import jwt from "jsonwebtoken";

export const validarJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, msg: "Token faltante o inválido" });
  }

  const token = authHeader.split(" ")[1]; // obtiene solo el token

  try {
    const { uid, rol } = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = uid;
    req.rol = rol;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, msg: "Token inválido" });
  }
};
