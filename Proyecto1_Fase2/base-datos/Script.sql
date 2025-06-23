USE proyecto1_fase2;

CREATE TABLE IF NOT EXISTS Metrica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    TotalRam VARCHAR(50) NOT NULL,
    RamLibre VARCHAR(50) NOT NULL,
    UsoRam VARCHAR(50) NOT NULL,
    PorcentajeRam VARCHAR(50) NOT NULL,
    PorcentajeCPUUso VARCHAR(50) NOT NULL,
    PorcentajeCPULibre VARCHAR(50) NOT NULL,
    ProcesosCorriendo VARCHAR(50)  NOT NULL,
    TotalProcesos VARCHAR(50)  NOT NULL,
    ProcesosDurmiendo VARCHAR(50)  NOT NULL,
    ProcesosZombie VARCHAR(50)  NOT NULL,
    ProcesosParados VARCHAR(50)  NOT NULL,
    HoraFecha VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);