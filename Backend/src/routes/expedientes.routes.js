import { Router } from "express";
import { crearExpedienteBorrador, actualizarExpediente, enviarExpedienteARevision,listarExpedientesFiltrado,obtenerExpedientePorID} from "../controllers/expedientes.controller.js";
import { check } from "express-validator";
import validarCampos from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/crear-borrador",
  [
    validarJWT,
    requireRole("tecnico"),   // solo técnicos crean borrador
    validarCampos,
  ],
  crearExpedienteBorrador
);

router.put(
  "/actualizar/:id",
  [
    validarJWT,
    check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    check("indicios", "Debe enviar la lista de indicios").isArray(),
    validarCampos
  ],
  actualizarExpediente
);

router.post(
  "/enviar/:id",
  [
    validarJWT,                   
    requireRole("tecnico"),       
    validarCampos
  ],
  enviarExpedienteARevision
);

router.get(
  "/listar",
  [
    validarJWT,  // cualquier usuario logueado puede ver expedientes
    validarCampos
  ],
  listarExpedientesFiltrado
);

router.get(
  "/detalle/:id",
  [validarJWT],
  obtenerExpedientePorID
);
export default router;