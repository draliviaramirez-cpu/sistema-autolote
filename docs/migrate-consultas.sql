-- Migration for an existing autolote_db installation.
-- Run this when the singular core tables already exist.

USE autolote_db;

CREATE TABLE IF NOT EXISTS consulta (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id   INT NOT NULL,
  vehiculo_id  INT NOT NULL,
  tipo         ENUM('informacion', 'prueba_manejo') NOT NULL,
  mensaje      TEXT,
  fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consulta_cliente_migracion
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_consulta_vehiculo_migracion
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_consulta_cliente_migracion ON consulta(cliente_id);
