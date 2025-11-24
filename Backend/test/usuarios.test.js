import request from "supertest";
import { app } from "../src/app.js";

let token = "";


beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "ana.ramirez@dicri.gob.gt",
      contrasena: "AnaCoord2025$",
    });



  token = res.body.token;
});

describe("GET /usuarios/listar", () => {
  it("Debería devolver un arreglo de usuarios", async () => {
    const res = await request(app)
      .get("/api/usuarios/listar")
       .set("Authorization", `Bearer ${token}`);
 


  expect(Array.isArray(res.body.usuarios)).toBe(true);

  });
});
