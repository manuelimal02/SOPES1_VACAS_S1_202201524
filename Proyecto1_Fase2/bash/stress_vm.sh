#!/bin/bash

NUM_CONTAINERS=5
BASE_NAME="contenedor_stress"
DURATION=60
PIDS_FILE="/tmp/test_pids.txt"

# Limpiar archivo de PIDs
> "$PIDS_FILE"

# Descargar Imagen De polinux/stress
echo "Verificando Imagen."
docker pull polinux/stress

echo  "Iniciando Contenedores"

# Iniciar contenedores
for i in $(seq 1 $NUM_CONTAINERS); do
 docker run -d --name "${BASE_NAME}_${i}" polinux/stress stress \
   --cpu 1 \
   --vm 1 \
   --vm-bytes 50M \
   --timeout ${DURATION}s
done

START_TIME=$(date +%s)
iteration=0
while [[ $(($(date +%s) - START_TIME)) -lt $DURATION ]]; do
 iteration=$((iteration + 1))
 
 # Procesos corriendo
 for i in {1..1}; do
   bash -c 'while true; do :; done' &
   echo $! >> "$PIDS_FILE"
 done
 
 # Procesos durmiendo
 for i in {1..1}; do
   sleep 300 &
   echo $! >> "$PIDS_FILE"
 done
 
 # Procesos zombie
 bash -c 'bash -c "exit 0" & bash -c "exit 0" & sleep 30' &
 echo $! >> "$PIDS_FILE"
 
 # Procesos parados
 bash -c 'while true; do sleep 1; done' &
 pid=$!
 echo $pid >> "$PIDS_FILE"
 sleep 0.5
 kill -STOP $pid
 
 
 sleep 10
done

# Limpiar todo
echo "Limpiando Contenedores"
for i in $(seq 1 $NUM_CONTAINERS); do
 docker rm -f "${BASE_NAME}_${i}"
done

echo "Limpiando Procesos"
while read -r pid; do
 kill -CONT "$pid" 2>/dev/null
 kill -9 "$pid" 2>/dev/null
done < "$PIDS_FILE"

rm -f "$PIDS_FILE"

echo "Prueba Completada."