const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Admin',
    database: 'autolote_db'
});

pool.getConnection((error, conexion) => {
  if (error) {
    console.log('Error de conexión con la base de datos...');
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

module.exports = pool;
