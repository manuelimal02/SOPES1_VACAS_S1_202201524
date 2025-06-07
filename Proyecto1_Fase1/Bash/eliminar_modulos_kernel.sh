#!/bin/bash

# Script para eliminar módulos del kernel y limpiar archivos generados

# Verificar si el script se ejecuta con permisos de superusuario
if [ "$EUID" -ne 0 ]; then
    echo "Error: Este script debe ejecutarse como root (use sudo)."
    exit 1
fi

# Directorio de los módulos
MODULE_DIR="$(dirname "$PWD")/modulos"

# Lista de módulos
MODULES=("cpu_202201524" "ram_202201524")

# Función para verificar éxito de comandos
check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: $1 falló."
        exit 1
    fi
}

# Cambiar al directorio de módulos y limpiar
cd "$MODULE_DIR" || { echo "Error: No se pudo acceder al directorio $MODULE_DIR."; exit 1; }

# Eliminar módulos cargados
for module in "${MODULES[@]}"; do
    if lsmod | grep -q "$module"; then
        rmmod "$module" && echo "Módulo $module descargado."
    else
        echo "Módulo $module no está cargado, nada que eliminar."
    fi
done

# Limpiar archivos generados
make clean && echo "Limpieza de archivos completada." || { echo "Error: Limpieza falló."; exit 1; }

# Verificar que los módulos no estén cargados
for module in "${MODULES[@]}"; do
    if ! lsmod | grep -q "$module"; then
        echo "Módulo $module eliminado correctamente."
    else
        echo "Error: Módulo $module sigue cargado."
    fi
done

echo "Eliminación y limpieza completadas."
exit 0