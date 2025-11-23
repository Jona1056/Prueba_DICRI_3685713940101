CREATE PROCEDURE sp_ActualizarExpedienteCompleto
    @ID_Expediente INT,
    @Descripcion VARCHAR(300),
    @ID_Usuario INT,   -- Técnico que está modificando/agregando indicios
    @Indicios TipoIndicioUpdate READONLY
AS
BEGIN
    SET NOCOUNT ON;


    IF NOT EXISTS (
        SELECT 1 
        FROM Expedientes
        WHERE ID_Expediente = @ID_Expediente
        AND Estado IN ('borrador','rechazado')
    )
    BEGIN
        RAISERROR('Solo se pueden editar expedientes en estado borrador o rechazado.', 16, 1);
        RETURN;
    END;


    BEGIN TRY
        BEGIN TRAN;

        UPDATE Expedientes
        SET Descripcion = @Descripcion
        WHERE ID_Expediente = @ID_Expediente;


   
        DELETE FROM Indicios
        WHERE ID_Expediente = @ID_Expediente
        AND ID_Indicio NOT IN (
            SELECT ID_Indicio FROM @Indicios WHERE ID_Indicio IS NOT NULL
        );

    
        UPDATE I
        SET 
            I.Descripcion = T.Descripcion,
            I.Color = T.Color,
            I.Tamano = T.Tamano,
            I.Peso = T.Peso,
            I.Ubicacion = T.Ubicacion
        FROM Indicios I
        INNER JOIN @Indicios T ON T.ID_Indicio = I.ID_Indicio
        WHERE I.ID_Expediente = @ID_Expediente;


     
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
            @ID_Usuario,   -- Técnico que agrega nuevos indicios
            Descripcion,
            Color,
            Tamano,
            Peso,
            Ubicacion
        FROM @Indicios
        WHERE ID_Indicio IS NULL;


        COMMIT;

        SELECT 'Expediente e indicios actualizados correctamente.' AS Mensaje;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH

END;
GO
