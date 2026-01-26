# Teacher Microservice

Este microservicio gestiona las funcionalidades específicas para el rol de Docente.

## Funcionalidades
- **Gestión de Solicitudes**: Revisión y respuesta a solicitudes de recalificación.
- **Calificaciones**: Actualización de notas tras revisión.
- **Evidencias**: Visualización de evidencias presentadas por estudiantes.

## Tecnologías
- **Framework**: FastAPI
- **Base de Datos**: MongoDB (compartida)

## Desarrollo
El servicio corre en el puerto `8000` internamente, pero es expuesto a través del API Gateway en `/api/docente`.
