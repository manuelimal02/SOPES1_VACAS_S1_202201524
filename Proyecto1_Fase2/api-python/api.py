import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

db_config = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def insertar_metricas(metrica):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        query = """
            INSERT INTO Metrica (
                API,
                TotalRam, 
                RamLibre, 
                UsoRam, 
                PorcentajeRam,
                PorcentajeCPUUso, 
                PorcentajeCPULibre,
                ProcesosCorriendo, 
                TotalProcesos,
                ProcesosDurmiendo, 
                ProcesosZombie,
                ProcesosParados, 
                HoraFecha
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            "API Python",
            metrica.get("TotalRam"),
            metrica.get("RamLibre"),
            metrica.get("UsoRam"),
            metrica.get("PorcentajeRam"),
            metrica.get("PorcentajeCPUUso"),
            metrica.get("PorcentajeCPULibre"),
            metrica.get("ProcesosCorriendo"),
            metrica.get("TotalProcesos"),
            metrica.get("ProcesosDurmiendo"),
            metrica.get("ProcesosZombie"),
            metrica.get("ProcesosParados"),
            metrica.get("HoraFecha")
        )

        cursor.execute(query, values)
        conn.commit()
        insert_id = cursor.lastrowid

        cursor.close()
        conn.close()
        return insert_id

    except mysql.connector.Error as err:
        raise Exception(f"Error de base de datos: {err}")

@app.route('/metricas', methods=['POST'])
def recibir_metricas():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Métricas No Proporcionadas.'}), 400

    try:
        insert_id = insertar_metricas(data)
        return jsonify({'message': 'Métricas Recibidas E Insertadas.', 'Id': insert_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    puerto = int(os.getenv('PYTHON_PORT', 5000))
    app.run(host='0.0.0.0', port=puerto)
