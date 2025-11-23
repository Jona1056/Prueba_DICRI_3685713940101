import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";
import "./RevisionDetalle.css";

export default function RevisionDetalle() {
  const { id_revision, id_expediente } = useParams();
  const navigate = useNavigate();

  const [expediente, setExpediente] = useState(null);
  const [revision, setRevision] = useState(null);
  const [justificacion, setJustificacion] = useState("");

  const cargarDatos = async () => {
    try {
      const exp = await api.get(`/expedientes/detalle/${id_expediente}`);
      setExpediente({
        ...exp.data.expediente,
        indicios: exp.data.indicios || []
      });

      const rev = await api.get(`/revisiones/listar`, {
        params: { id_expediente }
      });

      setRevision(rev.data.revisiones[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id_revision, id_expediente]);

  if (!expediente || !revision) return <p className="cargando">Cargando revisión...</p>;

  const aprobar = async () => {
    await api.put(`/revisiones/aprobar-rechazar/${id_revision}`, {
      id_expediente: expediente.ID_Expediente,
      accion: "aprobado",
      justificacion: null
    });

    Swal.fire("Aprobado", "El expediente fue aprobado.", "success");
    navigate("/inicio/revisiones");
  };

  const rechazar = async () => {
    if (!justificacion.trim())
      return Swal.fire("Error", "Debe ingresar una justificación.", "error");

    await api.put(`/revisiones/aprobar-rechazar/${id_revision}`, {
      id_expediente: expediente.ID_Expediente,
      accion: "rechazado",
      justificacion
    });

    Swal.fire("Rechazado", "El expediente fue rechazado.", "success");
    navigate("/inicio/revisiones");
  };

  return (
    <div className="rev-wrapper">
      {/* ENCABEZADO */}
      <div className="rev-header">
        <h2>Revisión #{id_revision}</h2>

        <span className={`estado-pill ${revision.Estado}`}>
          {revision.Estado.toUpperCase()}
        </span>
      </div>

      {/* TARJETAS DE INFORMACIÓN */}
      <div className="rev-info-grid">
        <div className="info-card">
          <label>Expediente</label>
          <p>{expediente.ID_Expediente}</p>
        </div>

        <div className="info-card">
          <label>Enviado por</label>
          <p>{revision.Usuario_Envia || "-"}</p>
        </div>

        <div className="info-card">
          <label>Fecha de envío</label>
          <p>{revision.Fecha_Revision || "-"}</p>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="rev-block">
        <h3>Descripción del Expediente</h3>
        <textarea className="rev-textarea" disabled value={expediente.Descripcion} />
      </div>

      {/* TABLA DE INDICIOS */}
      <div className="rev-block">
        <h3>Indicios</h3>

        <table className="rev-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Color</th>
              <th>Tamaño</th>
              <th>Peso</th>
              <th>Ubicación</th>
            </tr>
          </thead>

          <tbody>
            {expediente.indicios.map((i, idx) => (
              <tr key={idx}>
                <td>{i.Descripcion}</td>
                <td>{i.Color}</td>
                <td>{i.Tamano}</td>
                <td>{i.Peso}</td>
                <td>{i.Ubicacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* JUSTIFICACIÓN */}
      <div className="rev-block">
        <h3>Justificación (solo para rechazo)</h3>
        <textarea
          className="rev-textarea"
          placeholder="Escriba la justificación"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
        />
      </div>

      {/* BOTONES */}
      <div className="rev-buttons">
        <button className="btn-approve" onClick={aprobar}>Aprobar</button>
        <button className="btn-reject" onClick={rechazar}>Rechazar</button>
      </div>
    </div>
  );
}
