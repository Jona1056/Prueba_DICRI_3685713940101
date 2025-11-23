import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// Configuración de SQL Server desde el .env
const dbSettings = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: process.env.DB_ENCRYPT === "true", // true solo si usás certificados
        trustServerCertificate: true, // necesario para SQL local o Docker
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    }
};

let pool;


export const getConnection = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbSettings);
            
        }
        return pool;
    } catch (err) {
        console.error("Error conectando a SQL Server:", err);
        throw new Error("Error al conectar con la base de datos.");
    }
};

export { sql };
