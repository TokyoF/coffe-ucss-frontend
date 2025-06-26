// app/index.tsx - Welcome Screen simplificado (AuthGuard maneja la lógica)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    // Navegar a la pantalla de login
    router.push("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Imagen de fondo */}
      <ImageBackground
        source={require("../assets/images/Bg5.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <View style={styles.overlay} />

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/Logo 3.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Espaciador flexible */}
          <View style={styles.spacer} />

          {/* Botón de bienvenida */}
          <TouchableOpacity
            style={styles.welcomeButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.welcomeButtonText}>Bienvenido</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Overlay sutil
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 60,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  logo: {
    width: 200,
    height: 120,
  },
  spacer: {
    flex: 1,
  },
  welcomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D2691E", // Naranja principal del diseño
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Sombra para Android
  },
  welcomeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ✅ NUEVOS ESTILOS PARA LOADING
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  loader: {
    marginTop: 30,
    marginBottom: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
