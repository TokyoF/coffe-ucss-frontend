import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#8B4513" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F5F5DC" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: "Iniciar Sesión",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: "Crear Cuenta",
          }}
        />
      </Stack>
    </>
  );
}
