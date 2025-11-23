CREATE TABLE Usuarios (
    ID_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Cui VARCHAR(20) NOT NULL UNIQUE,
    Rol VARCHAR(20) NOT NULL 
        CHECK (Rol IN ('tecnico', 'coordinador')),
    Email VARCHAR(150) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL
);
GO


