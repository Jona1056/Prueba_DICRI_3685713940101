import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children, roles = [] }) {
  const { token, usuario } = useAuthStore();

  if (!token) {
    return <Navigate to="/" replace />;
  }


  if (roles.length > 0) {
    if (!usuario || !roles.includes(usuario.Rol)) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return children;
}
