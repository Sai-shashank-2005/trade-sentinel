import requests
import time
import random
import argparse
import sys
import uuid

# Configuration
BACKEND_URL = "http://backend:8000"

def generate_normal_traffic(duration=60):
    print(f"Generating normal traffic for {duration} seconds...")
    start = time.time()
    while time.time() - start < duration:
        try:
            # Hit health endpoint
            requests.get(f"{BACKEND_URL}/health", timeout=2)
            
            # Hit dashboard data endpoint (simulated)
            requests.get(f"{BACKEND_URL}/dashboard/metrics", timeout=2)
            
            time.sleep(random.uniform(0.5, 2.0))
        except Exception as e:
            print(f"Error: {e}")

def generate_load_spike(duration=30):
    print(f"Generating LOAD SPIKE for {duration} seconds...")
    start = time.time()
    while time.time() - start < duration:
        try:
            requests.get(f"{BACKEND_URL}/dashboard/metrics", timeout=2)
            time.sleep(0.05) # Fast requests
        except:
            pass

def generate_error_spike(duration=30):
    print(f"Generating ERROR SPIKE for {duration} seconds...")
    start = time.time()
    while time.time() - start < duration:
        try:
            # Hit a non-existent endpoint to generate 404s
            requests.get(f"{BACKEND_URL}/nonexistent-{uuid.uuid4()}", timeout=2)
            time.sleep(0.1)
        except:
            pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trade Sentinel Load Generator")
    parser.add_argument("--mode", choices=["normal", "load", "error"], default="normal")
    parser.add_argument("--duration", type=int, default=60, help="Duration in seconds")
    parser.add_argument("--url", type=str, default="http://backend:8000", help="Backend URL")
    
    args = parser.parse_args()
    BACKEND_URL = args.url
    
    if args.mode == "normal":
        generate_normal_traffic(args.duration)
    elif args.mode == "load":
        generate_load_spike(args.duration)
    elif args.mode == "error":
        generate_error_spike(args.duration)
