#!/bin/bash
set -e
URL="http://localhost:8000"

echo "=== Normal ==="
python3 apps/load-generator/main.py --mode normal --duration 10 --url $URL
sleep 5
python3 extract_telemetry.py --scenario normal

echo "=== Error Spike ==="
python3 apps/load-generator/main.py --mode error --duration 10 --url $URL
sleep 5
python3 extract_telemetry.py --scenario error-spike

echo "=== CPU Pressure (Load) ==="
python3 apps/load-generator/main.py --mode load --duration 10 --url $URL
sleep 5
python3 extract_telemetry.py --scenario cpu-pressure

echo "=== Pod Restart ==="
# Restart backend deployment
kubectl rollout restart deployment backend -n trade-sentinel
# Generate some traffic while it restarts
python3 apps/load-generator/main.py --mode normal --duration 15 --url $URL
sleep 15
python3 extract_telemetry.py --scenario pod-restart

