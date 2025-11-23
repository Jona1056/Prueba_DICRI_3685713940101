import { getConnection, sql } from "../config/database.js";

export const registrarRevision = async (req, res, next) => {
  try {
    const { id_revision } = req.params;
    const { id_expediente, accion, justificacion } = req.body;

    const idCoordinador = req.uid; // viene del token

    const pool = await getConnection();

    try {
      await pool
        .request()
        .input("ID_Revision", sql.Int, id_revision)
        .input("ID_Expediente", sql.Int, id_expediente)
        .input("ID_Coordinador", sql.Int, idCoordinador)
        .input("Accion", sql.VarChar(20), accion)
        .input("Justificacion", sql.VarChar(500), justificacion ?? null)
        .execute("sp_RegistrarRevision");
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: err.originalError?.message || "Error ejecutando revisión",
      });
    }

    return res.json({
      ok: true,
      msg: "Revisión registrada correctamente",
    });

  } catch (err) {
    next(err);
  }
};


export const listarRevisiones = async (req, res, next) => {
  try {
    const {
      page = 1,
      id_expediente = null,
      estado = null,
      usuario_envia = null,
      usuario_revisa = null,
      fecha_revision = null
    } = req.query;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("Page", sql.Int, Number(page))
      .input("ID_Expediente", sql.Int, id_expediente ? Number(id_expediente) : null)
      .input("Estado", sql.VarChar(20), estado || null)
      .input("UsuarioEnvia", sql.Int, usuario_envia ? Number(usuario_envia) : null)
      .input("UsuarioRevisa", sql.Int, usuario_revisa ? Number(usuario_revisa) : null)
      .input("FechaRevision", sql.Date, fecha_revision || null)
      .execute("sp_ListarRevisionesFiltrado");

    return res.json({
      ok: true,
      page: Number(page),
      revisiones: result.recordsets[1] || [],
      total: result.recordsets[0]?.[0]?.TotalRegistrosFiltrados ?? 0
    });

  } catch (err) {
    next(err);
  }
};