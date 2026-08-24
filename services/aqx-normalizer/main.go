package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// AQXEvent represents the Canonical telemetry representation for KubeHeals
type AQXEvent struct {
	EventID     string                 `json:"event_id"`
	Timestamp   string                 `json:"timestamp"`
	Source      string                 `json:"source"`
	Type        string                 `json:"type"`
	ClusterID   string                 `json:"cluster_id"`
	Namespace   string                 `json:"namespace"`
	Workload    string                 `json:"workload"`
	PodID       string                 `json:"pod_id"`
	ContainerID string                 `json:"container_id"`
	Service     string                 `json:"service"`
	Payload     map[string]interface{} `json:"payload"`
}

// AQXWrapper wraps the event per the user's schema definition
type AQXWrapper struct {
	AQX struct {
		Version string   `json:"version"`
		Purpose string   `json:"purpose"`
		Input   string   `json:"input"`
		Output  string   `json:"output"`
		Event   AQXEvent `json:"event"`
		Rules   struct {
			Deterministic        bool `json:"deterministic"`
			PreserveTimestamp    bool `json:"preserve_timestamp"`
			PreserveIdentity     bool `json:"preserve_identity"`
			SchemaVersioned      bool `json:"schema_versioned"`
			NoFeatureEngineering bool `json:"no_feature_engineering"`
			NoMLLogic            bool `json:"no_ml_logic"`
		} `json:"rules"`
	} `json:"aqx"`
}

var scenarios = []string{"normal", "cpu-pressure", "error-spike", "pod-restart"}

// Input Structures
type PromResponse struct {
	Status string `json:"status"`
	Data   struct {
		Result []struct {
			Metric map[string]string `json:"metric"`
			Values [][]interface{}   `json:"values"`
		} `json:"result"`
	} `json:"data"`
}

type LokiResponse struct {
	Status string `json:"status"`
	Data   struct {
		Result []struct {
			Stream map[string]string `json:"stream"`
			Values [][]string        `json:"values"`
		} `json:"result"`
	} `json:"data"`
}

func main() {
	fmt.Println("Starting AQX Normalizer...")

	outDir := "../../telemetry/canonical"
	os.MkdirAll(outDir, 0755)

	outFile, err := os.Create(filepath.Join(outDir, "normalized_telemetry.jsonl"))
	if err != nil {
		panic(err)
	}
	defer outFile.Close()

	totalEvents := 0

	for _, scenario := range scenarios {
		// 1. Process Prometheus
		promPath := fmt.Sprintf("../../telemetry/samples/prometheus/%s.json", scenario)
		if promData, err := os.ReadFile(promPath); err == nil {
			var promMap map[string]PromResponse
			if err := json.Unmarshal(promData, &promMap); err == nil {
				for query, resp := range promMap {
					metricName := strings.Split(query, "{")[0]
					for _, result := range resp.Data.Result {
						for _, val := range result.Values {
							tsRaw, _ := strconv.ParseFloat(fmt.Sprintf("%v", val[0]), 64)
							vRaw, _ := strconv.ParseFloat(fmt.Sprintf("%v", val[1]), 64)
							
							event := createAQXWrapper("prometheus", "metric", tsRaw)
							event.AQX.Event.Payload = map[string]interface{}{
								"metric_name": metricName,
								"value":       vRaw,
								"scenario":    scenario,
							}
							
							b, _ := json.Marshal(event)
							outFile.Write(b)
							outFile.WriteString("\n")
							totalEvents++
						}
					}
				}
			}
		}

		// 2. Process Loki
		lokiPath := fmt.Sprintf("../../telemetry/samples/loki/%s.json", scenario)
		if lokiData, err := os.ReadFile(lokiPath); err == nil {
			var lokiResp LokiResponse
			if err := json.Unmarshal(lokiData, &lokiResp); err == nil {
				for _, result := range lokiResp.Data.Result {
					for _, val := range result.Values {
						tsNano, _ := strconv.ParseFloat(val[0], 64)
						tsRaw := tsNano / 1e9
						
						event := createAQXWrapper("loki", "log", tsRaw)
						event.AQX.Event.Payload = map[string]interface{}{
							"log_line": val[1],
							"scenario": scenario,
						}
						
						b, _ := json.Marshal(event)
						outFile.Write(b)
						outFile.WriteString("\n")
						totalEvents++
					}
				}
			}
		}
	}

	fmt.Printf("AQX Normalization Complete. Generated %d canonical events.\n", totalEvents)
}

func createAQXWrapper(source, eventType string, timestamp float64) AQXWrapper {
	w := AQXWrapper{}
	w.AQX.Version = "1.0"
	w.AQX.Purpose = "Canonical telemetry representation for KubeHeals"
	w.AQX.Input = "Normalized Kubernetes telemetry"
	w.AQX.Output = "Canonical telemetry event"

	w.AQX.Rules.Deterministic = true
	w.AQX.Rules.PreserveTimestamp = true
	w.AQX.Rules.PreserveIdentity = true
	w.AQX.Rules.SchemaVersioned = true
	w.AQX.Rules.NoFeatureEngineering = true
	w.AQX.Rules.NoMLLogic = true

	tsUTC := time.Unix(int64(timestamp), 0).UTC().Format(time.RFC3339)

	w.AQX.Event = AQXEvent{
		EventID:     uuid.New().String(),
		Timestamp:   tsUTC,
		Source:      source,
		Type:        eventType,
		ClusterID:   "kubeheals-lab-cluster",
		Namespace:   "trade-sentinel",
		Workload:    "backend-workload",
		PodID:       "unknown-pod",
		ContainerID: "unknown-container",
		Service:     "backend-service",
		Payload:     make(map[string]interface{}),
	}
	return w
}
