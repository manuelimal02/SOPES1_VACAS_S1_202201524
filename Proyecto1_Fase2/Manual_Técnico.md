# Manual Técnico - Monitor de Servicios Linux

## Datos Personales

| Dato | Información |
|-------|-------------|
| **Nombre:** | Carlos Manuel Lima Y Lima|
| **Carnet:** | 202201524 |
| **CUI:** | 3009368850101 |

## Información del Curso

| Dato | Información |
|-------|-------------|
| **Curso:** | Sistemas Operativos 1 |
| **Sección:** | A |
| **Catedrático:** | Ing. Edgar René Ornelis Hoil |
| **Auxiliar:** | Diego Alejandro Juárez Brán |
| **Período:** | Escuela de Vacaciones Junio 2025 |
| **Proyecto:** | Fase 1 - Monitor de Servicios Linux |

## Resumen

El proyecto consiste en el desarrollo de un sistema de monitoreo de recursos del sistema Linux mediante la implementación de módulos de kernel en C, un agente de monitoreo en Golang, una API REST en NodeJS, una base de datos para almacenar la información obtenida y una interfaz web para visualización en tiempo real. El sistema utiliza contenedores Docker para su despliegue.

## Arquitectura del Sistema

### Descripción General
El sistema está compuesto por varios componentes que trabajan de manera integrada:

1. **Módulos de Kernel (C)**: Obtienen métricas de RAM y CPU directamente del kernel de Linux.
2. **Agente de Monitoreo (Golang)**: Recopila datos de los módulos y los procesa para ser enviados mediante archivos JSON.
3. **API REST (NodeJS)**: Gestiona la comunicación y persistencia de datos por medio de una base de datos.
4. **Frontend (React)**: Interfaz de usuario para visualización de las métricas obtenidas en tiempo real.
5. **Base de Datos (SQL)**: Almacenamiento persistente de métricas.
6. **Scripts de Automatización (Bash)**: Gestión de despliegue de contenedores, módulos y configuración para el sistema.

### Flujo de Datos
```
Módulos Kernel → Agente Golang → API NodeJS 
                                     ↓
            Frontend React ← Métricas Obtenidas → Base de Datos
```

## Tecnologías Utilizadas

### React
- **Propósito**: Desarrollo del frontend y interfaz de usuario.
- **Funcionalidad**: 
  - Visualización de gráficas en tiempo real.
  - Dashboard interactivo para monitoreo.
  - Consumo de API REST para obtención de datos.

### Node.js
- **Propósito**: Desarrollo de la API REST del backend.
- **Funcionalidad**:
  - Exposición de endpoints para comunicación con frontend.
  - Gestión de peticiones HTTP.
  - Comunicación con la base de datos para la persistencia.
  - Procesamiento de datos JSON recibidos del recolector Golang.

### Golang
- **Propósito**: Desarrollo del agente de monitoreo.
- **Funcionalidad**:
  - Lectura de módulos de kernel mediante rutinas concurrentes.
  - Procesamiento y parseo de datos a formato JSON.
  - Implementación de canales para comunicación entre goroutines.
  - Envío periódico de métricas a la API.

### C
- **Propósito**: Desarrollo de módulos de kernel.
- **Funcionalidad**:
  - Acceso directo a estructuras de datos del kernel.
  - Obtención de métricas de CPU y RAM.
  - Creación de archivos en /proc para exposición de datos.
  - Implementación de funciones de lectura del kernel.

### Makefile
- **Propósito**: Automatización de compilación de módulos de kernel.
- **Funcionalidad**:
  - Compilación automática de módulos (.ko).
  - Limpieza de archivos temporales.
  - Instalación y desinstalación de módulos.

### Archivos Bash (.sh)
- **Propósito**: Automatización de tareas del sistema.
- **Funcionalidad**:
  - Script de despliegue de contenedores para estresar la computadora.
  - Script de instalación y configuración de módulos kernel.
  - Script de limpieza y eliminación de servicios (módulos y contenedores).
  - Script de despliegue de la aplicación completa (módulos y contenedores).

### SQL
- **Propósito**: Gestión de base de datos para persistencia.
- **Funcionalidad**:
  - Almacenamiento de métricas obtenidas en tiempo real.
  - Gestión de esquemas de tablas.

