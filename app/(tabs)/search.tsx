// app/(tabs)/search.tsx - Placeholder básico
import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Búsqueda</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.placeholderText}>🔍 Función de búsqueda</Text>
        <Text style={styles.placeholderSubtext}>
          Próximamente podrás buscar tus productos favoritos aquí
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C2C2C",
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
