import requests
import json
import time
import os
import argparse
from datetime import datetime, timedelta

PROMETHEUS_URL = "http://localhost:9090"
LOKI_URL = "http://localhost:3100"

def get_loki_logs(start_time, end_time):
    query = '{app="backend"}'
    url = f"{LOKI_URL}/loki/api/v1/query_range"
    params = {
        'query': query,
        'start': int(start_time.timestamp() * 1e9),
        'end': int(end_time.timestamp() * 1e9),
        'limit': 5000
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    print(f"Loki error: {response.text}")
    return None

def get_prometheus_metrics(start_time, end_time):
    queries = [
        'http_requests_total{app="backend"}',
        'http_request_duration_seconds_sum{app="backend"}',
        'http_request_duration_seconds_count{app="backend"}'
    ]
    results = {}
    for query in queries:
        url = f"{PROMETHEUS_URL}/api/v1/query_range"
        params = {
            'query': query,
            'start': start_time.timestamp(),
            'end': end_time.timestamp(),
            'step': '5s'
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            results[query] = response.json()
        else:
            print(f"Prometheus error for {query}: {response.text}")
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", required=True)
    args = parser.parse_args()

    end_time = datetime.utcnow()
    start_time = end_time - timedelta(minutes=2)

    print(f"Extracting telemetry for scenario: {args.scenario} from {start_time} to {end_time}")

    loki_data = get_loki_logs(start_time, end_time)
    prom_data = get_prometheus_metrics(start_time, end_time)

    if loki_data:
        path = f"telemetry/samples/loki/{args.scenario}.json"
        with open(path, 'w') as f:
            json.dump(loki_data, f, indent=2)
        print(f"Saved Loki data to {path}")

    if prom_data:
        path = f"telemetry/samples/prometheus/{args.scenario}.json"
        with open(path, 'w') as f:
            json.dump(prom_data, f, indent=2)
        print(f"Saved Prometheus data to {path}")

if __name__ == "__main__":
    main()
