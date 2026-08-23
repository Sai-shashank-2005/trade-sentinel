import logging
import sys
from contextvars import ContextVar
from pythonjsonlogger import jsonlogger
from prometheus_client import Counter, Histogram

request_id_var = ContextVar("request_id", default="N/A")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        if not hasattr(record, "service"):
            record.service = "trade-sentinel-backend"
        return True

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            # This is automatically provided if we use %(asctime)s, but let's make sure
            from datetime import datetime
            now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
            log_record['timestamp'] = now
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(service)s %(message)s %(request_id)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.addFilter(RequestIdFilter())
    return logger

logger = setup_logging()

# --- Prometheus Metrics ---

# HTTP
http_requests_total = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "route", "status"]
)
http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "route"]
)
http_errors_total = Counter(
    "http_errors_total",
    "Total number of HTTP errors",
    ["method", "route", "status"]
)

# Application
trade_analysis_total = Counter("trade_analysis_total", "Total trade analyses performed")
trade_analysis_errors_total = Counter("trade_analysis_errors_total", "Total trade analysis errors")
trade_analysis_duration_seconds = Histogram("trade_analysis_duration_seconds", "Time taken for trade analysis")

csv_upload_total = Counter("csv_upload_total", "Total CSV uploads")
csv_processing_errors_total = Counter("csv_processing_errors_total", "Total CSV processing errors")

live_trade_total = Counter("live_trade_total", "Total live trades processed")
live_trade_errors_total = Counter("live_trade_errors_total", "Total live trade processing errors")

# Database
database_queries_total = Counter("database_queries_total", "Total database queries", ["operation"])
database_errors_total = Counter("database_errors_total", "Total database errors", ["operation"])
database_query_duration_seconds = Histogram("database_query_duration_seconds", "Time taken for database queries", ["operation"])
database_connections = Counter("database_connections", "Total database connections")

# Model
model_predictions_total = Counter("model_predictions_total", "Total model predictions")
model_prediction_errors_total = Counter("model_prediction_errors_total", "Total model prediction errors")
model_prediction_duration_seconds = Histogram("model_prediction_duration_seconds", "Model prediction duration")
