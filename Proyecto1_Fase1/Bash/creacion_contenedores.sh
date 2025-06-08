#!/bin/bash

# Número de contenedores
NUM_CONTAINERS=10

# Nombre base de los contenedores
BASE_NAME="stress_container"

# Tiempo en segundos que durará la prueba
DURATION=60

# Verificar que Docker esté disponible
if ! command -v docker &> /dev/null; then
  echo "Docker no está instalado. Abortando..."
  exit 1
fi

# Descargar imagen base si no existe
echo "Verificando imagen base..."
docker pull ubuntu:latest

echo "Iniciando $NUM_CONTAINERS contenedores para estresar la CPU y RAM por $DURATION segundos..."

for i in $(seq 1 $NUM_CONTAINERS); do
  docker run -d --name "${BASE_NAME}_${i}" ubuntu bash -c "\
    apt update && \
    apt install -y stress && \
    stress --cpu 2 --vm 2 --vm-bytes 100M --timeout $DURATION"
done

echo "Todos los contenedores han sido lanzados."

# Esperar a que finalice la carga
sleep $((DURATION + 10))

echo "Eliminando contenedores..."
for i in $(seq 1 $NUM_CONTAINERS); do
  docker rm -f "${BASE_NAME}_${i}"
done

echo "Prueba completada."
