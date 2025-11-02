import axios from "axios";

// Singleton pattern to ensure only one instance
let axiosInstance = null;
let isInitializing = false;

console.log("🔍 DEBUG: axiosInstance.js loaded");
console.log("🔍 DEBUG: VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("🔍 DEBUG: import.meta.env:", import.meta.env);

// Function to get the server port dynamically
const getServerPort = async () => {
  try {
    // Try to get port from environment variable first
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      const url = new URL(envUrl);
      return url.port || (url.protocol === "https:" ? "443" : "80");
    }

    // Fallback: try to discover port from server
    const ports = ["5000", "5001", "5002", "5003"];
    for (const port of ports) {
      try {
        const response = await axios.get(
          `http://localhost:${port}/api/server-port`,
          {
            timeout: 1000,
          }
        );
        return response.data.port.toString();
      } catch {
        continue;
      }
    }
    return "5001";
  } catch {
    // Final fallback to default ports
    return "5001";
  }
};

// Create axios instance with dynamic base URL
const createAxiosInstance = async () => {
  console.log("🔍 DEBUG: createAxiosInstance called");
  if (axiosInstance) {
    console.log("🔍 DEBUG: Returning existing axiosInstance");
    return axiosInstance;
  }

  if (isInitializing) {
    console.log("🔍 DEBUG: Initialization in progress, waiting...");
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return axiosInstance;
  }

  isInitializing = true;
  console.log("🔍 DEBUG: Starting axios instance initialization");

  try {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      console.log("Using VITE_API_URL as baseURL:", envUrl);
      console.log("Current window location:", window.location.origin);
      axiosInstance = axios.create({
        baseURL: envUrl,
      });
    } else {
      // Fallback for development
      const port = await getServerPort();
      const baseURL = `http://localhost:${port}`;
      console.log("Axios baseURL set to:", baseURL);
      console.log("Current window location:", window.location.origin);
      axiosInstance = axios.create({
        baseURL,
      });
    }

    // Set withCredentials globally for all requests
    axiosInstance.defaults.withCredentials = true;

    // Add request interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = sessionStorage.getItem("accessToken") || "";
        console.log(
          "Axios request interceptor - Token in storage:",
          !!accessToken
        );
        console.log(
          "Axios request interceptor - Token length:",
          accessToken.length
        );
        console.log("Axios request interceptor - Request URL:", config.url);
        console.log(
          "Axios request interceptor - withCredentials:",
          config.withCredentials
        );

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log("Axios request interceptor - Authorization header set");
        } else {
          console.log(
            "Axios request interceptor - No token found, no Authorization header"
          );
        }

        return config;
      },
      (err) => Promise.reject(err)
    );

    // Add response interceptor
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Import the refresh service dynamically to avoid circular dependency
            console.log(
              "🔍 DEBUG: Attempting dynamic import of refreshTokenService"
            );
            const { refreshTokenService } = await import("@/services");
            console.log("🔍 DEBUG: Dynamic import successful");

            const refreshResponse = await refreshTokenService();

            if (refreshResponse.success) {
              // Update the access token in sessionStorage
              sessionStorage.setItem(
                "accessToken",
                refreshResponse.data.accessToken
              );

              // Update the refresh token in sessionStorage if provided
              if (refreshResponse.data.refreshToken) {
                sessionStorage.setItem(
                  "refreshToken",
                  refreshResponse.data.refreshToken
                );
              }

              // Update the Authorization header for the original request
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

              // Retry the original request
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // Check if refresh token is expired (401 from refresh endpoint)
            if (refreshError.response?.status === 401) {
              console.log("Refresh token expired, redirecting to login");
              // Clear all tokens
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("refreshToken");
              // Redirect to login page
              window.location.href = "/auth";
            } else {
              // Other refresh errors (network, server error, etc.)
              console.error(
                "Unexpected error during token refresh:",
                refreshError
              );
              // Clear tokens and redirect
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("refreshToken");
              window.location.href = "/auth";
            }
          }
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  } finally {
    isInitializing = false;
  }
};

// Export the function that returns the promise resolving to the instance
export default createAxiosInstance;
