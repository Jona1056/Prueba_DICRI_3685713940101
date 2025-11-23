import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import expendientesRoutes from "./routes/expedientes.routes.js";
import revisionesRoutes from "./routes/revisiones.routes.js";

dotenv.config();

// Crear app Express
const app = express();

// Crear servidor HTTP (Socket.IO necesita esto)
const server = http.createServer(app);

// Inicializar WebSockets
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

// Guardar io para usarlo en los controllers
app.set("io", io);

// Eventos al conectar/desconectar
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Middleware base
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/expedientes", expendientesRoutes);
app.use("/api/revisiones", revisionesRoutes);


app.get("/api", (req, res) => {
  res.json({ msg: "Servidor DICRI funcionando" });
});

// Exportar server (IMPORTANTE)
export default server;
