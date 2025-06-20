#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Verificar si existe docker-compose.yml en la raíz del proyecto
if [ ! -f "docker-compose.yml" ] && [ ! -f "docker-compose.yaml" ]; then
    echo "Error: No Se Encontró docker-compose.yml"
    exit 1
fi

# Ejecutar docker-compose up
if docker compose version &> /dev/null; then
    # Usar nuevo comando docker compose
    docker compose up -d
else
    # Usar comando legacy docker-compose
    docker-compose up -d
fi

if [ $? -eq 0 ]; then
    echo "Contenedores Desplegados Exitosamente."
    echo "Estado de los Contenedores:"

    # Mostrar estado
    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi
else
    echo "Error en el Despliegue."
    exit 1
fi