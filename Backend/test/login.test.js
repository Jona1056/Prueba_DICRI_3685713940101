import request from "supertest";
import { app } from "../src/app.js";

describe("POST /login", () => {
  it("Debería permitir login válido", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "carlos.hernandez@dicri.gob.gt", contrasena: "123" });



    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Debería rechazar credenciales incorrectas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "carlos.hernandez@dicri.gob.gt", contrasena: "incorrecto" });

  

    expect(res.statusCode).toBe(400);
  });
});
