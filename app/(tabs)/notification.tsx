// app/(tabs)/notifications.tsx
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
import { router } from "expo-router";
import { apiClient, API_ENDPOINTS } from "../../src/services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

interface Order {
  id: number;
  status: string;
  total: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "ORDER" | "PROMO" | "SYSTEM";
  isRead: boolean;
  orderId?: number;
  createdAt: string;
  order?: Order;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
  timestamp: string;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // CARGAR NOTIFICACIONES
  // ========================================

  const loadNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await apiClient.get<NotificationsResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS}`,
      );

      if (response.data?.success && response.data.data) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        setError(response.message || "Error al cargar notificaciones");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Error de conexión al cargar notificaciones");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // MARCAR COMO LEÍDA
  // ========================================

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId),
      );

      if (response.success) {
        // Actualizar estado local
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        // Reducir contador de no leídas
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // ========================================
  // MARCAR TODAS COMO LEÍDAS
  // ========================================

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.MARK_ALL_READ);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      Alert.alert("Error", "No se pudieron marcar todas las notificaciones");
    }
  };

  // ========================================
  // ELIMINAR NOTIFICACIÓN
  // ========================================

  const deleteNotification = async (notificationId: number) => {
    Alert.alert(
      "Eliminar notificación",
      "¿Estás seguro de que quieres eliminar esta notificación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiClient.delete(
                `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
              );

              if (response.success) {
                setNotifications((prev) =>
                  prev.filter(
                    (notification) => notification.id !== notificationId,
                  ),
                );

                // Si era no leída, reducir contador
                const notification = notifications.find(
                  (n) => n.id === notificationId,
                );
                if (notification && !notification.isRead) {
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }
              }
            } catch (err) {
              console.error("Error deleting notification:", err);
              Alert.alert("Error", "No se pudo eliminar la notificación");
            }
          },
        },
      ],
    );
  };

  // ========================================
  // NAVEGAR A PEDIDO
  // ========================================

  const navigateToOrder = (orderId: number) => {
    // TODO: Implementar cuando tengas la pantalla de detalles de pedido
    router.push(`/order/${orderId}`);
  };

  // ========================================
  // PULL TO REFRESH
  // ========================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(false);
  }, [loadNotifications]);

  // ========================================
  // AUTO-REFRESH CADA 30 SEGUNDOS
  // ========================================

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications(false);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // ========================================
  // HELPERS PARA UI
  // ========================================

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "ORDER":
        return "cafe-outline";
      case "PROMO":
        return "pricetag-outline";
      case "SYSTEM":
        return "settings-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "ORDER":
        return "#8B4513"; // Café
      case "PROMO":
        return "#FF6B35"; // Naranja
      case "SYSTEM":
        return "#4A90E2"; // Azul
      default:
        return "#666";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Hace ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadNotifications()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} sin leer</Text>
            )}
          </View>

          {notifications.length > 0 && unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllButtonText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de notificaciones */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No hay notificaciones</Text>
          <Text style={styles.emptyMessage}>
            Cuando tengas pedidos o promociones aparecerán aquí
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B4513"
            />
          }
        >
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={[
                styles.notificationCard,
                notification.isRead ? styles.readCard : styles.unreadCard,
              ]}
              onPress={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
                if (notification.orderId) {
                  navigateToOrder(notification.orderId);
                }
              }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  {/* Icono del tipo */}
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: `${getNotificationColor(notification.type)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type) as any}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>

                  {/* Contenido */}
                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          notification.isRead && styles.readText,
                        ]}
                      >
                        {notification.title}
                      </Text>

                      {/* Badge no leída */}
                      {!notification.isRead && (
                        <View style={styles.unreadBadge} />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.notificationMessage,
                        notification.isRead && styles.readText,
                      ]}
                    >
                      {notification.message}
                    </Text>

                    {/* Info del pedido si existe */}
                    {notification.order && (
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderText}>
                          Pedido #{notification.order.id} •{" "}
                          {notification.order.status} • S/{" "}
                          {notification.order.total}
                        </Text>
                      </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                      <Text style={styles.timeText}>
                        {formatTime(notification.createdAt)}
                      </Text>

                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}

          {/* Espacio extra al final */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
    backgroundColor: "#D97706",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  unreadText: {
    fontSize: 14,
    color: "#D97706",
    marginTop: 4,
  },
  markAllButton: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllButtonText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 14,
  },
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
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
  },
  readCard: {
    borderColor: "#E5E7EB",
  },
  unreadCard: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationTitle: {
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  readText: {
    opacity: 0.7,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    backgroundColor: "#F59E0B",
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  notificationMessage: {
    color: "#6B7280",
    marginTop: 4,
  },
  orderInfo: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  orderText: {
    fontSize: 12,
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  deleteButton: {
    padding: 8,
  },
  bottomSpacing: {
    height: 24,
  },
});
