# Admin Microservice (Subdecano)

Este microservicio gestiona las funcionalidades administrativas y de "Subdecano".

## Funcionalidades
- **Gestión de Usuarios**: Altas y bajas de docentes/estudiantes (si aplica).
- **Sembrado de Datos (Seeding)**: Inicialización de la base de datos con usuarios por defecto (admin).
- **Reportes**: Visualización de estadísticas del sistema.
- **Auditoría**: Acceso a logs de acciones críticas.

## Inicialización de Datos
Este servicio es responsable de ejecutar el script `seed_db.py` al inicio (`startup_event`) para asegurar que existan los usuarios administradores.

## Tecnologías
- **Framework**: FastAPI
- **Base de Datos**: MongoDB (compartida)

## Desarrollo
El servicio corre en el puerto `8000` internamente, pero es expuesto a través del API Gateway en `/api/subdecano`.
