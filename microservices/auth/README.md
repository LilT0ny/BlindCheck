# Auth Microservice

Este microservicio se encarga de la autenticación y autorización de usuarios en el sistema BlindCheck.

## Funcionalidades
- **Login**: Verificación de credenciales para Estudiantes, Docentes y Subdecanos.
- **Generación de Tokens**: Emisión de JWT (JSON Web Tokens) seguros y HttpOnly cookies.
- **Logout**: Invalidación de sesiones.
- **Reset Password**: Gestión de solicitudes de cambio de contraseña.

## Tecnologías
- **Framework**: FastAPI
- **Base de Datos**: MongoDB (compartida)
- **Seguridad**: JWT, BCrypt, Rate Limiting (SlowAPI)

## Desarrollo
El servicio corre en el puerto `8000` internamente, pero es expuesto a través del API Gateway en `/api/auth`.
