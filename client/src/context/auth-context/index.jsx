import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Dynamic import to avoid circular dependency
const getServices = async () => {
  const { checkAuthService, loginService, registerService } = await import("@/services");
  return { checkAuthService, loginService, registerService };
};

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);
  const [signInFieldErrors, setSignInFieldErrors] = useState({});
  const [signUpFieldErrors, setSignUpFieldErrors] = useState({});

  async function handleRegisterUser(event) {
    event.preventDefault();

    console.log("🔍 DEBUG: handleRegisterUser called");
    console.log("🔍 DEBUG: Current signUpFormData:", signUpFormData);

    // Clear previous field errors
    setSignUpFieldErrors({});

    // Client-side validation: Check if role is selected
    if (!signUpFormData.role || signUpFormData.role === "") {
      console.log("🔍 DEBUG: Role validation failed - no role selected");
      setSignUpFieldErrors({ role: "Please select a role." });
      return { success: false, message: "Please select a role." };
    }

    console.log("🔍 DEBUG: Role validation passed, proceeding with registration");
    console.log("Registration data:", signUpFormData);
    try {
      const { registerService } = await getServices();
      const response = await registerService(signUpFormData);
      console.log("Registration response:", response);

      if (response.success) {
        // Reset form on success
        setSignUpFormData(initialSignUpFormData);
        setSignUpFieldErrors({});
        // Optionally switch to signin tab
        // You might want to add a callback or state to handle this
        return { success: true, message: response.message };
      } else {
        // Do not reset form on failure to allow user to correct issues
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.log("🔍 DEBUG: Error response data:", error.response?.data);
      console.log("🔍 DEBUG: Error status:", error.response?.status);
      console.log("🔍 DEBUG: Full error response:", error.response);
      console.log("🔍 DEBUG: Error message from server:", error.response?.data?.message);
      console.log("🔍 DEBUG: Error details from server:", error.response?.data);
      console.log("🔍 DEBUG: Validation errors array:", error.response?.data?.errors);
      console.log("🔍 DEBUG: First validation error:", error.response?.data?.errors?.[0]);
      console.log("🔍 DEBUG: First validation error field:", error.response?.data?.errors?.[0]?.field);
      console.log("🔍 DEBUG: First validation error message:", error.response?.data?.errors?.[0]?.message);

      // Handle field-specific validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setSignUpFieldErrors(fieldErrors);
      }

      // Do not reset form on failure to allow user to correct issues
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again."
      };
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();

    // Clear previous field errors
    setSignInFieldErrors({});

    try {
      const { loginService } = await getServices();
      const data = await loginService(signInFormData);

      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          data.data.accessToken
        );
        sessionStorage.setItem(
          "refreshToken",
          data.data.refreshToken
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
          refreshToken: data.data.refreshToken,
        });
        setSignInFieldErrors({});
        return { success: true, message: data.message };
      } else {
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuth({
        authenticate: false,
        user: null,
        refreshToken: null,
      });

      // Handle field-specific validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setSignInFieldErrors(fieldErrors);
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials."
      };
    }
  }

  //check auth user

  async function checkAuthUser() {
    console.log("🔍 DEBUG: checkAuthUser called");
    const accessToken = sessionStorage.getItem("accessToken");
    console.log("🔍 DEBUG: accessToken exists:", !!accessToken);
    if (!accessToken) {
      setAuth({
        authenticate: false,
        user: null,
        refreshToken: null,
      });
      setLoading(false);
      return;
    }

    try {
      const { checkAuthService } = await getServices();
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
          refreshToken: sessionStorage.getItem("refreshToken"),
        });
        setLoading(false);
      } else {
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        setLoading(false);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("accessToken");
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        setLoading(false);
      } else if (!error?.response?.data?.success) {
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        setLoading(false);
      }
    }
  }

  function resetCredentials() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setAuth({
      authenticate: false,
      user: null,
      refreshToken: null,
    });
  }

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setAuth({
      authenticate: false,
      user: null,
      refreshToken: null,
    });
  }

  useEffect(() => {
    console.log("🔍 DEBUG: AuthProvider useEffect running");
    // Initialize refresh token from sessionStorage if available
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    console.log("🔍 DEBUG: storedRefreshToken:", storedRefreshToken);
    if (storedRefreshToken) {
      setAuth(prev => ({ ...prev, refreshToken: storedRefreshToken }));
    }
    checkAuthUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
        logout,
        signInFieldErrors,
        signUpFieldErrors,
        setSignInFieldErrors,
        setSignUpFieldErrors,
      }}
    >
      {(() => {
        console.log("🔍 DEBUG: AuthProvider rendering children");
        console.log("🔍 DEBUG: loading state:", loading);
        return loading ? <Skeleton /> : children;
      })()}
    </AuthContext.Provider>
  );
}
