"use client";
import { createContext, useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import apiClient from "@/lib/apiClient";

type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const fetchCurrentUser = useCallback(async () => {
    const token = Cookies.get("accessToken");

    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const { data } = await apiClient.get("/users/getMe");
      setState({
        user: data.data,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post("/users/loginUser", {
      email,
      password
    });
    const { user } = data.data;

    console.log("SET COOKIE:", Cookies.get("accessToken"));
    console.log("ALL COOKIES:", document.cookie);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
    return user;
  };
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const { data } = await apiClient.post("/users/registerUser", {
      username,
      email,
      password
    });
    const { user } = data.data;

    setState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
    return user;
  };

  const logout = async () => {
    await apiClient.post("/users/logoutUser");

    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refetch: fetchCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
