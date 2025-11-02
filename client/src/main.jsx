// Debug logs for deployment issues
console.log("🔍 DEBUG: main.jsx loaded");
console.log("🔍 DEBUG: import.meta.env.DEV:", import.meta.env.DEV);
console.log("🔍 DEBUG: import.meta.env.PROD:", import.meta.env.PROD);
console.log("🔍 DEBUG: import.meta.env.BASE_URL:", import.meta.env.BASE_URL);
console.log("🔍 DEBUG: window.location:", window.location);
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
console.log("🔍 DEBUG: About to render App");
console.log("🔍 DEBUG: basename:", basename);
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
const basename = import.meta.env.DEV ? "" : "/LMS";

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <InstructorProvider>
        <StudentProvider>
          <App />
        </StudentProvider>
      </InstructorProvider>
    </AuthProvider>
  </BrowserRouter>
);
