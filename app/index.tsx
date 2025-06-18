// app/index.tsx - Pantalla de Bienvenida
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
    // Navegar a la pantalla de autenticación
    // router.push("/(auth)/login");
    router.push("/(tabs)");
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
        source={require("../assets/images/Bg5.jpg")} // ✅ Usar require()
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
              source={require("../assets/images/Logo 3.png")} // ✅ Usar require()
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
    // El logo se ajustará automáticamente
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
});

// constants/Colors.ts - Actualización de colores
export const Colors = {
  // Colores principales basados en el diseño
  primary: "#D2691E", // Naranja principal del botón
  primaryDark: "#B8860B", // Naranja más oscuro
  secondary: "#8B4513", // Marrón secondary
  background: "#F5F5DC", // Beige claro
  surface: "#FFFFFF", // Blanco
  text: "#2F4F4F", // Gris oscuro
  textSecondary: "#696969", // Gris medio
  textLight: "#FFFFFF", // Texto claro

  // Estados
  success: "#32CD32",
  warning: "#FFD700",
  error: "#DC143C",

  // Transparencias
  overlay: "rgba(0, 0, 0, 0.3)",
  cardShadow: "rgba(0, 0, 0, 0.1)",
  buttonShadow: "rgba(0, 0, 0, 0.3)",
};
