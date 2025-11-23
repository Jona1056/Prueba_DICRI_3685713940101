import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function PublicRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  // Si ya hay token → redirigimos al dashboard
  if (token) return <Navigate to="/inicio" replace />;

  // Si NO está logeado → permitir ver el login
  return children;
}
