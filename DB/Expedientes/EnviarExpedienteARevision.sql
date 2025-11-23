CREATE PROCEDURE sp_EnviarExpedienteARevision
    @ID_Expediente INT,
    @ID_Usuario_Envia INT       -- técnico que envía a revisión
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Expedientes WHERE ID_Expediente = @ID_Expediente)
    BEGIN
        RAISERROR('El expediente no existe.', 16, 1);
        RETURN;
    END

  
    IF EXISTS (
        SELECT 1 FROM Expedientes
        WHERE ID_Expediente = @ID_Expediente
        AND Estado NOT IN ('borrador', 'rechazado')
    )
    BEGIN
        RAISERROR('Solo se pueden enviar a revisión expedientes en estado borrador o rechazados.', 16, 1);
        RETURN;
    END


    BEGIN TRY
        BEGIN TRAN;

       
        UPDATE Expedientes
        SET 
            ID_Usuario = @ID_Usuario_Envia,
            Estado = 'pendiente'
        WHERE ID_Expediente = @ID_Expediente;


      
        INSERT INTO Revisiones (
            ID_Usuario_Envia,
            ID_Usuario_Revisa,
            ID_Expediente,
            Estado,
            Justificacion,
            Fecha_Revision
        )
        VALUES (
            @ID_Usuario_Envia,   -- técnico que envía
            NULL,                -- aún no revisa ningún coordinador
            @ID_Expediente,
            'pendiente',
            NULL,
            NULL
        );

        COMMIT;

        SELECT 'Expediente enviado a revisión correctamente.' AS Mensaje;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH

END
GO


EXEC sp_EnviarExpedienteARevision
    @ID_Expediente = 1,
    @ID_Usuario_Envia = 1;