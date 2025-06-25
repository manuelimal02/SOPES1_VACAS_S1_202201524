from locust import HttpUser, task, between, events
import json
import random
import os
import threading

# Cargar datos del JSON generado anteriormente
datos_metricas = []
# Lock para garantizar envío secuencial thread-safe
indice_lock = threading.Lock()
indice_global = 0

def cargar_datos():
    """Carga los datos del archivo JSON generado"""
    global datos_metricas
    try:
        with open("Metricas_Totales.json", "r") as f:
            datos_metricas = json.load(f)
        print(f"Cargados {len(datos_metricas)} registros del archivo JSON")
    except FileNotFoundError:
        print("Error: No se encontró el archivo Metricas_Totales.json")
        exit(1)
    except json.JSONDecodeError:
        print("Error: El archivo JSON no tiene formato válido")
        exit(1)

class TrafficSplitUser(HttpUser):
    wait_time = between(1, 4)  # Espera entre 1 y 4 segundos entre peticiones
    
    @task
    def send_metrics_to_ingress(self):
        """Envía datos al Ingress - Traffic Split distribuye automáticamente 50/50"""
        global indice_global
        
        if not datos_metricas:
            return
        
        # Obtener el siguiente índice de forma thread-safe
        with indice_lock:
            registro = datos_metricas[indice_global % len(datos_metricas)]
            indice_actual = indice_global
            indice_global += 1
        
        # Enviar al endpoint único del Ingress - él distribuye el tráfico
        with self.client.post("/metricas", 
                             json=registro,
                             headers={"Content-Type": "application/json"},
                             catch_response=True) as response:
            if response.status_code == 200:
                response.success()
                print(f"✅ Enviado registro {indice_actual + 1}/{len(datos_metricas)}")
            else:
                response.failure(f"❌ Error: {response.status_code} - {response.text}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Cargar datos al inicio de la prueba"""
    cargar_datos()

# Configuración para ejecutar Locust
if __name__ == "__main__":
    # Para ejecutar directamente:
    # locust -f traffic_split.py --host=http://<MINIKUBE_IP> -u 150 -r 1 --headless -t 300s
    pass