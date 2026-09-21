const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Registro
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
    [nombre, email, hashed],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Usuario registrado" });
    });
});

// Login
router.post('/login', (req, res) => {
  const { correo, password } = req.body;
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Credenciales inválidas" });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ id_usuario: user.id_usuario, email: user.email }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ token });
  });
});

module.exports = router;
