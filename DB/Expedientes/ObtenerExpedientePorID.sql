CREATE PROCEDURE sp_ObtenerExpedientePorID
    @ID_Expediente INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Expediente con datos del usuario
    SELECT 
        e.ID_Expediente,
        e.Descripcion,
        e.Fecha,
        e.Estado,
        e.ID_Usuario,
        u.Nombre AS Usuario_Responsable
    FROM Expedientes e
    INNER JOIN Usuarios u ON u.ID_Usuario = e.ID_Usuario
    WHERE e.ID_Expediente = @ID_Expediente;

    -- Indicios del expediente
    SELECT
        i.ID_Indicio,
        i.Descripcion,
        i.Color,
        i.Tamano,
        i.Peso,
        i.Ubicacion,
        i.ID_Usuario
    FROM Indicios i
    WHERE i.ID_Expediente = @ID_Expediente;
END
GO
