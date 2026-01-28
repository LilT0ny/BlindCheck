from motor.motor_asyncio import AsyncIOMotorClient
from common.config import settings

client = AsyncIOMotorClient(settings.mongodb_url)
# Logical Database Separation per Microservice
# We derive specific DB names from the base name to satisfy the "Database per Service" pattern.

db_base = settings.database_name

# 1. Auth Service Database
db_auth = client[f"{db_base}_auth"]
reset_password_collection = db_auth.get_collection("reset_password")
logs_collection = db_auth.get_collection("logs")

# 2. Student Service Database
db_student = client[f"{db_base}_student"]
estudiantes_collection = db_student.get_collection("estudiantes")

# 3. Teacher Service Database
db_teacher = client[f"{db_base}_teacher"]
docentes_collection = db_teacher.get_collection("docentes")
materias_collection = db_teacher.get_collection("materias")
calificaciones_collection = db_teacher.get_collection("calificaciones")
evidencias_collection = db_teacher.get_collection("evidencias")

# 4. Admin Service Database
db_admin = client[f"{db_base}_admin"]
subdecanos_collection = db_admin.get_collection("subdecanos")
solicitudes_collection = db_admin.get_collection("solicitudes")
mensajes_collection = db_admin.get_collection("mensajes")
