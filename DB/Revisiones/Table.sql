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
GO
