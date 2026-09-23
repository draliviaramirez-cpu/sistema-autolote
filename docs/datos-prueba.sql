-- Datos de prueba para el Sistema Autolote (vehiculos, clientes y consultas)
-- Importar en phpMyAdmin DESPUES de schema.sql
USE autolote_db;

INSERT INTO vehiculo (marca, modelo, anio, precio, disponible) VALUES
('Toyota',     'Hilux',     2021, 32500.00, TRUE),
('Toyota',     'Corolla',   2019, 15800.00, TRUE),
('Toyota',     'RAV4',      2020, 24900.00, TRUE),
('Honda',      'Civic',     2018, 13500.00, TRUE),
('Honda',      'CR-V',      2022, 29900.00, TRUE),
('Nissan',     'Frontier',  2020, 27500.00, TRUE),
('Nissan',     'Sentra',    2017,  9800.00, TRUE),
('Mitsubishi', 'L200',      2019, 22000.00, TRUE),
('Hyundai',    'Tucson',    2021, 23800.00, TRUE),
('Kia',        'Sportage',  2016, 11200.00, TRUE),
('Mazda',      'CX-5',      2020, 21500.00, TRUE),
('Ford',       'Ranger',    2018, 19900.00, TRUE);

INSERT INTO cliente (nombre, apellido, correo, telefono, direccion) VALUES
('Ana',    'López',     'ana.lopez@correo.com',     '9876-5432', 'Col. Kennedy, Tegucigalpa'),
('Carlos', 'Mejía',     'carlos.mejia@correo.com',  '3345-1122', 'Barrio Guamilito, San Pedro Sula'),
('María',  'Rodríguez', 'maria.rodriguez@correo.com','8899-0011', 'Comayagua centro'),
('José',   'Hernández', 'jose.hernandez@correo.com','9512-3478', 'Siguatepeque'),
('Karla',  'Martínez',  'karla.martinez@correo.com','3190-6655', 'La Ceiba');

INSERT INTO consulta (cliente_id, vehiculo_id, tipo, mensaje)
SELECT c.id, v.id, 'prueba_manejo', 'Quiere probarlo el sábado en la mañana'
FROM cliente c, vehiculo v WHERE c.correo='ana.lopez@correo.com' AND v.modelo='Hilux';
INSERT INTO consulta (cliente_id, vehiculo_id, tipo, mensaje)
SELECT c.id, v.id, 'informacion', '¿Aceptan carro usado como prima?'
FROM cliente c, vehiculo v WHERE c.correo='jose.hernandez@correo.com' AND v.modelo='Civic';
