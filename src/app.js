const express = require('express');
const cors = require('cors');
const ventaRoutes = require('./routes/venta.routes');
const tasasRoutes = require('./routes/tasas.routes');

const healthRoutes = require('./routes/health.routes');
// A medida que se implementen los módulos, se agregan aquí, ej:
// const vehiculoRoutes = require('./routes/vehiculo.routes');
// const clienteRoutes = require('./routes/cliente.routes');
// const ventaRoutes = require('./routes/venta.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/ventas', ventaRoutes);
app.use('/api/tasas-cambio', tasasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Autolote funcionando 🚗' });
});

app.use('/api', healthRoutes);
// app.use('/api/vehiculos', vehiculoRoutes);
// app.use('/api/clientes', clienteRoutes);
// app.use('/api/ventas', ventaRoutes);

// Manejo básico de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
