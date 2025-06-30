# Manual Técnico - Monitoreo Cloud de VMs

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
| **Proyecto:** | Fase 2 - Monitoreo Cloud de VMs |

## Resumen

El proyecto Fase 2 extiende el sistema de monitoreo desarrollado en la Fase 1, implementando una arquitectura cloud-native que utiliza Kubernetes para orquestación, Google Cloud Platform para servicios en la nube, y herramientas de pruebas de carga para evaluar el rendimiento de una VM. El sistema incluye múltiples APIs, websockets para comunicación en tiempo real, y un frontend desplegado en la nube para visualización interactiva de métricas del sistema.

## Arquitectura del Sistema

### Descripción General
El sistema está compuesto por varios componentes distribuidos en la nube:

1. **Módulos de Kernel (C)**: Obtienen métricas de RAM, CPU y procesos directamente del kernel de Linux en la VM.
2. **VM en Compute Engine**: Máquina virtual Ubuntu que ejecuta los módulos de kernel y el agente de monitoreo.
3. **Agente de Monitoreo (Golang)**: Contenedorizado y desplegado en la VM, recopila datos de los módulos.
4. **Generador de Tráfico (Locust + Python)**: Ejecutado localmente, simula usuarios y genera cargas de trabajo contra la VM.
5. **Kubernetes Cluster (GKE)**: Orquesta todos los servicios en la nube y gestiona el balanceamiento de carga.
6. **Traffic Split e Ingress**: Distribuye el tráfico 50/50 entre las dos rutas de API en Kubernetes.
7. **API Python (Ruta 1)**: Desplegada en Kubernetes, procesa y almacena datos en Cloud SQL.
8. **API NodeJS (Ruta 2)**: Desplegada en Kubernetes, alternativa para procesamiento y almacenamiento de datos.
9. **API WebSocket (NodeJS)**: Desplegada en Kubernetes, maneja comunicación en tiempo real con el frontend.
10. **Cloud SQL (MySQL)**: Base de datos administrada para persistencia de métricas.
11. **Cloud Run**: Servicio serverless para despliegue del frontend React.
12. **Frontend React**: Dashboard interactivo con comunicación por websockets.

### Flujo de Datos
```
              VM en Compute Engine
         ┌─────────────────────────────┐
         │ Módulos Kernel → Agente Go  │ ← Locust (Local)  
         └─────────────────────────────┘
                        ↓
                  Locust (Local)  
                        ↓
                Kubernetes Cluster
           ┌─────────────────────────┐
           │ Ingress + Traffic Split │
           │    ↙            ↘       │
           │ API Python  API NodeJS  │
           │   (50%)      (50%)      │
           │    ↓            ↓       │
           │         ↘    ↙          │
           │    WebSocket API        │
           └─────────────────────────┘
                     ↓
    Cloud SQL ← Métricas → Frontend React (Cloud Run)
```

## Google Cloud Platform (GCP) - Servicios Utilizados

### Cloud SQL
- **Propósito**: Base de datos MySQL totalmente administrada.
- **Funcionalidad**: 
  - Almacenamiento escalable y seguro de métricas.
  - Conexión desde APIs Python y NodeJS.

### Cloud Run
- **Propósito**: Plataforma serverless para contenedores.
- **Funcionalidad**:
  - Despliegue del frontend React sin gestión de infraestructura.
  - Integración nativa con otros servicios de GCP.

### Google Kubernetes Engine (GKE)
- **Propósito**: Orquestación de contenedores administrada.
- **Funcionalidad**:
  - Gestión del clúster Kubernetes.
  - Escalamiento automático de pods y nodos.
  - Balanceamiento de carga nativo.

### Compute Engine (VM Objetivo)
- **Propósito**: Máquina virtual objetivo para pruebas de carga y monitoreo.
- **Especificaciones**:
  - Sistema Operativo: Ubuntu 22.04.
  - Instalación de módulos de kernel personalizados.
  - Docker instalado para contenedores.
- **Funcionalidad**:
  - Hosting del agente de monitoreo Golang contenedorizado.
  - Ejecución de módulos de kernel para recolección de métricas.
  - Objetivo de las pruebas de carga generadas por Locust.
  - Contenedor de estrés (polinux/stress) para variación de métricas.
  - API REST En Golang expuesta para recepción de peticiones de Locust.

## Tecnologías Utilizadas

### Kubernetes
- **Propósito**: Orquestación y gestión de contenedores.
- **Funcionalidad**:
  - Namespace `so1_fase2` para aislamiento de recursos.
  - Gestión de pods, servicios y deployments.
  - Configuración de Ingress para exposición de servicios.
  - Traffic splitting para balanceamiento de carga.

### Locust
- **Propósito**: Generación de tráfico y pruebas de carga.
- **Funcionalidad**:
  - Simulación de 300 usuarios concurrentes para recolección inicial.
  - Generación de aproximadamente 2000 registros JSON.
  - Simulación de 150 usuarios para envío de datos al traffic split.
  - Configuración de tiempos de espera entre 1-4 segundos.

### Docker & Docker Hub
- **Propósito**: Contenerización y distribución de aplicaciones.
- **Funcionalidad**:
  - Imágenes publicadas en Docker Hub para todas las aplicaciones.
  - Agente Golang contenedorizado.
  - APIs Python y NodeJS contenedorizadas.
  - Contenedor de estrés (polinux/stress) para variación de métricas.

