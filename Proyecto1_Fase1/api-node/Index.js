const express = require('express');
const axios = require('axios');
const cors = require('cors')
const mysql = require('mysql2/promise');

const app = express();
const PORT = 4000;

app.use(cors());

let UltimosDatosRAM = null;
let UltimosDatosCPU = null;

const ConfigBD = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'manuellima123',
  database: 'proyecto1_fase1'
};


async function EstablecerConexionBD() {
  try {
    const ConexionBD = await mysql.EstablecerConexionBD(ConfigBD);
    return ConexionBD;
  } catch (error) {
    console.error('Error Conectando a La Base De Datos:', error);
    throw error;
  }
}

async function InsercionDatosRAM(datosRAM) {
  try {
    const ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO DatosRAM (Total, Libre, Usado, PorcentajeUso) VALUES (?, ?, ?, ?)`;
    const values = [
      datosRAM.Total || 'N/A',
      datosRAM.Libre || 'N/A', 
      datosRAM.Usado || 'N/A',
      datosRAM.PorcentajeUso || 'N/A'
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

async function InsercionDatosCPU(datosCPU) {
  try {
    const ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO DatosCPU (PorcentajeUso) VALUES (?)`;
    
    const values = [ datosCPU.PorcentajeUso || 'N/A'];
    
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
      axios.get('http://localhost:3000/recolector/ram_202201524'),
      axios.get('http://localhost:3000/recolector/cpu_202201524')
    ]);
    UltimosDatosRAM = RestultadoRAM.data;
    UltimosDatosCPU = RestultadoCPU.data;
    
    try {
      await Promise.all([
        InsercionDatosRAM(UltimosDatosRAM),
        InsercionDatosCPU(UltimosDatosCPU)
      ]);
      console.log('Datos Insertados Correctamente en la Base de Datos');
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
