const express = require('express');
const axios = require('axios');
const cors = require('cors')
const mysql = require('mysql2/promise');

const app = express();
const PORT = 4000;

app.use(cors());

let UltimosDatosRAM = null;
let UltimosDatosCPU = null;

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'manuellima123',
  database: 'proyecto1_fase1'
};

// Función para crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función para insertar datos de RAM en la base de datos
async function insertarDatosRAM(datosRAM) {
  try {
    const connection = await createConnection();
    
    const query = `INSERT INTO DatosRAM (Total, Libre, Usado, PorcentajeUso) VALUES (?, ?, ?, ?)`;
    const values = [
      datosRAM.Total || 'N/A',
      datosRAM.Libre || 'N/A', 
      datosRAM.Usado || 'N/A',
      datosRAM.PorcentajeUso || 'N/A'
    ];
    const [result] = await connection.execute(query, values);
    await connection.end();
    console.log(`Datos RAM insertados correctamente - ID: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar datos RAM:', error.message);
    throw error;
  }
}

// Función para insertar datos de CPU en la base de datos
async function insertarDatosCPU(datosCPU) {
  try {
    const connection = await createConnection();
    
    const query = `INSERT INTO DatosCPU (PorcentajeUso) VALUES (?)`;
    
    const values = [ datosCPU.PorcentajeUso || 'N/A'];
    
    const [result] = await connection.execute(query, values);
    await connection.end();
    
    console.log(`Datos CPU insertados correctamente - ID: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar datos CPU:', error.message);
    throw error;
  }
}

// Función para obtener datos del agente Go
const fetchMetrics = async () => {
  try {
    const [ramRes, cpuRes] = await Promise.all([
      axios.get('http://localhost:3000/recolector/ram_202201524'),
      axios.get('http://localhost:3000/recolector/cpu_202201524')
    ]);
    UltimosDatosRAM = ramRes.data;
    UltimosDatosCPU = cpuRes.data;
    
    try {
      await Promise.all([
        insertarDatosRAM(UltimosDatosRAM),
        insertarDatosCPU(UltimosDatosCPU)
      ]);
      console.log('Datos guardados en la base de datos exitosamente');
    } catch (dbError) {
      console.error('Error al guardar en base de datos:', dbError.message);
    }

    console.log('Metricas De RAM y CPU Actualizadas Correctamente');
  } catch (error) {
    console.error('Error al obtener métricas:', error.message);
  }
};

setInterval(fetchMetrics, 5000);

app.get('/api/metricas', (req, res) => {
  res.json({
    RAM: UltimosDatosRAM,
    CPU: UltimosDatosCPU
  });
});

app.listen(PORT, () => {
  console.log(`API Node Escuchando en http://localhost:${PORT}`);
});
