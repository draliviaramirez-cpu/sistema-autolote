const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');

// Gestión del personal del autolote (admin / vendedor).
// Todas las rutas requieren estar autenticado. Nunca se devuelve password_hash.

const ROLES = ['admin', 'vendedor'];

// GET /api/usuarios
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuario ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar los usuarios' });
  }
});

// POST /api/usuarios
router.post('/', verifyToken, async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y contraseña son obligatorios' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }
  const rolFinal = ROLES.includes(rol) ? rol : 'vendedor';

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuario (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, rolFinal]
    );
    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// PUT /api/usuarios/:id
// Actualiza nombre, email y rol. La contraseña solo cambia si se envía una nueva.
router.put('/:id', verifyToken, async (req, res) => {
  const { nombre, email, rol, password } = req.body;

  if (!nombre || !email || !ROLES.includes(rol)) {
    return res.status(400).json({ error: 'nombre, email y un rol válido son obligatorios' });
  }

  try {
    let sql = 'UPDATE usuario SET nombre = ?, email = ?, rol = ?';
    const valores = [nombre, email, rol];
    if (password) {
      sql += ', password_hash = ?';
      valores.push(await bcrypt.hash(password, 10));
    }
    sql += ' WHERE id = ?';
    valores.push(req.params.id);

    const [result] = await pool.query(sql, valores);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', verifyToken, async (req, res) => {
  if (Number(req.params.id) === Number(req.usuario.id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario mientras tienes la sesión abierta' });
  }

  try {
    const [result] = await pool.query('DELETE FROM usuario WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    // Un vendedor con ventas registradas no se puede borrar (FK de venta.vendedor_id)
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'No se puede eliminar: este usuario tiene ventas registradas' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
