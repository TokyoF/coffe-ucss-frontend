// app/(tabs)/notifications.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications List */}
        <View style={styles.notificationsSection}>
          {/* Notification 1 - Order Update */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <Text style={styles.iconText}>☕</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Order Success</Text>
              <Text style={styles.notificationMessage}>
                Your order has been placed successfully. Your coffee will be
                ready in 10-15 minutes.
              </Text>
              <Text style={styles.notificationTime}>2 min ago</Text>
            </View>
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          {/* Notification 2 - Promo */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.promoIcon]}>
              <Text style={styles.iconText}>🎉</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Special Promo!</Text>
              <Text style={styles.notificationMessage}>
                Get 1 FREE coffee when you buy 2 today. Limited time offer!
              </Text>
              <Text style={styles.notificationTime}>1 hour ago</Text>
            </View>
          </TouchableOpacity>

          {/* Notification 3 - Order Ready */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.readyIcon]}>
              <Text style={styles.iconText}>✅</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Order Ready</Text>
              <Text style={styles.notificationMessage}>
                Your Cappuccino with Chocolate is ready for pickup at Aula 101.
              </Text>
              <Text style={styles.notificationTime}>3 hours ago</Text>
            </View>
          </TouchableOpacity>

          {/* Notification 4 - Payment Confirmation */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.paymentIcon]}>
              <Text style={styles.iconText}>💳</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Payment Confirmed</Text>
              <Text style={styles.notificationMessage}>
                Payment of $4.53 has been successfully processed via Yape.
              </Text>
              <Text style={styles.notificationTime}>5 hours ago</Text>
            </View>
          </TouchableOpacity>

          {/* Notification 5 - New Menu */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.menuIcon]}>
              <Text style={styles.iconText}>🆕</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>New Menu Available</Text>
              <Text style={styles.notificationMessage}>
                Try our new Matcha Latte and Chai Tea collection now available!
              </Text>
              <Text style={styles.notificationTime}>1 day ago</Text>
            </View>
          </TouchableOpacity>

          {/* Notification 6 - Delivery Update */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.deliveryIcon]}>
              <Text style={styles.iconText}>🚀</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Delivery Update</Text>
              <Text style={styles.notificationMessage}>
                Your order is on its way to Aula 205. Estimated arrival: 5
                minutes.
              </Text>
              <Text style={styles.notificationTime}>2 days ago</Text>
            </View>
          </TouchableOpacity>

          {/* Notification 7 - Welcome */}
          <TouchableOpacity style={styles.notificationItem}>
            <View style={[styles.notificationIcon, styles.welcomeIcon]}>
              <Text style={styles.iconText}>👋</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>
                Welcome to COFFE UCSS!
              </Text>
              <Text style={styles.notificationMessage}>
                Start ordering your favorite coffee and get it delivered to your
                classroom.
              </Text>
              <Text style={styles.notificationTime}>3 days ago</Text>
            </View>
          </TouchableOpacity>
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

  // Notifications Section
  notificationsSection: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#3C3C3C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D2691E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  promoIcon: {
    backgroundColor: "#FF6B6B",
  },
  readyIcon: {
    backgroundColor: "#32CD32",
  },
  paymentIcon: {
    backgroundColor: "#4A90E2",
  },
  menuIcon: {
    backgroundColor: "#9B59B6",
  },
  deliveryIcon: {
    backgroundColor: "#F39C12",
  },
  welcomeIcon: {
    backgroundColor: "#E67E22",
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notificationMessage: {
    color: "#CCC",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  notificationTime: {
    color: "#888",
    fontSize: 10,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D2691E",
    position: "absolute",
    top: 16,
    right: 16,
  },
});
