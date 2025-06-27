// app/(tabs)/orders.tsx - Mis Pedidos conectado con Backend
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

// ✅ IMPORTAR servicios y contextos
import { useAuth } from "../../src/context/AuthContext";
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  customizations: any;
  specialNotes: string | null;
  product: {
    id: number;
    name: string;
    imageUrl: string | null;
    price: string;
  };
}

interface Order {
  id: number;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  deliveryLocation: string;
  paymentMethod: "YAPE" | "PLIN" | "TUNKI" | "CASH";
  subtotal: string;
  deliveryFee: string;
  total: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

// ========================================
// CONFIGURACIÓN DE ESTADOS
// ========================================

const ORDER_STATES = {
  PENDING: {
    color: "#FFD700",
    icon: "time-outline",
    text: "Confirmando",
    isActive: true,
    description: "Estamos procesando tu pedido",
  },
  PREPARING: {
    color: "#FF8C00",
    icon: "restaurant-outline",
    text: "Preparando",
    isActive: true,
    description: "Tu pedido está siendo preparado",
  },
  READY: {
    color: "#32CD32",
    icon: "checkmark-circle-outline",
    text: "Listo",
    isActive: true,
    description: "Tu pedido está listo para entrega",
  },
  DELIVERED: {
    color: "#888",
    icon: "bag-check-outline",
    text: "Entregado",
    isActive: false,
    description: "Pedido entregado exitosamente",
  },
  CANCELLED: {
    color: "#DC143C",
    icon: "close-circle-outline",
    text: "Cancelado",
    isActive: false,
    description: "Pedido cancelado",
  },
} as const;

const PAYMENT_METHODS = {
  YAPE: "Yape",
  PLIN: "Plin",
  TUNKI: "Tunki",
  CASH: "Efectivo",
} as const;

export default function OrdersScreen() {
  // ========================================
  // ESTADO Y HOOKS
  // ========================================

  const { user, isAuthenticated } = useAuth();

  // Estados de datos
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"active" | "history">(
    "active",
  );

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [selectedTab, orders]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const loadOrders = async () => {
    try {
      console.log("📋 Loading user orders...");
      setIsLoading(true);

      const response = await apiClient.get<any>(API_ENDPOINTS.MY_ORDERS);

      console.log("🔍 Orders response:", response);

      if (response.data?.data && Array.isArray(response.data.data)) {
        const ordersData = response.data.data;
        console.log(`✅ Loaded ${ordersData.length} orders`);
        setOrders(ordersData);
      } else {
        console.log("⚠️ No orders found or unexpected response structure");
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      Alert.alert("Error", "No se pudieron cargar los pedidos");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  // ========================================
  // FUNCIONES DE FILTRADO
  // ========================================

  const filterOrders = () => {
    if (selectedTab === "active") {
      // Pedidos activos: PENDING, PREPARING, READY
      const activeOrders = orders.filter((order) =>
        ["PENDING", "PREPARING", "READY"].includes(order.status),
      );
      setFilteredOrders(activeOrders);
    } else {
      // Historial: DELIVERED, CANCELLED
      const historyOrders = orders.filter((order) =>
        ["DELIVERED", "CANCELLED"].includes(order.status),
      );
      setFilteredOrders(historyOrders);
    }
  };

  // ========================================
  // FUNCIONES DE INTERACCIÓN
  // ========================================

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro que quieres cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`🚫 Cancelling order ${orderId}...`);

              const response = await apiClient.patch(
                `${API_ENDPOINTS.ORDERS}/${orderId}/cancel`,
              );

              if (response.data) {
                Alert.alert("Éxito", "Pedido cancelado correctamente");
                await loadOrders(); // Recargar pedidos
              }
            } catch (error) {
              console.error("❌ Error cancelling order:", error);
              Alert.alert("Error", "No se pudo cancelar el pedido");
            }
          },
        },
      ],
    );
  };

  const handleViewOrderDetails = (orderId: number) => {
    // TODO: Navegar a pantalla de detalle de pedido
    Alert.alert("Ver detalle", `Detalle del pedido #${orderId} (próximamente)`);
  };

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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString("es-PE");
  };

  const getEstimatedTime = (order: Order): string => {
    if (order.status === "DELIVERED") return "Entregado";
    if (order.status === "CANCELLED") return "Cancelado";
    if (order.status === "READY") return "Listo para entrega";

    // Estimar tiempo basado en estado
    const createdTime = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const elapsedMinutes = Math.floor((now - createdTime) / 60000);

    if (order.status === "PENDING") {
      return elapsedMinutes < 5 ? "Confirmando..." : "2-3 min";
    }
    if (order.status === "PREPARING") {
      const remainingTime = Math.max(0, 15 - elapsedMinutes);
      return remainingTime > 0 ? `${remainingTime} min` : "Casi listo";
    }

    return "Calculando...";
  };

  // ========================================
  // COMPONENTE DE IMAGEN
  // ========================================

  const ProductImage = ({ item }: { item: OrderItem }) => {
    const imageSource = item.product.imageUrl
      ? { uri: item.product.imageUrl }
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
  // COMPONENTES DE RENDERIZADO
  // ========================================

  const renderOrderCard = (order: Order) => {
    const stateConfig = ORDER_STATES[order.status];
    const canCancel = order.status === "PENDING";

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Header del pedido */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: stateConfig.color },
              ]}
            >
              <Ionicons
                name={stateConfig.icon as any}
                size={14}
                color="#FFF"
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>{stateConfig.text}</Text>
            </View>
          </View>

          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewOrderDetails(order.id)}
            >
              <Ionicons name="eye-outline" size={20} color="#D2691E" />
            </TouchableOpacity>

            {canCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelOrder(order.id)}
              >
                <Ionicons name="close-outline" size={20} color="#DC143C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Productos del pedido */}
        <View style={styles.orderItems}>
          {order.orderItems.slice(0, 2).map((item, index) => (
            <View key={item.id} style={styles.orderItem}>
              <ProductImage item={item} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemQuantity}>
                  Cantidad: {item.quantity}
                </Text>
                {item.customizations && (
                  <Text style={styles.itemCustomizations} numberOfLines={1}>
                    {JSON.stringify(item.customizations)}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}

          {order.orderItems.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.orderItems.length - 2} productos más
            </Text>
          )}
        </View>

        {/* Footer del pedido */}
        <View style={styles.orderFooter}>
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#888" />
              <Text style={styles.infoText}>{order.deliveryLocation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color="#888" />
              <Text style={styles.infoText}>
                {PAYMENT_METHODS[order.paymentMethod]}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#888" />
              <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.orderSummary}>
            <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
            <Text style={styles.estimatedTime}>{getEstimatedTime(order)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const isActiveTab = selectedTab === "active";
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isActiveTab ? "restaurant-outline" : "archive-outline"}
          size={64}
          color="#888"
        />
        <Text style={styles.emptyTitle}>
          {isActiveTab ? "No tienes pedidos activos" : "No hay historial"}
        </Text>
        <Text style={styles.emptyMessage}>
          {isActiveTab
            ? "Realiza tu primer pedido desde el catálogo"
            : "Aquí aparecerán tus pedidos completados"}
        </Text>
      </View>
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
          onPress={() => {
            // TODO: Navegar a login
          }}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#D2691E" />
        </TouchableOpacity>
      </View>

      {/* Tabs internos */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "active" && styles.activeTab]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "active" && styles.activeTabText,
            ]}
          >
            Activos (
            {orders.filter((o) => ORDER_STATES[o.status].isActive).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "history" && styles.activeTab]}
          onPress={() => setSelectedTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "history" && styles.activeTabText,
            ]}
          >
            Historial (
            {orders.filter((o) => !ORDER_STATES[o.status].isActive).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D2691E" />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      ) : (
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
          {filteredOrders.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.ordersContainer}>
              {filteredOrders.map(renderOrderCard)}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 4,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#3C3C3C",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#D2691E",
  },
  tabText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ordersContainer: {
    paddingBottom: 20,
  },

  // Order Card
  orderCard: {
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

  // Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  orderActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "rgba(220, 20, 60, 0.2)",
  },

  // Order Items
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemQuantity: {
    color: "#888",
    fontSize: 12,
  },
  itemCustomizations: {
    color: "#D2691E",
    fontSize: 11,
  },
  itemPrice: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  moreItems: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },

  // Order Footer
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2C",
    paddingTop: 12,
  },
  orderInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    color: "#888",
    fontSize: 12,
    marginLeft: 6,
  },
  orderSummary: {
    alignItems: "flex-end",
  },
  totalAmount: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  estimatedTime: {
    color: "#D2691E",
    fontSize: 12,
    fontWeight: "600",
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
