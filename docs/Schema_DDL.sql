CREATE DATABASE IF NOT EXISTS autolote_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE autolote_db;

DROP TABLE IF EXISTS Vehiculos;
CREATE TABLE Vehiculos (
id_vehiculo INT AUTO_INCREMENT NOT NULL,
marca VARCHAR(50) NOT NULL,
modelo VARCHAR(50) NOT NULL,
anio YEAR NOT NULL,
PRIMARY KEY (id_vehiculo)
);

DROP TABLE IF EXISTS Clientes;
CREATE TABLE Clientes (
id_cliente INT AUTO_INCREMENT NOT NULL,
nombre VARCHAR(100) NOT NULL,
apellido VARCHAR(100) NOT NULL,
correo VARCHAR(50) NOT NULL UNIQUE,
telefono VARCHAR(50) NOT NULL,
direccion VARCHAR(500) NOT NULL,
PRIMARY KEY (id_cliente)
);

DROP TABLE IF EXISTS Usuarios;
CREATE TABLE Usuarios (
id_usuario int AUTO_INCREMENT NOT NULL,
nombre VARCHAR(50) NOT NULL,
email VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL,
PRIMARY KEY (id_usuario)
);

DROP TABLE IF EXISTS Consultas;
CREATE TABLE Consultas (
id_consulta INT AUTO_INCREMENT NOT NULL,
id_cliente INT NOT NULL,
fecha_consulta DATETIME NOT NULL,
mensaje VARCHAR(500) NOT NULL,
PRIMARY KEY (id_consulta),
CONSTRAINT fk_consulta_cliente
FOREIGN KEY(id_cliente) REFERENCES Clientes(id_cliente)
ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Ventas;
CREATE TABLE Ventas (
id_venta INT AUTO_INCREMENT NOT NULL,
fecha_venta DATETIME NOT NULL,
id_vehiculo INT NOT NULL,
id_cliente INT NOT NULL,
id_vendedor INT NOT NULL,
precio_total DECIMAL(10,2) NOT NULL,
impuestos DECIMAL(10,2) NOT NULL,
PRIMARY KEY (id_venta),
CONSTRAINT chk_precio CHECK (precio_total > 0),
CONSTRAINT chk_impuestos CHECK (impuestos >= 0),
CONSTRAINT fk_venta_vehiculo
	FOREIGN KEY(id_vehiculo) REFERENCES Vehiculos(id_vehiculo)
	ON DELETE RESTRICT ON UPDATE CASCADE,
CONSTRAINT fk_venta_cliente
	FOREIGN KEY(id_cliente) REFERENCES Clientes(id_cliente)
	ON DELETE RESTRICT ON UPDATE CASCADE,
CONSTRAINT fk_venta_vendedor
	FOREIGN KEY(id_vendedor) REFERENCES Usuarios(id_usuario)
	ON DELETE RESTRICT ON UPDATE CASCADE
);

