from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict
from bson import ObjectId
from datetime import datetime
from models.schemas import (
    DocenteCreate, DocenteUpdate, DocenteResponse,
    EstudianteCreate, EstudianteResponse,
    SolicitudResponse, SolicitudUpdateEstado, EstadoSolicitud,
    MateriaCreate, MateriaResponse
)
from database import (
    docentes_collection, estudiantes_collection, subdecanos_collection,
    solicitudes_collection, materias_collection, mensajes_collection
)
from utils.auth import get_current_user
from utils.encryption import hash_password, anonymize_name

router = APIRouter(prefix="/api/subdecano", tags=["Subdecano"])

# =============== GESTIÓN DE DOCENTES ===============

@router.post("/docentes", response_model=DocenteResponse)
async def crear_docente(
    docente: DocenteCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Crea un nuevo docente"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    # Verificar si ya existe
    existe = await docentes_collection.find_one({"email": docente.email})
    if existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")
    
    nuevo_docente = {
        **docente.dict(exclude={"password"}),
        "password": hash_password(docente.password),
        "fecha_registro": datetime.utcnow()
    }
    
    result = await docentes_collection.insert_one(nuevo_docente)
    
    return DocenteResponse(
        id=str(result.inserted_id),
        email=docente.email,
        nombre=docente.nombre,
        apellido=docente.apellido,
        cedula=docente.cedula,
        departamento=docente.departamento,
        materias_asignadas=docente.materias_asignadas,
        grupos_asignados=docente.grupos_asignados,
        fecha_registro=nuevo_docente["fecha_registro"]
    )

@router.get("/docentes", response_model=List[DocenteResponse])
async def listar_docentes(current_user: Dict = Depends(get_current_user)):
    """Lista todos los docentes"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    docentes = await docentes_collection.find().to_list(length=1000)
    
    return [
        DocenteResponse(
            id=str(doc["_id"]),
            email=doc["email"],
            nombre=doc["nombre"],
            apellido=doc["apellido"],
            cedula=doc["cedula"],
            departamento=doc["departamento"],
            materias_asignadas=doc.get("materias_asignadas", []),
            grupos_asignados=doc.get("grupos_asignados", []),
            fecha_registro=doc["fecha_registro"]
        )
        for doc in docentes
    ]

@router.put("/docentes/{docente_id}", response_model=DocenteResponse)
async def actualizar_docente(
    docente_id: str,
    datos: DocenteUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Actualiza solo las materias y grupos de un docente"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    # Solo permitir actualizar materias y grupos asignados
    update_data = {}
    if datos.materias_asignadas is not None:
        update_data["materias_asignadas"] = datos.materias_asignadas
    if datos.grupos_asignados is not None:
        update_data["grupos_asignados"] = datos.grupos_asignados
    
    if update_data:
        result = await docentes_collection.update_one(
            {"_id": ObjectId(docente_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Docente no encontrado")
    
    docente = await docentes_collection.find_one({"_id": ObjectId(docente_id)})
    
    return DocenteResponse(
        id=str(docente["_id"]),
        email=docente["email"],
        nombre=docente["nombre"],
        apellido=docente["apellido"],
        cedula=docente["cedula"],
        departamento=docente["departamento"],
        materias_asignadas=docente.get("materias_asignadas", []),
        grupos_asignados=docente.get("grupos_asignados", []),
        fecha_registro=docente["fecha_registro"]
    )

@router.delete("/docentes/{docente_id}")
async def eliminar_docente(
    docente_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Elimina un docente"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    result = await docentes_collection.delete_one({"_id": ObjectId(docente_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Docente no encontrado")
    
    return {"message": "Docente eliminado exitosamente"}

# =============== GESTIÓN DE ESTUDIANTES ===============

@router.post("/estudiantes", response_model=EstudianteResponse)
async def crear_estudiante(
    estudiante: EstudianteCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Crea un nuevo estudiante"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    existe = await estudiantes_collection.find_one({"email": estudiante.email})
    if existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")
    
    nuevo_estudiante = {
        **estudiante.dict(exclude={"password"}),
        "password": hash_password(estudiante.password),
        "fecha_registro": datetime.utcnow()
    }
    
    result = await estudiantes_collection.insert_one(nuevo_estudiante)
    
    return EstudianteResponse(
        id=str(result.inserted_id),
        email=estudiante.email,
        nombre=estudiante.nombre,
        apellido=estudiante.apellido,
        cedula=estudiante.cedula,
        carrera=estudiante.carrera,
        nivel=estudiante.nivel,
        fecha_registro=nuevo_estudiante["fecha_registro"]
    )

@router.get("/estudiantes", response_model=List[EstudianteResponse])
async def listar_estudiantes(current_user: Dict = Depends(get_current_user)):
    """Lista todos los estudiantes"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    estudiantes = await estudiantes_collection.find().to_list(length=1000)
    
    return [
        EstudianteResponse(
            id=str(est["_id"]),
            email=est["email"],
            nombre=est["nombre"],
            apellido=est["apellido"],
            cedula=est["cedula"],
            carrera=est["carrera"],
            nivel=est["nivel"],
            fecha_registro=est["fecha_registro"]
        )
        for est in estudiantes
    ]

@router.delete("/estudiantes/{estudiante_id}")
async def eliminar_estudiante(
    estudiante_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Elimina un estudiante"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    result = await estudiantes_collection.delete_one({"_id": ObjectId(estudiante_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado")
    
    return {"message": "Estudiante eliminado exitosamente"}

# =============== GESTIÓN DE SOLICITUDES ===============

@router.get("/solicitudes", response_model=List[SolicitudResponse])
async def listar_solicitudes(current_user: Dict = Depends(get_current_user)):
    """Lista todas las solicitudes con datos anonimizados"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    solicitudes = await solicitudes_collection.find().sort("fecha_creacion", -1).to_list(length=1000)
    
    resultado = []
    for sol in solicitudes:
        materia = await materias_collection.find_one({"_id": sol["materia_id"]})
        docente = await docentes_collection.find_one({"_id": sol["docente_id"]})
        
        resultado.append(SolicitudResponse(
            id=str(sol["_id"]),
            estudiante_id=str(sol["estudiante_id"]),
            estudiante_nombre_anonimo=sol.get("estudiante_nombre_anonimo", "Anónimo"),
            materia_id=str(sol["materia_id"]),
            materia_nombre=materia["nombre"] if materia else "Desconocida",
            docente_id=str(sol["docente_id"]),
            docente_nombre_anonimo=sol.get("docente_nombre_anonimo", "Anónimo"),
            grupo=sol["grupo"],
            aporte=sol["aporte"],
            calificacion_actual=sol.get("calificacion_actual", 0),
            motivo=sol.get("motivo", ""),
            estado=sol["estado"],
            fecha_creacion=sol["fecha_creacion"],
            fecha_actualizacion=sol["fecha_actualizacion"]
        ))
    
    return resultado

@router.put("/solicitudes/{solicitud_id}/estado")
async def actualizar_estado_solicitud(
    solicitud_id: str,
    datos: dict,
    current_user: Dict = Depends(get_current_user)
):
    """Acepta o rechaza una solicitud"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    solicitud = await solicitudes_collection.find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    
    estado = datos.get("estado")
    if not estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado requerido")
    
    update_data = {
        "estado": estado,
        "fecha_actualizacion": datetime.utcnow()
    }
    
    if datos.get("motivo_rechazo"):
        update_data["motivo_rechazo"] = datos["motivo_rechazo"]
    
    # Si se aprueba, asignar AUTOMÁTICAMENTE un docente aleatorio
    if estado == "aprobada":
        print(f"\n🎲 ASIGNACIÓN AUTOMÁTICA DE DOCENTE:")
        print(f"   Solicitud ID: {solicitud_id}")
        print(f"   Materia ID: {solicitud['materia_id']}")
        print(f"   Docente Original: {solicitud['docente_id']}")
        
        # Buscar docentes disponibles (misma materia, NO el docente original)
        import random
        docentes_disponibles = await docentes_collection.find({
            "materias_asignadas": str(solicitud["materia_id"]),
            "_id": {"$ne": solicitud["docente_id"]}
        }).to_list(length=100)
        
        print(f"   Docentes disponibles: {len(docentes_disponibles)}")
        
        if not docentes_disponibles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay docentes disponibles para recalificar esta materia"
            )
        
        # Seleccionar uno ALEATORIO
        docente_seleccionado = random.choice(docentes_disponibles)
        print(f"   ✅ Docente asignado aleatoriamente: {docente_seleccionado['nombre']} {docente_seleccionado['apellido']}")
        
        update_data["docente_recalificador_id"] = docente_seleccionado["_id"]
        update_data["estado"] = "en_revision"
        update_data["fecha_asignacion"] = datetime.utcnow()
        
        # Notificar al docente recalificador
        await mensajes_collection.insert_one({
            "destinatario_id": docente_seleccionado["_id"],
            "remitente": "Sistema",
            "asunto": "Nueva recalificación asignada",
            "contenido": "Se te ha asignado automáticamente una nueva solicitud de recalificación para revisar.",
            "tipo": "notificacion",
            "leido": False,
            "fecha_envio": datetime.utcnow()
        })
    
    await solicitudes_collection.update_one(
        {"_id": ObjectId(solicitud_id)},
        {"$set": update_data}
    )
    
    # Notificar al estudiante
    if estado == "aprobada":
        mensaje_contenido = "Tu solicitud ha sido aprobada y se ha asignado automáticamente a un docente para su revisión."
    elif estado == "rechazada":
        mensaje_contenido = f"Tu solicitud ha sido rechazada. Motivo: {datos.get('motivo_rechazo', 'No especificado')}"
    else:
        mensaje_contenido = f"Tu solicitud ha sido actualizada al estado: {estado}"
    
    await mensajes_collection.insert_one({
        "destinatario_id": solicitud["estudiante_id"],
        "remitente": "Subdecano",
        "asunto": f"Actualización de solicitud - {estado}",
        "contenido": mensaje_contenido,
        "tipo": "notificacion",
        "leido": False,
        "fecha_envio": datetime.utcnow()
    })
    
    return {"message": "Estado actualizado exitosamente"}

