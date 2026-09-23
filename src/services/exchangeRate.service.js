// Servicio de tasas de cambio usando ExchangeRate-API (acceso abierto, open.er-api.com)
// Gratis, sin API key, e incluye la lempira (HNL). Las tasas se actualizan una vez al día.
// Los precios de los vehículos se asumen en USD.
// Docs: https://www.exchangerate-api.com/docs/free
// Atribución requerida: "Rates By Exchange Rate API" (https://www.exchangerate-api.com)

const API_BASE_URL = 'https://open.er-api.com/v6/latest';
const MONEDA_BASE = process.env.MONEDA_BASE || 'USD';

// Cache simple en memoria para no golpear la API en cada request.
// La API devuelve todas las monedas en una sola llamada, así que se guarda la tabla completa.
let cache = { tabla: null, timestamp: 0 };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

async function obtenerTablaCompleta() {
  const ahora = Date.now();
  if (cache.tabla && ahora - cache.timestamp < CACHE_TTL_MS) {
    return cache.tabla;
  }

  const response = await fetch(`${API_BASE_URL}/${MONEDA_BASE}`);
  if (!response.ok) {
    throw new Error(`ExchangeRate-API respondió con estado ${response.status}`);
  }

  const json = await response.json();
  if (json.result !== 'success') {
    throw new Error(`ExchangeRate-API devolvió un error: ${json['error-type'] || 'desconocido'}`);
  }

  const tabla = {
    base: json.base_code,
    fecha: new Date(json.time_last_update_utc).toISOString().slice(0, 10),
    tasas: json.rates,
  };
  cache = { tabla, timestamp: ahora };
  return tabla;
}

/**
 * Obtiene las tasas de cambio desde MONEDA_BASE hacia las monedas indicadas.
 * @param {string[]} monedas - ej. ['HNL', 'EUR', 'GBP']
 * @returns {Promise<{base: string, fecha: string, tasas: Object}>}
 */
async function obtenerTasas(monedas = ['HNL', 'EUR']) {
  const { base, fecha, tasas } = await obtenerTablaCompleta();
  const filtradas = {};
  monedas.forEach((m) => {
    if (tasas[m] !== undefined) filtradas[m] = tasas[m];
  });
  return { base, fecha, tasas: filtradas };
}

/**
 * Convierte un monto de MONEDA_BASE a una moneda destino.
 * @param {number} monto
 * @param {string} monedaDestino - ej. 'HNL'
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
