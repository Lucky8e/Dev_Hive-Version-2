import axios from "axios";
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
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/users/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        const isProd = process.env.NODE_ENV === "production";
        Cookies.set("accessToken", newToken, {
          expires: isProd ? 1 / 96 : 1 // 15 mins in prod, 1 day in dev
        });
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (error) {
        // refresh failed — clear everything and redirect to login
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;
