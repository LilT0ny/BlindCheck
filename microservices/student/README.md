# Student Microservice

Este microservicio gestiona las funcionalidades específicas para el rol de Estudiante.

## Funcionalidades
- **Consulta de Notas**: Visualización de calificaciones anonimizadas.
- **Solicitud de Recalificación**: Creación de solicitudes de revisión de notas.
- **Evidencias**: Carga de archivos y evidencias para las solicitudes.
- **Seguimiento**: Monitoreo del estado de las solicitudes.

## Tecnologías
- **Framework**: FastAPI
- **Base de Datos**: MongoDB (compartida)

## Desarrollo
El servicio corre en el puerto `8000` internamente, pero es expuesto a través del API Gateway en `/api/estudiante`.
