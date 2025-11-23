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
