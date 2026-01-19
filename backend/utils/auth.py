from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str):
    """Verifica y decodifica un token JWT"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    """Obtiene el usuario actual desde el header Authorization o la cookie"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = None
    
    # 1. Intentar validar el token del header (prioridad)
    if token:
        payload = verify_token(token)
        
    # 2. Si el header falló o no existe, intentar con la cookie
    if not payload:
        token_from_cookie = request.cookies.get("access_token")
        if token_from_cookie:
            payload = verify_token(token_from_cookie)
            
    # 3. Si ninguno funcionó, error
    if not payload:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    
    if user_id is None or role is None:
        raise credentials_exception
    
    return {"user_id": user_id, "role": role, "email": payload.get("email")}

async def get_user_from_db(user_data: dict, collection):
    """Auxiliar para obtener usuario de DB"""
    user = await collection.find_one({"_id": user_data["user_id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

async def get_current_active_user(
    current_user: dict = Depends(get_current_user), 
    required_role: str = None, 
    collection = None
):
    """Obtiene el usuario completo de la BD y verifica rol y estado"""
    if required_role and current_user["role"] != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado"
        )
    
    user = await get_user_from_db(current_user, collection)
    
    # Subdecanos a veces no tienen campo activo, asumimos True si no existe
    if not user.get("activo", True):
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return user

# Dependencias específicas para cada rol
from database import docentes_collection, estudiantes_collection, subdecanos_collection

async def get_current_active_docente(current_user: dict = Depends(get_current_user)):
    return await get_current_active_user(current_user, "docente", docentes_collection)

async def get_current_active_estudiante(current_user: dict = Depends(get_current_user)):
    return await get_current_active_user(current_user, "estudiante", estudiantes_collection)

async def get_current_active_subdecano(current_user: dict = Depends(get_current_user)):
    return await get_current_active_user(current_user, "subdecano", subdecanos_collection)

def require_role(required_role: str):
    """Decorator para requerir un rol específico (Legacy wrapper)"""
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción"
            )
        return current_user
    return role_checker
