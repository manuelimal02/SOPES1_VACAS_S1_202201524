from locust import HttpUser, task, between, events
import json
import threading

Metricas = []
Index_Lock = threading.Lock()
Index_General = 0

def cargar_datos():
    global Metricas
    try:
        with open("Metricas_Totales.json", "r") as f:
            Metricas = json.load(f)
        print(f"Cargados: {len(Metricas)} Registros del Archivo JSON.")
    except FileNotFoundError:
        print("Error: No se encontró el archivo Metricas_Totales.json")
        exit(1)

class TrafficSplitUser(HttpUser):
    wait_time = between(1, 4)
    
    @task
    def send_metrics_to_ingress(self):
        global Index_General
        if not Metricas:
            return
 
        with Index_Lock:
            registro = Metricas[Index_General % len(Metricas)]
            indice_actual = Index_General
            Index_General += 1
        
        with self.client.post("/metricas", json=registro, headers={"Content-Type": "application/json"}, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
                print(f"Enviando Registro: {indice_actual + 1}/{len(Metricas)}")
            else:
                response.failure(f"Error: {response.status_code} - {response.text}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    cargar_datos()

if __name__ == "__main__":
    # locust -f envio_metricas.py --host=http://192.168.49.2 -u 150 -r 1 --headless -t 30s
    pass