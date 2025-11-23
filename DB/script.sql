CREATE DATABASE DICRI;
GO
USE DICRI;
GO

-- #indices 
CREATE INDEX IX_Expedientes_Estado ON Expedientes (Estado);
CREATE INDEX IX_Expedientes_Fecha ON Expedientes (Fecha);
CREATE INDEX IX_Expedientes_Usuario ON Expedientes (ID_Usuario);
CREATE INDEX IX_Expedientes_Orden ON Expedientes (ID_Expediente DESC);

CREATE INDEX IX_Revisiones_Expediente ON Revisiones (ID_Expediente);
CREATE INDEX IX_Revisiones_ID_Usuario_Envia ON Revisiones (ID_Usuario_Envia);
CREATE INDEX IX_Revisiones_ID_ID_Usuario_Revisa ON Revisiones (ID_Usuario_Revisa);
CREATE INDEX IX_Revisiones_Estado ON Expedientes (Estado);
