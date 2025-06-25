import { useState, useEffect } from 'react';
import GraficaRAM from './GraficaRAM';
import GraficaCPU from './GraficaCPU';
import GraficaProcesos from './GraficaProcesos';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const [selectedChart, setSelectedChart] = useState('todos');
  const [ramData, setRamData] = useState(null);
  const [cpuData, setCpuData] = useState(null);
  const [procesosData, setProcesosData] = useState(null);

  useEffect(() => {
    const socket = io(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`);

    socket.on('connect', () => {
      console.log('Conectado al WebSocket:', socket.id);
    });

    socket.on('nueva-metrica', (metricas) => {
      const ultima = metricas[0];
      
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
