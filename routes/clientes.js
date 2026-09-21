const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Creacion de clientes
router.post('/', verifyToken, (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  db.query("INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)",
    [nombre, email, telefono, direccion],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Cliente registrado" });
    });
});

// Listar clientes
router.get('/', verifyToken, (req, res) => {
  db.query("SELECT * FROM clientes", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Actualizar cliente
router.put('/:id', verifyToken, (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  db.query("UPDATE clientes SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?",
    [nombre, email, telefono, direccion, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Cliente actualizado" });
    });
});

// Eliminar cliente
router.delete('/:id', verifyToken, (req, res) => {
  db.query("DELETE FROM clientes WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Cliente eliminado" });
  });
});

module.exports = router;
