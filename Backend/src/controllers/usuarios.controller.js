import { getConnection, sql } from "../config/database.js";
import bcrypt from "bcryptjs";

export const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, cui, rol, email, contrasena } = req.body;

    const pool = await getConnection();

    // Encriptar contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    let result;

    try {
      result = await pool
        .request()
        .input("Nombre", sql.VarChar(150), nombre)
        .input("Cui", sql.VarChar(20), cui)
        .input("Rol", sql.VarChar(20), rol)
        .input("Email", sql.VarChar(150), email)
        .input("Contrasena", sql.VarChar(255), hashedPassword) // HASH
        .execute("sp_CrearUsuario");
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: err.originalError?.message || "Error en SP sp_CrearUsuario"
      });
    }

    const nuevoID = result.recordset[0]?.NuevoIDUsuario;

    return res.json({
      ok: true,
      msg: "Usuario creado correctamente",
      id: nuevoID
    });

  } catch (err) {
    next(err);
  }
};
export const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, cui, rol, email, contrasenaActual, contrasena } = req.body;

    const pool = await getConnection();

    // 1) Si quiere cambiar la contraseña → validar contraseña actual
    let nuevaPasswordHash = null;

    if (contrasena) {
      // Obtener contraseña actual desde DB
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT Contrasena FROM Usuarios WHERE ID_Usuario = @id");

      if (result.recordset.length === 0) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }

      const hashActualDB = result.recordset[0].Contrasena;

      // Validar si mandó contrasenaActual
      if (!contrasenaActual) {
        return res.status(400).json({
          ok: false,
          msg: "Debes proporcionar tu contraseña actual para cambiarla",
        });
      }

      // Comparar contraseñas
      const coincide = await bcrypt.compare(contrasenaActual, hashActualDB);

      if (!coincide) {
        return res.status(400).json({
          ok: false,
          msg: "La contraseña actual es incorrecta",
        });
      }

      // Encriptar nueva contraseña
      nuevaPasswordHash = await bcrypt.hash(contrasena, 10);
    }

    // 2) Ejecutar el SP (si no se cambia contraseña → se envía NULL)
    await pool
      .request()
      .input("ID_Usuario", sql.Int, id)
      .input("Nombre", sql.VarChar(150), nombre ?? null)
      .input("Cui", sql.VarChar(20), cui ?? null)
      .input("Rol", sql.VarChar(20), rol ?? null)
      .input("Email", sql.VarChar(150), email ?? null)
      .input("Contrasena", sql.VarChar(255), nuevaPasswordHash)
      .execute("sp_ActualizarUsuario");

    return res.json({
      ok: true,
      msg: "Usuario actualizado correctamente",
    });

  } catch (err) {
      if (err.originalError?.info?.message?.includes("CUI")) {
    return res.status(400).json({
      ok: false,
      msg: "El CUI ya está registrado en otro usuario."
    });
  }

 
  // Email repetido
  if (err.originalError) {
    return res.status(400).json({
      ok: false,
      msg: "El Email ya está registrado en otro usuario."
    });
  }
  }
};
export const listarUsuarios = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const pool = await getConnection();

    const result = await pool
      .request()
      .input("Pagina", sql.Int, Number(page))
      .execute("sp_ListarUsuarios");

    return res.json({
      ok: true,
      page: Number(page),
      usuarios: result.recordset,
    });

  } catch (err) {
    next(err);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const pool = await getConnection();

    let result;

    try {
      result = await pool
        .request()
        .input("ID_Usuario", sql.Int, id)
        .execute("sp_EliminarUsuario");
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: err.originalError?.message || "Error en SP sp_EliminarUsuario"
      });
    }

    return res.json({
      ok: true,
      msg: "Usuario eliminado correctamente"
    });

  } catch (err) {
    next(err);
  }
};