// src/pages/Usuarios/UsuariosList.jsx
import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import api from "../../api/axios";
import Swal from "sweetalert2";
import "./Usuarios.css";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [usuarioEdit, setUsuarioEdit] = useState(null); // null = creación
  const [form, setForm] = useState({
    Nombre: "",
    Cui: "",
    Email: "",
    Rol: "",
    Contrasena: "",
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/usuarios/listar", { params: { page: 1 } });
      setUsuarios(data.usuarios || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const abrirCrear = () => {
    setUsuarioEdit(null); // modo creación
    setForm({
      Nombre: "",
      Cui: "",
      Email: "",
      Rol: "",
      Contrasena: "",
    });
    setDialogVisible(true);
  };

  const abrirEditar = (u) => {
    setUsuarioEdit(u);
    setForm({
      Nombre: u.Nombre,
      Cui: u.Cui,
      Email: u.Email,
      Rol: u.Rol,
      Contrasena: "",
    });
    setDialogVisible(true);
  };

  const cerrarDialog = () => {
    if (saving) return;
    setDialogVisible(false);
    setUsuarioEdit(null);
  };

  const validarFormulario = () => {
    if (!form.Nombre.trim()) {
      Swal.fire({ icon: "error", title: "El nombre es obligatorio." });
      return false;
    }
    if (!form.Cui.trim()) {
      Swal.fire({ icon: "error", title: "El CUI es obligatorio." });
      return false;
    }
    if (!form.Email.includes("@")) {
      Swal.fire({ icon: "error", title: "Email no válido." });
      return false;
    }
    if (!["tecnico", "coordinador"].includes(form.Rol)) {
      Swal.fire({ icon: "error", title: "Debe seleccionar un rol válido." });
      return false;
    }

    // Validar contraseña SOLO en creación
    if (!usuarioEdit && !form.Contrasena.trim()) {
      Swal.fire({ icon: "error", title: "La contraseña es obligatoria." });
      return false;
    }

    if (!usuarioEdit && form.Contrasena.length < 6) {
      Swal.fire({ icon: "error", title: "La contraseña debe tener mínimo 6 caracteres." });
      return false;
    }

    return true;
  };

  const guardarUsuario = async () => {
    if (!validarFormulario()) return;

    const payload = {
      nombre: form.Nombre,
      cui: form.Cui,
      email: form.Email,
      rol: form.Rol,
    };

    if (!usuarioEdit) {
      // modo creación
      payload.contrasena = form.Contrasena;
    }

    try {
      setSaving(true);

      if (usuarioEdit) {
        await api.put(`/usuarios/actualizar/${usuarioEdit.ID_Usuario}`, payload);
        Swal.fire({ icon: "success", title: "Usuario actualizado correctamente." });
      } else {
        await api.post("/usuarios/crear", payload);
        Swal.fire({ icon: "success", title: "Usuario creado correctamente." });
      }

      await cargarUsuarios();
      cerrarDialog();
    } catch (err) {
     
      Swal.fire({
        icon: "error",
        title: err.response?.data?.msg || err.response.data.errors[0].msg,
        toast: true,
        position: "top-end",
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const eliminarUsuario = async (u) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar usuario?",
      text: `Se eliminará a ${u.Nombre}`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/usuarios/eliminar/${u.ID_Usuario}`);
      Swal.fire({ icon: "success", title: "Usuario eliminado." });
      await cargarUsuarios();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.msg || "Error inesperado",
      });
    }
  };
  
  const onChangeForm = (field, value) => {
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

  const accionesTemplate = (row) => (
    <div className="acciones-cell">
      <Button icon="pi pi-pencil" className="btn-edit" onClick={() => abrirEditar(row)} />
      <Button icon="pi pi-trash" className="btn-delete" onClick={() => eliminarUsuario(row)} />
    </div>
  );

  const dialogFooter = (
    <div className="dialog-footer">
      <Button label="Cancelar" className="p-button-text" onClick={cerrarDialog} />
      <Button
        label={saving ? "Guardando..." : "Guardar"}
        icon="pi pi-save"
        onClick={guardarUsuario}
        disabled={saving}
      />
    </div>
  );

  return (
    <div className="usuarios-container">
      <Card className="usuarios-card">
        <div className="usuarios-header">
          <h2 className="usuarios-title">Gestión de Usuarios</h2>

          <Button
            label="Crear Usuario"
            icon="pi pi-plus"
            className="btn-new-user"
            onClick={abrirCrear}
          />
        </div>

        <DataTable
          value={usuarios}
          loading={loading}
          paginator
          rows={8}
          className="usuarios-table full-width"
          rowHover
        >
          <Column field="ID_Usuario" header="ID" style={{ width: "80px" }} />
          <Column field="Nombre" header="Nombre" />
          <Column field="Cui" header="CUI" />
          <Column field="Email" header="Email" />
          <Column field="Rol" header="Rol" />
          <Column
            header="Acciones"
            body={accionesTemplate}
            style={{ width: "150px", textAlign: "center" }}
          />
        </DataTable>
      </Card>

      {/* MODAL */}
      <Dialog
        visible={dialogVisible}
        header={<div className="modal-header"><h3>{usuarioEdit ? "Editar Usuario" : "Crear Usuario"}</h3></div>}
        modal
        className="custom-dialog"
        footer={dialogFooter}
        onHide={cerrarDialog}
      >
        <div className="modal-body">
          <div className="group">
            <label>Nombre completo</label>
            <input type="text" value={form.Nombre} onChange={(e) => onChangeForm("Nombre", e.target.value)} />
          </div>

          <div className="group">
            <label>CUI</label>
            <input type="text" value={form.Cui} onChange={(e) => onChangeForm("Cui", e.target.value)} />
          </div>

          <div className="group">
            <label>Email</label>
            <input type="email" value={form.Email} onChange={(e) => onChangeForm("Email", e.target.value)} />
          </div>

          <div className="group">
            <label>Rol</label>
            <select value={form.Rol} onChange={(e) => onChangeForm("Rol", e.target.value)}>
              <option value="">Seleccione rol</option>
              <option value="coordinador">Coordinador</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>

          {!usuarioEdit && (
            <div className="group">
              <label>Contraseña</label>
              <input type="password" value={form.Contrasena} onChange={(e) => onChangeForm("Contrasena", e.target.value)} />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