# =============== GESTIÓN DE MATERIAS ===============

@router.post("/materias", response_model=MateriaResponse)
async def crear_materia(
    materia: MateriaCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Crea una nueva materia"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    nueva_materia = {
        **materia.dict(),
        "fecha_creacion": datetime.utcnow()
    }
    
    result = await materias_collection.insert_one(nueva_materia)
    
    return MateriaResponse(
        id=str(result.inserted_id),
        nombre=materia.nombre,
        codigo=materia.codigo,
        descripcion=materia.descripcion
    )

@router.get("/materias", response_model=List[MateriaResponse])
async def listar_materias(current_user: Dict = Depends(get_current_user)):
    """Lista todas las materias"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    materias = await materias_collection.find().to_list(length=1000)
    
    return [
        MateriaResponse(
            id=str(mat["_id"]),
            nombre=mat["nombre"],
            codigo=mat["codigo"],
            descripcion=mat.get("descripcion")
        )
        for mat in materias
    ]

# =============== ASIGNACIÓN DE DOCENTES RECALIFICADORES ===============

@router.get("/solicitudes/{solicitud_id}/docentes-disponibles")
async def obtener_docentes_disponibles(
    solicitud_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Obtiene lista de docentes que pueden recalificar (excluyendo el docente original)"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    # Obtener la solicitud
    solicitud = await solicitudes_collection.find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    
    print(f"\n🔍 DEBUG DOCENTES DISPONIBLES:")
    print(f"   Solicitud ID: {solicitud_id}")
    print(f"   Materia ID: {solicitud['materia_id']}")
    print(f"   Docente Original ID: {solicitud['docente_id']}")
    
    # Buscar docentes que tengan esta materia asignada EXCEPTO el docente original
    docentes = await docentes_collection.find({
        "materias_asignadas": str(solicitud["materia_id"]),
        "_id": {"$ne": solicitud["docente_id"]}  # Excluir docente original
    }).to_list(length=100)
    
    print(f"   Docentes disponibles: {len(docentes)}")
    
    resultado = []
    for doc in docentes:
        resultado.append({
            "id": str(doc["_id"]),
            "nombre": f"{doc['nombre']} {doc['apellido']}",
            "email": doc["email"],
            "departamento": doc["departamento"],
            "grupos": doc.get("grupos_asignados", [])
        })
    
    return resultado

@router.post("/solicitudes/{solicitud_id}/asignar-docente")
async def asignar_docente_recalificador(
    solicitud_id: str,
    datos: dict,
    current_user: Dict = Depends(get_current_user)
):
    """Asigna un docente recalificador a una solicitud aprobada"""
    if current_user["role"] != "subdecano":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    
    docente_recalificador_id = datos.get("docente_recalificador_id")
    if not docente_recalificador_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID del docente requerido")
    
    # Obtener la solicitud
    solicitud = await solicitudes_collection.find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    
    # Verificar que NO sea el mismo docente original
    if str(solicitud["docente_id"]) == docente_recalificador_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes asignar al mismo docente que calificó originalmente"
        )
    
    # Verificar que el docente tenga esta materia asignada
    docente = await docentes_collection.find_one({"_id": ObjectId(docente_recalificador_id)})
    if not docente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Docente no encontrado")
    
    if str(solicitud["materia_id"]) not in docente.get("materias_asignadas", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El docente no tiene asignada esta materia"
        )
    
    # Actualizar la solicitud
    await solicitudes_collection.update_one(
        {"_id": ObjectId(solicitud_id)},
        {
            "$set": {
                "docente_recalificador_id": ObjectId(docente_recalificador_id),
                "estado": "en_revision",
                "fecha_asignacion": datetime.utcnow()
            }
        }
    )
    
    # Notificar al docente recalificador
    await mensajes_collection.insert_one({
        "destinatario_id": ObjectId(docente_recalificador_id),
        "remitente": "Subdecano",
        "asunto": "Nueva recalificación asignada",
        "contenido": f"Se te ha asignado una nueva solicitud de recalificación para revisar.",
        "tipo": "notificacion",
        "leido": False,
        "fecha_envio": datetime.utcnow()
    })
    
    # Notificar al estudiante
    await mensajes_collection.insert_one({
        "destinatario_id": solicitud["estudiante_id"],
        "remitente": "Subdecano",
        "asunto": "Docente asignado a tu solicitud",
        "contenido": "Se ha asignado un docente para recalificar tu solicitud.",
        "tipo": "notificacion",
        "leido": False,
        "fecha_envio": datetime.utcnow()
    })
    
    return {"message": "Docente asignado exitosamente"}
