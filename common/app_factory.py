from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from common.config import settings

# Shared Limiter instance
limiter = Limiter(key_func=get_remote_address)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

def create_app(title: str, description: str, version: str = "1.0.0") -> FastAPI:
    """
    Factory function to create a FastAPI application with standard configuration.
    This reduces code duplication across microservices.
    """
    app = FastAPI(
        title=title,
        description=description,
        version=version,
    )

    # Security Headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Rate Limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        # Allow specific methods/headers is better for security, 
        # but for now we keep * as per user original, 
        # strict origins is the most important part.
        allow_methods=["*"], 
        allow_headers=["*"],
    )

    # Prometheus Metrics
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator().instrument(app).expose(app)

    return app, limiter
