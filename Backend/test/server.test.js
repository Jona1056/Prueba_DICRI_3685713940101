import request from "supertest";
import { app } from "../src/app.js";

describe("Servidor API", () => {
  it("Debe responder 200 en la ruta raíz", async () => {
    const res = await request(app).get("/api");
    expect(res.statusCode).toBe(200);
  });
});
