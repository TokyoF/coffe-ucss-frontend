// src/context/AuthContext.tsx - Con debugging mejorado
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  saveAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  saveUserData,
  getUserData,
} from "../services/storage";
import { apiClient, API_ENDPOINTS, AuthResponse } from "../services/api";

// ========================================
// TIPOS DE DATOS
// ========================================

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Funciones
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;

  // Verificaciones
  isAdmin: () => boolean;
  isClient: () => boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// ========================================
// CONTEXTO
// ========================================

const AuthContext = createContext<AuthState | undefined>(undefined);

// ========================================
// HOOK PERSONALIZADO
// ========================================

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ========================================
// PROVIDER COMPONENT
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ========================================
  // INICIALIZACIÓN - VERIFICAR TOKENS GUARDADOS
  // ========================================

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async (): Promise<void> => {
    try {
      console.log("🔍 Checking stored authentication...");

      const { accessToken, refreshToken } = await getAuthTokens();

      if (!accessToken || !refreshToken) {
        console.log("📭 No stored tokens found");
        setIsLoading(false);
        return;
      }

      // Intentar obtener el perfil del usuario con el token existente
      const profileResponse = await apiClient.get<{ user: User }>(
        API_ENDPOINTS.PROFILE,
      );

      console.log("🔍 Profile response:", profileResponse);

      // ✅ ARREGLADO: Verificar estructura correcta de la respuesta
      if (profileResponse.data && profileResponse.data.user) {
        const userData = profileResponse.data.user;
        console.log("✅ User data received:", userData);

        setUser(userData);
        setIsAuthenticated(true);
        await saveUserData(userData);
        console.log("✅ Authentication restored from storage");
      } else if (profileResponse.data && (profileResponse.data as any).email) {
        // ✅ FALLBACK: Si la respuesta tiene email directamente (formato alternativo)
        const userData = profileResponse.data as any;
        console.log("✅ User data received (direct format):", userData);

        setUser(userData);
        setIsAuthenticated(true);
        await saveUserData(userData);
        console.log("✅ Authentication restored from storage (direct format)");
      } else {
        // Si falla, limpiar tokens
        await clearAuthTokens();
        console.log("❌ Stored tokens invalid, cleared");
      }
    } catch (error) {
      console.error("❌ Error checking stored auth:", error);
      await clearAuthTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FUNCIÓN DE LOGIN
  // ========================================

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log("🔐 Attempting login for:", email);

      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
      });

      // ✅ DEBUGGING MEJORADO
      const responseData = response.data as any;
      console.log(
        "🔍 Login response full:",
        JSON.stringify(responseData, null, 2),
      );

      if (responseData?.tokens && responseData?.user) {
        console.log("✅ Login tokens received:", responseData.tokens);
        console.log("✅ Login user received:", responseData.user);

        // Guardar tokens
        await saveAuthTokens(
          responseData.tokens.accessToken,
          responseData.tokens.refreshToken,
        );

        // Guardar datos del usuario
        await saveUserData(responseData.user);

        // Actualizar estado
        setUser(responseData.user as User);
        setIsAuthenticated(true);

        console.log("✅ Login successful");
        return {
          success: true,
          message: responseData.message || "Login exitoso",
        };
      } else {
        console.log("❌ Login failed - Invalid response structure");
        console.log("🔍 Response data:", responseData);
        return {
          success: false,
          message:
            responseData.error || responseData.message || "Error en el login",
        };
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        message: error.message || "Error de conexión",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FUNCIÓN DE REGISTRO
  // ========================================

  const register = async (
    userData: RegisterData,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log("📝 Attempting registration for:", userData.email);

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        userData,
      );

      // ✅ DEBUGGING MEJORADO
      const responseData = response.data as any;
      console.log(
        "🔍 Register response full:",
        JSON.stringify(responseData, null, 2),
      );

      if (responseData?.tokens && responseData?.user) {
        console.log("✅ Register tokens received:", responseData.tokens);
        console.log("✅ Register user received:", responseData.user);

        // Guardar tokens
        await saveAuthTokens(
          responseData.tokens.accessToken,
          responseData.tokens.refreshToken,
        );

        // Guardar datos del usuario
        await saveUserData(responseData.user);

        // Actualizar estado
        setUser(responseData.user as User);
        setIsAuthenticated(true);

        console.log("✅ Registration successful");
        return {
          success: true,
          message: responseData.message || "Registro exitoso",
        };
      } else {
        console.log("❌ Registration failed");
        console.log("🔍 Response data:", responseData);
        return {
          success: false,
          message:
            responseData.error ||
            responseData.message ||
            "Error en el registro",
        };
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      return {
        success: false,
        message: error.message || "Error de conexión",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FUNCIÓN DE LOGOUT
  // ========================================

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("🚪 Logging out...");

      // Intentar logout en el servidor (opcional, puede fallar)
      const { refreshToken } = await getAuthTokens();
      if (refreshToken) {
        try {
          await apiClient.post(API_ENDPOINTS.LOGOUT, { refreshToken });
        } catch (error) {
          // No es crítico si falla el logout del servidor
          console.log("⚠️ Server logout failed, continuing with local logout");
        }
      }

      // Limpiar storage local
      await clearAuthTokens();

      // Limpiar estado
      setUser(null);
      setIsAuthenticated(false);

      console.log("✅ Logout completed");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Forzar limpieza local incluso si hay errores
      await clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FUNCIÓN PARA REFRESCAR PERFIL
  // ========================================

  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (!isAuthenticated) return;

      console.log("🔄 Refreshing user profile...");
      const response = await apiClient.get<{ user: User }>(
        API_ENDPOINTS.PROFILE,
      );

      console.log("🔍 Profile refresh response:", response);

      // ✅ ARREGLADO: Manejar estructura correcta de la respuesta
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log("✅ Profile refreshed with data:", userData);

        setUser(userData);
        await saveUserData(userData);
        console.log("✅ Profile refreshed and saved");
      } else if (response.data && (response.data as any).email) {
        // ✅ FALLBACK: Si la respuesta tiene email directamente
        const userData = response.data as any;
        console.log(
          "✅ Profile refreshed with data (direct format):",
          userData,
        );

        setUser(userData);
        await saveUserData(userData);
        console.log("✅ Profile refreshed and saved (direct format)");
      }
    } catch (error) {
      console.error("❌ Error refreshing profile:", error);
    }
  };

  // ========================================
  // FUNCIONES DE VERIFICACIÓN
  // ========================================

  const isAdmin = (): boolean => {
    return user?.role === "ADMIN";
  };

  const isClient = (): boolean => {
    return user?.role === "CLIENT";
  };

  // ========================================
  // VALOR DEL CONTEXTO
  // ========================================

  const authValue: AuthState = {
    // Estado
    user,
    isAuthenticated,
    isLoading,

    // Funciones
    login,
    register,
    logout,
    refreshUserProfile,

    // Verificaciones
    isAdmin,
    isClient,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
