// app/(tabs)/_layout.tsx - Con Profile Tab agregado
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
        tabBarShowLabel: false, // Ocultar labels correctamente
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

      {/* Tab 2: Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search" color={color} focused={focused} />
          ),
        }}
      />

      {/* Tab 3: Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />

      {/* Tab 4: Cart */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shopping-bag" color={color} focused={focused} />
          ),
        }}
      />

      {/* Tab 5: Notifications */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bell" color={color} focused={focused} />
          ),
        }}
      />

      {/* ✅ Tab 6: Profile - AGREGADO */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
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
      case "search":
        return "🔍";
      case "heart":
        return "🤍";
      case "shopping-bag":
        return "🛍️";
      case "bell":
        return "🔔";
      case "profile":
        return "👤";
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
          fontSize: focused ? 24 : 22,
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
