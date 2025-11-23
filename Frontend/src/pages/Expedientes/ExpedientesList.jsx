import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import "./Expedientes.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ExpedientesList() {
  const { usuario } = useAuthStore();
  const navigate = useNavigate();

  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
const [refrescar, setRefrescar] = useState(false);
  const [pagina, setPagina] = useState(1);   // 1-based para el backend
  const [first, setFirst] = useState(0);     // offset para PrimeReact
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Filtros
  const [estado, setEstado] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null); // por si luego lo usas
  const [idExpediente, setIdExpediente] = useState("");
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [usuariosLista, setUsuariosLista] = useState([]);

  const estados = [
    { label: "Borrador", value: "borrador" },
    { label: "Pendiente", value: "pendiente" },
    { label: "Aprobado", value: "aprobado" },
    { label: "Rechazado", value: "rechazado" },
  ];

  const estadoTemplate = (row) => {
    const colorMap = {
      borrador: "badge-gray",
      pendiente: "badge-blue",
      aprobado: "badge-green",
      rechazado: "badge-red",
    };
    return <span className={`badge ${colorMap[row.Estado]}`}>{row.Estado}</span>;
  };

  const fechaTemplate = (row) => {
    if (!row.Fecha) return "-";
    const fechaISO = row.Fecha;
    const fecha = fechaISO.split("T")[0];
    const hora = fechaISO.split("T")[1].substring(0, 5);
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y} ${hora}`;
  };

 const cargarExpedientes = async (page = 1) => {
  setLoading(true);

  try {
    const params = {
      page,
      estado: estado || null,
      expediente: idExpediente || null,
      fechaInicio: fechaInicio ? fechaInicio.toISOString().split("T")[0] : null,
      fechaFin: fechaFin ? fechaFin.toISOString().split("T")[0] : null,
    };

    const { data } = await api.get("/expedientes/listar", { params });

    setExpedientes(data.expedientes || []);
    setTotalRegistros(data.total || 0);

    // siempre establecer la nueva página
    setPagina(page);
  } catch (err) {
    console.log(err);
  }

  setLoading(false);
};
  const cargarUsuarios = async () => {
    if (usuario.rol !== "coordinador") return;
    try {
      const { data } = await api.get("/usuarios/listar?page=1");
      setUsuariosLista(
        data.usuarios.map((u) => ({
          label: u.Nombre,
          value: u.ID_Usuario,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    cargarExpedientes(1);
    cargarUsuarios();
      if (refrescar) {
    cargarExpedientes(1); // ahora sí se ejecuta con filtros limpios
    setRefrescar(false);
  }
  }, [refrescar]);

  useEffect(() => {
    const mensaje = sessionStorage.getItem("expMensaje");
    if (mensaje) {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: mensaje,
      });
      sessionStorage.removeItem("expMensaje");
    }
  }, []);

  const aplicarFiltros = () => {
    setFirst(0);
    cargarExpedientes(1);
  };

const limpiarFiltros = () => {
  setEstado(null);
  setIdUsuario(null);
  setIdExpediente("");
  setFechaInicio(null);
  setFechaFin(null);
  setFirst(0); // resetea paginación
  setRefrescar(true); // marcar que debe recargar
};
  const cambiarPagina = (event) => {
    const nuevaPagina = event.page + 1; // PrimeReact es 0-based
    setFirst(event.first);
    cargarExpedientes(nuevaPagina);
  };

  const onRowClick = (row) => {
    navigate(`/inicio/expedientes/detalle/${row.data.ID_Expediente}`);
  };

  return (
    <div className="exp-container">
      <Card className="exp-card">
        <h2 className="exp-title">Expedientes</h2>

        <div style={{ marginBottom: "20px" }}>
          <Button
            label="Nuevo Expediente"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => navigate("/inicio/expedientes/nuevo")}
          />
        </div>

        {/* FILTROS */}
        <div className="exp-filter-grid">
          <Dropdown
            value={estado}
            options={estados}
            onChange={(e) => setEstado(e.value)}
            placeholder="Estado"
            className="exp-filter-item"
          />

          <InputText
            value={idExpediente}
            onChange={(e) => setIdExpediente(e.target.value)}
            placeholder="ID Expediente"
            className="exp-filter-item"
          />

          <Calendar
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.value)}
            placeholder="Fecha inicio"
            dateFormat="yy-mm-dd"
            className="exp-filter-item"
          />

          <Calendar
            value={fechaFin}
            onChange={(e) => setFechaFin(e.value)}
            placeholder="Fecha fin"
            dateFormat="yy-mm-dd"
            className="exp-filter-item"
          />

          <Button label="Filtrar" icon="pi pi-search" onClick={aplicarFiltros} />

          <Button
            label="Limpiar"
            icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={limpiarFiltros}
          />
        </div>

        {/* TABLA */}
        <DataTable
          value={expedientes}
          loading={loading}
          paginator
          lazy
          rows={25}
          first={first}
          totalRecords={totalRegistros}
          onPage={cambiarPagina}
          onRowClick={onRowClick}
          className="exp-table"
          emptyMessage="No hay expedientes que coincidan con los filtros."
        >
          <Column field="ID_Expediente" header="ID"  />
          <Column field="Descripcion" header="Descripción"  />
          <Column field="Estado" body={estadoTemplate} header="Estado"  />
          <Column field="Fecha" body={fechaTemplate} header="Fecha"  />
          <Column field="Usuario_Responsable" header="Responsable"  />
        </DataTable>
      </Card>
    </div>
  );
}
