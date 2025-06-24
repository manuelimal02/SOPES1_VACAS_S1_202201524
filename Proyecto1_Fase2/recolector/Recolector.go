package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Estructura para almacenar datos de CPU
type CPUData struct {
	PorcentajeUso float64
}

// Estructura para almacenar datos de RAM
type RAMData struct {
	Total         uint64
	Libre         uint64
	Usado         uint64
	PorcentajeUso uint64
}

// Estructura para almacenar datos de Procesos
type ProcesoData struct {
	TotalProcesos     uint64
	ProcesosCorriendo uint64
	ProcesosDurmiendo uint64
	ProcesosZombie    uint64
	ProcesosParados   uint64
}

type DatosCompletos struct {
	TotalRam           uint64
	RamLibre           uint64
	UsoRam             uint64
	PorcentajeRam      uint64
	PorcentajeCPUUso   float64
	PorcentajeCPULibre float64
	TotalProcesos      uint64
	ProcesosCorriendo  uint64
	ProcesosDurmiendo  uint64
	ProcesosZombie     uint64
	ProcesosParados    uint64
	HoraFecha          string
}

// Canales con buffer para manejar múltiples requests
var cpuChan = make(chan CPUData, 100)
var ramChan = make(chan RAMData, 100)
var processChan = make(chan ProcesoData, 100)

// Función para leer datos de RAM de forma concurrente
func readRAMData() {
	for {
		file, err := os.Open("/proc/ram_202201524")
		if err != nil {
			fmt.Println("Error al abrir /proc/ram_202201524:", err)
			time.Sleep(time.Second)
			continue
		}

		scanner := bufio.NewScanner(file)
		var ram RAMData
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "  \"Total\":") {
				fmt.Sscanf(line, "  \"Total\": %d", &ram.Total)
			} else if strings.HasPrefix(line, "  \"Libre\":") {
				fmt.Sscanf(line, "  \"Libre\": %d", &ram.Libre)
			} else if strings.HasPrefix(line, "  \"Usado\":") {
				fmt.Sscanf(line, "  \"Usado\": %d", &ram.Usado)
			} else if strings.HasPrefix(line, "  \"PorcentajeUso\":") {
				fmt.Sscanf(line, "  \"PorcentajeUso\": %d", &ram.PorcentajeUso)
			}
		}
		file.Close()
		if err := scanner.Err(); err != nil {
			fmt.Println("Error al leer /proc/ram_202201524:", err)
		}
		// Enviar datos múltiples veces al canal buffer
		for i := 0; i < 10; i++ {
			select {
			case ramChan <- ram:
			default:
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

// Función para leer datos de CPU de forma concurrente
func readCPUData() {
	for {
		file, err := os.Open("/proc/cpu_202201524")
		if err != nil {
			fmt.Println("Error al abrir /proc/cpu_202201524:", err)
			time.Sleep(time.Second)
			continue
		}

		scanner := bufio.NewScanner(file)
		var cpu CPUData
		for scanner.Scan() {
			line := scanner.Text()
			if strings.Contains(line, "PorcentajeUso") {
				fmt.Sscanf(line, "  \"PorcentajeUso\": \"%f\"", &cpu.PorcentajeUso)
				break
			}
		}
		file.Close()
		if err := scanner.Err(); err != nil {
			fmt.Println("Error al leer /proc/cpu_202201524:", err)
		}
		// Enviar datos múltiples veces al canal buffer
		for i := 0; i < 10; i++ {
			select {
			case cpuChan <- cpu:
			default:
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

// Función para leer datos de Procesos de forma concurrente
func readProcessData() {
	for {
		file, err := os.Open("/proc/procesos_202201524")
		if err != nil {
			fmt.Println("Error al abrir /proc/procesos_202201524:", err)
			time.Sleep(time.Second)
			continue
		}

		scanner := bufio.NewScanner(file)
		var process ProcesoData
		for scanner.Scan() {
			line := scanner.Text()
			if strings.HasPrefix(line, "  \"TotalProcesos\":") {
				fmt.Sscanf(line, "  \"TotalProcesos\": %d", &process.TotalProcesos)
			} else if strings.HasPrefix(line, "  \"ProcesosCorriendo\":") {
				fmt.Sscanf(line, "  \"ProcesosCorriendo\": %d", &process.ProcesosCorriendo)
			} else if strings.HasPrefix(line, "  \"ProcesosDurmiendo\":") {
				fmt.Sscanf(line, "  \"ProcesosDurmiendo\": %d", &process.ProcesosDurmiendo)
			} else if strings.HasPrefix(line, "  \"ProcesosZombie\":") {
				fmt.Sscanf(line, "  \"ProcesosZombie\": %d", &process.ProcesosZombie)
			} else if strings.HasPrefix(line, "  \"ProcesosParados\":") {
				fmt.Sscanf(line, "  \"ProcesosParados\": %d", &process.ProcesosParados)
			}
		}
		file.Close()
		if err := scanner.Err(); err != nil {
			fmt.Println("Error al leer /proc/procesos_202201524:", err)
		}
		// Enviar datos múltiples veces al canal buffer
		for i := 0; i < 10; i++ {
			select {
			case processChan <- process:
			default:
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	// Iniciar goroutines para leer datos
	go readCPUData()
	go readRAMData()
	go readProcessData()

	// Crear aplicación Fiber
	app := fiber.New()

	// Endpoint para obtener todos los datos
	app.Get("/recolector/metrica_202201524", func(c *fiber.Ctx) error {
		var Buffer DatosCompletos
		// Obtener datos de RAM
		select {
		case ram := <-ramChan:
			Buffer.TotalRam = ram.Total
			Buffer.RamLibre = ram.Libre
			Buffer.UsoRam = ram.Usado
			Buffer.PorcentajeRam = ram.PorcentajeUso
		case <-time.After(2 * time.Second):
			return c.Status(500).JSON(fiber.Map{"error": "Tiempo de espera agotado para datos de RAM"})
		}
		// Obtener datos de CPU
		select {
		case cpu := <-cpuChan:
			Buffer.PorcentajeCPUUso = cpu.PorcentajeUso
			Buffer.PorcentajeCPULibre = 100.0 - cpu.PorcentajeUso
		case <-time.After(2 * time.Second):
			return c.Status(500).JSON(fiber.Map{"error": "Tiempo de espera agotado para datos de CPU"})
		}
		// Obtener datos de Procesos
		select {
		case process := <-processChan:
			Buffer.TotalProcesos = process.TotalProcesos
			Buffer.ProcesosCorriendo = process.ProcesosCorriendo
			Buffer.ProcesosDurmiendo = process.ProcesosDurmiendo
			Buffer.ProcesosZombie = process.ProcesosZombie
			Buffer.ProcesosParados = process.ProcesosParados
		case <-time.After(2 * time.Second):
			return c.Status(500).JSON(fiber.Map{"error": "Tiempo de espera agotado para datos de Procesos"})
		}
		Buffer.HoraFecha = time.Now().Format("2006-01-02 15:04:05")
		return c.JSON(Buffer)
	})

	// Iniciar servidor
	err := app.Listen(":6000")
	if err != nil {
		fmt.Println("Error al iniciar el servidor:", err)
	}
}
