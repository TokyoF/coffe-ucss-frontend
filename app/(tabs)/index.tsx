// app/(tabs)/index.tsx - Dashboard Principal Conectado con Backend y Carrito
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

// ✅ IMPORTAR servicios y contextos
import { useAuth } from "../../src/context/AuthContext";
import { useCart } from "../../src/context/CartContext"; // ✅ NUEVO
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

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  products: Product[];
}

export default function DashboardScreen() {
  // ========================================
  // ESTADO Y HOOKS
  // ========================================

  const { user, isAuthenticated } = useAuth();
  const { addItem, getItemQuantity, summary } = useCart(); // ✅ NUEVO

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const loadInitialData = async () => {
    try {
      console.log("🔄 Loading dashboard data...");
      setIsLoading(true);

      await Promise.all([loadProducts(), loadCategories()]);

      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      Alert.alert("Error", "No se pudo cargar la información");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      console.log("📦 Loading products...");
      const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCTS);

      console.log("🔍 Products response structure:", response);

      if (response.data?.data && Array.isArray(response.data.data)) {
        const productsData = response.data.data;
        console.log(`✅ Loaded ${productsData.length} products`);
        setProducts(productsData);
      } else {
        console.log("⚠️ Unexpected products response structure:", response);
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error loading products:", error);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      console.log("🏷️ Loading categories...");
      const response = await apiClient.get<any>(API_ENDPOINTS.CATEGORIES);

      console.log("🔍 Categories response structure:", response);

      if (response.data?.data && Array.isArray(response.data.data)) {
        const categoriesData = response.data.data;
        console.log(`✅ Loaded ${categoriesData.length} categories`);
        setCategories(categoriesData);
      } else {
        console.log("⚠️ Unexpected categories response structure:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Error loading categories:", error);
      setCategories([]);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  // ========================================
  // FUNCIONES DE FILTRADO
  // ========================================

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por categoría
    if (selectedCategory !== null) {
      filtered = filtered.filter(
        (product) => product.category.id === selectedCategory,
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.name.toLowerCase().includes(query),
      );
    }

    // Solo productos disponibles
    filtered = filtered.filter((product) => product.isAvailable);

    setFilteredProducts(filtered);
  };

  // ========================================
  // FUNCIONES DE INTERACCIÓN
  // ========================================

  const handleCategoryPress = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      // Deseleccionar si ya está seleccionado
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  // ✅ NUEVA FUNCIÓN: Agregar al carrito con Context
  // const handleAddToCart = async (product: Product) => {
  //   try {
  //     console.log("🛒 Adding to cart:", product.name);
  //
  //     const success = await addItem(product.id, 1);
  //
  //     if (success) {
  //       Alert.alert(
  //         "Agregado al carrito",
  //         `${product.name} se agregó exitosamente`,
  //         [
  //           { text: "Continuar", style: "default" },
  //           {
  //             text: "Ver carrito",
  //             style: "default",
  //             onPress: () => router.push("/(tabs)/cart"),
  //           },
  //         ],
  //       );
  //     }
  //   } catch (error) {
  //     console.error("❌ Error adding to cart:", error);
  //     Alert.alert("Error", "No se pudo agregar el producto al carrito");
  //   }
  // };

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return `S/ ${numPrice.toFixed(2)}`;
  };

  const getLocationText = (): string => {
    return user ? `Hola, ${user.firstName}` : "Universidad UCSS";
  };

  // ========================================
  // COMPONENTE DE IMAGEN OPTIMIZADA
  // ========================================

  const ProductImage = ({
    product,
    style,
  }: {
    product: Product;
    style: any;
  }) => {
    const [imageError, setImageError] = useState(false);

    // ✅ USAR IMAGEN LOCAL por problema de red del emulador
    // const imageSource = require("../../assets/images/cafe-mocaccino.jpg");

    // 🔄 FUTURO: Cuando tengas internet, descomenta esto:

    const imageSource =
      imageError || !product.imageUrl
        ? require("../../assets/images/cafe-mocaccino.jpg")
        : {
            uri: product.imageUrl,
            cachePolicy: "memory-disk" as const,
          };

    return (
      <Image
        source={imageSource}
        style={style}
        contentFit="cover"
        transition={300}
        placeholder={require("../../assets/images/cafe-mocaccino.jpg")}
        placeholderContentFit="cover"
        onError={() => {
          console.log(`❌ Error loading image for ${product.name}`);
          setImageError(true);
        }}
        onLoad={() => {
          console.log(`✅ Image loaded for ${product.name}`);
        }}
      />
    );
  };

  // ========================================
  // COMPONENTES DE CARGA
  // ========================================

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#D2691E" />
      <Text style={styles.loadingText}>Cargando productos...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cafe-outline" size={64} color="#888" />
      <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery ? "Intenta con otra búsqueda" : "Vuelve más tarde"}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  // ========================================
  // RENDERIZADO PRINCIPAL
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Ubicación</Text>
          <Text style={styles.locationText}>{getLocationText()}</Text>
        </View>

        {/* ✅ NUEVO: Header Actions con Carrito */}
        <View style={styles.headerActions}>
          {/* Cart Badge */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="bag-outline" size={20} color="#FFF" />
            {summary.itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{summary.itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#D2691E"]}
            tintColor="#D2691E"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar café, mate, té..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>Promo</Text>
            </View>
            <Text style={styles.promoTitle}>
              Delivery gratis{"\n"}en tu aula
            </Text>
          </View>
          <Image
            source={require("../../assets/images/cafe-mocaccino.jpg")}
            style={styles.promoImage}
            contentFit="cover"
            transition={200}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              selectedCategory === null && styles.categoryBtnActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.categoryTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryBtn,
                selectedCategory === category.id && styles.categoryBtnActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {isLoading && renderLoadingState()}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && renderEmptyState()}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "Productos disponibles"}
            </Text>

            {/* Renderizar productos en filas de 2 */}
            {Array.from(
              { length: Math.ceil(filteredProducts.length / 2) },
              (_, rowIndex) => (
                <View key={rowIndex} style={styles.productsGrid}>
                  {filteredProducts
                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                    .map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.productCard}
                        onPress={() => handleProductPress(product.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>
                            {parseFloat(product.rating).toFixed(1)}
                          </Text>
                        </View>

                        <ProductImage
                          product={product}
                          style={styles.productImage}
                        />

                        <Text style={styles.productName} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={styles.productType} numberOfLines={1}>
                          {product.description || product.category.name}
                        </Text>

                        {/* ✅ NUEVO: Footer con indicador de carrito */}
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>
                            {formatPrice(product.price)}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              getItemQuantity(product.id) > 0 &&
                                styles.addButtonActive,
                            ]}
                            onPress={() => handleProductPress(product.id)}
                          >
                            {getItemQuantity(product.id) > 0 ? (
                              <View style={styles.addButtonContent}>
                                <Text style={styles.addButtonQuantity}>
                                  {getItemQuantity(product.id)}
                                </Text>
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#FFF"
                                />
                              </View>
                            ) : (
                              <Ionicons name="add" size={20} color="#FFF" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}

                  {/* Espaciador si hay número impar de productos */}
                  {filteredProducts.slice(rowIndex * 2, rowIndex * 2 + 2)
                    .length === 1 && (
                    <View style={[styles.productCard, { opacity: 0 }]} />
                  )}
                </View>
              ),
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
  },
  locationText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // ✅ NUEVOS: Header Actions
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    width: 40,
    height: 40,
    backgroundColor: "#3C3C3C",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#D2691E",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2C2C2C",
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: "#D2691E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#D2691E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Promo Banner
  promoBanner: {
    flexDirection: "row",
    backgroundColor: "#D2691E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  promoContent: {
    flex: 1,
  },
  promoTag: {
    backgroundColor: "#FF6B6B",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  promoTagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  promoTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 32,
  },
  promoImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },

  // Categories
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3C3C3C",
  },
  categoryBtnActive: {
    backgroundColor: "#D2691E",
    borderColor: "#D2691E",
  },
  categoryText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Products Section
  productsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#3C3C3C",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productType: {
    color: "#888",
    fontSize: 12,
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ✅ NUEVOS: Add Button con indicador
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: "#D2691E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonActive: {
    backgroundColor: "#32CD32",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonQuantity: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },

  // Loading States
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyMessage: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#D2691E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Error State
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

  // Bottom spacing
  bottomPadding: {
    height: 100,
  },
});
