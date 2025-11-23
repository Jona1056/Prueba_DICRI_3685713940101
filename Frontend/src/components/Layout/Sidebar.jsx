import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import "./Sidebar.css";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuthStore();


  const menuCoordinador = [
    { label: "Revisiones", icon: "pi pi-check-square", path: "/inicio/revisiones" },
    { label: "Usuarios", icon: "pi pi-users", path: "/inicio/usuarios" },
      { label: "Perfil", icon: "pi pi-user-edit", path: "/inicio/perfil" },
  ];
 
  const menuTecnico = [
    { label: "Expedientes", icon: "pi pi-folder", path: "/inicio" },
    { label: "Perfil", icon: "pi pi-user-edit", path: "/inicio/perfil" },
  ];
  const menu = usuario?.Rol === "coordinador"
    ? [ ...menuCoordinador]
    : menuTecnico;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">SISTEMA DICRI</div>

      {usuario && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {usuario.Nombre?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <div className="user-name">{usuario.Nombre}</div>
            <div className="user-role">{usuario.Rol?.toUpperCase()}</div>
          </div>
        </div>
      )}

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${pathname === item.path ? "active" : ""}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        className="sidebar-logout"
        onClick={() => {
          logout();
          window.location.href = "/";
        }}
      >
        <i className="pi pi-sign-out" />
        Salir
      </button>
    </aside>
  );
}
