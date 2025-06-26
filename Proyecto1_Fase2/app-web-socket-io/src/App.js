import { useState, useEffect } from 'react';
import GraficaRAM from './GraficaRAM';
import GraficaCPU from './GraficaCPU';
import GraficaProcesos from './GraficaProcesos';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');
  const [selectedChart, setSelectedChart] = useState('todos');
  const [ramData, setRamData] = useState({
    title: "Uso de Memoria RAM",
    labels: ["Libre", "Usada"],
    series: [0, 0],
    totalGB: 0,
    porcentajeUso: 0
  });

  const [cpuData, setCpuData] = useState({
    title: "Uso de CPU",
    labels: ["Libre", "Usada"],
    series: [0, 0]
  });

  const [procesosData, setProcesosData] = useState({
    title: "Estado De Los Procesos",
    labels: ['Totales', 'Corriendo', 'Parados', 'Zombie', 'Durmiendo'],
    series: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    const socket = io(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`);

    socket.on('connect', () => {
      console.log('Conectado al WebSocket:', socket.id);
    });

    socket.on('nueva-metrica', (metricas) => {
      const ultima = metricas[0];

      if (ultima.fecha_creacion) {
        const fecha = new Date(ultima.fecha_creacion);
        setUltimaActualizacion(fecha.toLocaleString('es-ES'));
      }

      
      setRamData({
        title: "Uso de Memoria RAM",
        labels: ["Libre", "Usada"],
        series: [
          parseInt(ultima.RamLibre), 
          parseInt(ultima.UsoRam)
        ],
        totalGB: parseInt(ultima.TotalRam),
        porcentajeUso: parseInt(ultima.PorcentajeRam)
      });

      setCpuData({
        title: "Uso de CPU",
        labels: ["Libre", "Usada"],
        series: [
          parseFloat(ultima.PorcentajeCPULibre), 
          parseFloat(ultima.PorcentajeCPUUso)
        ]
      });

      setProcesosData({
        title: "Estado De Los Procesos",
        labels: ['Totales', 'Corriendo', 'Parados', 'Zombie', 'Durmiendo'],
        series: [
          parseInt(ultima.TotalProcesos),
          parseInt(ultima.ProcesosCorriendo),
          parseInt(ultima.ProcesosParados),
          parseInt(ultima.ProcesosZombie),
          parseInt(ultima.ProcesosDurmiendo)
        ]
      });
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del WebSocket');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <div className="navbar">
        <h2>Monitor de Sistema</h2>
        <p className="ultima-actualizacion">
          {ultimaActualizacion && `Última actualización: ${ultimaActualizacion}`}
        </p>
        <div className="navbar-buttons">
          <button className="btn-all" onClick={() => setSelectedChart('todos')}>Todos</button>
          <button className="btn-ram" onClick={() => setSelectedChart('ram')}>RAM</button>
          <button className="btn-cpu" onClick={() => setSelectedChart('cpu')}>CPU</button>
          <button className="btn-proc" onClick={() => setSelectedChart('procesos')}>Procesos</button>
        </div>
      </div>

      {(selectedChart === 'todos' || selectedChart === 'ram' || selectedChart === 'cpu') && (
        <div className="chart-container">
          {(selectedChart === 'todos' || selectedChart === 'ram') && ramData && (
            <GraficaRAM
              title={ramData.title}
              labels={ramData.labels}
              series={ramData.series}
              totalGB={ramData.totalGB}
              porcentajeUso={ramData.porcentajeUso}
            />
          )}
          {(selectedChart === 'todos' || selectedChart === 'cpu') && cpuData && (
            <GraficaCPU
              title={cpuData.title}
              labels={cpuData.labels}
              series={cpuData.series}
            />
          )}
        </div>
      )}

      {(selectedChart === 'todos' || selectedChart === 'procesos') && procesosData && (
        <div className="procesos-container">
          <GraficaProcesos
            title={procesosData.title}
            labels={procesosData.labels}
            series={procesosData.series}
          />
        </div>
      )}
    </div>
  );
}

export default App;