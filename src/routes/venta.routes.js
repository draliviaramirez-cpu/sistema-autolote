const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');

// Todas las rutas de ventas requieren estar autenticado

// POST /api/ventas
// El vendedor se toma del token (req.usuario.id), no del body, para que no se pueda
// suplantar a otro vendedor.
router.post('/', verifyToken, async (req, res) => {
  const { vehiculo_id, cliente_id, precio_total, impuestos, fecha_venta } = req.body;
  const vendedor_id = req.usuario.id;

  if (!vehiculo_id || !cliente_id || !precio_total) {
    return res.status(400).json({ error: 'vehiculo_id, cliente_id y precio_total son obligatorios' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verifica que el vehículo exista y siga disponible
    const [vehiculos] = await connection.query(
      'SELECT id, disponible FROM vehiculo WHERE id = ? FOR UPDATE',
      [vehiculo_id]
    );

    if (vehiculos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'El vehículo no existe' });
    }
    if (!vehiculos[0].disponible) {
      await connection.rollback();
      return res.status(409).json({ error: 'El vehículo ya no está disponible (posiblemente ya vendido)' });
    }

    const [result] = await connection.query(
      `INSERT INTO venta (vehiculo_id, cliente_id, vendedor_id, fecha_venta, precio_total, impuestos)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehiculo_id, cliente_id, vendedor_id, fecha_venta || new Date(), precio_total, impuestos || 0]
    );

    // Marca el vehículo como no disponible al venderse
    await connection.query('UPDATE vehiculo SET disponible = FALSE WHERE id = ?', [vehiculo_id]);

    await connection.commit();
    res.status(201).json({ message: 'Venta registrada', id: result.insertId });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este vehículo ya tiene una venta registrada' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  } finally {
    connection.release();
  }
});

// GET /api/ventas
// Devuelve las ventas con los datos básicos del vehículo, cliente y vendedor (JOIN)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        v.id, v.fecha_venta, v.precio_total, v.impuestos,
        veh.id AS vehiculo_id, veh.marca, veh.modelo, veh.anio,
        c.id AS cliente_id, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
        u.id AS vendedor_id, u.nombre AS vendedor_nombre
      FROM venta v
      JOIN vehiculo veh ON veh.id = v.vehiculo_id
      JOIN cliente c ON c.id = v.cliente_id
      JOIN usuario u ON u.id = v.vendedor_id
      ORDER BY v.fecha_venta DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las ventas' });
  }
});

// GET /api/ventas/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM venta WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
});

// PUT /api/ventas/:id
// Solo permite corregir precio, impuestos y fecha — no reasignar vehículo/cliente/vendedor,
// para no romper la consistencia con la disponibilidad del vehículo.
router.put('/:id', verifyToken, async (req, res) => {
  const { precio_total, impuestos, fecha_venta } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE venta SET precio_total = ?, impuestos = ?, fecha_venta = ? WHERE id = ?',
      [precio_total, impuestos, fecha_venta, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json({ message: 'Venta actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
});

// DELETE /api/ventas/:id
// Al cancelar una venta, vuelve a marcar el vehículo como disponible.
router.delete('/:id', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT vehiculo_id FROM venta WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    await connection.query('DELETE FROM venta WHERE id = ?', [req.params.id]);
    await connection.query('UPDATE vehiculo SET disponible = TRUE WHERE id = ?', [rows[0].vehiculo_id]);

    await connection.commit();
    res.json({ message: 'Venta eliminada y vehículo marcado como disponible de nuevo' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  } finally {
    connection.release();
  }
});

module.exports = router;
