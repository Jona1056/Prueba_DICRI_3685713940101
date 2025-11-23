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
