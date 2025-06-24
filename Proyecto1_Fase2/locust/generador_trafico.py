from locust import HttpUser, TaskSet, task, between, events
import json
import threading

resultados = []
lock = threading.Lock()

class MetricsBehavior(TaskSet):
    @task
    def get_metrics(self):
        with self.client.get("/recolector/metrica_202201524", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    with lock:
                        resultados.append(data)
                    response.success()
                except json.JSONDecodeError:
                    response.failure("No es un JSON válido")
            else:
                response.success()

class WebsiteUser(HttpUser):
    tasks = [MetricsBehavior]
    wait_time = between(1, 2)

@events.quitting.add_listener
def guardar_resultado(environment, **kwargs):
    with open("Metricas_Totales.json", "w") as f:
        json.dump(resultados, f, indent=4)
    print(f"\nSe Guardaron: {len(resultados)} Registros en 'Metricas_Totales.json'")