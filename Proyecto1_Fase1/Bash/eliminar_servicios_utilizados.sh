#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Error: Este Script Debe Ejecutarse Como Root (Sudo)."
    exit 1
fi

# Directorio De Los Módulos
MODULE_DIR="$(dirname "$PWD")/modulos"

# Directorio Para El Docker Compose
PROJECT_ROOT="$(dirname "$PWD")"

# Lista De Modulos A Eliminar
MODULES=("cpu_202201524" "ram_202201524")

check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: '$1' Falló."
        exit 1
    fi
}

# Detener Y Eliminar Contenedores Docker
cd "$PROJECT_ROOT" || { echo "Error: No Se Pudo Acceder A: $PROJECT_ROOT."; exit 1; }

if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    check_status "docker-compose down"
    echo "Contenedores Docker Detenidos Y Eliminados."
else
    echo "Advertencia: No Se Encontró docker-compose.yml"
fi

# Cambiar Al Directorio De Módulos Y Limpiar
cd "$MODULE_DIR" || { echo "Error: No Se Pudo Acceder A: $MODULE_DIR."; exit 1; }

# Eliminar Módulos Cargados
for module in "${MODULES[@]}"; do
    if lsmod | grep -q "$module"; then
        rmmod "$module" && echo "Módulo $module Descargado."
    else
        echo "Módulo $module no está cargado, nada que eliminar."
    fi
done

# Limpiar Archivos Generados
make clean && echo "Limpieza De Archivos Completada." || { echo "Error: Limpieza Falló."; exit 1; }

# Verificar Que Los Módulos No Estén Cargados
for module in "${MODULES[@]}"; do
    if ! lsmod | grep -q "$module"; then
        echo "Módulo $module Eliminado Correctamente."
    else
        echo "Error: Módulo $module Sigue Cargado."
    fi
done

echo "Eliminación y limpieza completadas."
exit 0