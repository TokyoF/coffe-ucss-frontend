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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [activeTab, setActiveTab] = useState("register");

  // ✅ NUEVO: Usar el hook de AuthContext
  const { register, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      formData;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return false;
    }

    if (!email.endsWith("@ucss.pe")) {
      Alert.alert("Error", "Debes usar tu correo institucional @ucss.pe");
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    if (phone.length < 9) {
      Alert.alert("Error", "Ingresa un número de teléfono válido");
      return false;
    }

    if (!acceptTerms) {
      Alert.alert("Error", "Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // ✅ NUEVO: Usar la función register del contexto
    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (result.success) {
        Alert.alert("¡Registro exitoso!", result.message, [
          {
            text: "OK",
            onPress: () => {
              // ✅ MEJORADO: Ir directamente a tabs ya que está logueado
              router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error register:", error);
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
        source={require("../../assets/images/Bg5.jpg")} // Usa la misma imagen
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
            {/* Logo en la parte superior */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Image
                source={require("../../assets/images/Logo 3.png")} // Usa tu logo actual
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Card principal */}
            <View style={styles.formCard}>
              {/* Tabs de Iniciar Sesión / Registrarse */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "login" && styles.activeTab,
                  ]}
                  onPress={() => router.push("/(auth)/login")}
                  disabled={isLoading}
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
                  onPress={() => setActiveTab("register")}
                  disabled={isLoading}
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

              {/* Nombres */}
              <View style={styles.row}>
                <View
                  style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombres"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={formData.firstName}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>

                <View
                  style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Apellidos"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={formData.lastName}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="tu.correo@ucss.pe"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Teléfono */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono (ej: 987654321)"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  keyboardType="phone-pad"
                  maxLength={9}
                  editable={!isLoading}
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Contraseña (mín. 8 caracteres)"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
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

              {/* Confirmar Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  Acepto los{" "}
                  <Text style={styles.termsLink}>términos y condiciones</Text> y{" "}
                  <Text style={styles.termsLink}>política de privacidad</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  isLoading && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {/* ✅ MEJORADO: Indicador de carga más elegante */}
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.registerButtonText}>
                      Creando cuenta...
                    </Text>
                    <View style={styles.loadingDots}>
                      <Text style={styles.dot}>●</Text>
                      <Text style={styles.dot}>●</Text>
                      <Text style={styles.dot}>●</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.registerButtonText}>Continuar</Text>
                )}
              </TouchableOpacity>

              {/* Links inferiores */}
              <View style={styles.linksContainer}>
                <TouchableOpacity
                  style={styles.linkButton}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>Restablecer Cuenta</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 10,
    zIndex: 1,
    padding: 8,
  },
  logo: {
    width: 160,
    height: 100,
    marginTop: 20,
  },
  formCard: {
    backgroundColor: "rgba(139, 69, 19, 0.85)",
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
    marginBottom: 25,
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
  row: {
    flexDirection: "row",
    marginBottom: 16,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#D2691E",
    borderColor: "#D2691E",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  termsLink: {
    color: "#D2691E",
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#D2691E",
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
  registerButtonDisabled: {
    backgroundColor: "rgba(210, 105, 30, 0.5)",
  },
  registerButtonText: {
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
