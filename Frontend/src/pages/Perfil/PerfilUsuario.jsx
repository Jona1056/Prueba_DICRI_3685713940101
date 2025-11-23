import { useState, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import useAuthStore from "../../store/authStore";
import "./Perfil.css";

export default function PerfilUsuario() {
  const { usuario, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("perfil");
  const [hasChanges, setHasChanges] = useState(false);

  const [datos, setDatos] = useState({
    Nombre: "",
    Cui: "",
    Email: "",
    Rol: "",
  });

  const [datosOriginal, setDatosOriginal] = useState(null);

  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: "",
    repetir: "",
  });

  useEffect(() => {
    setDatos({
      Nombre: usuario.Nombre,
      Cui: usuario.Cui,
      Email: usuario.Email,
      Rol: usuario.Rol,
    });
    setDatosOriginal({
      Nombre: usuario.Nombre,
      Cui: usuario.Cui,
      Email: usuario.Email,
      Rol: usuario.Rol,
    });
  }, [usuario]);

  const onChangeDatos = (field, value) => {
    setDatos((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const revertirCambios = () => {
    setDatos(datosOriginal);
    setHasChanges(false);
  };

  const guardarPerfil = async () => {
    try {
      const payload = {
        nombre: datos.Nombre,
        cui: datos.Cui,
        email: datos.Email,
      };

      await api.put(`/usuarios/actualizar/${usuario.ID_Usuario}`, payload);

      Swal.fire("Actualizado", "Los datos fueron actualizados correctamente", "success");

      updateUser({
        Nombre: datos.Nombre,
        Cui: datos.Cui,
        Email: datos.Email,
      });

      setDatosOriginal(datos);
      setHasChanges(false);
    } catch (err) {
     
      Swal.fire("Error", err.response?.data?.message || "No se pudo actualizar", "error");
    }
  };

  const cambiarPassword = async () => {
    if (!passwords.actual.trim() || !passwords.nueva.trim() || !passwords.repetir.trim()) {
      return Swal.fire("Error", "Todos los campos son obligatorios", "error");
    }

    if (passwords.nueva !== passwords.repetir) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    try {
      await api.put(`/usuarios/actualizar/${usuario.ID_Usuario}`, {
        contrasenaActual: passwords.actual,
        contrasena: passwords.nueva,
      });

      Swal.fire("Actualizado", "La contraseña fue modificada", "success");

      setPasswords({ actual: "", nueva: "", repetir: "" });
    } catch (err) {
    
      Swal.fire("Error", err.response?.data?.msg || "Error al cambiar la contraseña", "error");
    }
  };

  return (
    <div className="perfil-wrapper">
      <div className="perfil-card">
        <h2 className="perfil-title">Mi Perfil</h2>

        <div className="perfil-tabs">
          <button
            className={activeTab === "perfil" ? "active" : ""}
            onClick={() => setActiveTab("perfil")}
          >
            Datos Personales
          </button>

          <button
            className={activeTab === "pass" ? "active" : ""}
            onClick={() => setActiveTab("pass")}
          >
            Cambiar Contraseña
          </button>
        </div>

        {/* TAB PERFIL */}
        {activeTab === "perfil" && (
          <div className="perfil-section">

            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={datos.Nombre}
                onChange={(e) => onChangeDatos("Nombre", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>CUI</label>
              <input
                type="text"
                value={datos.Cui}
                onChange={(e) => onChangeDatos("Cui", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                value={datos.Email}
                onChange={(e) => onChangeDatos("Email", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Rol</label>
              <input type="text" value={datos.Rol} disabled />
            </div>

            <div className="perfil-buttons">
              {hasChanges && (
                <button className="btn-revert" onClick={revertirCambios}>
                  ↩ Revertir
                </button>
              )}

              <button
                className={`btn-save ${hasChanges ? "active" : "disabled"}`}
                disabled={!hasChanges}
                onClick={guardarPerfil}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTRASEÑA */}
        {activeTab === "pass" && (
          <div className="perfil-section">
            <div className="form-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={passwords.actual}
                onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={passwords.nueva}
                onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Repetir nueva contraseña</label>
              <input
                type="password"
                value={passwords.repetir}
                onChange={(e) => setPasswords({ ...passwords, repetir: e.target.value })}
              />
            </div>

            <button className="btn-save active" onClick={cambiarPassword}>
              Actualizar Contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
