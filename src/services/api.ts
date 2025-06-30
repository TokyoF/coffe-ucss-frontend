// src/services/api.ts
import {
  getAuthTokens,
  saveAuthTokens,
  clearAuthTokens,
  STORAGE_KEYS,
} from "./storage";

// ========================================
// CONFIGURACIÓN DEL API
// ========================================

// TODO: Cambiar por tu IP local para testing
export const API_BASE_URL = "http://192.168.1.2:3000";

// Endpoints principales
export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  PROFILE: "/api/auth/profile",

  // Products
  PRODUCTS: "/api/products",
  PRODUCT_BY_ID: (id: number) => `/api/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: number) =>
    `/api/products/category/${categoryId}`,

  // Categories
  CATEGORIES: "/api/categories",
  CATEGORY_BY_ID: (id: number) => `/api/categories/${id}`,

  // Orders
  ORDERS: "/api/orders",
  MY_ORDERS: "/api/orders/my-orders",
  ORDER_BY_ID: (id: number) => `/api/orders/${id}`,
  CANCEL_ORDER: (id: number) => `/api/orders/${id}/cancel`,

  // Notifications
  NOTIFICATIONS: "/api/notifications",
  MARK_NOTIFICATION_READ: (id: number) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: "/api/notifications/mark-all-read",
  // Favorites

  FAVORITES: "/api/favorites",
  ADD_FAVORITE: "/api/favorites",
  REMOVE_FAVORITE: (productId: number) => `/api/favorites/${productId}`,
  CHECK_FAVORITE: (productId: number) => `/api/favorites/check/${productId}`,
} as const;

// ========================================
// TIPOS DE RESPUESTA
// ========================================

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
  timestamp?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ========================================
// CLIENTE HTTP
// ========================================

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Realizar una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      // Headers por defecto
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Agregar token de autenticación si existe
      const { accessToken } = await getAuthTokens();
      if (accessToken) {
        (defaultHeaders as Record<string, string>).Authorization =
          `Bearer ${accessToken}`;
      }

      console.log(`🌐 API Request: ${options.method || "GET"} ${endpoint}`);

      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      const responseData = await response.json();

      // Si el token expiró, intentar renovarlo
      if (response.status === 401 && responseData.code === "TOKEN_EXPIRED") {
        console.log("🔄 Token expired, attempting refresh...");
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          // Reintentar la petición original con el nuevo token
          const retryHeaders: Record<string, string> = {
            ...(defaultHeaders as Record<string, string>),
            Authorization: `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          const retryData = await retryResponse.json();
          return { data: retryData };
        }
      }

      // Log de respuesta
      if (response.ok) {
        console.log(`✅ API Success: ${endpoint}`);
        // ✅ CORREGIDO: Retornar los datos directamente
        return { data: responseData };
      } else {
        console.log(`❌ API Error: ${endpoint} - ${response.status}`);
        return {
          success: false,
          error:
            responseData.error || responseData.message || "Error del servidor",
          data: responseData,
        };
      }
    } catch (error) {
      console.error(`💥 API Network Error: ${endpoint}`, error);
      return {
        success: false,
        error: "Error de conexión. Verifica tu internet.",
        message: "Network Error",
      };
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Si ya estamos renovando, esperar a que termine
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const { refreshToken } = await getAuthTokens();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        const { accessToken } = data;

        // Guardar nuevo access token (mantener refresh token actual)
        await saveAuthTokens(accessToken, refreshToken);

        // Notificar a todas las peticiones en espera
        this.refreshSubscribers.forEach((callback) => callback(accessToken));
        this.refreshSubscribers = [];

        console.log("🔑 Token refreshed successfully");
        return accessToken;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // Limpiar tokens y redirigir a login
      await clearAuthTokens();

      // Notificar fallo a peticiones en espera
      this.refreshSubscribers.forEach((callback) => callback(""));
      this.refreshSubscribers = [];

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ========================================
  // MÉTODOS HTTP
  // ========================================

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// ========================================
// INSTANCIA SINGLETON
// ========================================

export const apiClient = new ApiClient(API_BASE_URL);

// ========================================
// FUNCIONES DE CONVENIENCIA
// ========================================

/**
 * Verificar si el API está disponible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ status: string }>("/health");
    return (response.data as any)?.status === "OK";
  } catch (error) {
    console.error("❌ API Health check failed:", error);
    return false;
  }
};

/**
 * Configurar nueva URL base (útil para testing)
 */
export const setApiBaseUrl = (newUrl: string): void => {
  console.log(`🔗 API URL changed to: ${newUrl}`);
  // Crear nueva instancia con nueva URL
  Object.setPrototypeOf(apiClient, new ApiClient(newUrl));
};
