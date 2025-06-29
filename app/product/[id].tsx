// app/product/[id].tsx - Modal de Configuración de Producto
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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

// ✅ IMPORTAR servicios y contextos
import { useAuth } from "../../src/context/AuthContext";
import { useCart } from "../../src/context/CartContext";
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  rating: string;
  isAvailable: boolean;
  category: {
    id: number;
    name: string;
    description: string | null;
  };
  customizations: Array<{
    id: number;
    name: string;
    type: string;
    options: any;
    isRequired: boolean;
  }>;
}

interface CustomizationSelection {
  [key: string]: string;
}

export default function ProductModal() {
  // ========================================
  // ESTADO Y HOOKS
  // ========================================

  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  // Estados de datos
  const [product, setProduct] = useState<Product | null>(null);
  const [customizations, setCustomizations] = useState<CustomizationSelection>(
    {},
  );
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (id && isAuthenticated) {
      loadProduct();
    }
  }, [id, isAuthenticated]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const loadProduct = async () => {
    try {
      console.log(`🔄 Loading product with ID: ${id}`);
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<any>(
        API_ENDPOINTS.PRODUCT_BY_ID(parseInt(id!)),
      );

      console.log("🔍 Product response:", response);

      if (response.data?.data) {
        const productData = response.data.data;
        console.log(`✅ Loaded product: ${productData.name}`);
        setProduct(productData);

        // Inicializar personalizaciones obligatorias
        initializeCustomizations(productData.customizations);
      } else {
        throw new Error("Producto no encontrado");
      }
    } catch (error) {
      console.error("❌ Error loading product:", error);
      setError("No se pudo cargar el producto");
      Alert.alert("Error", "No se pudo cargar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCustomizations = (productCustomizations: any[]) => {
    const initialCustomizations: CustomizationSelection = {};

    productCustomizations.forEach((customization) => {
      if (customization.isRequired && customization.options?.length > 0) {
        // Seleccionar la primera opción por defecto para campos obligatorios
        initialCustomizations[customization.type] =
          customization.options[0].name;
      }
    });

    setCustomizations(initialCustomizations);
  };

  // ========================================
  // FUNCIONES DE INTERACCIÓN
  // ========================================

  const handleCustomizationChange = (type: string, value: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const calculateFinalPrice = (): number => {
    if (!product) return 0;

    let basePrice = parseFloat(product.price);

    // Agregar costo de personalizaciones
    product.customizations.forEach((customization) => {
      const selectedOption = customizations[customization.type];
      if (selectedOption && customization.options) {
        const option = customization.options.find(
          (opt: any) => opt.name === selectedOption,
        );
        if (option && option.price) {
          basePrice += parseFloat(option.price);
        }
      }
    });

    return basePrice * quantity;
  };

  const validateCustomizations = (): boolean => {
    if (!product) return false;

    const requiredCustomizations = product.customizations.filter(
      (c) => c.isRequired,
    );

    for (const customization of requiredCustomizations) {
      if (!customizations[customization.type]) {
        Alert.alert(
          "Personalización requerida",
          `Por favor selecciona ${customization.name.toLowerCase()}`,
        );
        return false;
      }
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!validateCustomizations()) return;

    try {
      setIsAddingToCart(true);

      await addItem(
        product!.id,
        quantity,
        customizations,
        specialNotes || undefined,
      );

      Alert.alert(
        "¡Agregado al carrito!",
        `${product!.name} x${quantity} agregado exitosamente`,
        [
          {
            text: "Seguir comprando",
            style: "cancel",
            onPress: () => router.back(),
          },
          {
            text: "Ver carrito",
            onPress: () => {
              router.back();
              router.push("/(tabs)/cart");
            },
          },
        ],
      );
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      Alert.alert("Error", "No se pudo agregar al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ========================================
  // COMPONENTES DE RENDERIZADO
  // ========================================

  const renderCustomizationSection = (customization: any) => {
    return (
      <View key={customization.id} style={styles.customizationSection}>
        <View style={styles.customizationHeader}>
          <Text style={styles.customizationTitle}>
            {customization.name}
            {customization.isRequired && (
              <Text style={styles.required}> *</Text>
            )}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {customization.options?.map((option: any, index: number) => {
            const isSelected =
              customizations[customization.type] === option.name;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() =>
                  handleCustomizationChange(customization.type, option.name)
                }
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                  {option.price > 0 && (
                    <Text
                      style={[
                        styles.optionPrice,
                        isSelected && styles.optionPriceSelected,
                      ]}
                    >
                      +S/ {parseFloat(option.price).toFixed(2)}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.radioButton,
                    isSelected && styles.radioButtonSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.container, styles.centerContent]}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
      <Ionicons name="alert-circle-outline" size={64} color="#888" />
      <Text style={styles.emptyTitle}>{error || "Producto no encontrado"}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.retryButtonText}>Volver</Text>
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
        <ActivityIndicator size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!product || error) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header del Modal */}
      <View style={styles.modalHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.modalTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Imagen del Producto */}
        <View style={styles.imageContainer}>
          <Image
            source={
              product.imageUrl
                ? { uri: product.imageUrl }
                : require("../../assets/images/cafe-mocaccino.jpg")
            }
            style={styles.productImage}
            contentFit="cover"
          />

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {parseFloat(product.rating).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Información del Producto */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>
                {product.category.name}
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.basePrice}>S/ {product.price}</Text>
              <Text style={styles.finalPrice}>
                S/ {calculateFinalPrice().toFixed(2)}
              </Text>
            </View>
          </View>

          <Text style={styles.productDescription}>
            {product.description ||
              "Deliciosa bebida preparada con ingredientes de calidad."}
          </Text>
        </View>

        {/* Secciones de Personalización */}
        {product.customizations.length > 0 && (
          <View style={styles.customizationsContainer}>
            <Text style={styles.sectionTitle}>Personaliza tu pedido</Text>
            {product.customizations.map(renderCustomizationSection)}
          </View>
        )}

        {/* Notas Especiales */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notas especiales (opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="¿Alguna preferencia especial?"
            placeholderTextColor="#888"
            value={specialNotes}
            onChangeText={setSpecialNotes}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer con controles */}
      <View style={styles.footer}>
        {/* Selector de cantidad */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? "#555" : "#FFF"}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= 10 && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= 10 ? "#555" : "#FFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Agregar al Carrito */}
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAddingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="bag-add" size={20} color="#FFF" />
              <Text style={styles.addToCartText}>
                Agregar al carrito • S/ {calculateFinalPrice().toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========================================
// ESTILOS
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

  // Modal Header
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C3C",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3C3C3C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    flex: 1,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Product Image
  imageContainer: {
    position: "relative",
    height: 300,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#3C3C3C",
  },
  ratingBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Product Info
  productInfo: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productCategory: {
    color: "#D2691E",
    fontSize: 16,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  basePrice: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  finalPrice: {
    color: "#D2691E",
    fontSize: 20,
    fontWeight: "bold",
  },
  productDescription: {
    color: "#CCC",
    fontSize: 16,
    lineHeight: 24,
  },

  // Sections
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // Customizations
  customizationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  customizationSection: {
    marginBottom: 24,
  },
  customizationHeader: {
    marginBottom: 12,
  },
  customizationTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  required: {
    color: "#FF6B6B",
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3C3C3C",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#D2691E",
    borderColor: "#F4A460",
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#FFF",
  },
  optionPrice: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  optionPriceSelected: {
    color: "#FFF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#FFF",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },

  // Notes Section
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  notesInput: {
    backgroundColor: "#3C3C3C",
    color: "#FFF",
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    height: 80,
    textAlignVertical: "top",
  },

  // Footer
  footer: {
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#4C4C4C",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantityLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D2691E",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#555",
  },
  quantityText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D2691E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#888",
  },
  addToCartText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Loading & Error States
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#D2691E",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
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
