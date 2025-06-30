// app/_layout.tsx - Root Layout con navegación condicional mejorada
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

// ✅ IMPORTAR CONTEXTOS
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext"; // ✅ NUEVO
import { FavoritesProvider } from "@/src/context/FavoriteContext";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index", // ✅ CAMBIAR: Welcome como inicial
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({});

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    // ✅ WRAPPER CON AMBOS PROVIDERS - AuthProvider envuelve CartProvider
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <RootLayoutNav />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#2C2C2C" },
        }}
      >
        {/* ✅ ORDEN CORRECTO DE SCREENS */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false, // No permitir volver con gesto
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            gestureEnabled: false, // No permitir volver con gesto
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false, // No permitir volver con gesto una vez logueado
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            presentation: "modal",
            headerShown: false,
            gestureEnabled: true,
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="product"
          options={{
            headerShown: false,
            presentation: "modal", // Para que aparezca como modal
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
