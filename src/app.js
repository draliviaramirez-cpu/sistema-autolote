const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const ventaRoutes = require('./routes/venta.routes');
const tasasRoutes = require('./routes/tasas.routes');
const consultaRoutes = require('./routes/consulta.routes');
const usuarioRoutes = require('./routes/usuario.routes');

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
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/tasas-cambio', tasasRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Manejo básico de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
