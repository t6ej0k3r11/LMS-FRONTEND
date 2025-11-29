import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "@/hooks/use-toast";
import { checkAuthService, loginService, registerService, logoutService } from "@/services";

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

    // Clear previous field errors
    setSignUpFieldErrors({});

    // Client-side validation: Check if role is selected
    if (!signUpFormData.role || signUpFormData.role === "") {
      setSignUpFieldErrors({ role: "Please select a role." });
      return { success: false, message: "Please select a role." };
    }

    try {
      const response = await registerService(signUpFormData);

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
      const data = await loginService(signInFormData);

      if (data.success) {
        localStorage.setItem(
          "accessToken",
          data.data.accessToken
        );
        // Note: refreshToken is now handled via httpOnly cookies
        setAuth({
          authenticate: true,
          user: data.data.user,
          refreshToken: null, // No longer stored in localStorage
        });
        setSignInFieldErrors({});
        toast({
          title: "Success",
          description: "Login successful! Welcome back.",
          variant: "default",
        });
        return { success: true, message: data.message };
      } else {
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        toast({
          title: "Error",
          description: data.message || "Login failed. Please check your credentials.",
          variant: "destructive",
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
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

      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed. Please check your credentials.",
        variant: "destructive",
      });

      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials."
      };
    }
  }

  //check auth user

  async function checkAuthUser() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setAuth({
        authenticate: false,
        user: null,
        refreshToken: null,
      });
      setLoading(false);
      return;
    }

    // Check if token is expired before making request
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        // Token expired, clear it
        localStorage.removeItem("accessToken");
        setAuth({
          authenticate: false,
          user: null,
          refreshToken: null,
        });
        setLoading(false);
        return;
      }
    } catch {
      // Invalid token format, clear it
      localStorage.removeItem("accessToken");
      setAuth({
        authenticate: false,
        user: null,
        refreshToken: null,
      });
      setLoading(false);
      return;
    }

    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
          refreshToken: null, // No longer stored in localStorage
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
        localStorage.removeItem("accessToken");
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
    localStorage.removeItem("accessToken");
    setAuth({
      authenticate: false,
      user: null,
      refreshToken: null,
    });
  }

  async function logout() {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("accessToken");
      setAuth({
        authenticate: false,
        user: null,
        refreshToken: null,
      });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    }
  }

  useEffect(() => {
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
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
