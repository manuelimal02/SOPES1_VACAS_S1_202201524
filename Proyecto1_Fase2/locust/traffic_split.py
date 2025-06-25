from locust import HttpUser, task, between, events
import json
import random
import os
import threading

datos_metricas = []
indice_lock = threading.Lock()
indice_global = 0

def cargar_datos():
    global datos_metricas
    try:
        with open("Metricas_Totales.json", "r") as f:
            datos_metricas = json.load(f)
        print(f"Cargados: {len(datos_metricas)} Registros del Archivo JSON.")
    except FileNotFoundError:
        print("Error: No se encontró el archivo Metricas_Totales.json")
        exit(1)
    except json.JSONDecodeError:
        print("Error: El archivo JSON no tiene formato válido.")
        exit(1)

class TrafficSplitUser(HttpUser):
    wait_time = between(1, 4)
    
    @task
    def send_metrics_to_ingress(self):
        global indice_global
        if not datos_metricas:
            return
 
        with indice_lock:
            registro = datos_metricas[indice_global % len(datos_metricas)]
            indice_actual = indice_global
            indice_global += 1
        
        with self.client.post("/metricas", 
                             json=registro,
                             headers={"Content-Type": "application/json"},
                             catch_response=True) as response:
            if response.status_code == 200:
                response.success()
                print(f"Enviado Registro: {indice_actual + 1}/{len(datos_metricas)}")
            else:
                response.failure(f"Error: {response.status_code} - {response.text}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    cargar_datos()

if __name__ == "__main__":
    # locust -f traffic_split.py --host=http://192.168.49.2 -u 150 -r 1 --headless -t 30s
    pass