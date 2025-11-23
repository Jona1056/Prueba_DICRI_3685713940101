CREATE PROCEDURE sp_ListarRevisionesFiltrado
    @Page INT = 1,
    @ID_Expediente INT = NULL,
    @Estado VARCHAR(20) = NULL,
    @UsuarioEnvia INT = NULL,
    @UsuarioRevisa INT = NULL,
    @FechaRevision DATE = NULL    -- << SOLO esta fecha
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PageSize INT = 25;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    ------------------------------------------------------------
    -- CTE #1: para contar
    ------------------------------------------------------------
    ;WITH RevisionesFiltradas AS (
        SELECT 
            r.ID_Revision,
            r.ID_Expediente,
            r.Estado,
            r.Justificacion,
            r.Fecha_Revision,

            r.ID_Usuario_Envia,
            ue.Nombre AS Usuario_Envia,

            r.ID_Usuario_Revisa,
            ur.Nombre AS Usuario_Revisa

        FROM Revisiones r
        LEFT JOIN Usuarios ue ON ue.ID_Usuario = r.ID_Usuario_Envia
        LEFT JOIN Usuarios ur ON ur.ID_Usuario = r.ID_Usuario_Revisa
        WHERE
            (@ID_Expediente IS NULL OR r.ID_Expediente = @ID_Expediente)
            AND (@Estado IS NULL OR r.Estado = @Estado)
            AND (@UsuarioEnvia IS NULL OR r.ID_Usuario_Envia = @UsuarioEnvia)
            AND (@UsuarioRevisa IS NULL OR r.ID_Usuario_Revisa = @UsuarioRevisa)
            AND (@FechaRevision IS NULL OR CAST(r.Fecha_Revision AS DATE) = @FechaRevision)
    )
    SELECT COUNT(*) AS TotalRegistrosFiltrados
    FROM RevisionesFiltradas;

    ------------------------------------------------------------
    -- CTE #2: paginación
    ------------------------------------------------------------
    ;WITH RevisionesFiltradas AS (
        SELECT 
            r.ID_Revision,
            r.ID_Expediente,
            r.Estado,
            r.Justificacion,
            r.Fecha_Revision,

            r.ID_Usuario_Envia,
            ue.Nombre AS Usuario_Envia,

            r.ID_Usuario_Revisa,
            ur.Nombre AS Usuario_Revisa

        FROM Revisiones r
        LEFT JOIN Usuarios ue ON ue.ID_Usuario = r.ID_Usuario_Envia
        LEFT JOIN Usuarios ur ON ur.ID_Usuario = r.ID_Usuario_Revisa
        WHERE
            (@ID_Expediente IS NULL OR r.ID_Expediente = @ID_Expediente)
            AND (@Estado IS NULL OR r.Estado = @Estado)
            AND (@UsuarioEnvia IS NULL OR r.ID_Usuario_Envia = @UsuarioEnvia)
            AND (@UsuarioRevisa IS NULL OR r.ID_Usuario_Revisa = @UsuarioRevisa)
            AND (@FechaRevision IS NULL OR CAST(r.Fecha_Revision AS DATE) = @FechaRevision)
    )
    SELECT *
    FROM RevisionesFiltradas
    ORDER BY ID_Revision DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END;
GO
