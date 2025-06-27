// app/(tabs)/cart.tsx - TOTALMENTE INTEGRADO CON CARTCONTEXT
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

// ✅ IMPORTAR CONTEXTOS Y SERVICIOS
import { useAuth } from "../../src/context/AuthContext";
import { useCart, CartItem } from "../../src/context/CartContext"; // Importar hook y tipo
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

export default function CartScreen() {
  // ========================================
  // ESTADO Y HOOKS
  // ========================================

  const { isAuthenticated } = useAuth();
  const {
    items: cartItems,
    summary,
    isLoading,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart(); // ✅ USAR ESTADO GLOBAL DEL CARRITO

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Estados del formulario (se mantienen locales)
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");
  const [orderNotes, setOrderNotes] = useState("");

  // ========================================
  // FUNCIONES DE INTERACCIÓN (ADAPTADAS A CONTEXT)
  // ========================================

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateItemQuantity(itemId, newQuantity); // ✅ USAR FUNCIÓN DEL CONTEXT
      } else {
        handleRemoveItem(itemId); // Eliminar si la cantidad es 0
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      Alert.alert(
        "Eliminar producto",
        `¿Seguro que quieres eliminar ${item.productName}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => removeItem(itemId), // ✅ USAR FUNCIÓN DEL CONTEXT
          },
        ],
      );
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      "Vaciar carrito",
      "¿Seguro que quieres eliminar todos los productos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: () => clearCart(), // ✅ USAR FUNCIÓN DEL CONTEXT
        },
      ],
    );
  };

  // ========================================
  // CREAR PEDIDO CON BACKEND (SIN CAMBIOS)
  // ========================================

  const handleCreateOrder = async () => {
    if (!deliveryLocation.trim()) {
      Alert.alert("Error", "Por favor especifica la ubicación de entrega");
      return;
    }

    if (summary.total < 2.0) {
      Alert.alert("Error", "El monto mínimo del pedido es S/ 2.00");
      return;
    }

    setIsCreatingOrder(true);

    try {
      console.log("📝 Creating order...");

      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        customizations: item.customizations || null,
        specialNotes: item.specialNotes || null,
      }));

      const orderData = {
        items: orderItems,
        deliveryLocation: deliveryLocation.trim(),
        paymentMethod: selectedPaymentMethod,
        notes: orderNotes.trim() || undefined,
      };

      console.log("📦 Order data:", orderData);

      const response = await apiClient.post<any>(
        API_ENDPOINTS.ORDERS,
        orderData,
      );

      console.log("🔍 Order response:", response);

      if (response.data?.data) {
        const order = response.data.data;
        console.log("✅ Order created:", order.id);

        clearCart(); // ✅ Limpiar carrito con context

        Alert.alert(
          "¡Pedido creado!",
          `Tu pedido #${order.id} ha sido creado exitosamente`,
          [
            {
              text: "Ver mis pedidos",
              onPress: () => {
                router.push("/(tabs)/notification");
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Error",
          response.data?.error || "No se pudo crear el pedido",
        );
      }
    } catch (error: any) {
      console.error("❌ Error creating order:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo conectar con el servidor",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // ========================================
  // FUNCIONES DE UTILIDAD (SIN CAMBIOS)
  // ========================================

  const formatPrice = (price: number): string => {
    return `S/ ${price.toFixed(2)}`;
  };

  const getPaymentMethodText = () => {
    const methods: Record<string, string> = {
      CASH: "Efectivo",
      YAPE: "Yape",
      PLIN: "Plin",
      TUNKI: "Tunki",
    };
    return methods[selectedPaymentMethod] || "Efectivo";
  };

  // ========================================
  // COMPONENTE DE IMAGEN (SIN CAMBIOS)
  // ========================================

  const ProductImage = ({ item }: { item: CartItem }) => {
    const imageSource = item.productImage
      ? { uri: item.productImage }
      : require("../../assets/images/cafe-mocaccino.jpg");

    return (
      <Image
        source={imageSource}
        style={styles.itemImage}
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
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
        <Text style={styles.errorText}>Debes iniciar sesión</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.loginButtonText}>Ir al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ========================================
  // ESTADO DE CARGA
  // ========================================

  if (isLoading && cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
        <ActivityIndicator size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  // ========================================
  // CARRITO VACÍO
  // ========================================

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrito</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#888" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyMessage}>
            Agrega productos desde el catálogo para empezar
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.shopButtonText}>Explorar productos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Carrito ({summary.itemCount})</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#DC143C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Ubicación de entrega</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#D2691E" />
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Aula 101, Laboratorio 2, etc."
              placeholderTextColor="#888"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
            />
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>
            Productos ({cartItems.length})
          </Text>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <ProductImage item={item} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.productName}
                </Text>
                <Text style={styles.itemDescription} numberOfLines={1}>
                  {item.productDescription}
                </Text>

                {/* Quantity Controls */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.itemPriceContainer}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Ionicons name="close" size={16} color="#DC143C" />
                </TouchableOpacity>

                <Text style={styles.itemPrice}>
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Método de pago</Text>

          <View style={styles.paymentMethods}>
            {["CASH", "YAPE", "PLIN", "TUNKI"].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method &&
                    styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <Text style={styles.paymentMethodText}>
                  {method === "CASH" ? "Efectivo" : method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notas (opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#D2691E" />
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="Instrucciones especiales..."
              placeholderTextColor="#888"
              value={orderNotes}
              onChangeText={setOrderNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({summary.itemCount} productos)
            </Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            {summary.deliveryFee === 0 ? (
              <Text style={styles.freeDelivery}>¡Gratis!</Text>
            ) : (
              <Text style={styles.summaryValue}>
                {formatPrice(summary.deliveryFee)}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>{formatPrice(summary.total)}</Text>
          </View>

          {summary.total < 2.0 && (
            <Text style={styles.minimumOrderWarning}>
              ⚠️ Monto mínimo del pedido: S/ 2.00
            </Text>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Payment Method Display */}
        <View style={styles.paymentMethodSection}>
          <View style={styles.paymentMethodContainer}>
            <View style={styles.cashIcon}>
              <Text style={styles.cashIconText}>
                {selectedPaymentMethod === "CASH" ? "💵" : "📱"}
              </Text>
            </View>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodLabel}>
                {getPaymentMethodText()}
              </Text>
              <Text style={styles.paymentMethodValue}>
                {formatPrice(summary.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Button */}
        <TouchableOpacity
          style={[
            styles.orderButton,
            (summary.total < 2.0 ||
              !deliveryLocation.trim() ||
              isCreatingOrder) &&
              styles.orderButtonDisabled,
          ]}
          onPress={handleCreateOrder}
          disabled={
            summary.total < 2.0 || !deliveryLocation.trim() || isCreatingOrder
          }
        >
          {isCreatingOrder ? (
            <View style={styles.orderButtonLoading}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.orderButtonText}>Creando pedido...</Text>
            </View>
          ) : (
            <Text style={styles.orderButtonText}>
              Realizar pedido • {formatPrice(summary.total)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}


// ========================================
// ESTILOS (MANTENIENDO LOS ORIGINALES + NUEVOS)
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C2C2C",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Loading & Error States
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: "#DC143C",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#D2691E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#D2691E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Sections
  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 12,
  },
  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },

  // Delivery Section
  deliverySection: {
    marginBottom: 25,
  },

  // Cart Section
  cartSection: {
    marginBottom: 25,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemDescription: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3C3C3C",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    color: "#FFF",
    fontSize: 14,
    marginHorizontal: 15,
  },
  itemPriceContainer: {
    alignItems: "flex-end",
  },
  removeButton: {
    padding: 4,
    marginBottom: 8,
  },
  itemPrice: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Payment Methods
  paymentSection: {
    marginBottom: 25,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  paymentMethod: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3C3C3C",
    borderWidth: 1,
    borderColor: "#3C3C3C",
  },
  paymentMethodSelected: {
    backgroundColor: "#D2691E",
    borderColor: "#D2691E",
  },
  paymentMethodText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },

  // Notes
  notesSection: {
    marginBottom: 25,
  },

  // Summary Section
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    color: "#FFF",
    fontSize: 14,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  freeDelivery: {
    color: "#32CD32",
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#3C3C3C",
    marginVertical: 12,
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#D2691E",
    fontSize: 18,
    fontWeight: "bold",
  },
  minimumOrderWarning: {
    color: "#FFD700",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },

  // Bottom Section
  bottomPadding: {
    height: 150,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#3C3C3C",
  },
  paymentMethodSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cashIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cashIconText: {
    fontSize: 16,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodLabel: {
    color: "#FFF",
    fontSize: 12,
    marginBottom: 2,
  },
  paymentMethodValue: {
    color: "#D2691E",
    fontSize: 14,
    fontWeight: "600",
  },
  orderButton: {
    backgroundColor: "#D2691E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  orderButtonDisabled: {
    backgroundColor: "#555",
  },
  orderButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
