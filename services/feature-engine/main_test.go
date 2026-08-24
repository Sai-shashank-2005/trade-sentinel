package main

import (
	"testing"
)

// Generate massive synthetic data for benchmarking
func generateSyntheticRecords(numRecords int) []Record {
	var records []Record
	timestamp := 1700000000.0

	for i := 0; i < numRecords; i++ {
		// Add a metric
		records = append(records, Record{
			Timestamp: timestamp,
			Type:      "metric",
			Metric:    "http_requests_total",
			Value:     float64(i % 100),
		})
		
		// Add a log
		logLine := "INFO: Everything is fine"
		if i%100 == 0 {
			logLine = "ERROR: Connection timeout"
		}
		records = append(records, Record{
			Timestamp: timestamp + 1.0,
			Type:      "log",
			LogLine:   logLine,
		})

		timestamp += 2.0 // Increment time slightly
	}
	return records
}

// Standard Test
func TestBuildWindows(t *testing.T) {
	records := generateSyntheticRecords(100)
	rows := buildWindowsConcurrent("test-scenario", 1, records, 10.0)

	if len(rows) == 0 {
		t.Fatalf("Expected rows, got 0")
	}
}

// Performance Benchmark
func BenchmarkBuildWindows(b *testing.B) {
	// Generate 100,000 synthetic metrics and 100,000 synthetic logs (200k total)
	records := generateSyntheticRecords(100000)
	
	b.ResetTimer() // Don't count data generation in the benchmark

	for i := 0; i < b.N; i++ {
		// Test chunking 200,000 records into 10-second rolling windows
		buildWindowsConcurrent("benchmark-scenario", 0, records, 10.0)
	}
}
