#!/bin/bash

# Script para compilar y cargar módulos del kernel en /proc

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

# Compilar los módulos
cd "$MODULE_DIR" || { echo "Error: No se pudo acceder al directorio $MODULE_DIR."; exit 1; }
echo "Compilando los módulos del kernel..."
make clean
make
check_status "Compilación de módulos"

# Regresar al directorio original y cargar módulos
cd - > /dev/null
echo "Cargando los módulos del kernel..."
for module in "${MODULES[@]}"; do
    if lsmod | grep -q "$module"; then
        echo "Módulo $module ya está cargado, intentando recargarlo..."
        rmmod "$module" 2>/dev/null
        check_status "Descarga del módulo $module"
    fi
    insmod "$MODULE_DIR/${module}.ko"
    check_status "Carga del módulo $module"
done

# Verificar módulos cargados
echo "Verificando módulos cargados..."
for module in "${MODULES[@]}"; do
    if lsmod | grep -q "$module"; then
        echo "Módulo $module cargado correctamente."
    else
        echo "Error: Módulo $module no está cargado."
        exit 1
    fi
done

# Mostrar contenido de /proc
echo "Mostrando contenido de /proc para verificar:"
for module in "${MODULES[@]}"; do
    if [ -e "/proc/$module" ]; then
        echo "Contenido de /proc/$module:"
        cat "/proc/$module"
    else
        echo "Error: La entrada /proc/$module no existe."
    fi
done

echo "Carga y configuración completadas."
exit 0