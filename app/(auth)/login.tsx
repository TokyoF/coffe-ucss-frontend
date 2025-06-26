import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// ✅ NUEVO: Import del AuthContext
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // ✅ NUEVO: Usar el hook de AuthContext
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // Validar email @ucss.pe
    if (!email.endsWith("@ucss.pe")) {
      Alert.alert("Error", "Debes usar tu correo institucional @ucss.pe");
      return;
    }

    // ✅ NUEVO: Usar la función login del contexto
    try {
      const result = await login(email, password);

      if (result.success) {
        Alert.alert("¡Bienvenido!", result.message, [
          {
            text: "OK",
            onPress: () => {
              // ✅ MEJORADO: Navegación automática después del login
              router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error login:", error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Image */}
      <ImageBackground
        source={require("../../assets/images/Bg5.jpg")} // Usa la misma imagen de tu Welcome
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo y título en la parte superior */}
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/Logo 3.png")} // Usa tu logo actual
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Card principal centrada */}
            <View style={styles.formCard}>
              {/* Tabs de Iniciar Sesión / Registrarse */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "login" && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab("login")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "login" && styles.activeTabText,
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "register" && styles.activeTab,
                  ]}
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "register" && styles.activeTabText,
                    ]}
                  >
                    Registrarte
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="tu.correo@ucss.pe"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {/* ✅ MEJORADO: Indicador de carga más elegante */}
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loginButtonText}>Ingresando...</Text>
                    <View style={styles.loadingDots}>
                      <Text style={styles.dot}>●</Text>
                      <Text style={styles.dot}>●</Text>
                      <Text style={styles.dot}>●</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Continuar</Text>
                )}
              </TouchableOpacity>

              {/* Links inferiores */}
              <View style={styles.linksContainer}>
                <TouchableOpacity
                  style={styles.linkButton}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>Restablecer Contraseña</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkButton}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>Necesitas Ayuda?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Overlay más oscuro para mejor contraste
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 60,
  },
  logo: {
    width: 180,
    height: 110,
  },
  formCard: {
    backgroundColor: "rgba(139, 69, 19, 0.85)", // Fondo marrón semi-transparente
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#D2691E",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#D2691E", // Color naranja del diseño
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "rgba(210, 105, 30, 0.5)",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // ✅ NUEVO: Estilos para el indicador de carga
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 8,
  },
  dot: {
    color: "#FFFFFF",
    fontSize: 8,
    marginHorizontal: 1,
    opacity: 0.7,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkButton: {
    flex: 1,
    alignItems: "center",
  },
  linkText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
