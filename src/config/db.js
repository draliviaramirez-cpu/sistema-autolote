const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones a MySQL. Se usa un pool en lugar de una sola conexión
// para que el servidor pueda manejar varias peticiones concurrentes.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autolote_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función auxiliar para probar la conexión al iniciar el servidor.
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente.');
    connection.release();
  } catch (error) {
    console.error('⚠️  No se pudo conectar a MySQL:', error.message);
    console.error('   El servidor seguirá corriendo, pero las rutas que usen la base de datos fallarán.');
  }
}

module.exports = { pool, testConnection };
