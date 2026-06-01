import axios from "axios";
import { error } from "console";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL! || "http://localhost:8000/api/v1",
  withCredentials: true
});

//attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//refresh accessToken when expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { data } = await apiClient.post("/users/refresh");
        const newToken = data.data.accessToken;
        Cookies.set("accessToken", newToken, { expires: 1 / 96 });
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (error) {
        // refresh failed — clear everything and redirect to login
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
