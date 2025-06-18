// app/(tabs)/cart.tsx
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

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.deliverySection}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.deliveryTitle}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deliveryAddress}>Jl. Kpg Sutoyo</Text>
          <Text style={styles.deliveryDetails}>
            Kpg. Sutoyo No. 620, Bilzen, Tanjungbalai.
          </Text>
        </View>

        {/* Cart Items */}
        <View style={styles.cartSection}>
          {/* Item 1 */}
          <View style={styles.cartItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Cappuccino</Text>
              <Text style={styles.itemDescription}>with Chocolate</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>1</Text>
                <TouchableOpacity style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemPrice}>$ 4.53</Text>
          </View>

          {/* Item 2 */}
          <View style={styles.cartItem}>
            <Image
              source={require("../../assets/images/cafe-mocaccino.jpg")}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Cappuccino</Text>
              <Text style={styles.itemDescription}>with Oat Milk</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>1</Text>
                <TouchableOpacity style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemPrice}>$ 3.90</Text>
          </View>
        </View>

        {/* Discount */}
        <TouchableOpacity style={styles.discountSection}>
          <View style={styles.discountIcon}>
            <Text style={styles.discountIconText}>%</Text>
          </View>
          <Text style={styles.discountText}>1 Discount is applied</Text>
          <Text style={styles.discountArrow}>›</Text>
        </TouchableOpacity>

        {/* Payment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryValue}>$ 8.43</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <View style={styles.deliveryFeeContainer}>
              <Text style={styles.originalPrice}>$ 2.0</Text>
              <Text style={styles.summaryValue}>$ 1.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>$ 9.43</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Payment Method */}
        <View style={styles.paymentMethodSection}>
          <View style={styles.paymentMethodContainer}>
            <View style={styles.cashIcon}>
              <Text style={styles.cashIconText}>💳</Text>
            </View>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodLabel}>Cash</Text>
              <Text style={styles.paymentMethodValue}>$ 9.43</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.paymentMethodArrow}>...</Text>
          </TouchableOpacity>
        </View>

        {/* Order Button */}
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },

  // Delivery Section
  deliverySection: {
    marginBottom: 25,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  editText: {
    color: "#D2691E",
    fontSize: 14,
  },
  deliveryAddress: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  deliveryDetails: {
    color: "#888",
    fontSize: 12,
  },

  // Cart Section
  cartSection: {
    marginBottom: 25,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3C3C3C",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    color: "#FFF",
    fontSize: 14,
    marginHorizontal: 15,
  },
  itemPrice: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Discount Section
  discountSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  discountIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D2691E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  discountIconText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  discountText: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  discountArrow: {
    color: "#888",
    fontSize: 18,
  },

  // Summary Section
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    color: "#FFF",
    fontSize: 14,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  deliveryFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#3C3C3C",
    marginVertical: 12,
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  paymentMethodSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3C3C3C",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cashIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cashIconText: {
    fontSize: 16,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodLabel: {
    color: "#FFF",
    fontSize: 12,
    marginBottom: 2,
  },
  paymentMethodValue: {
    color: "#D2691E",
    fontSize: 12,
    fontWeight: "500",
  },
  paymentMethodArrow: {
    color: "#888",
    fontSize: 18,
  },
  orderButton: {
    backgroundColor: "#D2691E",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
