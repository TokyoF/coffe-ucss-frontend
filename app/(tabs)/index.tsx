// app/(tabs)/index.tsx - Dashboard Principal
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location</Text>
          <Text style={styles.locationText}>Bilzen, Tanjungbalai ▼</Text>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search coffee"
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>Promo</Text>
            </View>
            <Text style={styles.promoTitle}>Buy one get{"\n"}one FREE</Text>
          </View>
          <Image
            source={require("../../assets/images/cafe-mocaccino.jpg")}
            style={styles.promoImage}
            resizeMode="cover"
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[styles.categoryBtn, styles.categoryBtnActive]}
          >
            <Text style={[styles.categoryText, styles.categoryTextActive]}>
              All Coffee
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBtn}>
            <Text style={styles.categoryText}>Machiato</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBtn}>
            <Text style={styles.categoryText}>Latte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBtn}>
            <Text style={styles.categoryText}>Americ</Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {/* Product 1 */}
          <View style={styles.productCard}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.8</Text>
            </View>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.productImage}
              resizeMode="cover"
            />
            <Text style={styles.productName}>Caffe Mocha</Text>
            <Text style={styles.productType}>Deep Foam</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>$ 4.53</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product 2 */}
          <View style={styles.productCard}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.9</Text>
            </View>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.productImage}
              resizeMode="cover"
            />
            <Text style={styles.productName}>Flat White</Text>
            <Text style={styles.productType}>Espresso</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>$ 3.53</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* More products row */}
        <View style={styles.productsGrid}>
          <View style={styles.productCard}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.8</Text>
            </View>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.productImage}
              resizeMode="cover"
            />
            <Text style={styles.productName}>Cappuccino</Text>
            <Text style={styles.productType}>Medium Roasted</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>$ 3.90</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>4.7</Text>
            </View>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.productImage}
              resizeMode="cover"
            />
            <Text style={styles.productName}>Americano</Text>
            <Text style={styles.productType}>Strong</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>$ 2.50</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    color: "#888",
    fontSize: 12,
  },
  locationText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: "#D2691E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    color: "#FFF",
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#D2691E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnText: {
    color: "#FFF",
    fontSize: 16,
  },
  promoBanner: {
    flexDirection: "row",
    backgroundColor: "#D2691E",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  promoContent: {
    flex: 1,
  },
  promoTag: {
    backgroundColor: "#FF6B6B",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  promoTagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  promoTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
  },
  promoImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "transparent",
  },
  categoryBtnActive: {
    backgroundColor: "#D2691E",
  },
  categoryText: {
    color: "#888",
    fontSize: 14,
  },
  categoryTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  productsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#3C3C3C",
    borderRadius: 15,
    padding: 15,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingIcon: {
    fontSize: 12,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 4,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productType: {
    color: "#888",
    fontSize: 12,
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: "#D2691E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
