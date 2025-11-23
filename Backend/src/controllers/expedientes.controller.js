import { getConnection, sql } from "../config/database.js";

export const crearExpedienteBorrador = async (req, res, next) => {
  try {
    const { descripcion, indicios } = req.body;
    const idUsuario = req.uid; 

    const pool = await getConnection();

    // Crear tabla tipo para TVP
    const tvp = new sql.Table("TipoIndicio");
    tvp.columns.add("Descripcion", sql.VarChar(300));
    tvp.columns.add("Color", sql.VarChar(50));
    tvp.columns.add("Tamano", sql.VarChar(50));
    tvp.columns.add("Peso", sql.VarChar(50));
    tvp.columns.add("Ubicacion", sql.VarChar(200));
    tvp.columns.add("ID_Usuario", sql.Int);

    indicios.forEach(i => {
      tvp.rows.add(
        i.descripcion,
        i.color,
        i.tamano,
        i.peso,
        i.ubicacion,
        idUsuario
      );
    });

    const result = await pool
      .request()
      .input("ID_Usuario", sql.Int, idUsuario)
      .input("Descripcion", sql.VarChar(300), descripcion)
      .input("Indicios", tvp)
      .execute("sp_CrearExpedienteBorrador");

    return res.json({
      ok: true,
      msg: result.recordset[0].Mensaje,
      id_expediente: result.recordset[0].ID_Expediente,
    });

  } catch (err) {
    next(err);
  }
};

export const actualizarExpediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descripcion, indicios } = req.body;
    const idUsuario = req.uid; // técnico que modifica/agrega indicios

    const pool = await getConnection();

    // Crear tabla TVP para TipoIndicioUpdate
    const tvp = new sql.Table("TipoIndicioUpdate");

    tvp.columns.add("ID_Indicio", sql.Int);
    tvp.columns.add("Descripcion", sql.VarChar(300));
    tvp.columns.add("Color", sql.VarChar(50));
    tvp.columns.add("Tamano", sql.VarChar(50));
    tvp.columns.add("Peso", sql.VarChar(50));
    tvp.columns.add("Ubicacion", sql.VarChar(200));

    // Llenar TVP
    indicios.forEach(ind => {
      tvp.rows.add(
        ind.id_indicio ?? null,
        ind.descripcion,
        ind.color,
        ind.tamano,
        ind.peso,
        ind.ubicacion
      );
    });

    // Ejecutar procedimiento
    const result = await pool
      .request()
      .input("ID_Expediente", sql.Int, id)
      .input("Descripcion", sql.VarChar(300), descripcion)
      .input("ID_Usuario", sql.Int, idUsuario)
      .input("Indicios", tvp)
      .execute("sp_ActualizarExpedienteCompleto");

    res.json({
      ok: true,
      msg: result.recordset[0].Mensaje,
    });

  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const enviarExpedienteARevision = async (req, res, next) => {
  try {
    const { id } = req.params;         
    const idUsuarioEnvia = req.uid;    

    const pool = await getConnection();

    let result;
    try {
      result = await pool
        .request()
        .input("ID_Expediente", sql.Int, id)
        .input("ID_Usuario_Envia", sql.Int, idUsuarioEnvia)
        .execute("sp_EnviarExpedienteARevision");
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: err.originalError?.message || "Error en SP sp_EnviarExpedienteARevision"
      });
    }


     const io = req.app.get("io");

    io.emit("revision:nueva", {
      id_revision: result.recordset[0]?.ID_Revision || null,
      id_expediente: id,
      enviado_por: idUsuarioEnvia,
      fecha: new Date().toISOString()
    });
    // ---------------------------

    return res.json({
      ok: true,
      msg: result.recordset[0].Mensaje
    });

  } catch (err) {
    next(err);
  }
};

export const listarExpedientesFiltrado = async (req, res, next) => {
  try {
    const {
      page = 1,
      estado = null,
      usuario = null,
      fechaInicio = null,
      fechaFin = null,
      expediente = null
    } = req.query;

    const pool = await getConnection();
    
    const result = await pool
      .request()
      .input("Page", sql.Int, Number(page))
      .input("Estado", sql.VarChar(20), estado || null)
      .input("ID_Usuario", sql.Int, usuario ? Number(usuario) : null)
      .input("FechaInicio", sql.Date, fechaInicio || null)
      .input("FechaFin", sql.Date, fechaFin || null)
      .input("ID_Expediente", sql.Int, expediente ? Number(expediente) : null)
      .execute("sp_ListarExpedientesFiltrado");

    // SQL Server nos devuelve dos recordsets
    // recordset[0] = total filtrados
    // recordset[1] = expedientes paginados

    const total = result.recordsets[0][0]?.TotalRegistrosFiltrados || 0;
    const expedientes = result.recordsets[1] || [];

    return res.json({
      ok: true,
      page: Number(page),
      total,
      total_pages: Math.max(1, Math.ceil(total / 25)),
      expedientes
    });

  } catch (err) {
    next(err);
  }
};



export const obtenerExpedientePorID = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("ID_Expediente", sql.Int, id)
      .execute("sp_ObtenerExpedientePorID");

    const expediente = result.recordsets[0][0];
    const indicios = result.recordsets[1];

    if (!expediente) {
      return res.status(404).json({
        ok: false,
        msg: "El expediente no existe"
      });
    }

    return res.json({
      ok: true,
      expediente,
      indicios
    });

  } catch (err) {
    next(err);
  }
};