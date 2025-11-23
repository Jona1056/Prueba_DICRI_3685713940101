DECLARE @TablaIndicios AS TipoIndicio;


INSERT INTO @TablaIndicios (Descripcion, Color, Tamano, Peso, Ubicacion, ID_Usuario)
VALUES
('Celular Samsung', 'Negro', 'Mediano', '200g', 'Mesa del comedor', 1),
('Laptop HP', 'Gris', '15 pulgadas', '1.8kg', 'Habitación principal', 1);

EXEC sp_CrearExpedienteBorrador
    @ID_Usuario = 1,
    @Descripcion = 'Expediente por allanamiento',
    @Indicios = @TablaIndicios;