package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var scenarios = map[string]int{
	"normal":       0,
	"cpu-pressure": 1,
	"error-spike":  2,
	"pod-restart":  3,
}

type PromResponse struct {
	Status string   `json:"status"`
	Data   PromData `json:"data"`
}
type PromData struct {
	Result []PromResult `json:"result"`
}
type PromResult struct {
	Metric map[string]string `json:"metric"`
	Values [][]interface{}   `json:"values"`
}

type LokiResponse struct {
	Status string   `json:"status"`
	Data   LokiData `json:"data"`
}
type LokiData struct {
	Result []LokiResult `json:"result"`
}
type LokiResult struct {
	Stream map[string]string `json:"stream"`
	Values [][]string        `json:"values"`
}

// Packed struct for better CPU Cache Locality
type Record struct {
	Timestamp float64
	Value     float64
	Type      string
	Metric    string
	LogLine   string
}

type FeatureRow struct {
	Scenario   string
	StartTime  string
	ReqRate    float64
	LogVolume  int
	ErrorCount int
	Label      int
}

func main() {
	fmt.Println("Starting KubeHeals Feature Engineering (Concurrent Go)...")
	var allRows []FeatureRow

	for scenario, label := range scenarios {
		promPath := fmt.Sprintf("../../telemetry/samples/prometheus/%s.json", scenario)
		lokiPath := fmt.Sprintf("../../telemetry/samples/loki/%s.json", scenario)

		records := parseScenario(promPath, lokiPath)
		if len(records) == 0 {
			fmt.Printf("Warning: No telemetry data found for scenario '%s'\n", scenario)
			continue
		}

		rows := buildWindowsConcurrent(scenario, label, records, 10.0)
		allRows = append(allRows, rows...)
	}

	if len(allRows) == 0 {
		fmt.Println("Dataset is empty. Run the load generators first to populate JSON samples.")
		return
	}

	writeCSV("../../telemetry/dataset/kubeheals_training_data.csv", allRows)
}

func parseScenario(promPath, lokiPath string) []Record {
	var records []Record

	promBytes, err := os.ReadFile(promPath)
	if err == nil {
		var promMap map[string]PromResponse
		if err := json.Unmarshal(promBytes, &promMap); err == nil {
			for query, resp := range promMap {
				metricName := strings.Split(query, "{")[0]
				for _, result := range resp.Data.Result {
					for _, val := range result.Values {
						ts, _ := strconv.ParseFloat(fmt.Sprintf("%v", val[0]), 64)
						v, _ := strconv.ParseFloat(fmt.Sprintf("%v", val[1]), 64)
						records = append(records, Record{Timestamp: ts, Value: v, Type: "metric", Metric: metricName})
					}
				}
			}
		}
	}

	lokiBytes, err := os.ReadFile(lokiPath)
	if err == nil {
		var lokiResp LokiResponse
		if err := json.Unmarshal(lokiBytes, &lokiResp); err == nil {
			for _, result := range lokiResp.Data.Result {
				for _, val := range result.Values {
					tsNano, _ := strconv.ParseFloat(val[0], 64)
					records = append(records, Record{Timestamp: tsNano / 1e9, Type: "log", LogLine: strings.ToLower(val[1])})
				}
			}
		}
	}

	sort.Slice(records, func(i, j int) bool {
		return records[i].Timestamp < records[j].Timestamp
	})
	return records
}

// Concurrently computes sliding windows across available CPU cores
func buildWindowsConcurrent(scenario string, label int, records []Record, windowSize float64) []FeatureRow {
	if len(records) == 0 {
		return nil
	}

	minTs := records[0].Timestamp
	maxTs := records[len(records)-1].Timestamp
	totalWindows := int((maxTs - minTs) / windowSize)
	if totalWindows <= 0 {
		totalWindows = 1
	}

	numWorkers := runtime.NumCPU()
	if totalWindows < numWorkers {
		numWorkers = totalWindows
	}

	windowsPerWorker := totalWindows / numWorkers
	results := make([][]FeatureRow, numWorkers)
	var wg sync.WaitGroup

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			
			startWindow := workerID * windowsPerWorker
			endWindow := startWindow + windowsPerWorker
			if workerID == numWorkers-1 {
				endWindow = totalWindows + 1 // Ensure last worker catches remainder
			}

			startTs := minTs + float64(startWindow)*windowSize
			endTs := minTs + float64(endWindow)*windowSize

			// Binary search to find the starting index for this worker's time segment
			idx := sort.Search(len(records), func(i int) bool {
				return records[i].Timestamp >= startTs
			})

			var localRows []FeatureRow

			for currentTs := startTs; currentTs < endTs; currentTs += windowSize {
				nextTs := currentTs + windowSize
				
				var sum float64 = 0
				var count int = 0
				logVolume := 0
				errorCount := 0

				// O(N) optimized sliding window for this specific time chunk
				for idx < len(records) && records[idx].Timestamp < nextTs {
					r := records[idx]
					if r.Type == "metric" && r.Metric == "http_requests_total" {
						sum += r.Value
						count++
					} else if r.Type == "log" {
						logVolume++
						if strings.Contains(r.LogLine, "error") || strings.Contains(r.LogLine, "exception") || strings.Contains(r.LogLine, "timeout") {
							errorCount++
						}
					}
					idx++
				}

				reqRate := 0.0
				if count > 0 {
					reqRate = sum / float64(count)
				}

				startStr := time.Unix(int64(currentTs), 0).UTC().Format("2006-01-02 15:04:05")
				localRows = append(localRows, FeatureRow{Scenario: scenario, StartTime: startStr, ReqRate: reqRate, LogVolume: logVolume, ErrorCount: errorCount, Label: label})
			}
			results[workerID] = localRows
		}(w)
	}

	wg.Wait()

	// Merge results in chronological order
	var finalRows []FeatureRow
	for _, res := range results {
		finalRows = append(finalRows, res...)
	}
	return finalRows
}

func writeCSV(path string, rows []FeatureRow) {
	os.MkdirAll(filepath.Dir(path), 0755)
	f, _ := os.Create(path)
	defer f.Close()

	f.WriteString("Scenario,StartTime,ReqRate,LogVolume,ErrorCount,Label\n")
	for _, r := range rows {
		f.WriteString(fmt.Sprintf("%s,%s,%.2f,%d,%d,%d\n", r.Scenario, r.StartTime, r.ReqRate, r.LogVolume, r.ErrorCount, r.Label))
	}
}
