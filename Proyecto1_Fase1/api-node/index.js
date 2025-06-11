require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors')
const mysql = require('mysql2/promise');

const app = express();

const PORT = process.env.NODE_PORT;

app.use(cors());

let UltimosDatosRAM = null;
let UltimosDatosCPU = null;

// Variables De Entorno Base De Datos
const ConfigBD = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Variable De Entorno Go
const GO_URL = `http://${process.env.GO_HOST}:${process.env.GO_PORT}`;

async function EstablecerConexionBD() {
  try {
    const ConexionBD = await mysql.createConnection(ConfigBD);
    return ConexionBD;
  } catch (error) {
    console.error('Error Conectando a La Base De Datos:', error);
    throw error;
  }
}

async function InsertarDatosRAM(datosRAM) {
  try {
    const ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO DatosRAM (Total, Libre, Usado, PorcentajeUso) VALUES (?, ?, ?, ?)`;
    const values = [
      datosRAM.Total,
      datosRAM.Libre, 
      datosRAM.Usado,
      datosRAM.PorcentajeUso
    ];
    const [result] = await ConexionBD.execute(query, values);
    await ConexionBD.end();
    console.log(`Datos RAM Insertados Correctamente - ID: ${result.insertId}`);
    return result.insertId;

  } catch (error) {
    console.error('Error Al Insertar Datos RAM:', error.message);
    throw error;
  }
}

async function InsertarDatosCPU(datosCPU) {
  try {
    const ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO DatosCPU (PorcentajeUso) VALUES (?)`;
    
    const values = [datosCPU.PorcentajeUso];
    
    const [result] = await ConexionBD.execute(query, values);
    await ConexionBD.end();
    
    console.log(`Datos CPU Insertados Correctamente - ID: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    console.error('Error Al Insertar Datos CPU:', error.message);
    throw error;
  }
}

const ObtenerMetricas = async () => {
  try {
    const [RestultadoRAM, RestultadoCPU] = await Promise.all([
      axios.get(`${GO_URL}/recolector/ram_202201524`),
      axios.get(`${GO_URL}/recolector/cpu_202201524`)
    ]);
    UltimosDatosRAM = RestultadoRAM.data;
    UltimosDatosCPU = RestultadoCPU.data;
    
    try {
      await Promise.all([
        InsertarDatosRAM(UltimosDatosRAM),
        InsertarDatosCPU(UltimosDatosCPU)
      ]);
    } catch (dbError) {
      console.error('Error al guardar en base de datos:', dbError.message);
    }

    console.log('Metricas De RAM y CPU Actualizadas Correctamente');
  } catch (error) {
    console.error('Error al obtener métricas:', error.message);
  }
};

setInterval(ObtenerMetricas, 2000);

app.get('/api/metricas', (req, res) => {
  res.json({
    RAM: UltimosDatosRAM,
    CPU: UltimosDatosCPU
  });
});

app.listen(PORT, () => {
  console.log(`API Node Escuchando en http://localhost:${PORT}`);
});