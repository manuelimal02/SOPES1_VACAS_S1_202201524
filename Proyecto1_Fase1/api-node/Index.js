const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4000;

let UltimosDatosRAM = null;
let UltimosDatosCPU = null;

// Función para obtener datos del agente Go
const fetchMetrics = async () => {
  try {
    const [ramRes, cpuRes] = await Promise.all([
      axios.get('http://localhost:3000/recolector/ram_202201524'),
      axios.get('http://localhost:3000/recolector/cpu_202201524')
    ]);
    UltimosDatosRAM = ramRes.data;
    UltimosDatosCPU = cpuRes.data;
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
