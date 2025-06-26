#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Error: Este Script Debe Ejecutarse Como Root (Sudo)."
    exit 1
fi

# Directorio De Los Módulos
MODULE_DIR="$(dirname "$PWD")/modulos"

# Lista De Módulos A Crear
MODULES=("cpu_202201524" "ram_202201524" "procesos_202201524")

check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: '$1' Falló."
        exit 1
    fi
}

# Compilar Los Módulos
cd "$MODULE_DIR" || { echo "Error: No Se Pudo Acceder A: $MODULE_DIR."; exit 1; }
echo "Compilando Los Módulos Del kernel."
make clean
make
check_status "Compilación De Módulos"

# Regresar Al Directorio Orginal y Cargar Los Módulos
cd - > /dev/null
echo "Cargando Los Módulos Del kernel."
for module in "${MODULES[@]}"; do
    if lsmod | grep -q "$module"; then
        echo "Módulo $module ya está cargado, intentando recargarlo..."
        rmmod "$module" 2>/dev/null
        check_status "Descarga del módulo $module"
    fi
    insmod "$MODULE_DIR/${module}.ko"
    check_status "Carga del módulo $module"
done

# Verificar Que Los Módulos Están Cargados
echo "Verificando Módulos Cargados:"
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
        echo "----------------------------------------"
        echo "Contenido de /proc/$module:"
        cat "/proc/$module"
        echo ""
    else
        echo "Error: La entrada /proc/$module no existe."
    fi
done

echo "Proceso Completado Exitosamente."
exit 0