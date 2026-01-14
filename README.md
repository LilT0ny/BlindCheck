# BlindCheck - Sistema de Recalificación Anónima

Sistema completo de gestión de recalificaciones académicas con anonimización de datos para garantizar imparcialidad en el proceso.

## 🎯 Descripción

BlindCheck permite a estudiantes solicitar recalificaciones de forma anónima, donde subdecanos revisan y aprueban las solicitudes, y docentes califican sin conocer la identidad del estudiante.

## 🏗️ Arquitectura

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Cifrado**: Bcrypt + Fernet

## 📋 Características Principales

### 👨‍🎓 Estudiante
- ✅ Inicio de sesión seguro con credenciales cifradas
- ✅ Dashboard con resumen de solicitudes
- ✅ Crear solicitudes de recalificación (materia, GR, aporte, evidencia)
- ✅ Ver estado de solicitudes en tiempo real
- ✅ Ver detalles de calificación (notas de 2 profesores anónimos + promedio)
- ✅ Recibir notificaciones del estado de solicitudes
- ✅ Actualizar datos personales

### 👨‍🏫 Docente
- ✅ Ver materias y grupos asignados
- ✅ Subir evidencias por materia y tipo de aporte
- ✅ Ver recalificaciones asignadas (estudiante anónimo)
- ✅ Calificar con nota (0-10) y comentario justificativo
- ✅ Acceso a evidencia del estudiante y del docente original
- ✅ Actualizar perfil

### 👔 Subdecano
- ✅ Ver todas las solicitudes (datos anonimizados)
- ✅ Aprobar/Rechazar solicitudes con motivo
- ✅ Asignar docentes a solicitudes aprobadas
- ✅ CRUD completo de docentes (solo materias/GR editables)
- ✅ CRUD de estudiantes
- ✅ Gestión de materias
- ✅ Visualización con datos anonimizados

## 🔒 Seguridad

- Contraseñas hasheadas con **Bcrypt**
- Tokens **JWT** con expiración
- Datos sensibles cifrados con **Fernet**
- Anonimización mediante hashing **MD5**
- Validación de roles en cada endpoint
- CORS configurado

## 🎨 Diseño

Paleta de colores elegante y profesional:
- 🔴 **Rojo**: `#dc2626` (Primary)
- 🔵 **Azul**: `#2563eb` (Secondary)
- ⚪ **Blanco**: `#ffffff` (Background)

## 📦 Estructura del Proyecto

```
recalificacion_anonima/
├── backend/                    # Backend FastAPI
│   ├── main.py                # Aplicación principal
│   ├── config.py              # Configuración
│   ├── database.py            # Conexión MongoDB
│   ├── requirements.txt       # Dependencias Python
│   ├── models/
│   │   └── schemas.py         # Modelos Pydantic
│   ├── routers/
│   │   ├── auth.py           # Autenticación
│   │   ├── estudiante.py     # Endpoints estudiante
│   │   ├── docente.py        # Endpoints docente
│   │   └── subdecano.py      # Endpoints subdecano
│   └── utils/
│       ├── encryption.py      # Cifrado y anonimización
│       └── auth.py           # JWT y autorización
│
└── frontend/                   # Frontend React
    ├── src/
    │   ├── App.jsx            # Rutas principales
    │   ├── main.jsx           # Punto de entrada
    │   ├── index.css          # Estilos globales
    │   ├── components/        # Componentes reutilizables
    │   ├── pages/             # Páginas por rol
    │   ├── services/          # API client
    │   └── store/             # Estado global (Zustand)
    ├── package.json
    └── vite.config.js
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Python 3.9+
- Node.js 16+
- MongoDB 4.4+ (corriendo en localhost:27017)

### 1. Backend (Terminal 1)

```powershell
cd backend

# Crear entorno virtual (solo primera vez)
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar dependencias (solo primera vez)
pip install -r requirements.txt

# Iniciar servidor
python main.py
```

✅ Backend: **http://localhost:8000**  
✅ Documentación API: **http://localhost:8000/docs**

### 2. Frontend (Terminal 2)

```powershell
cd frontend

# Instalar dependencias (solo primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

✅ Frontend: **http://localhost:3000**

### 3. Base de Datos MongoDB

La base de datos ya está configurada como **BlindCheck**.

Ver archivo [SETUP_BLINDCHECK_MONGODB.md](SETUP_BLINDCHECK_MONGODB.md) para instrucciones de cómo poblar la base de datos con usuarios iniciales.

## 📊 Base de Datos

### Colecciones MongoDB

- **estudiantes**: Información de estudiantes
- **docentes**: Información de docentes
- **subdecanos**: Información de subdecanos
- **solicitudes**: Solicitudes de recalificación
- **calificaciones**: Calificaciones de docentes
- **evidencias**: Evidencias subidas por docentes
- **materias**: Catálogo de materias
- **mensajes**: Notificaciones y mensajes

## 🔑 Credenciales de Prueba

**Nota**: Debes crear l (Base de datos: BlindCheck)

- **estudiantes**: Información de estudiantes
- **docentes**: Información de docentes
- **subdecanos**: Información de subdecanos
- **solicitudes**: Solicitudes de recalificación
- **calificaciones**: Calificaciones de docentes
- **evidencias**: Evidencias subidas por docentes
- **materias**: Catálogo de materias
- **mensajes**: Notificaciones y mensajes

## 🔑 Credenciales de Acceso

Ver [SETUP_BLINDCHECK_MONGODB.md](SETUP_BLINDCHECK_MONGODB.md) para obtener las credenciales completas.

**Ejemplo:**
- **Subdecano:** admin@blindcheck.edu / Admin2026!
- **Docentes:** *.@blindcheck.edu / Docente2026!
- **Estudiantes:** *.@blindcheck.edu / Estudiante2026!
- `GET /api/docente/materias` - Ver materias
- `POST /api/docente/evidencias` - Subir evidencia
- `GET /api/docente/recalificaciones` - Ver recalificaciones
- `POST /api/docente/recalificaciones/{id}/calificar` - Calificar

### Subdecano
- `POST /api/subdecano/docentes` - Crear docente
- `POST /api/subdecano/estudiantes` - Crear estudiante
- `GET /api/subdecano/solicitudes` - Ver solicitudes
- `PUT /api/subdecano/solicitudes/{id}/estado` - Aprobar/Rechazar

Ver documentación completa en: http://localhost:8000/docs

## 🛠️ Tecnologías

### Backend
- FastAPI 0.104+
- Motor (MongoDB async driver)
- Pydantic (Validación)
- Python-JOSE (JWT)
- Passlib + Bcrypt (Hashing)
- Cryptography (Cifrado Fernet)

### Frontend
- React 18
- React Router DOM 6
- Vite 5
- Axios
- Zustand

## 📝 Flujo del Sistema

1. **Estudiante** crea solicitud de recalificación
2. **Subdecano** recibe solicitud (datos anonimizados)
3. **Subdecano** aprueba y asigna 2 docentes
4. **Docentes** califican la solicitud (estudiante anónimo)
5. Sistema calcula promedio de las 2 notas
6. **Estudiante** recibe notificación con resultado final

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

Sistema desarrollado para la gestión académica universitaria.

## 📞 Soporte

Para soporte y preguntas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando FastAPI y React**
