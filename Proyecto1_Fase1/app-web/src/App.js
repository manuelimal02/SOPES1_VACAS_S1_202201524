import { useState, useEffect } from 'react';
import './App.css';
import GraficaCPU from './GraficaCPU';
import GraficaRAM from './GraficaRAM';

const Navbar = ({ setSelectedChart }) => (
  <nav className="navbar">
    <h2>Monitor De Servicios Linux - Proyecto Fase 1</h2>
    <div className="navbar-buttons">
      <button className="navbar-button btn-all" onClick={() => setSelectedChart("todos")}>Todos Los Servicios</button>
      <button className="navbar-button btn-ram" onClick={() => setSelectedChart("ram")}>Memoria RAM</button>
      <button className="navbar-button btn-cpu" onClick={() => setSelectedChart("cpu")}>CPU</button>
    </div>
  </nav>
);

function App() {
  const [selectedChart, setSelectedChart] = useState("todos");
  const [ramData, setRamData] = useState({
    title: "Uso de Memoria RAM",
    labels: ["En uso", "Libre"],
    series: [0, 0],
    totalGB: 0,
    porcentajeUso: 0
  });
  const [cpuData, setCpuData] = useState({
    title: "Uso de CPU",
    labels: ["En uso", "Libre"],
    series: [0, 0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/api/metricas`);
        const data = await res.json();
        // Procesar Datos de RAM
        const totalGB = +(data.RAM.Total / 1024).toFixed(3);
        const usadoGB = +(data.RAM.Usado / 1024).toFixed(3);
        const libreGB = +(data.RAM.Libre / 1024).toFixed(3);
        const porcentajeUso = data.RAM.PorcentajeUso;

        setRamData({
          title: "Uso de Memoria RAM",
          labels: ["En uso (GB)", "Libre (GB)"],
          series: [usadoGB, libreGB],
          totalGB,
          porcentajeUso
        });

        // Procesar Datos de CPU
        const cpuUso = data.CPU.PorcentajeUso;
        const cpuLibre = 100 - cpuUso;

        setCpuData({
          title: "Uso de CPU",
          labels: ["En uso (%)", "Libre (%)"],
          series: [cpuUso, cpuLibre]
        });

      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Navbar setSelectedChart={setSelectedChart} />
      <div className="chart-container">
        {(selectedChart === "todos" || selectedChart === "ram") && (
          <GraficaRAM
            title={ramData.title}
            labels={ramData.labels}
            series={ramData.series}
            totalGB={ramData.totalGB}
            porcentajeUso={ramData.porcentajeUso}
          />
        )}
        {(selectedChart === "todos" || selectedChart === "cpu") && (
          <GraficaCPU
            title={cpuData.title}
            labels={cpuData.labels}
            series={cpuData.series}
          />
        )}
      </div>
    </div>
  );
}

export default App;