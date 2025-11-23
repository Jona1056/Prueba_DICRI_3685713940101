import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";
import "./ExpedientesForm.css";

export default function ExpedienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const modoEdicion = Boolean(id);
  const [hasChanges, setHasChanges] = useState(false);
  const [expedienteOriginal, setExpedienteOriginal] = useState(null);

  const [expediente, setExpediente] = useState({
    Descripcion: "",
    Fecha: "",
    Usuario_Responsable: "",
    Estado: "borrador",
    indicios: [
      {
        ID_Indicio: null,
        Descripcion: "",
        Color: "",
        Tamano: "",
        Peso: "",
        Ubicacion: "",
      },
    ],
  });

  const editable = ["borrador", "rechazado"].includes(expediente.Estado);

  // ➕ NUEVO: Panel y historial
  const [historial, setHistorial] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [cantidadRevisiones, setCantidadRevisiones] = useState(0);

  useEffect(() => {
    if (!modoEdicion) {
      setExpedienteOriginal(JSON.parse(JSON.stringify(expediente)));
      setHasChanges(false);
      return;
    }
    cargarExpediente();
  }, [id]);

  const cargarHistorial = async () => {
    try {
      const { data } = await api.get("/revisiones/listar", {
        params: { page: 1, id_expediente: id },
      });

      setHistorial(data.revisiones || []);
      setCantidadRevisiones(data.revisiones?.length || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const cargarExpediente = async () => {
    if (!modoEdicion) return;
    const { data } = await api.get(`/expedientes/detalle/${id}`);

    const formatted = {
      ...data.expediente,
      indicios: data.indicios,
    };

    setExpediente(formatted);
    setExpedienteOriginal(JSON.parse(JSON.stringify(formatted)));
    setHasChanges(false);

    // ➕ cargar historial también
    await cargarHistorial();
  };

  const indicioValido = (ind) =>
    ind.Descripcion.trim() &&
    ind.Color.trim() &&
    ind.Tamano.trim() &&
    ind.Peso.trim() &&
    ind.Ubicacion.trim();

  const agregarIndicio = () => {
    const ultimo = expediente.indicios[expediente.indicios.length - 1];

    if (ultimo && !indicioValido(ultimo)) {
      Swal.fire("Campos incompletos", "Completa el indicio antes de agregar otro.", "warning");
      return;
    }

    setExpediente((prev) => ({
      ...prev,
      indicios: [
        ...prev.indicios,
        { ID_Indicio: null, Descripcion: "", Color: "", Tamano: "", Peso: "", Ubicacion: "" },
      ],
    }));

    setHasChanges(true);
  };

  const eliminarIndicio = (index) => {
    setExpediente((prev) => ({
      ...prev,
      indicios: prev.indicios.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const actualizarIndicio = (index, field, value) => {
    const clone = [...expediente.indicios];
    clone[index][field] = value;
    setExpediente((prev) => ({ ...prev, indicios: clone }));
    setHasChanges(true);
  };

  const revertirCambios = () => {
    if (!expedienteOriginal) return;
    setExpediente(JSON.parse(JSON.stringify(expedienteOriginal)));
    setHasChanges(false);
  };

  const guardarExpediente = async () => {
    for (const i of expediente.indicios) {
      if (!indicioValido(i)) {
        return Swal.fire("Error", "Todos los indicios deben estar completos.", "error");
      }
    }

    const payload = {
      descripcion: expediente.Descripcion,
      indicios: expediente.indicios.map((i) => ({
        id_indicio: i.ID_Indicio,
        descripcion: i.Descripcion,
        color: i.Color,
        tamano: i.Tamano,
        peso: i.Peso,
        ubicacion: i.Ubicacion,
      })),
    };

    if (!modoEdicion) {
      try {
        const { data } = await api.post("/expedientes/crear-borrador", payload);
        Swal.fire("Creado", "El expediente se ha creado.", "success");
        const newId = data.id_expediente;
        navigate(`/inicio/expedientes/detalle/${newId}`);
      } catch (err) {
        Swal.fire("Error", "No se pudo crear.", "error");
      }
      return;
    }

    try {
      await api.put(`/expedientes/actualizar/${id}`, payload);
      Swal.fire("Guardado", "Los cambios fueron guardados.", "success");
      setHasChanges(false);
      setExpedienteOriginal(JSON.parse(JSON.stringify(expediente)));
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar.", "error");
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const fecha = fechaISO.split("T")[0];
    const hora = fechaISO.split("T")[1].substring(0, 5);
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y} ${hora}`;
  };

  const enviarRevision = async () => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Enviar a revisión",
      text: "No podrás editar después.",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    await api.post(`/expedientes/enviar/${id}`);
    await cargarExpediente();

    Swal.fire("Enviado", "El expediente fue enviado a revisión.", "success");
  };

  const abrirHistorial = () => setMostrarPanel(true);

  return (
    <div className="expediente-wrapper">

    
      {modoEdicion && (
        <div className="smart-buttons">
          <button className="smart-btn" onClick={abrirHistorial}>
            📝 Revisiones ({cantidadRevisiones})
          </button>
        </div>
      )}

      <div className="top-bar">
        <h2>{modoEdicion ? `Expediente #${id}` : "Nuevo Expediente"}</h2>

        {hasChanges && (
          <button className="btn-revert" onClick={revertirCambios}>
            ↩️
          </button>
        )}

        <button
          className={`btn-save ${hasChanges ? "active" : "disabled"}`}
          disabled={!hasChanges}
          onClick={guardarExpediente}
        >
          Guardar
        </button>

        {modoEdicion && ["borrador", "rechazado"].includes(expediente.Estado) && (
          <button className="btn-revision" onClick={enviarRevision}>
            Enviar a Revisión
          </button>
        )}
      </div>

      {modoEdicion && (
        <span className={`estado-badge ${expediente.Estado}`}>
          {expediente.Estado.toUpperCase()}
        </span>
      )}

      <div className="form-grid">
        <div>
          <label>Descripción</label>
          <input
            type="text"
            value={expediente.Descripcion}
            disabled={!editable}
            onChange={(e) => {
              setExpediente({ ...expediente, Descripcion: e.target.value });
              setHasChanges(true);
            }}
          />
        </div>

        <div>
          <label>Fecha</label>
          <input type="text" value={modoEdicion ? formatearFecha(expediente.Fecha) : ""} disabled />
        </div>

        <div>
          <label>Responsable</label>
          <input
            type="text"
            value={modoEdicion ? expediente.Usuario_Responsable : ""}
            disabled
          />
        </div>
      </div>

      <h3>Indicios</h3>

      <table className="tabla-indicios">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Color</th>
            <th>Tamaño</th>
            <th>Peso</th>
            <th>Ubicación</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {expediente.indicios.map((ind, index) => (
            <tr key={index}>
              <td>
                <input
                  value={ind.Descripcion}
                  disabled={!editable}
                  onChange={(e) =>
                    actualizarIndicio(index, "Descripcion", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={ind.Color}
                  disabled={!editable}
                  onChange={(e) =>
                    actualizarIndicio(index, "Color", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={ind.Tamano}
                  disabled={!editable}
                  onChange={(e) =>
                    actualizarIndicio(index, "Tamano", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={ind.Peso}
                  disabled={!editable}
                  onChange={(e) =>
                    actualizarIndicio(index, "Peso", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={ind.Ubicacion}
                  disabled={!editable}
                  onChange={(e) =>
                    actualizarIndicio(index, "Ubicacion", e.target.value)
                  }
                />
              </td>
              <td>
                <button
                  className="btn-delete"
                  disabled={!editable}
                  onClick={() => editable && eliminarIndicio(index)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-add" disabled={!editable} onClick={agregarIndicio}>
        Agregar Indicio
      </button>


      {mostrarPanel && (
        <div className="side-panel">
          <div className="side-panel-header">
            <h3>Historial de Revisiones</h3>
            <button className="close-btn" onClick={() => setMostrarPanel(false)}>
              ✖
            </button>
          </div>

          <div className="revision-list">
            {historial.length === 0 && (
              <p className="no-rev">Este expediente no tiene revisiones.</p>
            )}

            {historial.map((rev) => (
              <div key={rev.ID_Revision} className="revision-item">
                <div className={`estado-pill ${rev.Estado}`}>
                  {rev.Estado.toUpperCase()}
                </div>
                <p><b>Revisión #{rev.ID_Revision}</b></p>
                <p><b>Revisor:</b> {rev.Usuario_Revisa || "Pendiente"}</p>
                <p><b>Fecha:</b> {rev.Fecha_Revision || "-"}</p>
                {rev.Justificacion && (
                  <p><b>Justificación:</b> {rev.Justificacion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
