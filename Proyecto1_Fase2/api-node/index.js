require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.NODE_PORT;

app.use(cors());
app.use(express.json());

let MetricasRecibidas = null;

const ConfigBD = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

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
  let ConexionBD;
  try {
    ConexionBD = await EstablecerConexionBD();
    
    const query = `INSERT INTO Metrica (
        API,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      "API Node",
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
    return result.insertId;

  } catch (error) {
    console.error('Error Al Insertar Métricas:', error.message);
    throw error;
  } finally {
    if (ConexionBD) {
      await ConexionBD.end();
    }
  }
}

app.post('/metricas', async (req, res) => {
  const metrica = req.body;

  if (!metrica) {
    return res.status(400).json({ error: 'Métricas No Proporcionadas.' });
  }

  try {
    MetricasRecibidas = metrica;
    const id = await InsertarMetricas(metrica);
    res.status(200).json({ message: 'Métricas Recibidas E Insertadas.', "Id": id });
  } catch (error) {
    res.status(500).json({ error: 'Error Al Insertar Métricas.', detalle: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Node Escuchando en http://localhost:${PORT}`);
});