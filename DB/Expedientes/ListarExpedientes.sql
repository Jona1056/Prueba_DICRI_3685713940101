

-- LISTAR EXPEDIENTES CON FILTROS
CREATE PROCEDURE sp_ListarExpedientesFiltrado
    @Page INT = 1,
    @Estado VARCHAR(20) = NULL,
    @ID_Usuario INT = NULL,
    @FechaInicio DATE = NULL,
    @FechaFin DATE = NULL,
    @ID_Expediente INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PageSize INT = 25;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    ------------------------------------------------------------
    -- CTE #1 para contar
    ------------------------------------------------------------
    ;WITH ExpedientesFiltrados AS (
        SELECT 
            e.ID_Expediente,
            e.Descripcion,
            e.Fecha,
            e.Estado,
            e.ID_Usuario,
            u.Nombre AS Usuario_Responsable
        FROM Expedientes e
        INNER JOIN Usuarios u ON u.ID_Usuario = e.ID_Usuario
        WHERE
            (@Estado IS NULL OR e.Estado = @Estado)
            AND (@ID_Usuario IS NULL OR e.ID_Usuario = @ID_Usuario)
            AND (@ID_Expediente IS NULL OR e.ID_Expediente = @ID_Expediente)
            AND (@FechaInicio IS NULL OR e.Fecha >= @FechaInicio)
            AND (@FechaFin IS NULL OR e.Fecha <= @FechaFin)
    )
    SELECT COUNT(*) AS TotalRegistrosFiltrados
    FROM ExpedientesFiltrados;

    ------------------------------------------------------------
    -- CTE #2 para paginar
    ------------------------------------------------------------
    ;WITH ExpedientesFiltrados AS (
        SELECT 
            e.ID_Expediente,
            e.Descripcion,
            e.Fecha,
            e.Estado,
            e.ID_Usuario,
            u.Nombre AS Usuario_Responsable
        FROM Expedientes e
        INNER JOIN Usuarios u ON u.ID_Usuario = e.ID_Usuario
        WHERE
            (@Estado IS NULL OR e.Estado = @Estado)
            AND (@ID_Usuario IS NULL OR e.ID_Usuario = @ID_Usuario)
            AND (@ID_Expediente IS NULL OR e.ID_Expediente = @ID_Expediente)
            AND (@FechaInicio IS NULL OR e.Fecha >= @FechaInicio)
            AND (@FechaFin IS NULL OR e.Fecha <= @FechaFin)
    )
    SELECT *
    FROM ExpedientesFiltrados
    ORDER BY ID_Expediente DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO


