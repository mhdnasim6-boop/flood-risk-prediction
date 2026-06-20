"""
Flood Risk Prediction API — FastAPI application.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.model_loader import label_encoder, model
from app.predictor import predict_flood
from app.schemas import FloodRequest, FloodResponse

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# --- App ---
app = FastAPI(
    title="Flood Risk Prediction API",
    description="Predict flood probability for Indian meteorological subdivisions",
    version="1.0.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static & Templates ---
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)

templates = Jinja2Templates(directory="app/templates")


# --- Routes ---

@app.get("/")
def home(request: Request):
    """Serve the main UI page."""
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get("/health")
def health():
    """Health check for Docker / load balancers."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }


@app.get("/subdivisions")
def get_subdivisions():
    """Return sorted list of valid subdivision names."""
    return {
        "subdivisions": sorted(
            label_encoder.classes_.tolist()
        )
    }


@app.post("/predict", response_model=FloodResponse)
def predict(request: FloodRequest):
    """Run flood risk prediction."""
    logger.info(
        "Prediction request: %s, %s, month=%d, year=%d",
        request.subdivision,
        request.rainfall,
        request.month,
        request.year,
    )

    result = predict_flood(
        rainfall=request.rainfall,
        month=request.month,
        year=request.year,
        subdivision_name=request.subdivision,
    )

    logger.info("Prediction result: %s", result)
    return result
