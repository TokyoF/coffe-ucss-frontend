// app/(tabs)/_layout.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D2691E", // Naranja cuando está activo
        tabBarInactiveTintColor: "#888", // Gris cuando está inactivo
        headerShown: false, // Sin header en las tabs
        tabBarStyle: {
          backgroundColor: "#2C2C2C", // Fondo oscuro del tab bar
          borderTopWidth: 0, // Sin borde superior
          paddingBottom: 8, // Espaciado inferior
          paddingTop: 8, // Espaciado superior
          height: 70, // Altura del tab bar
        },
        tabBarShowLabel: false, // ✅ ARREGLADO: Ocultar labels correctamente
      }}
    >
      {/* Tab 1: Home (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shopping-bag" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bell" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// Componente para los íconos de tabs
function TabIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const getIconText = (iconName: string) => {
    switch (iconName) {
      case "home":
        return "🏠";
      case "heart":
        return "🤍";
      case "shopping-bag":
        return "🛍️";
      case "bell":
        return "🔔";
      default:
        return "●";
    }
  };

  return (
    <Text
      style={[
        styles.tabIcon,
        {
          color: color,
          fontSize: focused ? 24 : 22, // ✅ ARREGLADO: Tamaños válidos
          opacity: focused ? 1 : 0.7,
        },
      ]}
    >
      {getIconText(name)}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    textAlign: "center",
  },
});
