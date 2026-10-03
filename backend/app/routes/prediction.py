"""
Prediction endpoint running statistical machine learning models.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictRequest, PredictResponse
from app.ml.pipeline import train_and_predict

router = APIRouter(prefix="/api", tags=["Machine Learning Prediction"])


@router.post("/predict", response_model=PredictResponse)
def generate_prediction(request: PredictRequest):
    """
    Trains/evaluates a regression model on historical time-series data
    and generates an estimated multi-step forward forecast.
    """
    valid_models = ["linear_regression", "random_forest"]
    clean_model = request.model_name.lower().strip()
    if clean_model not in valid_models:
        clean_model = "linear_regression"

    result = train_and_predict(
        symbol=request.symbol,
        model_name=clean_model,
        period_days=request.period_days
    )

    if not result:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to generate predictions for '{request.symbol.upper()}'. Ensure ticker exists and has adequate historical depth."
        )

    return result
