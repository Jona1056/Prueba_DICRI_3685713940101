import { Router } from "express";
import { loginUsuario } from "../controllers/auth.controller.js";
import { check } from "express-validator";
import validarCampos from "../middlewares/validarCampos.js";

const router = Router();

router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("contrasena", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  loginUsuario
);

export default router;
