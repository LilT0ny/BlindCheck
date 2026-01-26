from common.app_factory import create_app
from routers import auth
from fastapi.responses import JSONResponse

app, limiter = create_app(
    title="Auth Service",
    description="Microservicio de Autenticación"
)

# Custom error handler example (if needed specific to auth)
# app.add_exception_handler(...)

app.include_router(auth.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth"}

if __name__ == "__main__":
    import uvicorn
    # SonarQube Hotspot: Binding to 0.0.0.0 is safe inside a container.
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
