import { Router } from "express";
import {
  crearUsuario,
  actualizarUsuario,
  listarUsuarios, eliminarUsuario
} from "../controllers/usuarios.controller.js";
import validarCampos from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { check } from "express-validator";
import { onlySelfOrRole } from "../middlewares/owner.middleware.js";
const router = Router();

router.post(
  "/crear",
  [
    validarJWT,
    requireRole("coordinador"),

    check("nombre").not().isEmpty().withMessage("El nombre es obligatorio."),
    check("cui")
      .not()
      .isEmpty()
      .withMessage("El CUI es obligatorio.")
      .matches(/^[0-9]{13}$/)
      .withMessage("El CUI debe contener exactamente 13 dígitos numéricos."),
    check("rol").isIn(["tecnico", "coordinador"]).withMessage("Rol inválido."),
    check("email").isEmail().withMessage("Email inválido."),

    check("contrasena")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.,;:_\-])[A-Za-z\d@$!%*#?&.,;:_\-]{8,}$/
      )
      .withMessage(
        "La contraseña debe tener mínimo 8 caracteres, una letra, un número y un símbolo."
      ),

    validarCampos,
  ],
  crearUsuario
);

router.put(
  "/actualizar/:id",
  [validarJWT, check("nombre").not().isEmpty().withMessage("El nombre es obligatorio."),
    check("cui")
      .not()
      .isEmpty()
      .withMessage("El CUI es obligatorio.")
      .matches(/^[0-9]{13}$/)
      .withMessage("El CUI debe contener exactamente 13 dígitos numéricos."),
    check("rol").isIn(["tecnico", "coordinador"]).withMessage("Rol inválido."),
    check("email").isEmail().withMessage("Email inválido."),
    , validarCampos],
  actualizarUsuario
);

router.get("/listar", [validarJWT, requireRole("coordinador")], listarUsuarios);

router.delete(
  "/eliminar/:id",
  [
    validarJWT,
    requireRole("coordinador"), 
    validarCampos,
  ],
  eliminarUsuario
);
export default router;
