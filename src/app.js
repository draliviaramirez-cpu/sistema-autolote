const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
// A medida que se implementen los módulos, se agregan aquí, ej:
// const vehiculoRoutes = require('./routes/vehiculo.routes');
// const ventaRoutes = require('./routes/venta.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Autolote funcionando 🚗' });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
// app.use('/api/vehiculos', vehiculoRoutes);
// app.use('/api/ventas', ventaRoutes);

// Manejo básico de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
