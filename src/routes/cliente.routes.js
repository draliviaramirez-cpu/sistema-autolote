const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');

// Todas las rutas de clientes requieren estar autenticado (personal del autolote)

// POST /api/clientes
router.post('/', verifyToken, async (req, res) => {
  const { nombre, apellido, correo, telefono, direccion } = req.body;

  if (!nombre || !apellido || !correo) {
    return res.status(400).json({ error: 'nombre, apellido y correo son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO cliente (nombre, apellido, correo, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, correo, telefono || null, direccion || null]
    );
    res.status(201).json({ message: 'Cliente registrado', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
});

// GET /api/clientes
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
});

// GET /api/clientes/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', verifyToken, async (req, res) => {
  const { nombre, apellido, correo, telefono, direccion } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE cliente SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, apellido, correo, telefono, direccion, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cliente WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;
