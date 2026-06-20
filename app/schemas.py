from pydantic import BaseModel, Field


class FloodRequest(BaseModel):
    """Input schema for flood risk prediction."""

    rainfall: float = Field(
        gt=0,
        description="Rainfall in millimeters"
    )

    month: int = Field(
        ge=1,
        le=12,
        description="Month of the year (1-12)"
    )

    year: int = Field(
        ge=1900,
        description="Year (>= 1900)"
    )

    subdivision: str = Field(
        min_length=1,
        description="Indian meteorological subdivision name"
    )


class FloodResponse(BaseModel):
    """Output schema for flood risk prediction."""

    probability: float = Field(
        description="Flood probability percentage (0-100)"
    )

    confidence: float = Field(
        description="Prediction confidence percentage (0-100)"
    )

    uncertainty: float = Field(
        description="Prediction uncertainty percentage (0-100)"
    )

    risk: str = Field(
        description="Risk level: LOW, MEDIUM, or HIGH"
    )

    threshold: float | None = Field(
        default=None,
        description="Historical rainfall threshold in mm"
    )