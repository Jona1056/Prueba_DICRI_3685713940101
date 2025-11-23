import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";
import "./ExpedientesForm.css";

export default function ExpedienteCrear() {
  const navigate = useNavigate();

  const [hasChanges, setHasChanges] = useState(false);

  // Estado inicial del expediente vacío
  const [expediente, setExpediente] = useState({
    Descripcion: "",
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

  const indicioValido = (ind) => {
    return (
      ind.Descripcion.trim() !== "" &&
      ind.Color.trim() !== "" &&
      ind.Tamano.trim() !== "" &&
      ind.Peso.trim() !== "" &&
      ind.Ubicacion.trim() !== ""
    );
  };

  const agregarIndicio = () => {
    const ultimo = expediente.indicios[expediente.indicios.length - 1];

    if (ultimo && !indicioValido(ultimo)) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Debes completar todos los campos del indicio antes de agregar otro.",
      });
      return;
    }

    setExpediente((prev) => ({
      ...prev,
      indicios: [
        ...prev.indicios,
        {
          ID_Indicio: null,
          Descripcion: "",
          Color: "",
          Tamano: "",
          Peso: "",
          Ubicacion: "",
        },
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
    const newList = [...expediente.indicios];
    newList[index][field] = value;

    setExpediente((prev) => ({
      ...prev,
      indicios: newList,
    }));
    setHasChanges(true);
  };

  const crearExpediente = async () => {
    for (const ind of expediente.indicios) {
      if (!indicioValido(ind)) {
        Swal.fire({
          icon: "error",
          title: "Indicios incompletos",
          text: "Todos los campos de cada indicio deben estar completos.",
        });
        return;
      }
    }

    const payload = {
      descripcion: expediente.Descripcion,
      indicios: expediente.indicios.map((i) => ({
        descripcion: i.Descripcion,
        color: i.Color,
        tamano: i.Tamano,
        peso: i.Peso,
        ubicacion: i.Ubicacion,
      })),
    };

    try {
      await api.post(`/expedientes/crear-borrador`, payload);

      // Guardamos mensaje para mostrarlo en la otra vista
      sessionStorage.setItem(
        "expMensaje",
        "El expediente fue registrado correctamente."
      );

      setHasChanges(false);

      // Redirigimos al listado
      navigate("/inicio");
    } catch (err) {
   
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el expediente.",
      });
    }
  };

  return (
    <div className="expediente-wrapper">
      {/* ENCABEZADO */}
      <div className="top-bar">
        <h2>Nuevo Expediente</h2>
        <button
          className="btn-save"
          disabled={!hasChanges}
          onClick={crearExpediente}
        >
          Crear Expediente
        </button>
      </div>

      {/* FORM PRINCIPAL */}
      <div className="form-grid">
        <div>
          <label>Descripción</label>
          <input
            type="text"
            value={expediente.Descripcion}
            onChange={(e) => {
              setExpediente({ ...expediente, Descripcion: e.target.value });
              setHasChanges(true);
            }}
          />
        </div>

        <div>
          <label>Fecha</label>
          <input type="text" disabled />
        </div>

        <div>
          <label>Responsable</label>
          <input type="text" disabled />
        </div>
      </div>

      {/* INDICIOS */}
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
                  onChange={(e) =>
                    actualizarIndicio(index, "Descripcion", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={ind.Color}
                  onChange={(e) =>
                    actualizarIndicio(index, "Color", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={ind.Tamano}
                  onChange={(e) =>
                    actualizarIndicio(index, "Tamano", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={ind.Peso}
                  onChange={(e) =>
                    actualizarIndicio(index, "Peso", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  value={ind.Ubicacion}
                  onChange={(e) =>
                    actualizarIndicio(index, "Ubicacion", e.target.value)
                  }
                />
              </td>

              <td>
                <button
                  className="btn-delete"
                  onClick={() => eliminarIndicio(index)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-add" onClick={agregarIndicio}>
        Agregar Indicio
      </button>
    </div>
  );
}
