// src/components/AuthGuard.tsx - Sin errores de TypeScript
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import { router, useSegments } from "expo-router";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Esperar a que termine la verificación inicial

    // ✅ ARREGLADO: Verificaciones de segmentos más explícitas
    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === "(auth)";
    const inTabsGroup = currentSegment === "(tabs)";
    const isOnWelcome = !currentSegment; // En la raíz "/" cuando no hay segmento

    console.log("🔒 AuthGuard Check:", {
      isAuthenticated,
      isLoading,
      segments: segments,
      currentSegment: currentSegment,
      inAuthGroup: inAuthGroup,
      inTabsGroup: inTabsGroup,
      isOnWelcome: isOnWelcome,
      userExists: !!user,
    });

    if (isAuthenticated && user) {
      // ✅ USUARIO AUTENTICADO
      if (inAuthGroup || isOnWelcome) {
        // Si está en auth o welcome, redirigir a tabs
        console.log("✅ Authenticated user, redirecting to tabs");
        setIsNavigating(true);
        router.replace("/(tabs)");
        setTimeout(() => setIsNavigating(false), 1000);
      }
      // Si ya está en tabs, no hacer nada
    } else {
      // ❌ USUARIO NO AUTENTICADO
      if (inTabsGroup) {
        // Si está en tabs sin auth, redirigir a welcome
        console.log("❌ Unauthenticated user in tabs, redirecting to welcome");
        setIsNavigating(true);
        router.replace("/");
        setTimeout(() => setIsNavigating(false), 1000);
      }
      // Si está en auth o welcome, no hacer nada
    }
  }, [isAuthenticated, isLoading, segments, user]);

  // ✅ LOADING SCREEN MIENTRAS SE VERIFICA AUTH
  if (isLoading || isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ImageBackground
          source={require("../../assets/images/Bg5.jpg")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.loadingContent}>
            <Image
              source={require("../../assets/images/Logo 3.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ActivityIndicator
              size="large"
              color="#D2691E"
              style={styles.loader}
            />
            <Text style={styles.loadingText}>
              {isNavigating ? "Redirigiendo..." : "Verificando sesión..."}
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // ✅ RENDERIZAR CONTENIDO NORMAL
  return <>{children}</>;
};

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 180,
    height: 110,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
