export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.rol)) {
      return res.status(403).json({
        ok: false,
        msg: "No tiene permisos para esta acción"
      });
    }
    next();
  };
};
