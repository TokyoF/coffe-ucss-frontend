// app/(tabs)/favorites.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourite</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Favorite Items */}
        <View style={styles.favoritesSection}>
          {/* Item 1 */}
          <View style={styles.favoriteItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Cappuccino</Text>
              <Text style={styles.itemDescription}>with Chocolate</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>$ 4.53</Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.favoriteItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Cappuccino</Text>
              <Text style={styles.itemDescription}>with Oat Milk</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>$ 3.90</Text>
            </View>
          </View>

          {/* Item 3 */}
          <View style={styles.favoriteItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Cappuccino</Text>
              <Text style={styles.itemDescription}>with Steamed Milk</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>4.7</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>$ 4.20</Text>
            </View>
          </View>

          {/* Item 4 */}
          <View style={styles.favoriteItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Americano</Text>
              <Text style={styles.itemDescription}>with Extra Shot</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>4.6</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>$ 2.50</Text>
            </View>
          </View>

          {/* Item 5 */}
          <View style={styles.favoriteItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Macchiato</Text>
              <Text style={styles.itemDescription}>with Foam Art</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
              <Text style={styles.itemPrice}>$ 5.20</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },

  // Favorites Section
  favoritesSection: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemDescription: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  itemActions: {
    alignItems: "center",
  },
  heartButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heartIcon: {
    fontSize: 20,
  },
  itemPrice: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
