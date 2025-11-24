# API DICRI – Documentación Técnica

## Descripción General

Este proyecto es una API REST desarrollada para la Dirección de Investigaciones Criminalísticas (DICRI). Su propósito es gestionar expedientes, indicios, flujos de aprobación y rechazos, además de proveer endpoints claros y estructurados para el frontend.  
El sistema está diseñado para funcionar completamente en contenedores Docker y conectar con un frontend en React.



---

## Arquitectura del Proyecto


![Arquitectura del sistema](\img\arquitectura.png)
---

## Modelo entidad Relacion


![Entidad Relacion](\img\ER.png)
---

## Tecnologías Utilizadas

### Backend
- Node.js
- Express
- MSSQL (librería mssql)
- dotenv
- cors
- axios
- express-validator
- ws (WebSocket)
- bcryptjs 
- jsonwebtoken 

### Base de Datos
- SQL Server
- Procedimientos almacenados
- Llaves foráneas
- Índices
- Tipos

### Contenedores
- Docker
- Docker Compose

  - node:18-alpine 
  

### Frontend 
- React
- Axios
- SweetAlert2
- Vite

---

## Estructura del Proyecto

/src  
├── routes  
├── controllers  
├── config 
├── database  
├── middlewares  
└── server.js
└── app.js  

---

## WebSockets

El backend incluye una pequeña validacion de notificacion cuando el tecnico envia el expediente


---

## Ejecución del Proyecto

```
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```


---

## Configuración .env

```
DB_USER=sa
DB_PASSWORD=<password>
DB_SERVER=sql_server
DB_DATABASE=DICRI
PORT=3000
```

---

## Endpoints Principales y Descripción

### 1. Crear expediente  
**POST /api/expedientes/crear-borrador**  
Crea un nuevo expediente en estado borrador en el cual incluye los indicios del expediente

Ejemplo de body:
```js
export const crearExpedienteBorrador = async (req, res, next) => {
  try {
    const { descripcion, indicios } = req.body;
    const idUsuario = req.uid; 

    const pool = await getConnection();

    // Crear tabla tipo para TVP
    const tvp = new sql.Table("TipoIndicio");
    tvp.columns.add("Descripcion", sql.VarChar(300));
    tvp.columns.add("Color", sql.VarChar(50));
    tvp.columns.add("Tamano", sql.VarChar(50));
    tvp.columns.add("Peso", sql.VarChar(50));
    tvp.columns.add("Ubicacion", sql.VarChar(200));
    tvp.columns.add("ID_Usuario", sql.Int);

    indicios.forEach(i => {
      tvp.rows.add(
        i.descripcion,
        i.color,
        i.tamano,
        i.peso,
        i.ubicacion,
        idUsuario
      );
    });

    const result = await pool
      .request()
      .input("ID_Usuario", sql.Int, idUsuario)
      .input("Descripcion", sql.VarChar(300), descripcion)
      .input("Indicios", tvp)
      .execute("sp_CrearExpedienteBorrador");

    return res.json({
      ok: true,
      msg: result.recordset[0].Mensaje,
      id_expediente: result.recordset[0].ID_Expediente,
    });

  } catch (err) {
    next(err);
  }
};
```

---


### 2. Aprobar o Rechazar Expediente 
**PUT /api/revisiones/aprobar-rechazar/:id_revision**  
Cambia el estado del expediente a 'aprobado' o rechazado donde se le agrega una justificacion.  

```js
export const registrarRevision = async (req, res, next) => {
  try {
    const { id_revision } = req.params;
    const { id_expediente, accion, justificacion } = req.body;

    const idCoordinador = req.uid; // viene del token

    const pool = await getConnection();

    try {
      await pool
        .request()
        .input("ID_Revision", sql.Int, id_revision)
        .input("ID_Expediente", sql.Int, id_expediente)
        .input("ID_Coordinador", sql.Int, idCoordinador)
        .input("Accion", sql.VarChar(20), accion)
        .input("Justificacion", sql.VarChar(500), justificacion ?? null)
        .execute("sp_RegistrarRevision");
    } catch (err) {
      return res.status(400).json({
        ok: false,
        msg: err.originalError?.message || "Error ejecutando revisión",
      });
    }

    return res.json({
      ok: true,
      msg: "Revisión registrada correctamente",
    });

  } catch (err) {
    next(err);
  }
};

```

---

