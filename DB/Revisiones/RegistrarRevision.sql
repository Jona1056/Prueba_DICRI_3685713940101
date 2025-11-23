CREATE PROCEDURE sp_RegistrarRevision
    @ID_Revision INT,
    @ID_Expediente INT,
    @ID_Coordinador INT,
    @Accion VARCHAR(20),          
    @Justificacion VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Revisiones WHERE ID_Revision = @ID_Revision)
    BEGIN
        RAISERROR('La revisión no existe.', 16, 1);
        RETURN;
    END


    IF NOT EXISTS (
        SELECT 1 FROM Revisiones 
        WHERE ID_Revision = @ID_Revision 
        AND ID_Expediente = @ID_Expediente
    )
    BEGIN
        RAISERROR('La revisión no corresponde al expediente.', 16, 1);
        RETURN;
    END

 
    IF @Accion NOT IN ('aprobado','rechazado')
    BEGIN
        RAISERROR('La acción debe ser "aprobado" o "rechazado".', 16, 1);
        RETURN;
    END

 
    IF EXISTS (
        SELECT 1 FROM Revisiones
        WHERE ID_Revision = @ID_Revision
        AND Estado <> 'pendiente'
    )
    BEGIN
        RAISERROR('La revisión ya fue dictaminada anteriormente. No se puede modificar.', 16, 1);
        RETURN;
    END


    IF @Accion = 'rechazado' 
       AND ( @Justificacion IS NULL OR LTRIM(RTRIM(@Justificacion)) = '' )
    BEGIN
        RAISERROR('Debe ingresar una justificación para rechazar.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

  
        UPDATE Revisiones
        SET
            ID_Usuario_Revisa = @ID_Coordinador,
            Estado = @Accion,
            Justificacion = @Justificacion,
            Fecha_Revision = GETDATE()
        WHERE ID_Revision = @ID_Revision;

        -- 7. Actualizar estado del expediente
        UPDATE Expedientes
        SET 
            Estado = @Accion
        WHERE ID_Expediente = @ID_Expediente;

        COMMIT;

        SELECT 'Revisión registrada correctamente.' AS Mensaje;

    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH

END
GO
