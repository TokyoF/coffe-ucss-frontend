// src/services/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// ========================================
// KEYS PARA ASYNCSTORAGE
// ========================================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "coffe_ucss_access_token",
  REFRESH_TOKEN: "coffe_ucss_refresh_token",
  USER_DATA: "coffe_ucss_user_data",
  CART_ITEMS: "coffe_ucss_cart_items",
  FAVORITE_IDS: "favorite_ids", // ← AGREGAR ESTA LÍNEA
} as const;

// ========================================
// FUNCIONES HELPER PARA ASYNCSTORAGE
// ========================================

/**
 * Guardar un valor en AsyncStorage
 */
export const setStorageItem = async (
  key: string,
  value: any,
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`✅ Storage: Saved ${key}`);
  } catch (error) {
    console.error(`❌ Storage Error saving ${key}:`, error);
    throw error;
  }
};

/**
 * Obtener un valor de AsyncStorage
 */
export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      console.log(`📭 Storage: ${key} not found`);
      return null;
    }
    const parsedValue = JSON.parse(jsonValue) as T;
    console.log(`📦 Storage: Retrieved ${key}`);
    return parsedValue;
  } catch (error) {
    console.error(`❌ Storage Error getting ${key}:`, error);
    return null;
  }
};

/**
 * Eliminar un valor de AsyncStorage
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Storage: Removed ${key}`);
  } catch (error) {
    console.error(`❌ Storage Error removing ${key}:`, error);
    throw error;
  }
};

/**
 * Limpiar todo el storage (útil para logout)
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log("🧹 Storage: Cleared all COFFE UCSS data");
  } catch (error) {
    console.error("❌ Storage Error clearing all:", error);
    throw error;
  }
};

/**
 * Verificar si AsyncStorage está disponible
 */
export const isStorageAvailable = async (): Promise<boolean> => {
  try {
    const testKey = "test_storage_availability";
    await AsyncStorage.setItem(testKey, "test");
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error("❌ Storage not available:", error);
    return false;
  }
};

// ========================================
// FUNCIONES ESPECÍFICAS PARA AUTH
// ========================================

/**
 * Guardar tokens de autenticación
 */
export const saveAuthTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  try {
    await Promise.all([
      setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
    console.log("🔐 Auth tokens saved successfully");
  } catch (error) {
    console.error("❌ Error saving auth tokens:", error);
    throw error;
  }
};

/**
 * Obtener tokens de autenticación
 */
export const getAuthTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN),
      getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("❌ Error getting auth tokens:", error);
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Limpiar tokens de autenticación
 */
export const clearAuthTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN),
      removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    console.log("🔑 Auth tokens cleared");
  } catch (error) {
    console.error("❌ Error clearing auth tokens:", error);
    throw error;
  }
};

/**
 * Guardar datos del usuario
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await setStorageItem(STORAGE_KEYS.USER_DATA, userData);
    console.log("👤 User data saved");
  } catch (error) {
    console.error("❌ Error saving user data:", error);
    throw error;
  }
};

/**
 * Obtener datos del usuario
 */
export const getUserData = async <T>(): Promise<T | null> => {
  try {
    return await getStorageItem<T>(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return null;
  }
};
