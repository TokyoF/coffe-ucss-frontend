// app/(tabs)/favorites.tsx - COMPLETAMENTE FUNCIONAL
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Customization {
  id: number;
  name: string;
  type: string;
  options: any;
  isRequired: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  rating: string;
  isAvailable: boolean;
  category: Category;
  customizations: Customization[];
}

interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

interface FavoritesResponse {
  success: boolean;
  message: string;
  data: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}
interface DeleteFavoriteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function FavoritesScreen() {
  const { user, isAuthenticated } = useAuth();

  // Estados de datos
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // CARGAR FAVORITOS
  // ========================================

  const loadFavorites = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await apiClient.get<FavoritesResponse>(
        `${API_ENDPOINTS.FAVORITES}?limit=50`,
      );

      if (response.data?.success && response.data?.data) {
        setFavorites(response.data.data);
      } else {
        setError(response.data?.message || "Error al cargar favoritos");
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Error de conexión al cargar favoritos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // QUITAR DE FAVORITOS
  // ========================================

  const removeFromFavorites = async (
    productId: number,
    productName: string,
  ) => {
    Alert.alert(
      "Quitar de favoritos",
      `¿Estás seguro de que quieres quitar "${productName}" de tus favoritos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiClient.delete<DeleteFavoriteResponse>(
                API_ENDPOINTS.REMOVE_FAVORITE(productId),
              );

              if (response.data?.success) {
                // Actualizar estado local (remover de la lista)
                setFavorites((prev) =>
                  prev.filter((favorite) => favorite.product.id !== productId),
                );

                // Mostrar mensaje de éxito
                Alert.alert("Éxito", "Producto eliminado de favoritos");
              } else {
                Alert.alert(
                  "Error",
                  response.data?.message || "No se pudo quitar de favoritos",
                );
              }
            } catch (err) {
              console.error("Error removing from favorites:", err);
              Alert.alert("Error", "No se pudo quitar de favoritos");
            }
          },
        },
      ],
    );
  };

  // ========================================
  // NAVEGAR A PRODUCTO
  // ========================================

  const navigateToProduct = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // ========================================
  // PULL TO REFRESH
  // ========================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites(false);
  }, [loadFavorites]);

  // ========================================
  // CARGAR AL MONTAR COMPONENTE
  // ========================================

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, loadFavorites]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return `S/ ${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `${diffInDays} días`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas`;

    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // ========================================
  // COMPONENTE DE IMAGEN
  // ========================================

  const ProductImage = ({ product }: { product: Product }) => {
    const imageSource = product.imageUrl
      ? { uri: product.imageUrl }
      : require("../../assets/images/cafe-mocaccino.jpg");

    return (
      <Image
        source={imageSource}
        style={styles.productImage}
        contentFit="cover"
        placeholder={require("../../assets/images/cafe-mocaccino.jpg")}
        placeholderContentFit="cover"
      />
    );
  };

  // ========================================
  // VERIFICAR AUTENTICACIÓN
  // ========================================

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color="#888" />
          <Text style={styles.errorTitle}>Debes iniciar sesión</Text>
          <Text style={styles.errorMessage}>
            Inicia sesión para ver tus productos favoritos
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // ESTADO DE CARGA
  // ========================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // ESTADO DE ERROR
  // ========================================

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadFavorites()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#8B4513" />
        </TouchableOpacity>
      </View>

      {/* Lista de favoritos */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No tienes favoritos</Text>
          <Text style={styles.emptyMessage}>
            Los productos que marques como favoritos aparecerán aquí
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.browseButtonText}>Explorar productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Contador de favoritos */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {favorites.length} producto{favorites.length !== 1 ? "s" : ""}{" "}
              favorito{favorites.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8B4513"
              />
            }
          >
            {favorites.map((favorite) => (
              <Pressable
                key={favorite.id}
                style={styles.favoriteCard}
                onPress={() => navigateToProduct(favorite.product.id)}
              >
                <ProductImage product={favorite.product} />

                <View style={styles.productDetails}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {favorite.product.name}
                    </Text>

                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() =>
                        removeFromFavorites(
                          favorite.product.id,
                          favorite.product.name,
                        )
                      }
                    >
                      <Ionicons name="heart" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.productDescription} numberOfLines={2}>
                    {favorite.product.description ||
                      favorite.product.category.name}
                  </Text>

                  <View style={styles.productMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {favorite.product.category.name}
                      </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {parseFloat(favorite.product.rating).toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      {formatPrice(favorite.product.price)}
                    </Text>

                    <Text style={styles.favoriteDate}>
                      Agregado {formatDate(favorite.createdAt)}
                    </Text>
                  </View>

                  {!favorite.product.isAvailable && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>No disponible</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}

            {/* Espacio extra al final */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// ========================================
// ESTILOS
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  refreshButton: {
    padding: 4,
  },

  // Counter
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  counterText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptyMessage: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  browseButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // List
  scrollView: {
    flex: 1,
  },
  favoriteCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    padding: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  favoriteDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  unavailableBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unavailableText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 24,
  },
});
