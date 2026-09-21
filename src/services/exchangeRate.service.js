// Servicio de tasas de cambio usando Frankfurter (api.frankfurter.dev)
// Gratis, sin API key. Los precios de los vehículos se asumen en USD.
// Docs: https://frankfurter.dev

const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev/v2';
const MONEDA_BASE = process.env.MONEDA_BASE || 'USD';

// Cache simple en memoria para no golpear la API en cada request
// (las tasas no cambian segundo a segundo, con 1 hora de cache es más que suficiente)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Obtiene las tasas de cambio desde MONEDA_BASE hacia las monedas indicadas.
 * @param {string[]} monedas - ej. ['EUR', 'HNL', 'GBP']
 * @returns {Promise<{base: string, fecha: string, tasas: Object}>}
 */
async function obtenerTasas(monedas = ['EUR', 'HNL']) {
  const ahora = Date.now();
  const simbolos = monedas.join(',');

  if (cache.data && cache.simbolos === simbolos && (ahora - cache.timestamp) < CACHE_TTL_MS) {
    return cache.data;
  }

  const url = `${FRANKFURTER_BASE_URL}/latest?base=${MONEDA_BASE}&symbols=${simbolos}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Frankfurter respondió con estado ${response.status}`);
  }

  const json = await response.json();
  const resultado = {
    base: json.base,
    fecha: json.date,
    tasas: json.rates,
  };

  cache = { data: resultado, timestamp: ahora, simbolos };
  return resultado;
}

/**
 * Convierte un monto de MONEDA_BASE a una moneda destino.
 * @param {number} monto
 * @param {string} monedaDestino - ej. 'EUR'
 */
async function convertir(monto, monedaDestino) {
  const { tasas, base, fecha } = await obtenerTasas([monedaDestino]);
  const tasa = tasas[monedaDestino];

  if (tasa === undefined) {
    throw new Error(`No se encontró tasa para ${monedaDestino}`);
  }

  return {
    monedaOrigen: base,
    monedaDestino,
    montoOriginal: monto,
    montoConvertido: Number((monto * tasa).toFixed(2)),
    tasa,
    fecha,
  };
}

module.exports = { obtenerTasas, convertir, MONEDA_BASE };
