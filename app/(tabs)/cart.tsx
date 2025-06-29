// app/(tabs)/cart.tsx - VERSIÓN COMPLETA CON TODAS LAS MEJORAS
import React, { useState, useEffect } from "react";
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
import { useCart, CartItem } from "../../src/context/CartContext";
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

// ========================================
// TIPOS DE DATOS ADICIONALES
// ========================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  unavailableItems: CartItem[];
}

interface PriceValidation {
  isValid: boolean;
  outdatedItems: CartItem[];
}

export default function CartScreen() {
  // ========================================
  // ESTADO Y HOOKS
  // ========================================

  const { isAuthenticated, user } = useAuth();
  const {
    items: cartItems,
    summary,
    isLoading,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Estados del formulario (se mantienen locales)
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");
  const [orderNotes, setOrderNotes] = useState("");

  // Estados de validación
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (cartItems.length > 0) {
      validateCartPeriodically();
    }
  }, [cartItems]);

  // ========================================
  // FUNCIONES DE VALIDACIÓN (OPCIÓN D)
  // ========================================

  const validateCartPeriodically = async () => {
    // Validar cada 30 segundos si hay items en el carrito
    const interval = setInterval(async () => {
      if (cartItems.length > 0) {
        await validateProductAvailability(false); // Silencioso
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const validateProductAvailability = async (
    showAlert: boolean = true,
  ): Promise<ValidationResult> => {
    try {
      setIsValidating(true);

      const unavailableItems: CartItem[] = [];
      const errors: string[] = [];

      // Verificar cada producto en el carrito
      for (const item of cartItems) {
        try {
          const response = await apiClient.get<any>(
            API_ENDPOINTS.PRODUCT_BY_ID(item.productId),
          );

          if (!response.data?.data?.isAvailable) {
            unavailableItems.push(item);
            errors.push(`${item.productName} ya no está disponible`);
          }
        } catch (error) {
          unavailableItems.push(item);
          errors.push(`No se pudo verificar ${item.productName}`);
        }
      }

      const result: ValidationResult = {
        isValid: unavailableItems.length === 0,
        errors,
        unavailableItems,
      };

      if (!result.isValid && showAlert) {
        Alert.alert(
          "Productos no disponibles",
          `Los siguientes productos ya no están disponibles:\n${errors.join("\n")}`,
          [
            { text: "Entendido", style: "default" },
            {
              text: "Eliminar productos",
              style: "destructive",
              onPress: () => {
                unavailableItems.forEach((item) => removeItem(item.id));
              },
            },
          ],
        );
      }

      setValidationErrors(errors);
      return result;
    } catch (error) {
      console.error("❌ Error validating cart:", error);
      return {
        isValid: false,
        errors: ["Error al validar el carrito"],
        unavailableItems: [],
      };
    } finally {
      setIsValidating(false);
    }
  };

  const validatePrices = async (): Promise<PriceValidation> => {
    try {
      const outdatedItems: CartItem[] = [];

      for (const item of cartItems) {
        try {
          const response = await apiClient.get<any>(
            API_ENDPOINTS.PRODUCT_BY_ID(item.productId),
          );

          const currentPrice = parseFloat(response.data?.data?.price || "0");
          const cartPrice = item.unitPrice;

          // Verificar si el precio cambió (tolerancia de 0.01)
          if (Math.abs(currentPrice - cartPrice) > 0.01) {
            outdatedItems.push(item);
          }
        } catch (error) {
          console.warn(`⚠️ Could not validate price for ${item.productName}`);
        }
      }

      return {
        isValid: outdatedItems.length === 0,
        outdatedItems,
      };
    } catch (error) {
      console.error("❌ Error validating prices:", error);
      return { isValid: false, outdatedItems: [] };
    }
  };

  const validateFormData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!deliveryLocation.trim()) {
      errors.push("La ubicación de entrega es obligatoria");
    }

    if (deliveryLocation.trim().length < 3) {
      errors.push("La ubicación debe tener al menos 3 caracteres");
    }

    if (!selectedPaymentMethod) {
      errors.push("Selecciona un método de pago");
    }

    if (cartItems.length === 0) {
      errors.push("El carrito está vacío");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // ========================================
  // FUNCIONES DE INTERACCIÓN MEJORADAS (OPCIÓN A)
  // ========================================

  const handleEditItem = async (item: CartItem) => {
    try {
      console.log(`✏️ Editing item: ${item.productName}`);

      // TODO: Implementar apertura de modal con datos precargados
      // Por ahora, redirigir al modal normal
      router.push(`/product/${item.productId}?editItemId=${item.id}`);
    } catch (error) {
      console.error("❌ Error editing item:", error);
      Alert.alert("Error", "No se pudo editar el producto");
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateItemQuantity(itemId, newQuantity);
      } else {
        handleRemoveItem(itemId);
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
            onPress: () => removeItem(itemId),
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
          onPress: () => clearCart(),
        },
      ],
    );
  };

  // ========================================
  // FUNCIÓN DE PEDIDO CON VALIDACIONES COMPLETAS (OPCIÓN D)
  // ========================================

  const handleCreateOrder = async () => {
    try {
      setIsCreatingOrder(true);

      // 1. Validar formulario
      const formValidation = validateFormData();
      if (!formValidation.isValid) {
        Alert.alert("Faltan datos", formValidation.errors.join("\n"));
        return;
      }

      // 2. Validar disponibilidad de productos
      console.log("🔍 Validating product availability...");
      const availabilityValidation = await validateProductAvailability(false);
      if (!availabilityValidation.isValid) {
        Alert.alert(
          "Productos no disponibles",
          "Algunos productos del carrito ya no están disponibles. Revisa tu carrito.",
          [
            {
              text: "Revisar carrito",
              onPress: () => {
                availabilityValidation.unavailableItems.forEach((item) =>
                  removeItem(item.id),
                );
              },
            },
          ],
        );
        return;
      }

      // 3. Validar precios actualizados
      console.log("💰 Validating prices...");
      const priceValidation = await validatePrices();
      if (
        !priceValidation.isValid &&
        priceValidation.outdatedItems.length > 0
      ) {
        Alert.alert(
          "Precios actualizados",
          "Algunos precios han cambiado. ¿Quieres continuar con los precios actuales?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Continuar", onPress: () => proceedWithOrder() },
          ],
        );
        return;
      }

      // 4. Si todo está bien, proceder
      await proceedWithOrder();
    } catch (error) {
      console.error("❌ Error creating order:", error);
      Alert.alert("Error", "No se pudo procesar el pedido. Intenta de nuevo.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const proceedWithOrder = async () => {
    try {
      console.log("📦 Creating order...");

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          customizations: item.customizations,
          specialNotes: item.specialNotes,
        })),
        deliveryLocation: deliveryLocation.trim(),
        paymentMethod: selectedPaymentMethod,
        notes: orderNotes.trim() || null,
      };

      console.log("🚀 Sending order:", orderData);

      const response = await apiClient.post<any>(
        API_ENDPOINTS.ORDERS,
        orderData,
      );

      if (response.data?.success) {
        Alert.alert(
          "¡Pedido realizado!",
          `Tu pedido #${response.data.data.id} fue creado exitosamente`,
          [
            {
              text: "Ver pedidos",
              onPress: () => {
                clearCart();
                router.push("/(tabs)/orders");
              },
            },
          ],
        );
      } else {
        throw new Error(response.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      console.error("❌ Error processing order:", error);

      let errorMessage = "No se pudo procesar el pedido";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error en el pedido", errorMessage);
    }
  };

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const formatPrice = (price: number): string => {
    return `S/ ${price.toFixed(2)}`;
  };

  const formatCustomizations = (customizations: any): string => {
    // ✅ VALIDACIÓN ROBUSTA
    if (!customizations || typeof customizations !== "object") {
      return "Sin personalizaciones";
    }

    // ✅ MANEJAR TANTO OBJETOS COMO STRINGS
    let customizationObj = customizations;
    if (typeof customizations === "string") {
      try {
        customizationObj = JSON.parse(customizations);
      } catch {
        return "Sin personalizaciones";
      }
    }

    const keys = Object.keys(customizationObj);
    if (keys.length === 0) {
      return "Sin personalizaciones";
    }

    const parts: string[] = [];

    // Orden específico para mejor legibilidad
    const orderedKeys = ["size", "milk", "sugar", "temperature"];

    orderedKeys.forEach((key) => {
      if (customizationObj[key] && typeof customizationObj[key] === "string") {
        parts.push(customizationObj[key]);
      }
    });

    // Agregar cualquier otra personalización válida
    keys.forEach((key) => {
      if (
        !orderedKeys.includes(key) &&
        customizationObj[key] &&
        typeof customizationObj[key] === "string"
      ) {
        parts.push(customizationObj[key]);
      }
    });

    return parts.length > 0 ? parts.join(" + ") : "Sin personalizaciones";
  };
  // ========================================
  // COMPONENTES DE RENDERIZADO MEJORADOS (OPCIÓN B)
  // ========================================

  const ProductImage = ({ item }: { item: CartItem }) => {
    const [imageError, setImageError] = useState(false);

    const imageSource =
      imageError || !item.productImage
        ? require("../../assets/images/cafe-mocaccino.jpg")
        : { uri: item.productImage };

    return (
      <Image
        source={imageSource}
        style={styles.itemImage}
        contentFit="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  const renderCartItem = (item: CartItem, index: number) => {
    const customizationsText = formatCustomizations(item.customizations);
    const hasCustomizations = customizationsText !== "Sin personalizaciones";

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.cartItem}
        onPress={() => handleEditItem(item)}
        activeOpacity={0.7}
      >
        {/* Imagen del producto */}
        <ProductImage item={item} />

        {/* Detalles del producto */}
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.productName}
            </Text>

            {/* Botón de editar */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditItem(item)}
            >
              <Ionicons name="create-outline" size={16} color="#D2691E" />
            </TouchableOpacity>
          </View>

          {/* Descripción básica */}
          <Text style={styles.itemDescription} numberOfLines={1}>
            {item.productDescription}
          </Text>

          {/* Personalizaciones detalladas */}
          {hasCustomizations && (
            <View style={styles.customizationsContainer}>
              <Text style={styles.customizationsLabel}>Personalización:</Text>
              <Text style={styles.customizationsText} numberOfLines={2}>
                {customizationsText}
              </Text>
            </View>
          )}

          {/* Notas especiales */}
          {item.specialNotes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Nota:</Text>
              <Text style={styles.notesText} numberOfLines={1}>
                {item.specialNotes}
              </Text>
            </View>
          )}

          {/* Controles de cantidad */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityChange(item.id, -1)}
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? "#666" : "#FFF"}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, 1)}
            >
              <Ionicons name="add" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Precio y controles */}
        <View style={styles.itemPriceContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#DC143C" />
          </TouchableOpacity>

          <View style={styles.priceInfo}>
            <Text style={styles.unitPrice}>
              {formatPrice(item.unitPrice)} c/u
            </Text>
            <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color="#888" />
      <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
      <Text style={styles.emptyMessage}>
        Agrega productos desde el catálogo para continuar
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push("../(tabs)/")}
      >
        <Text style={styles.shopButtonText}>Ir al catálogo</Text>
      </TouchableOpacity>
    </View>
  );

  // ========================================
  // VERIFICACIONES DE ACCESO
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
  // RENDERIZADO PRINCIPAL
  // ========================================

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrito (0)</Text>
        </View>

        {renderEmptyCart()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header con indicadores de validación */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Carrito ({summary.itemCount})</Text>

          <View style={styles.headerActions}>
            {/* Indicador de validación */}
            {isValidating && (
              <ActivityIndicator
                size="small"
                color="#D2691E"
                style={styles.validatingIndicator}
              />
            )}

            {/* Errores de validación */}
            {validationErrors.length > 0 && (
              <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
            )}

            {/* Botón limpiar carrito */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCart}
            >
              <Ionicons name="trash-outline" size={20} color="#DC143C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alertas de validación */}
        {validationErrors.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertContent}>
              <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
              <Text style={styles.alertText}>
                Algunos productos requieren atención
              </Text>
            </View>
          </View>
        )}

        {/* Ubicación de entrega */}
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

        {/* Lista de productos con visualización mejorada */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>
            Productos ({cartItems.length}{" "}
            {cartItems.length === 1 ? "tipo" : "tipos"})
          </Text>

          {cartItems.map(renderCartItem)}
        </View>

        {/* Método de pago */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Método de pago</Text>

          <View style={styles.paymentMethods}>
            {[
              { key: "CASH", label: "Efectivo", icon: "cash-outline" },
              { key: "YAPE", label: "Yape", icon: "phone-portrait-outline" },
              { key: "PLIN", label: "Plin", icon: "phone-portrait-outline" },
              { key: "TUNKI", label: "Tunki", icon: "phone-portrait-outline" },
            ].map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.key &&
                    styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method.key)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={selectedPaymentMethod === method.key ? "#FFF" : "#888"}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method.key &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notas del pedido */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notas del pedido (opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color="#D2691E" />
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="Instrucciones especiales..."
              placeholderTextColor="#888"
              value={orderNotes}
              onChangeText={setOrderNotes}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        {/* Resumen de precios */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(summary.subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Costo de entrega</Text>
            <Text
              style={[
                styles.summaryValue,
                summary.deliveryFee === 0 && styles.summaryValueFree,
              ]}
            >
              {summary.deliveryFee === 0
                ? "Gratis"
                : formatPrice(summary.deliveryFee)}
            </Text>
          </View>

          {summary.deliveryFee === 0 && (
            <Text style={styles.freeDeliveryNote}>
              🎉 Envío gratis por compras mayores a S/ 10
            </Text>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(summary.total)}</Text>
          </View>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer con botón de pedido */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.orderButton,
            (isCreatingOrder || isValidating) && styles.orderButtonDisabled,
          ]}
          onPress={handleCreateOrder}
          disabled={isCreatingOrder || isValidating}
        >
          {isCreatingOrder ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="restaurant-outline" size={20} color="#FFF" />
              <Text style={styles.orderButtonText}>
                Realizar pedido • {formatPrice(summary.total)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========================================
// ESTILOS COMPLETOS Y MEJORADOS
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C3C",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  validatingIndicator: {
    marginRight: 4,
  },
  clearButton: {
    padding: 4,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Alerts
  alertContainer: {
    backgroundColor: "#4A2C2A",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    padding: 12,
    marginVertical: 16,
    borderRadius: 8,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
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
    marginTop: 20,
  },

  // Cart Section
  cartSection: {
    marginBottom: 25,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#3C3C3C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#4C4C4C",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
    backgroundColor: "#4C4C4C",
    borderRadius: 8,
  },
  itemDescription: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },

  // Customizations
  customizationsContainer: {
    backgroundColor: "#2A2A2A",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  customizationsLabel: {
    color: "#D2691E",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  customizationsText: {
    color: "#FFF",
    fontSize: 12,
    lineHeight: 16,
  },

  // Notes
  notesContainer: {
    backgroundColor: "#2A2A2A",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesLabel: {
    color: "#D2691E",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  notesText: {
    color: "#FFF",
    fontSize: 12,
    fontStyle: "italic",
  },

  // Quantity Controls
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D2691E",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#555",
  },
  quantityText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 12,
    minWidth: 24,
    textAlign: "center",
  },

  // Price Container
  itemPriceContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 80,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#4A2C2A",
    borderRadius: 8,
    marginBottom: 8,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  unitPrice: {
    color: "#888",
    fontSize: 11,
    marginBottom: 2,
  },
  itemPrice: {
    color: "#D2691E",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Payment Section
  paymentSection: {
    marginBottom: 25,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: "47%",
    gap: 8,
  },
  paymentMethodSelected: {
    backgroundColor: "#D2691E",
    borderColor: "#F4A460",
  },
  paymentMethodText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  paymentMethodTextSelected: {
    color: "#FFF",
  },

  // Notes Section
  notesSection: {
    marginBottom: 25,
  },

  // Summary Section
  summarySection: {
    backgroundColor: "#3C3C3C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    color: "#888",
    fontSize: 14,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  summaryValueFree: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  freeDeliveryNote: {
    color: "#4CAF50",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#4C4C4C",
    paddingTop: 12,
    marginBottom: 0,
    marginTop: 8,
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

  // Footer
  footer: {
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#4C4C4C",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D2691E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  orderButtonDisabled: {
    backgroundColor: "#888",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Error States
  errorText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#D2691E",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 20,
  },
});
