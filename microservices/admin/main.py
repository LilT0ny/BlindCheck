from common.app_factory import create_app
from routers import subdecano
from seed_db import seed_data

app, limiter = create_app(
    title="Admin Service",
    description="Microservicio de Administración"
)

@app.on_event("startup")
async def startup_event():
    await seed_data()

app.include_router(subdecano.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "admin"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
