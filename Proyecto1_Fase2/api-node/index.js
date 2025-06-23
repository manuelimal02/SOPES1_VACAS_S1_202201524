require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors')
const mysql = require('mysql2/promise');

const app = express();

const PORT = process.env.NODE_PORT;

app.use(cors());

let MetricasRecibidas = null;

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


async function InsertarMetricas(metrica) {
  try {
    const ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO Metrica (
        TotalRam, 
        RamLibre, 
        UsoRam, 
        PorcentajeRam,
        PorcentajeCPUUso, 
        PorcentajeCPULibre,
        ProcesosCorriendo, 
        TotalProcesos,
        ProcesosDurmiendo, 
        ProcesosZombie,
        ProcesosParados, 
        HoraFecha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      metrica.TotalRam,
      metrica.RamLibre,
      metrica.UsoRam,
      metrica.PorcentajeRam,
      metrica.PorcentajeCPUUso,
      metrica.PorcentajeCPULibre,
      metrica.ProcesosCorriendo,
      metrica.TotalProcesos,
      metrica.ProcesosDurmiendo,
      metrica.ProcesosZombie,
      metrica.ProcesosParados,
      metrica.HoraFecha
    ];

    const [result] = await ConexionBD.execute(query, values);
    await ConexionBD.end();
    console.log(`Métricas Insertadas Correctamente - ID: ${result.insertId}`);
    return result.insertId;

  } catch (error) {
    console.error('Error Al Insertar Métricas:', error.message);
    throw error;
  }
}

const ObtenerMetricas = async () => {
  try {
    const [ResultadoMetricas] = await Promise.all([
      axios.get(`${GO_URL}/recolector/data_202201524`),
    ]);
    MetricasRecibidas = ResultadoMetricas.data;
    
    try {
      await Promise.all([
        InsertarMetricas(MetricasRecibidas),
      ]);
    } catch (dbError) {
      console.error('Error al guardar en base de datos:', dbError.message);
    }

    console.log('Metricas De RAM, CPU y Procesos Actualizadas Correctamente');
  } catch (error) {
    console.error('Error al obtener métricas:', error.message);
  }
};

app.listen(PORT, () => {
  console.log(`API Node Escuchando en http://localhost:${PORT}`);
});