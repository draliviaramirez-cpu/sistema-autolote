const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');

// GET /api/vehiculos
// Público — los clientes deben poder ver el inventario sin loguearse.
// Soporta filtros: ?marca=Toyota&modelo=Corolla&precio_min=10000&precio_max=20000&disponible=true
router.get('/', async (req, res) => {
  const { marca, modelo, precio_min, precio_max, disponible } = req.query;

  const condiciones = [];
  const valores = [];

  if (marca) {
    condiciones.push('marca LIKE ?');
    valores.push(`%${marca}%`);
  }
  if (modelo) {
    condiciones.push('modelo LIKE ?');
    valores.push(`%${modelo}%`);
  }
  if (precio_min) {
    condiciones.push('precio >= ?');
    valores.push(precio_min);
  }
  if (precio_max) {
    condiciones.push('precio <= ?');
    valores.push(precio_max);
  }
  if (disponible !== undefined) {
    condiciones.push('disponible = ?');
    valores.push(disponible === 'true' ? 1 : 0);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(`SELECT * FROM vehiculo ${where} ORDER BY id DESC`, valores);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar los vehículos' });
  }
});

// GET /api/vehiculos/:id
// Público
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
});

// POST /api/vehiculos
// Protegido — solo el personal del autolote puede registrar vehículos.
router.post('/', verifyToken, async (req, res) => {
  const { marca, modelo, anio, precio, disponible, imagen_url } = req.body;

  if (!marca || !modelo || !anio || !precio) {
    return res.status(400).json({ error: 'marca, modelo, anio y precio son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO vehiculo (marca, modelo, anio, precio, disponible, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [marca, modelo, anio, precio, disponible === undefined ? true : disponible, imagen_url || null]
    );
    res.status(201).json({ message: 'Vehículo registrado', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el vehículo' });
  }
});

// PUT /api/vehiculos/:id
// Protegido
router.put('/:id', verifyToken, async (req, res) => {
  const { marca, modelo, anio, precio, disponible, imagen_url } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE vehiculo SET marca = ?, modelo = ?, anio = ?, precio = ?, disponible = ?, imagen_url = ?
       WHERE id = ?`,
      [marca, modelo, anio, precio, disponible, imagen_url, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json({ message: 'Vehículo actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el vehículo' });
  }
});

// DELETE /api/vehiculos/:id
// Protegido
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM vehiculo WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json({ message: 'Vehículo eliminado' });
  } catch (error) {
    // Si el vehículo ya tiene una venta asociada, la FK impide borrarlo (ON DELETE RESTRICT)
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'No se puede eliminar: el vehículo tiene una venta registrada' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el vehículo' });
  }
});

module.exports = router;