### 3. Listar expedientes por estado  
**GET /api/expedientes/listar?estado=pendiente**  
Permite consultar expedientes filtrados.

```js
export const listarExpedientesFiltrado = async (req, res, next) => {
  try {
    const {
      page = 1,
      estado = null,
      usuario = null,
      fechaInicio = null,
      fechaFin = null,
      expediente = null
    } = req.query;

    const pool = await getConnection();
    
    const result = await pool
      .request()
      .input("Page", sql.Int, Number(page))
      .input("Estado", sql.VarChar(20), estado || null)
      .input("ID_Usuario", sql.Int, usuario ? Number(usuario) : null)
      .input("FechaInicio", sql.Date, fechaInicio || null)
      .input("FechaFin", sql.Date, fechaFin || null)
      .input("ID_Expediente", sql.Int, expediente ? Number(expediente) : null)
      .execute("sp_ListarExpedientesFiltrado");

    // SQL Server nos devuelve dos recordsets
    // recordset[0] = total filtrados
    // recordset[1] = expedientes paginados

    const total = result.recordsets[0][0]?.TotalRegistrosFiltrados || 0;
    const expedientes = result.recordsets[1] || [];

    return res.json({
      ok: true,
      page: Number(page),
      total,
      total_pages: Math.max(1, Math.ceil(total / 25)),
      expedientes
    });

  } catch (err) {
    next(err);
  }
};

```
---


## SQL Server

Tablas principales:

### Tabla Expedientes

```sql
CREATE TABLE Expedientes (
    ID_Expediente INT IDENTITY(1,1) PRIMARY KEY,
    ID_Usuario INT NOT NULL,      -- técnico que crea el expediente
    Fecha DATETIME NOT NULL DEFAULT(GETDATE()),
    Descripcion VARCHAR(300) NOT NULL,
    Estado VARCHAR(20) NOT NULL 
        DEFAULT 'borrador'
        CHECK (Estado IN ('borrador','pendiente','aprobado','rechazado')),

    CONSTRAINT FK_Expedientes_Usuarios
        FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
GO

```

### Tabla Indicios

```sql
CREATE TABLE Indicios (
    ID_Indicio INT IDENTITY(1,1) PRIMARY KEY,
    ID_Expediente INT NOT NULL,
    ID_Usuario INT NOT NULL,       -- técnico que registra el indicio
    Descripcion VARCHAR(300) NOT NULL,
    Color VARCHAR(50),
    Tamano VARCHAR(50),
    Peso VARCHAR(50),
    Ubicacion VARCHAR(200),

    CONSTRAINT FK_Indicios_Expedientes
        FOREIGN KEY (ID_Expediente) REFERENCES Expedientes(ID_Expediente),

    CONSTRAINT FK_Indicios_Usuarios
        FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario)
);
GO

```
### Tabla Usuarios

```sql
CREATE TABLE Usuarios (
    ID_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Cui VARCHAR(20) NOT NULL UNIQUE,
    Rol VARCHAR(20) NOT NULL 
        CHECK (Rol IN ('tecnico', 'coordinador')),
    Email VARCHAR(150) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL
);
```
### Tabla Revisiones

```sql
CREATE TABLE Revisiones (
    ID_Revision INT IDENTITY(1,1) PRIMARY KEY,

    ID_Usuario_Envia INT NULL,        -- Técnico que envía
    ID_Usuario_Revisa INT NULL,       -- Coordinador que revisa

    ID_Expediente INT NOT NULL,

    Estado VARCHAR(20) NOT NULL
        CHECK (Estado IN ('pendiente','aprobado','rechazado')),

    Justificacion VARCHAR(500) NULL,

    Fecha_Revision DATETIME NULL,     -- Se llena cuando el COORDINADOR revisa

    CONSTRAINT FK_Revisiones_UsuarioEnvia
        FOREIGN KEY (ID_Usuario_Envia) REFERENCES Usuarios(ID_Usuario),

    CONSTRAINT FK_Revisiones_UsuarioRevisa
        FOREIGN KEY (ID_Usuario_Revisa) REFERENCES Usuarios(ID_Usuario),

    CONSTRAINT FK_Revisiones_Expediente
        FOREIGN KEY (ID_Expediente) REFERENCES Expedientes(ID_Expediente)
);
```
---

## Postman

Documentación:  
https://documenter.getpostman.com/view/43176091/2sB3dHWD9k

---


