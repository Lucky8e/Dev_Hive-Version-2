import apiClient from "@/lib/apiClient";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

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

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });
  const fetchCurrentUser = useCallback(async () => {
    const token = Cookies.get("accessToken");

    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
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
    fetchCurrentUser;
  }, [fetchCurrentUser]);

  const login = async (username: string, email: string) => {
    const { data } = await apiClient.post("/users/loginUser", {
      username,
      email
    });
    const { accessToken, user } = data.data;
    Cookies.set("accessToken", accessToken, { expires: 1 / 96 });
    setState({
      user: user,
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

    const { accessToken, user } = data.data;
    Cookies.set("accessToken", accessToken, { expires: 1 / 96 });
    setState({
      user: user,
      isAuthenticated: true,
      isLoading: false
    });
    return user;
  };

  const logout = async () => {
    await apiClient.post("/users/logoutUser");
    Cookies.remove("accessToken");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return {
    ...state,
    login,
    register,
    logout,
    refetch: fetchCurrentUser
  };
};
