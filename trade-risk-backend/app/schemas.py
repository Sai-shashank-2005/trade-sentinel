from pydantic import BaseModel
from datetime import date


class AnalyzeRequest(BaseModel):

    date: date
    importer: str
    exporter: str
    hs_code: str

    quantity: float
    unit_price: float

    origin_country: str
    destination_country: str