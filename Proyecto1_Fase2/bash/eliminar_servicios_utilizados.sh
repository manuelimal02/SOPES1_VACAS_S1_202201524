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
MODULES=("cpu_202201524" "ram_202201524" "procesos_202201524")

check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: '$1' Falló."
        exit 1
    fi
}

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

exit 0