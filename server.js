const express = require('express');
const app = express();
const mysql = require('mysql2');
const PORT = 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Admin',
    database: 'autolote_db'
})

pool.getConnection((error, conexion)=>{
    if(error){
        console.log('Error de conexion con la base de datos...');
    }
    else{
        console.log('Conexion exitosa');
    }
});

app.use(express.json());

app.listen(PORT, ()=>{
    console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});
