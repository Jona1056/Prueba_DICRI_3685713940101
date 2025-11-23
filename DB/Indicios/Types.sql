CREATE TYPE TipoIndicio AS TABLE (
    Descripcion VARCHAR(300),
    Color VARCHAR(50),
    Tamano VARCHAR(50),
    Peso VARCHAR(50),
    Ubicacion VARCHAR(200),
    ID_Usuario INT
);
GO


CREATE TYPE TipoIndicioUpdate AS TABLE (
    ID_Indicio INT NULL,          -- NULL si es nuevo
    Descripcion VARCHAR(300),
    Color VARCHAR(50),
    Tamano VARCHAR(50),
    Peso VARCHAR(50),
    Ubicacion VARCHAR(200)
);
GO
