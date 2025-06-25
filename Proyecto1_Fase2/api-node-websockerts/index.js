require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.NODE_PORT;

app.use(cors());
app.use(express.json());

const ConfigBD = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Establecer conexión a la base de datos
async function EstablecerConexionBD() {
  try {
    const ConexionBD = await mysql.createConnection(ConfigBD);
    return ConexionBD;
  } catch (error) {
    console.error('Error Conectando a La Base De Datos:', error.message);
    throw error;
  }
}

async function ObtenerUltimasMetricas() {
  let ConexionBD;
  try {
    ConexionBD = await EstablecerConexionBD();
    const [rows] = await ConexionBD.execute(
        `SELECT * FROM Metrica ORDER BY fecha_creacion DESC LIMIT 1`
    );
    return rows;
  } catch (error) {
    console.error('Error Al Obtener métricas:', error.message);
    return [];
  } finally {
    if (ConexionBD) await ConexionBD.end();
  }
}

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente Conectado Vía WebSocket:', socket.id);
  // Enviar datos inmediatamente al conectar
  EnviarMetricas(socket);
  socket.on('disconnect', () => {
    console.log('Cliente Desconectado:', socket.id);
  });
});

// Función que envía métricas cada segundo
async function EnviarMetricas(socket = null) {
    const metricas = await ObtenerUltimasMetricas();
    console.log('Enviando Métricas:', metricas);
    if (socket) {
      socket.emit('nueva-metrica', metricas);
    } else {
      io.emit('nueva-metrica', metricas);
    }
}

setInterval(() => {
  EnviarMetricas();
}, 1000);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`API WebSocket escuchando en http://localhost:${PORT}`);
});
