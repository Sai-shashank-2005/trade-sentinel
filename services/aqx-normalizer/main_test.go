package main

import (
	"encoding/json"
	"io"
	"testing"
)

// Benchmark the normalization of raw float data into AQX Event JSON
func BenchmarkAQXNormalization(b *testing.B) {
	// Use io.Discard to avoid measuring disk write speed
	// We only want to measure the CPU cost of the AQX translation
	
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		event := createAQXWrapper("prometheus", "metric", 1700000000.0 + float64(i))
		event.AQX.Event.Payload = map[string]interface{}{
			"metric_name": "http_requests_total",
			"value":       100.0,
			"scenario":    "benchmark",
		}
		
		bytes, _ := json.Marshal(event)
		io.Discard.Write(bytes)
	}
}
