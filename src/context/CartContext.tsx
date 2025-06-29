// src/context/CartContext.tsx - Estado Global del Carrito
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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

export interface CartItem {
  id: string; // ID único del item en carrito
  productId: number;
  productName: string;
  productDescription: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  customizations?: any;
  specialNotes?: string;
  subtotal: number;
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  // Estado
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;

  // Funciones CRUD
  addItem: (
    productId: number,
    quantity?: number,
    customizations?: any,
    specialNotes?: string,
  ) => Promise<boolean>;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;

  // Funciones de utilidad
  getItemQuantity: (productId: number) => number;
  isProductInCart: (productId: number) => boolean;
}

// ========================================
// CONTEXTO
// ========================================

const CartContext = createContext<CartState | undefined>(undefined);

// ========================================
// HOOK PERSONALIZADO
// ========================================

export const useCart = (): CartState => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// ========================================
// PROVIDER COMPONENT
// ========================================

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // INICIALIZACIÓN - CARGAR CARRITO GUARDADO
  // ========================================

  useEffect(() => {
    loadSavedCart();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [items]);

  const loadSavedCart = async (): Promise<void> => {
    try {
      console.log("🛒 Loading saved cart...");
      const savedCart = await getStorageItem<CartItem[]>(
        STORAGE_KEYS.CART_ITEMS,
      );

      if (savedCart && Array.isArray(savedCart)) {
        setItems(savedCart);
        console.log(`✅ Loaded ${savedCart.length} items from cart`);
      }
    } catch (error) {
      console.error("❌ Error loading cart:", error);
    }
  };

  const saveCartToStorage = async (): Promise<void> => {
    try {
      await setStorageItem(STORAGE_KEYS.CART_ITEMS, items);
      console.log(`💾 Cart saved with ${items.length} items`);
    } catch (error) {
      console.error("❌ Error saving cart:", error);
    }
  };

  // ========================================
  // CÁLCULOS DEL CARRITO
  // ========================================

  const calculateSummary = (): CartSummary => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Reglas de negocio del backend
    const deliveryFee = subtotal >= 10 ? 0 : 1.0; // Gratis si gasta más de S/ 10
    const total = subtotal + deliveryFee;

    return {
      subtotal,
      deliveryFee,
      total,
      itemCount,
    };
  };

  const summary = calculateSummary();

  // ========================================
  // FUNCIONES CRUD DEL CARRITO
  // ========================================

  const addItem = async (
    productId: number,
    quantity: number = 1,
    customizations?: any,
    specialNotes?: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`🛒 Processing product ${productId} for cart...`);

      // 1. Obtener información fresca del producto desde el backend
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.PRODUCTS}/${productId}`,
      );

      if (!response.data?.data) {
        Alert.alert("Error", "No se pudo obtener la información del producto");
        return false;
      }

      const product = response.data.data;
      console.log("📦 Product data:", product);

      // 2. Verificar disponibilidad
      if (!product.isAvailable) {
        Alert.alert(
          "No disponible",
          "Este producto no está disponible actualmente",
        );
        return false;
      }

      // 3. Verificar si el producto ya existe en el carrito
      // Por ahora, la lógica es simple: si el producto (por ID) ya está, se actualiza la cantidad.
      // TODO: Mejorar para manejar personalizaciones distintas como items separados.
      const existingItem = items.find(
        (item) =>
          item.productId === productId &&
          JSON.stringify(item.customizations) ===
            JSON.stringify(customizations),
      );
      if (existingItem) {
        // --- ACTUALIZAR CANTIDAD ---
        console.log(`✅ Product ${productId} exists. Updating quantity.`);
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: item.unitPrice * (item.quantity + quantity),
                }
              : item,
          ),
        );
      } else {
        // --- AGREGAR NUEVO ITEM ---
        console.log(`✨ Product ${productId} is new. Adding to cart.`);
        const basePrice = parseFloat(product.price);
        const unitPrice = basePrice; // Futuro: calcular precio con personalizaciones
        const subtotal = unitPrice * quantity;

        const newItem: CartItem = {
          id: `${productId}_${JSON.stringify(customizations)}_${Date.now()}`, // ID si son productos diferentes
          productId: product.id,
          productName: product.name,
          productDescription:
            product.description || product.category?.name || "",
          productImage: product.imageUrl,
          unitPrice,
          quantity,
          customizations: customizations || null,
          specialNotes: specialNotes || undefined,
          subtotal,
        };

        setItems((prevItems) => [...prevItems, newItem]);
      }

      console.log(`🛒 Cart updated for product ${product.name}`);
      return true;
    } catch (error) {
      console.error("❌ Error processing item for cart:", error);
      Alert.alert("Error", "No se pudo actualizar el carrito");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: item.unitPrice * newQuantity,
            }
          : item,
      ),
    );

    console.log(`🔄 Updated item ${itemId} quantity to ${newQuantity}`);
  };

  const removeItem = (itemId: string): void => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);
      console.log(`🗑️ Removed item ${itemId} from cart`);
      return newItems;
    });
  };

  const clearCart = (): void => {
    setItems([]);
    console.log("🧹 Cart cleared");
  };

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const getItemQuantity = (productId: number): number => {
    return items
      .filter((item) => item.productId === productId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const isProductInCart = (productId: number): boolean => {
    return items.some((item) => item.productId === productId);
  };

  // ========================================
  // VALOR DEL CONTEXTO
  // ========================================

  const cartValue: CartState = {
    // Estado
    items,
    summary,
    isLoading,

    // Funciones CRUD
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,

    // Funciones de utilidad
    getItemQuantity,
    isProductInCart,
  };

  return (
    <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
  );
};
