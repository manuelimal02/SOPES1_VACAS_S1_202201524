// App.jsx
import React, { useState } from 'react';
import GraficaRAM from './GraficaRAM';
import GraficaCPU from './GraficaCPU';
import GraficaProcesos from './GraficaProcesos';
import './App.css';

function App() {
  const [selectedChart, setSelectedChart] = useState('todos');

  const ramData = {
    title: "Uso de Memoria RAM",
    labels: ["Libre", "Usada"],
    series: [40, 60]
  };

  const cpuData = {
    title: "Uso de CPU",
    labels: ["Libre", "Usada"],
    series: [25, 75]
  };

  const procesosData = {
    title: "Estado De Los Procesos",
    labels: ['Totales', 'Corriendo', 'Parados', 'Zombie', 'Durmiendo'],
    series: [250, 80, 30, 5, 135]
  };

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
          {(selectedChart === 'todos' || selectedChart === 'ram') && (
            <GraficaRAM title={ramData.title} labels={ramData.labels} series={ramData.series} />
          )}
          {(selectedChart === 'todos' || selectedChart === 'cpu') && (
            <GraficaCPU title={cpuData.title} labels={cpuData.labels} series={cpuData.series} />
          )}
        </div>
      )}

      {(selectedChart === 'todos' || selectedChart === 'procesos') && (
        <div className="procesos-container">
          <GraficaProcesos title={procesosData.title} labels={procesosData.labels} series={procesosData.series} />
        </div>
      )}
    </div>
  );
}

export default App;
