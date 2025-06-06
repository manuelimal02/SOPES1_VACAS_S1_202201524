import React, { useState } from 'react';
import './App.css';
import ApexChart from './Grafica';

const Navbar = ({ setSelectedChart }) => (
  <nav className="navbar">
    <h2>Monitor De Servicios Linux</h2>
    <div className="navbar-buttons">
     <button className="navbar-button btn-all" onClick={() => setSelectedChart("todos")}>Todos Los Servicios</button>
      <button className="navbar-button btn-ram" onClick={() => setSelectedChart("ram")}>Memoria RAM</button>
      <button className="navbar-button btn-cpu" onClick={() => setSelectedChart("cpu")}>CPU</button>
    </div>
  </nav>
);

function App() {
  const [selectedChart, setSelectedChart] = useState("todos");

  const ramData = {
    title: "Uso de Memoria RAM",
    labels: ["En uso", "Libre"],
    series: [60, 40]
  };

  const cpuData = {
    title: "Uso de CPU",
    labels: ["En uso", "Libre"],
    series: [45, 55]
  };

  return (
    <div className="App">
      <Navbar setSelectedChart={setSelectedChart} />
      <div className="chart-container">
        {(selectedChart === "todos" || selectedChart === "ram") && (
          <ApexChart {...ramData} />
        )}
        {(selectedChart === "todos" || selectedChart === "cpu") && (
          <ApexChart {...cpuData} />
        )}
      </div>
    </div>
  );
}

export default App;
