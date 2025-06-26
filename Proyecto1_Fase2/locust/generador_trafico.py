from locust import HttpUser, TaskSet, task, between, events
import json
import threading

Metricas = []
Index_Lock = threading.Lock()

class MetricsBehavior(TaskSet):
    @task
    def get_metrics(self):
        with self.client.get("/recolector/metrica_202201524", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    with Index_Lock:
                        Metricas.append(data)
                    response.success()
                except json.JSONDecodeError:
                    response.failure("JSON No Válido")
            else:
                response.failure(f"Error HTTP: {response.status_code}")

class WebsiteUser(HttpUser):
    tasks = [MetricsBehavior]
    wait_time = between(1, 2)

@events.quitting.add_listener
def guardar_resultado(environment, **kwargs):
    with open("Metricas_Totales.json", "w") as f:
        json.dump(Metricas, f, indent=4)
    print(f"\nSe Guardaron: {len(Metricas)} Registros en 'Metricas_Totales.json'")