### Docker
- **Propósito**: Contenerización de servicios.
- **Funcionalidad**:
  - Encapsulación del agente de monitoreo.
  - Contenerización de la API NodeJS.
  - Contenerización del frontend React.
  - Gestión de la base de datos mediante contenedor.

### Dockerfile
- **Propósito**: Definición de imágenes de contenedores personalizadas.
- **Funcionalidad**:
  - Especificación del entorno base y dependencias.
  - Automatización del proceso de construcción de imágenes.
  - Configuración de comandos de ejecución y puntos de entrada.
  - Definición de variables de entorno y configuraciones específicas.

### Docker Compose
- **Propósito**: Orquestación de múltiples contenedores.
- **Funcionalidad**:
  - Gestión de servicios multi-contenedor.
  - Configuración de redes entre contenedores.
  - Gestión de volúmenes para persistencia.
  - Simplificación del despliegue completo.

### Docker Hub
- **Propósito**: Repositorio de imágenes de contenedores.
- **Funcionalidad**:
  - Almacenamiento de imágenes personalizadas.
  - Distribución de imágenes para despliegue.

## Componentes del Sistema

### Módulos de Kernel

#### Módulo de RAM
- **Ubicación**: `/proc/ram_202201524`
- **Librerías**: `<sys/sysinfo.h>`, `<linux/mm.h>`.
- **Funcionalidad**: Obtiene información de memoria RAM directamente de estructuras del kernel.
- **Formato de salida**: JSON con métricas de memoria total, utilizada y disponible.

#### Módulo de CPU
- **Ubicación**: `/proc/cpu_202201524`
- **Librerías**: `<linux/sched.h>`, `<linux/sched/signal.h>`.
- **Funcionalidad**: Obtiene información de CPU y procesos del sistema.
- **Formato de salida**: JSON con métricas de utilización de CPU.

### Agente de Monitoreo (Golang)
- **Contenedor**: Dockerizado para portabilidad.
- **Concurrencia**: Utiliza goroutines para lecturas paralelas.
- **Comunicación**: Canales para sincronización entre rutinas.
- **Funcionalidad**: Lectura periódica de módulos y envío de datos a API.

### API REST (NodeJS)
- **Endpoints**: Servicios para lectura y escritura de métricas.
- **Base de datos**: Conexión con sistema de persistencia SQL.
- **Middleware**: Gestión de CORS y autenticación.
- **Formato**: Intercambio de datos en JSON.

### Frontend (React)
- **Componentes**: Dashboard con gráficas en tiempo real.
- **Visualización**: Gráficas de CPU y RAM con actualización automática.
- **Comunicación**: Consumo de API REST mediante fetch y axios.

### Base de Datos
- **Tipo**: SQL (MySQL).
- **Persistencia**: Volumen Docker para mantener datos.
- **Esquema**: Tablas para métricas de CPU y RAM con timestamps.

## Scripts de Automatización

### Script de Estrés del Sistema
```bash
./creacion_contenedores_stress.sh
```

### Script de Instalación de Módulos
```bash
./instalar_modulos_kernel.sh
```

### Script de Limpieza
```bash
./eliminar_servicios_utilizados.sh
```

### Script de Despliegue De Contenedores
```bash
./desplegar_contenedores.sh
```

## Funcionamiento del Sistema

### Flujo de Monitoreo
1. Los módulos de kernel exponen métricas en `/proc`.
2. El agente Golang lee periódicamente estos archivos.
3. Los datos se procesan y envían a la API NodeJS.
4. La API almacena los datos en la base de datos.
5. El frontend consulta la API para mostrar gráficas en tiempo real.

### Ciclo de Datos
- **Frecuencia**: Actualización de métricas cada segundo por el agente recolector.
- **Procesamiento**: Datos en formato JSON para su fácil manipulación.
- **Almacenamiento**: Métricas con timestamp para análisis histórico.
- **Visualización**: Gráficas dinámicas con datos en tiempo real.

## Conclusiones

El proyecto integra múltiples tecnologías para crear un sistema completo de monitoreo de recursos del sistema Linux. La implementación demuestra:

- Comprensión de programación a nivel de kernel.
- Aplicación de principios de concurrencia en Golang.
- Desarrollo de APIs REST escalables.
- Implementación de interfaces de usuario.
- Gestión de contenedores y orquestación.