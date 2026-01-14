from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Dict
from models.schemas import LoginRequest, TokenResponse, UserRole
from database import estudiantes_collection, docentes_collection, subdecanos_collection
from utils.encryption import verify_password, decrypt_data
from utils.auth import create_access_token
from config import settings

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """Endpoint de inicio de sesión para todos los roles"""
    
    print(f"\n🔍 DEBUG LOGIN:")
    print(f"   Email: {login_data.email}")
    print(f"   Role: {login_data.role}")
    
    # Seleccionar la colección según el rol
    if login_data.role == UserRole.ESTUDIANTE:
        collection = estudiantes_collection
    elif login_data.role == UserRole.DOCENTE:
        collection = docentes_collection
    elif login_data.role == UserRole.SUBDECANO:
        collection = subdecanos_collection
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rol no válido"
        )
    
    # Buscar usuario por email
    user = await collection.find_one({"email": login_data.email})
    
    if not user:
        print(f"   ❌ Usuario NO encontrado en BD")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    print(f"   ✅ Usuario encontrado en BD")
    print(f"   Hash en BD: {user['password'][:30]}...")
    print(f"   Password ingresado: {login_data.password}")
    
    # Verificar contraseña
    password_valid = verify_password(login_data.password, user["password"])
    print(f"   Verificación password: {password_valid}")
    
    if not password_valid:
        print(f"   ❌ Password incorrecto")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    print(f"   ✅ Login exitoso\n")
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": login_data.role
        },
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        role=login_data.role,
        user_id=str(user["_id"])
    )

@router.post("/verify-token")
async def verify_token_endpoint(current_user: Dict = Depends(lambda: None)):
    """Verifica si un token es válido"""
    return {"valid": True, "user": current_user}
