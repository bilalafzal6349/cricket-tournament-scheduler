from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import tournaments, teams, venues, schedule
from app.db.session import engine, Base

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    yield

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered cricket tournament scheduling system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    tournaments.router,
    prefix=f"{settings.API_V1_PREFIX}/tournaments",
    tags=["tournaments"]
)

app.include_router(
    teams.router,
    prefix=f"{settings.API_V1_PREFIX}/tournaments",
    tags=["teams"]
)

app.include_router(
    venues.router,
    prefix=f"{settings.API_V1_PREFIX}/tournaments",
    tags=["venues"]
)

app.include_router(
    schedule.router,
    prefix=f"{settings.API_V1_PREFIX}/tournaments",
    tags=["schedule"]
)

from app.api import auth
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["auth"]
)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Cricket Tournament Scheduler API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "cricket-tournament-scheduler"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
