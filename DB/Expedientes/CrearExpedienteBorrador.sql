CREATE PROCEDURE sp_CrearExpedienteBorrador
    @ID_Usuario INT,                  -- técnico que crea
    @Descripcion VARCHAR(300),
    @Indicios TipoIndicio READONLY    -- lista de indicios
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

 
        INSERT INTO Expedientes (ID_Usuario, Fecha, Descripcion, Estado)
        VALUES (@ID_Usuario, GETDATE(), @Descripcion, 'borrador');

        DECLARE @ID_Expediente INT = SCOPE_IDENTITY();



        INSERT INTO Indicios (
            ID_Expediente,
            ID_Usuario,
            Descripcion,
            Color,
            Tamano,
            Peso,
            Ubicacion
        )
        SELECT 
            @ID_Expediente,
            ID_Usuario,
            Descripcion,
            Color,
            Tamano,
            Peso,
            Ubicacion
        FROM @Indicios;


        -------------------------------------------------------
        COMMIT;

        SELECT 
            @ID_Expediente AS ID_Expediente,
            'Expediente creado en estado borrador correctamente.' AS Mensaje;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH

END
GO


DECLARE @TablaIndicios AS TipoIndicio;

INSERT INTO @TablaIndicios (Descripcion, Color, Tamano, Peso, Ubicacion, ID_Usuario)
VALUES ('Celular Samsung', 'Negro', 'Mediano', '200g', 'Mesa', 1);

EXEC sp_CrearExpedienteBorrador
    @ID_Usuario = 1,
    @Descripcion = 'Expediente de prueba',
    @Indicios = @TablaIndicios;