const express = require('express');
const router = express.Router();

// GET /health -> confirma que el servidor está corriendo
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    proyecto: 'Sistema de Gestión para un Autolote',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
