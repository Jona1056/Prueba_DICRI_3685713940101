import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import api from "../../api/axios";
import "./Revisiones.css";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import Swal from "sweetalert2";
export default function RevisionesList() {
  const navigate = useNavigate();

  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [first, setFirst] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [estado, setEstado] = useState(null);
  const [idExpediente, setIdExpediente] = useState("");
  const [fechaRevision, setFechaRevision] = useState(null);
  const [refrescar, setRefrescar] = useState(false);

  const estados = [
    { label: "Pendiente", value: "pendiente" },
    { label: "Aprobado", value: "aprobado" },
    { label: "Rechazado", value: "rechazado" },
  ];

  const fechaTemplate = (row) => {
    if (!row.Fecha_Revision) return "-";
    const iso = row.Fecha_Revision;
    const fecha = iso.split("T")[0];
    const hora = iso.split("T")[1]?.substring(0, 5);
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y} ${hora}`;
  };

  const estadoTemplate = (row) => {
    const colorMap = {
      pendiente: "badge-blue",
      aprobado: "badge-green",
      rechazado: "badge-red",
    };
    return <span className={`badge ${colorMap[row.Estado]}`}>{row.Estado}</span>;
  };

  const cargarRevisiones = async (page = 1) => {
    setLoading(true);

    try {
      const params = {
        page,
        id_expediente: idExpediente || null,
        estado: estado || null,
        fecha_revision: fechaRevision
          ? fechaRevision.toISOString().split("T")[0]
          : null,
      };

      const { data } = await api.get("/revisiones/listar", { params });

      setRevisiones(data.revisiones || []);
      setTotalRegistros(data.total || 0);
      setPagina(page);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

useEffect(() => {
  cargarRevisiones(1);

  if (refrescar) {
    cargarRevisiones(1);
    setRefrescar(false);
  }
}, [refrescar]);


useEffect(() => {
  const handler = (data) => {
  

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: `Nuevo expediente enviado a revisión (#${data.id_expediente})`,
      showConfirmButton: false,
      timer: 3000
    });
  };

  // Registrar listener
  socket.on("revision:nueva", handler);

  // Cleanup
  return () => socket.off("revision:nueva", handler);
}, []);
  const aplicarFiltros = () => {
    setFirst(0);
    cargarRevisiones(1);
  };

  const limpiarFiltros = () => {
    setEstado(null);
    setIdExpediente("");
    setFechaRevision(null);

    setFirst(0);
    setRefrescar(true);
  };

  const cambiarPagina = (event) => {
    const nuevaPagina = event.page + 1;
    setFirst(event.first);
    cargarRevisiones(nuevaPagina);
  };

 const onRowClick = (row) => {

  navigate(`/inicio/revisiones/detalle/${row.data.ID_Revision}/${row.data.ID_Expediente}`);
};
  return (
    <div className="rev-container">
      <Card className="rev-card">
        <h2 className="rev-title">Revisiones</h2>

        {/* FILTROS */}
        <div className="rev-filter-grid">
          <Dropdown
            value={estado}
            options={estados}
            onChange={(e) => setEstado(e.value)}
            placeholder="Estado"
            className="rev-filter-item"
          />

          <InputText
            value={idExpediente}
            onChange={(e) => setIdExpediente(e.target.value)}
            placeholder="ID Expediente"
            className="rev-filter-item"
          />

          <Calendar
            value={fechaRevision}
            onChange={(e) => setFechaRevision(e.value)}
            placeholder="Fecha de revisión"
            dateFormat="yy-mm-dd"
            className="rev-filter-item"
          />

          <Button label="Filtrar" icon="pi pi-search" onClick={aplicarFiltros} />

          <Button
            label="Limpiar"
            icon="pi pi-refresh"
            className="p-button-secondary"
            onClick={limpiarFiltros}
          />
        </div>

        <DataTable
          value={revisiones}
          loading={loading}
          paginator
          lazy
          rows={25}
          first={first}
          totalRecords={totalRegistros}
          onPage={cambiarPagina}
          onRowClick={onRowClick}
          className="rev-table"
          emptyMessage="No hay revisiones que coincidan con los filtros."
        >
          <Column field="ID_Revision" header="ID"  />
          <Column field="ID_Expediente" header="Expediente"  />
          <Column field="Estado" body={estadoTemplate} header="Estado"  />
          <Column field="Usuario_Envia" header="Enviado por"  />
          <Column field="Fecha_Revision" body={fechaTemplate} header="Fecha"  />
        </DataTable>
      </Card>
    </div>
  );
}
