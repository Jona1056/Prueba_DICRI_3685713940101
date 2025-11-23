export const onlySelfOrRole = (rolPermitido) => {
  return (req, res, next) => {
    const idToUpdate = Number(req.params.id);  
    const idFromToken = Number(req.uid);       

    
    if (req.rol === rolPermitido) {
      return next();
    }

    if (idToUpdate !== idFromToken) {
      return res.status(403).json({
        ok: false,
        msg: "No puedes actualizar los datos de otro usuario.",
      });
    }

    next();
  };
};
