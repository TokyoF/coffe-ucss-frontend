// src/context/FavoritesContext.tsx - Estado Global de Favoritos
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Alert } from "react-native";
import {
  setStorageItem,
  getStorageItem,
  STORAGE_KEYS,
} from "../services/storage";
import { apiClient, API_ENDPOINTS } from "../services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

export interface FavoriteProduct {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  rating: string;
  isAvailable: boolean;
  category: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: FavoriteProduct;
}

export interface FavoritesState {
  // Estado
  favoriteIds: Set<number>;
  favorites: Favorite[];
  isLoading: boolean;

  // Funciones CRUD
  addFavorite: (productId: number) => Promise<boolean>;
  removeFavorite: (productId: number) => Promise<boolean>;
  toggleFavorite: (productId: number) => Promise<boolean>;
  loadFavorites: () => Promise<void>;

  // Funciones de utilidad
  isFavorite: (productId: number) => boolean;
  getFavoriteCount: () => number;
  clearFavorites: () => void;
}

interface FavoritesResponse {
  success: boolean;
  message: string;
  data: Favorite[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}

interface FavoriteActionResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

// ========================================
// CONTEXTO
// ========================================

const FavoritesContext = createContext<FavoritesState | undefined>(undefined);

// ========================================
// HOOK PERSONALIZADO
// ========================================

export const useFavorites = (): FavoritesState => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

// ========================================
// PROVIDER COMPONENT
// ========================================

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({
  children,
}) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // INICIALIZACIÓN - CARGAR FAVORITOS GUARDADOS
  // ========================================

  useEffect(() => {
    loadSavedFavorites();
  }, []);

  useEffect(() => {
    saveFavoritesToStorage();
  }, [favoriteIds]);

  const loadSavedFavorites = async (): Promise<void> => {
    try {
      console.log("❤️ Loading saved favorites...");
      const savedFavoriteIds = await getStorageItem<number[]>(
        STORAGE_KEYS.FAVORITE_IDS,
      );

      if (savedFavoriteIds && Array.isArray(savedFavoriteIds)) {
        setFavoriteIds(new Set(savedFavoriteIds));
        console.log(
          `✅ Loaded ${savedFavoriteIds.length} favorites from storage`,
        );
      }
    } catch (error) {
      console.error("❌ Error loading favorites:", error);
    }
  };

  const saveFavoritesToStorage = async (): Promise<void> => {
    try {
      const favoriteIdsArray = Array.from(favoriteIds);
      await setStorageItem(STORAGE_KEYS.FAVORITE_IDS, favoriteIdsArray);
      console.log(`💾 Favorites saved with ${favoriteIdsArray.length} items`);
    } catch (error) {
      console.error("❌ Error saving favorites:", error);
    }
  };

  // ========================================
  // CARGAR FAVORITOS DESDE BACKEND
  // ========================================

  const loadFavorites = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("❤️ Loading favorites from backend...");
      const response = await apiClient.get<FavoritesResponse>(
        `${API_ENDPOINTS.FAVORITES}?limit=100`,
      );

      if (response.data?.success && response.data?.data) {
        const favoritesData = response.data.data;
        const favoriteProductIds = favoritesData.map((fav) => fav.product.id);

        setFavorites(favoritesData);
        setFavoriteIds(new Set(favoriteProductIds));

        console.log(`✅ Loaded ${favoritesData.length} favorites from backend`);
      } else {
        console.log("⚠️ No favorites found or unexpected response");
        setFavorites([]);
        setFavoriteIds(new Set());
      }
    } catch (error) {
      console.error("❌ Error loading favorites from backend:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // FUNCIONES CRUD DE FAVORITOS
  // ========================================

  const addFavorite = async (productId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`❤️ Adding product ${productId} to favorites...`);

      const response = await apiClient.post<FavoriteActionResponse>(
        API_ENDPOINTS.ADD_FAVORITE,
        { productId },
      );

      if (response.data?.success) {
        // Actualizar estado local inmediatamente
        setFavoriteIds((prev) => new Set([...prev, productId]));

        // Recargar lista completa para tener datos actualizados
        await loadFavorites();

        console.log(`✅ Product ${productId} added to favorites`);
        return true;
      } else {
        const errorMessage =
          response.data?.message || "No se pudo agregar a favoritos";
        Alert.alert("Error", errorMessage);
        return false;
      }
    } catch (error) {
      console.error("❌ Error adding to favorites:", error);
      Alert.alert("Error", "No se pudo agregar a favoritos");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (productId: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`💔 Removing product ${productId} from favorites...`);

      const response = await apiClient.delete<FavoriteActionResponse>(
        API_ENDPOINTS.REMOVE_FAVORITE(productId),
      );

      if (response.data?.success) {
        // Actualizar estado local inmediatamente
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });

        // Actualizar lista de favoritos
        setFavorites((prev) =>
          prev.filter((fav) => fav.product.id !== productId),
        );

        console.log(`✅ Product ${productId} removed from favorites`);
        return true;
      } else {
        const errorMessage =
          response.data?.message || "No se pudo quitar de favoritos";
        Alert.alert("Error", errorMessage);
        return false;
      }
    } catch (error) {
      console.error("❌ Error removing from favorites:", error);
      Alert.alert("Error", "No se pudo quitar de favoritos");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (productId: number): Promise<boolean> => {
    const isCurrentlyFavorite = favoriteIds.has(productId);

    if (isCurrentlyFavorite) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  const clearFavorites = (): void => {
    setFavoriteIds(new Set());
    setFavorites([]);
    console.log("🧹 Favorites cleared");
  };

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const isFavorite = (productId: number): boolean => {
    return favoriteIds.has(productId);
  };

  const getFavoriteCount = (): number => {
    return favoriteIds.size;
  };

  // ========================================
  // VALOR DEL CONTEXTO
  // ========================================

  const favoritesValue: FavoritesState = {
    // Estado
    favoriteIds,
    favorites,
    isLoading,

    // Funciones CRUD
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites,

    // Funciones de utilidad
    isFavorite,
    getFavoriteCount,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider value={favoritesValue}>
      {children}
    </FavoritesContext.Provider>
  );
};
