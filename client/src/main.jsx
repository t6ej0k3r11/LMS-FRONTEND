import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import { Toaster } from "@/components/ui/toaster";
const basename = import.meta.env.DEV ? "" : "/";

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <InstructorProvider>
        <StudentProvider>
          <App />
          <Toaster />
        </StudentProvider>
      </InstructorProvider>
    </AuthProvider>
  </BrowserRouter>
);
