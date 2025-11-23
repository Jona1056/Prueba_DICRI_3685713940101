-- procedimiento creacion de usuarios
USE DICRI;

GO

CREATE PROCEDURE sp_CrearUsuario
    @Nombre        VARCHAR(150),
    @Cui           VARCHAR(20),
    @Rol           VARCHAR(20),
    @Email         VARCHAR(150),
    @Contrasena    VARCHAR(255)   
AS
BEGIN
    SET NOCOUNT ON;


    IF (@Rol NOT IN ('tecnico', 'coordinador'))
    BEGIN
        RAISERROR ('El rol debe ser tecnico o coordinador', 16, 1);
        RETURN;
    END

   
    IF EXISTS (SELECT 1 FROM Usuarios WHERE Cui = @Cui)
    BEGIN
        RAISERROR ('El CUI ya se encuentra registrado.', 16, 1);
        RETURN;
    END

 
    IF EXISTS (SELECT 1 FROM Usuarios WHERE Email = @Email)
    BEGIN
        RAISERROR ('El email ya se encuentra registrado.', 16, 1);
        RETURN;
    END


    INSERT INTO Usuarios (Nombre, Cui, Rol, Email, Contrasena)
    VALUES (@Nombre, @Cui, @Rol, @Email, @Contrasena);

    --devuelve el id del usuario creado
    SELECT SCOPE_IDENTITY() AS NuevoIDUsuario;
END
GO

 EXEC sp_CrearUsuario
     @Nombre      = 'Juan Pérez',
     @Cui         = '1234567890101',
     @Rol         = 'tecnico',
     @Email       = 'juan.perez@dicri.gob.gt',
     @Contrasena  = '123'; 

GO

-- listar usuario de 10 en 10, para paginacion
CREATE PROCEDURE sp_ListarUsuarios
    @Pagina INT = 1   
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TamanoPagina INT = 10;
    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    SELECT 
        ID_Usuario,
        Nombre,
        Cui,
        Rol,
        Email
    FROM Usuarios
    ORDER BY ID_Usuario
    OFFSET @Offset ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;
END
GO


EXEC sp_ListarUsuarios
    @Pagina      = '2';

GO


GO
CREATE PROCEDURE sp_ActualizarUsuario
    @ID_Usuario INT,
    @Nombre VARCHAR(150) = NULL,
    @Cui VARCHAR(20) = NULL,
    @Rol VARCHAR(20) = NULL,
    @Email VARCHAR(150) = NULL,
    @Contrasena VARCHAR(255) = NULL   
AS
BEGIN
    SET NOCOUNT ON;


    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE ID_Usuario = @ID_Usuario)
    BEGIN
        RAISERROR('El usuario no existe.', 16, 1);
        RETURN;
    END

    
    IF @Rol IS NOT NULL AND @Rol NOT IN ('tecnico', 'coordinador')
    BEGIN
        RAISERROR('El rol debe ser tecnico o coordinador.', 16, 1);
        RETURN;
    END

  
    IF @Cui IS NOT NULL AND EXISTS (
        SELECT 1 FROM Usuarios 
        WHERE Cui = @Cui AND ID_Usuario <> @ID_Usuario
    )
    BEGIN
        RAISERROR('El CUI ya está registrado por otro usuario.', 16, 1);
        RETURN;
    END

   
    IF @Email IS NOT NULL AND EXISTS (
        SELECT 1 FROM Usuarios 
        WHERE Email = @Email AND ID_Usuario <> @ID_Usuario
    )
    BEGIN
        RAISERROR('El email ya está registrado por otro usuario.', 16, 1);
        RETURN;
    END

    UPDATE Usuarios
    SET
        Nombre     = COALESCE(@Nombre, Nombre),
        Cui        = COALESCE(@Cui, Cui),
        Rol        = COALESCE(@Rol, Rol),
        Email      = COALESCE(@Email, Email),

       
        Contrasena = CASE 
                        WHEN @Contrasena IS NOT NULL THEN @Contrasena
                        ELSE Contrasena
                     END
    WHERE ID_Usuario = @ID_Usuario;

    SELECT 'Usuario actualizado correctamente.' AS Mensaje;
END
GO

GO

GO
EXEC sp_ActualizarUsuario
    @ID_Usuario = 1,
    @Nombre = 'Luis Díaz',
    @Cui = '1234567890101',
    @Email = 'ldiaz@dicri.gob.gt',
    @Rol = 'tecnico',
    @Contrasena = '1234';





CREATE PROCEDURE sp_ObtenerUsuarioPorEmail
    @Email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ID_Usuario,
        Nombre,
        Cui,
        Rol,
        Email,
        Contrasena
    FROM Usuarios
    WHERE Email = @Email;
END
GO
GO
CREATE PROCEDURE sp_EliminarUsuario
    @ID_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar existencia
    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE ID_Usuario = @ID_Usuario)
    BEGIN
        RAISERROR('El usuario no existe.', 16, 1);
        RETURN;
    END

    -- Validar que no tenga expedientes registrados
    IF EXISTS (
        SELECT 1 FROM Expedientes WHERE ID_Usuario = @ID_Usuario
    )
    BEGIN
        RAISERROR('No se puede eliminar el usuario porque tiene expedientes registrados.', 16, 1);
        RETURN;
    END

    -- Validar que no tenga revisiones realizadas
    IF EXISTS (
        SELECT 1 FROM Revisiones 
        WHERE ID_Usuario_Envia = @ID_Usuario 
           OR ID_Usuario_Revisa = @ID_Usuario
    )
    BEGIN
        RAISERROR('No se puede eliminar el usuario porque participó en revisiones.', 16, 1);
        RETURN;
    END

    -- Eliminación
    DELETE FROM Usuarios WHERE ID_Usuario = @ID_Usuario;

    SELECT 'Usuario eliminado correctamente.' AS Mensaje;
END
GO
