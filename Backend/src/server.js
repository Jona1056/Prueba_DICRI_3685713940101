import server from "./app.js";
import { getConnection } from "./config/database.js";

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Servidor DICRI corriendo en http://localhost:${PORT}`);

  try {
    await getConnection();
    console.log("Conexión a base de datos correcta");
  } catch (err) {
    console.log("No se pudo conectar a la DB");
  }
});