### WebSockets (Socket.IO)
- **Propósito**: Comunicación en tiempo real entre frontend y backend.
- **Funcionalidad**:
  - Canal de comunicación bidireccional.
  - Optimización para manejo de gran cantidad de información.
  - Actualización en tiempo real de métricas en el dashboard.

### React
- **Propósito**: Desarrollo del frontend con comunicación en tiempo real.
- **Funcionalidad**: 
  - Dashboard interactivo desplegado en Cloud Run.
  - Gráficas en tiempo real de CPU y RAM.
  - Tabla con información detallada de procesos.
  - Integración con Socket.IO para comunicación WebSocket.

### Python
- **Propósito**: Desarrollo de API REST (Ruta 1) y scripts de Locust.
- **Funcionalidad**:
  - API REST para procesamiento y almacenamiento de datos.
  - Conexión con Cloud SQL MySQL.

### Node.js
- **Propósito**: Desarrollo de APIs (Ruta 2 y WebSocket).
- **Funcionalidad**:
  - API REST alternativa para comparación de rendimiento.
  - API WebSocket para comunicación en tiempo real.
  - Conexión con Cloud SQL MySQL.

### Golang
- **Propósito**: Agente de monitoreo contenedorizado.
- **Funcionalidad**:
  - Imagen descargada desde Docker Hub.
  - Recopilación de métricas de módulos de kernel.
  - Procesamiento concurrente de datos.
  - Generación de JSON con métricas del sistema.

### C
- **Propósito**: Desarrollo de módulos de kernel extendidos.
- **Funcionalidad**:
  - Módulo de RAM.
  - Módulo de CPU.
  - **Nuevo**: Módulo de procesos (`procesos_202201524`).
  - Exposición de datos en `/proc` para lectura del agente.

## Componentes del Sistema

### Máquina Virtual en Compute Engine

#### Especificaciones de la VM
- **Sistema Operativo**: Ubuntu 22.04.
- **Ubicación**: Google Cloud Platform - Compute Engine.
- **Propósito**: VM objetivo para pruebas de carga y recolección de métricas.

#### Componentes Instalados en la VM
- **Módulos de Kernel**: Los tres módulos desarrollados en C instalados directamente.
- **Docker**: Para ejecución del agente de monitoreo contenedorizado.

#### Configuración y Despliegue
- **Instalación de Módulos**: Scripts automatizados para compilación e instalación.
- **Contenedor de Estrés**: `polinux/stress` para generar variaciones en métricas.
- **Networking**: Configuración para recibir tráfico desde Locust (local) y enviar datos a Kubernetes.
- **Monitoreo**: Exposición de métricas a través de `/proc` para lectura del agente.
- **Fase 1**: Generación de 300 usuarios simulados por 3 minutos.
- **Fase 2**: Envío de datos con 150 usuarios al traffic split.
- **Contenedor de Estrés**: Utiliza `polinux/stress` para variación de métricas.
- **Salida**: JSON con aproximadamente 2000 registros de métricas.

### Infraestructura Kubernetes

#### Namespace
- **Nombre**: `so1_fase2`
- **Propósito**: Aislamiento de recursos del proyecto.

#### Ingress Controller
- **Funcionalidad**: Gestión de acceso externo a servicios HTTP/HTTPS.
- **Traffic Split**: Distribución 50/50 entre rutas Python y NodeJS.

#### Services y Deployments
- **API Python**: Deployment y Service para la Ruta 1.
- **API NodeJS**: Deployment y Service para la Ruta 2.
- **WebSocket API**: Service especializado para comunicación en tiempo real.

### APIs del Sistema

#### API Python (Ruta 1)
- **Endpoints**: Recepción y procesamiento de métricas JSON.
- **Base de datos**: Conexión directa con Cloud SQL.

#### API NodeJS (Ruta 2)
- **Endpoints**: Alternativa para procesamiento de métricas.
- **Base de datos**: Conexión directa con Cloud SQL.

#### API WebSocket (NodeJS)
- **Protocolo**: Socket.IO para comunicación bidireccional.
- **Optimización**: Diseñada para manejo eficiente de gran volumen de datos.
- **Tiempo Real**: Envío inmediato de actualizaciones al frontend.

### Base de Datos Cloud SQL
- **Motor**: MySQL administrado por Google Cloud.
- **Esquema**: Tablas para métricas con campos timestamp y identificador de API.

### Frontend React en Cloud Run
- **Despliegue**: Serverless en Google Cloud Run.
- **Comunicación**: WebSockets para actualizaciones en tiempo real.
- **Visualización**:
  - Gráfica en tiempo real del porcentaje de utilización de RAM.
  - Gráfica en tiempo real del porcentaje de utilización de CPU.
  - Tabla interactiva con información detallada de procesos.

## Conclusiones

El proyecto Fase 2 representa una evolución significativa hacia una arquitectura cloud-native que demuestra:

- **Dominio de orquestación**: Implementación completa de Kubernetes con traffic splitting.
- **Integración cloud**: Uso efectivo de servicios administrados de GCP.
- **Comunicación en tiempo real**: Implementación de WebSockets para actualizaciones instantáneas.
- **Pruebas de rendimiento**: Metodología sistemática para evaluación de sistemas bajo carga.
- **Arquitectura distribuida**: Diseño resiliente y escalable para entornos productivos.
- **Comparación tecnológica**: Análisis objetivo del rendimiento entre diferentes stacks tecnológicos.

La arquitectura implementada proporciona una base sólida para sistemas de monitoreo en producción, con capacidades de escalamiento, alta disponibilidad y análisis de rendimiento en tiempo real.