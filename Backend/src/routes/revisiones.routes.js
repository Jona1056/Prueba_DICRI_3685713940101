import { Router } from "express";
import { check } from "express-validator";
import { registrarRevision, listarRevisiones} from "../controllers/revisiones.controller.js";
import validarCampos from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.put(
  "/aprobar-rechazar/:id_revision",
  [
    validarJWT,
    requireRole("coordinador"),  // SOLO COORDINADORES
    check("id_expediente", "El ID del expediente es obligatorio").isNumeric(),
    check("accion")
      .isIn(["aprobado", "rechazado"])
      .withMessage('Acción debe ser "aprobado" o "rechazado".'),
    check("justificacion")
      .if((value, { req }) => req.body.accion === "rechazado")
      .not()
      .isEmpty()
      .withMessage("La justificación es obligatoria cuando se rechaza."),
    validarCampos,
  ],
  registrarRevision
);


router.get(
  "/listar",
  [validarJWT],
  listarRevisiones
);

export default router;
