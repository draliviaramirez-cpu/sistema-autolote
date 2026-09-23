const express = require('express');
const router = express.Router();
const { obtenerTasas, convertir } = require('../services/exchangeRate.service');

// GET /api/tasas-cambio?monedas=HNL,EUR,GBP
// Público — los clientes necesitan ver precios en su moneda sin estar logueados.
router.get('/', async (req, res) => {
  const monedas = req.query.monedas
    ? req.query.monedas.split(',').map((m) => m.trim().toUpperCase())
    : ['HNL', 'EUR'];

  try {
    const resultado = await obtenerTasas(monedas);
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'No se pudo obtener las tasas de cambio en este momento' });
  }
});

// GET /api/tasas-cambio/convertir?monto=18500&moneda=EUR
router.get('/convertir', async (req, res) => {
  const monto = Number(req.query.monto);
  const moneda = (req.query.moneda || '').toUpperCase();

  if (!monto || monto <= 0) {
    return res.status(400).json({ error: 'El parámetro "monto" debe ser un número positivo' });
  }
  if (!moneda) {
    return res.status(400).json({ error: 'El parámetro "moneda" es obligatorio, ej. ?moneda=EUR' });
  }

  try {
    const resultado = await convertir(monto, moneda);
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'No se pudo realizar la conversión en este momento' });
  }
});

module.exports = router;
