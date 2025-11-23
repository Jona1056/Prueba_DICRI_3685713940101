import { getConnection, sql } from "../config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const loginUsuario = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    const pool = await getConnection();

    // 1. Obtener usuario desde el SP
    const result = await pool
      .request()
      .input("Email", sql.VarChar(150), email)
      .execute("sp_ObtenerUsuarioPorEmail");

    if (result.recordset.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El correo no está registrado.",
      });
    }

    const usuario = result.recordset[0];

  
    const validPassword = await bcrypt.compare(contrasena, usuario.Contrasena);

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Credenciales incorrectas.",
      });
    }

  
    const token = jwt.sign(
      {
        uid: usuario.ID_Usuario,
        rol: usuario.Rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      ok: true,
      token,
      usuario: {
        ID_Usuario: usuario.ID_Usuario,
        Nombre: usuario.Nombre,
        Cui: usuario.Cui,
        Rol: usuario.Rol,
        Email: usuario.Email,
      },
    });

  } catch (err) {
    next(err);
  }
};
