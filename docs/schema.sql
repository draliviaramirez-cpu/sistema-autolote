-- Sistema de Gestión para un Autolote - DW5548
-- Script de creación de la base de datos y tablas
-- Modelo normalizado hasta 3FN

CREATE DATABASE IF NOT EXISTS autolote_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE autolote_db;

-- ------------------------------------------------------
-- Tabla: usuario (personal del autolote: vendedores/admin)
-- ------------------------------------------------------
CREATE TABLE usuario (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100)  NOT NULL,
  email          VARCHAR(150)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  rol            ENUM('admin', 'vendedor') NOT NULL DEFAULT 'vendedor',
  creado_en      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------
-- Tabla: vehiculo
-- ------------------------------------------------------
CREATE TABLE vehiculo (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  marca         VARCHAR(50)     NOT NULL,
  modelo        VARCHAR(50)     NOT NULL,
  anio          SMALLINT        NOT NULL,
  precio        DECIMAL(10, 2)  NOT NULL,
  disponible    BOOLEAN         NOT NULL DEFAULT TRUE,
  imagen_url    VARCHAR(255),
  creado_en     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_precio_positivo CHECK (precio > 0)
);

-- ------------------------------------------------------
-- Tabla: cliente
-- ------------------------------------------------------
CREATE TABLE cliente (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  apellido  VARCHAR(100) NOT NULL,
  correo    VARCHAR(150) NOT NULL UNIQUE,
  telefono  VARCHAR(20),
  direccion VARCHAR(255)
);

-- ------------------------------------------------------
-- Tabla: consulta (historial de consultas / pruebas de manejo)
-- ------------------------------------------------------
CREATE TABLE consulta (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id   INT NOT NULL,
  vehiculo_id  INT NOT NULL,
  tipo         ENUM('informacion', 'prueba_manejo') NOT NULL,
  mensaje      TEXT,
  fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_consulta_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_consulta_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------
-- Tabla: venta
-- ------------------------------------------------------
CREATE TABLE venta (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id   INT NOT NULL UNIQUE,   -- un vehículo se vende una sola vez
  cliente_id    INT NOT NULL,
  vendedor_id   INT NOT NULL,
  fecha_venta   DATE NOT NULL,
  precio_total  DECIMAL(10, 2) NOT NULL,
  impuestos     DECIMAL(10, 2) NOT NULL DEFAULT 0,

  CONSTRAINT fk_venta_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id),
  CONSTRAINT fk_venta_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_venta_vendedor
    FOREIGN KEY (vendedor_id) REFERENCES usuario(id),

  CONSTRAINT chk_precio_total_positivo CHECK (precio_total > 0)
);

-- ------------------------------------------------------
-- Índices adicionales sugeridos (filtros del enunciado)
-- ------------------------------------------------------
CREATE INDEX idx_vehiculo_marca_modelo ON vehiculo(marca, modelo);
CREATE INDEX idx_vehiculo_disponible ON vehiculo(disponible);
CREATE INDEX idx_consulta_cliente ON consulta(cliente_id);
CREATE INDEX idx_venta_cliente ON venta(cliente_id);
