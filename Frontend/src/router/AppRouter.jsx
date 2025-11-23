import { Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";

import MainLayout from "../components/Layout/MainLayout";
import ExpedientesList from "../pages/Expedientes/ExpedientesList";
import ExpedienteForm from "../pages/Expedientes/ExpedienteForm";
import PerfilUsuario from "../pages/Perfil/PerfilUsuario";
import RevisionesList from "../pages/Revisiones/RevisionesList";
import RevisionDetalle from "../pages/Revisiones/RevisionDetalle";
// import RevisionesList from "../pages/Revisiones/RevisionesList";
// import UsuariosList from "../pages/Usuarios/UsuariosList";
import UsuariosList from "../pages/Usuarios/UsuariosList";
import useAuthStore from "../store/authStore";

export default function AppRouter() {
  const { usuario } = useAuthStore();

  return (
    <Routes>


      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

 
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* HOME → LISTA */}
        <Route index element={<ExpedientesList />} />

        {/* EXPEDIENTES */}
        <Route path="expedientes/detalle/:id" element={<ExpedienteForm />} />
        <Route path="expedientes/nuevo" element={<ExpedienteForm />} />

        {/* PERFIL */}
        <Route path="perfil" element={<PerfilUsuario />} />

        {/* RUTAS SOLO PARA COORDINADOR */}
        <Route path="revisiones" element={<RevisionesList />} />
<Route path="revisiones/detalle/:id_revision/:id_expediente" element={<RevisionDetalle />} />
<Route path="usuarios" element={<UsuariosList />} />
      </Route>

    </Routes>
  );
}
