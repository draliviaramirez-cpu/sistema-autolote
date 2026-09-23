const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', verifyToken, async (req, res) => {
  const { cliente_id, vehiculo_id, tipo, mensaje } = req.body;

  if (!cliente_id || !vehiculo_id || !['informacion', 'prueba_manejo'].includes(tipo)) {
    return res.status(400).json({
      error: 'cliente_id, vehiculo_id y un tipo valido son obligatorios',
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO consulta (cliente_id, vehiculo_id, tipo, mensaje) VALUES (?, ?, ?, ?)',
      [cliente_id, vehiculo_id, tipo, mensaje || null],
    );
    res.status(201).json({ message: 'Consulta registrada', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'El cliente o vehículo no existe' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la consulta' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const clienteId = req.query.cliente_id;
  const where = clienteId ? 'WHERE c.cliente_id = ?' : '';
  const values = clienteId ? [clienteId] : [];

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.cliente_id, c.vehiculo_id, c.tipo, c.mensaje, c.fecha,
              cl.nombre AS cliente_nombre, cl.apellido AS cliente_apellido,
              v.marca, v.modelo
       FROM consulta c
       JOIN cliente cl ON cl.id = c.cliente_id
       JOIN vehiculo v ON v.id = c.vehiculo_id
       ${where}
       ORDER BY c.fecha DESC`,
      values,
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las consultas' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM consulta WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }
    res.json({ message: 'Consulta eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la consulta' });
  }
});

module.exports = router;
