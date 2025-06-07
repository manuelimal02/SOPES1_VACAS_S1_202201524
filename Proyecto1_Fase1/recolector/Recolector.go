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
	PorcentajeUso uint64
}

// Estructura para almacenar datos de RAM
type RAMData struct {
	Total         uint64
	Libre         uint64
	Usado         uint64
	PorcentajeUso uint64
}

// Canales para enviar datos
var cpuChan = make(chan CPUData)
var ramChan = make(chan RAMData)

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
		ramChan <- ram
		time.Sleep(time.Second)
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
				fmt.Sscanf(line, "  \"PorcentajeUso\": %d", &cpu.PorcentajeUso)
				break
			}
		}
		file.Close()
		if err := scanner.Err(); err != nil {
			fmt.Println("Error al leer /proc/cpu_202201524:", err)
		}
		cpuChan <- cpu
		time.Sleep(time.Second)
	}
}

func main() {
	// Iniciar goroutines para leer datos
	go readCPUData()
	go readRAMData()

	// Crear aplicación Fiber
	app := fiber.New()

	// Endpoint para RAM
	app.Get("/recolector/ram_202201524", func(c *fiber.Ctx) error {
		select {
		case ram := <-ramChan:
			return c.JSON(ram)
		case <-time.After(time.Second):
			return c.Status(500).JSON(fiber.Map{"error": "Tiempo de espera agotado para datos de RAM"})
		}
	})

	// Endpoint para CPU
	app.Get("/recolector/cpu_202201524", func(c *fiber.Ctx) error {
		select {
		case cpu := <-cpuChan:
			return c.JSON(cpu)
		case <-time.After(time.Second):
			return c.Status(500).JSON(fiber.Map{"error": "Tiempo de espera agotado para datos de CPU"})
		}
	})

	// Iniciar servidor
	err := app.Listen(":3000")
	if err != nil {
		fmt.Println("Error al iniciar el servidor:", err)
	}
}
