-- Migration for an existing autolote_db installation.
-- Run this after docs/schema.sql when the singular core tables already exist.

USE autolote_db;

CREATE TABLE IF NOT EXISTS venta (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id   INT NOT NULL UNIQUE,
  cliente_id    INT NOT NULL,
  vendedor_id   INT NOT NULL,
  fecha_venta   DATE NOT NULL,
  precio_total  DECIMAL(10, 2) NOT NULL,
  impuestos     DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_venta_vehiculo_migracion
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id),
  CONSTRAINT fk_venta_cliente_migracion
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_venta_vendedor_migracion
    FOREIGN KEY (vendedor_id) REFERENCES usuario(id),
  CONSTRAINT chk_precio_total_positivo_migracion CHECK (precio_total > 0)
);

CREATE INDEX idx_venta_cliente_migracion ON venta(cliente_id);
