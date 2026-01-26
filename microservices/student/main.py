from common.app_factory import create_app
from routers import estudiante
from pathlib import Path
from fastapi.staticfiles import StaticFiles

app, limiter = create_app(
    title="Student Service",
    description="Microservicio de Estudiantes"
)

# Uploads specific logic
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(estudiante.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "student"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
