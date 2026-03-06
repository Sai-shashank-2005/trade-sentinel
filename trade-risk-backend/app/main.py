from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base

from .routes import analyze
from .routes import transactions
from .routes import dashboard


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Trade Risk Intelligence API",
    version="2.0",
    description="Hybrid AI + Rule-Based + Context-Aware Trade Risk Engine",
)


# -------------------------
# CORS CONFIGURATION
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# ROUTERS
# -------------------------
app.include_router(analyze.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)


# -------------------------
# ROOT ENDPOINT
# -------------------------
@app.get("/")
def root():
    return {"message": "Trade Risk Intelligence Backend Running"}