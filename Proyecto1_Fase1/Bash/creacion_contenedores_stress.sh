#!/bin/bash

NUM_CONTAINERS=10

BASE_NAME="contenedor_stress"

DURATION=60

# Verificar  Que Dcoker Está Instalado
if ! command -v docker &> /dev/null; then
  echo "Docker No Está Instalado."
  exit 1
fi

# Descargar Imagen De Ubuntu
echo "Verificando Imagen."
docker pull ubuntu:latest

for i in $(seq 1 $NUM_CONTAINERS); do
  docker run -d --name "${BASE_NAME}_${i}" ubuntu bash -c "\
    apt update && \
    apt install -y stress && \
    stress --cpu 2 --vm 2 --vm-bytes 100M --timeout $DURATION"
done

echo "Todos Los Contenedores Se Han Iniciado."

# Esperar A Que Los Contenedores Terminen
sleep $((DURATION + 10))

echo "Eliminando Contenedores"
for i in $(seq 1 $NUM_CONTAINERS); do
  docker rm -f "${BASE_NAME}_${i}"
done

echo "Prueba Completada."
