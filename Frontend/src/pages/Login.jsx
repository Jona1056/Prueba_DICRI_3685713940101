import { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import "./Login.css";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const loginStore = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { data } = await api.post("/auth/login", { email, contrasena });

      loginStore.login(data.token, data.usuario);

      const rol = data.usuario.Rol || data.usuario.rol;

      if (rol === "coordinador") {
        window.location.href = "/inicio/revisiones";
      
      } else {
        navigate("/inicio");
      }

    } catch (err) {
      const mensaje =
        err.response?.data?.msg ||
        "Error al iniciar sesión. Inténtelo nuevamente.";

      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: mensaje,
      });
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <Card className="login-card">
          <h2 className="login-title">Iniciar Sesión</h2>

          <div className="p-fluid">
            <label className="login-label">Correo electrónico</label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />

            <label className="login-label">Contraseña</label>
            <Password
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              feedback={false}
              toggleMask
              className="login-input"
            />

            <Button
              label="Sign in"
              className="login-button"
              onClick={handleLogin}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
