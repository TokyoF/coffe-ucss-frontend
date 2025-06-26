// app/(tabs)/profile.tsx - Versión final corregida
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
// ✅ IMPORTAR AuthContext
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ USAR AuthContext
  const { user, logout, isAuthenticated, refreshUserProfile } = useAuth();

  // ✅ REFRESCAR DATOS AL CARGAR
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔍 Profile screen loaded - User data:", user);
      refreshUserProfile();
    }
  }, [isAuthenticated]);

  // ✅ FUNCIÓN DE LOGOUT CORREGIDA
  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que quieres cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            console.log("🚪 Starting logout process...");

            // Ejecutar logout del AuthContext
            await logout();

            console.log("✅ Logout completed, clearing navigation stack");

            // ✅ NAVEGACIÓN MEJORADA - Limpiar stack completo
            router.dismissAll();
            router.replace("/");
          } catch (error) {
            console.error("❌ Logout error:", error);
            Alert.alert("Error", "No se pudo cerrar sesión correctamente");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // ✅ VALIDACIÓN SEGURA DE DATOS CON DATOS REALES
  const getUserInitials = () => {
    if (!user) return "??";
    const firstName = user.firstName || "U";
    const lastName = user.lastName || "U";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserFullName = () => {
    if (!user) return "Usuario UCSS";
    const firstName = user.firstName || "Usuario";
    const lastName = user.lastName || "UCSS";
    return `${firstName} ${lastName}`;
  };

  const getUserEmail = () => {
    return user?.email || "no-email@ucss.pe";
  };

  const getUserPhone = () => {
    return user?.phone || "No especificado";
  };

  const getUserRole = () => {
    if (!user) return "Cliente";
    return user.role === "ADMIN" ? "Administrador" : "Estudiante";
  };

  const isUserVerified = () => {
    return user?.isVerified || false;
  };

  const getUserCreatedDate = () => {
    if (!user?.createdAt) return "Fecha no disponible";
    try {
      return new Date(user.createdAt).toLocaleDateString("es-PE");
    } catch {
      return "Fecha no válida";
    }
  };

  // ✅ MANEJAR ESTADO NO AUTENTICADO (SOLO UNA VEZ)
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
        <Text style={styles.errorText}>No hay sesión activa</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            router.dismissAll();
            router.replace("/");
          }}
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
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{getUserFullName()}</Text>
          <Text style={styles.userEmail}>{getUserEmail()}</Text>

          {/* User Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la cuenta</Text>

          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color="#D2691E" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoValue}>{getUserFullName()}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#D2691E" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{getUserEmail()}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#D2691E" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{getUserPhone()}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#D2691E"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de cuenta</Text>
              <Text style={styles.infoValue}>{getUserRole()}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name={isUserVerified() ? "checkmark-circle" : "time-outline"}
              size={20}
              color={isUserVerified() ? "#32CD32" : "#FFD700"}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estado de verificación</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isUserVerified() ? "#32CD32" : "#FFD700" },
                ]}
              >
                {isUserVerified() ? "Verificado" : "Pendiente"}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color="#FFF" />
            <Text style={styles.menuText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={20} color="#FFF" />
            <Text style={styles.menuText}>Métodos de pago</Text>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="location-outline" size={20} color="#FFF" />
            <Text style={styles.menuText}>Direcciones favoritas</Text>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={20} color="#FFF" />
            <Text style={styles.menuText}>Ayuda y soporte</Text>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={20} color="#FFF" />
            <Text style={styles.menuText}>Términos y condiciones</Text>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la app</Text>

          <View style={styles.infoItem}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#888"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#888" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>{getUserCreatedDate()}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoading && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#FFF"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>
            {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Text>
        </TouchableOpacity>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

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
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D2691E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  userName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#3C3C3C",
    marginHorizontal: 20,
  },

  // Sections
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  // Info Items
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C3C",
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },

  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3C3C3C",
  },
  menuText: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginLeft: 15,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC143C",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutButtonDisabled: {
    backgroundColor: "rgba(220, 20, 60, 0.5)",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
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
