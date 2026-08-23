import time
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from sqlalchemy import text

from app.database import Base, engine, SessionLocal
from app.routes import analyze, dashboard, transactions, live_trade
from app.telemetry import (
    request_id_var, logger, http_requests_total, 
    http_request_duration_seconds, http_errors_total
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Trade Risk Intelligence API",
    description="Hybrid AI + Rule-Based + Context-Aware Trade Risk Engine",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telemetry Middleware
@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    req_id = str(uuid.uuid4())
    request_id_var.set(req_id)
    
    start_time = time.time()
    method = request.method
    path = request.url.path
    
    logger.info(
        "request received", 
        extra={"event": "request_received", "method": method, "path": path}
    )
    
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        logger.error(
            "request failed", 
            extra={
                "event": "request_failed", "method": method, "path": path, 
                "error": str(e)
            }
        )
        raise e
    finally:
        latency = time.time() - start_time
        latency_ms = round(latency * 1000, 2)
        
        # If we got a status_code, log completion and metrics
        if 'status_code' in locals():
            route = path
            # Simple path normalization for metrics to avoid high cardinality
            if path.startswith("/transactions/"):
                route = "/transactions/{id}"
                
            http_requests_total.labels(method=method, route=route, status=status_code).inc()
            http_request_duration_seconds.labels(method=method, route=route).observe(latency)
            
            if status_code >= 400:
                http_errors_total.labels(method=method, route=route, status=status_code).inc()
            
            logger.info(
                "request completed",
                extra={
                    "event": "request_completed",
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "latency_ms": latency_ms
                }
            )

    return response


# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


# Health and Readiness Endpoints
@app.get("/health")
def health():
    logger.info("health check", extra={"event": "health_check", "status": "alive"})
    return {"status": "alive"}

@app.get("/ready")
def ready():
    # Check database connection
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = "error"
        logger.error("database check failed", extra={"event": "readiness_check_failed", "error": str(e)})
        return Response(content='{"status": "error", "database": "unreachable"}', status_code=503)
        
    logger.info("readiness check", extra={"event": "readiness_check", "database": db_status})
    return {"status": "ready", "database": db_status}


# ROUTES
app.include_router(analyze.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(live_trade.router)

@app.get("/")
def root():
    return {"message": "Trade Risk Intelligence Backend Running"}