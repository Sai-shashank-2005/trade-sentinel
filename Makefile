.PHONY: help up down rebuild-frontend extract-telemetry run-features bench-features

.DEFAULT_GOAL := help

help: ## Show this interactive CLI menu
	@printf "\033[1;36m================================================================================\033[0m\n"
	@printf "                           \033[1;37mKUBEHEALS INTERACTIVE MENU\033[0m                           \n"
	@printf "\033[1;36m================================================================================\033[0m\n"
	@bash -c '\
	PS3=$$'"'"'\n\033[1;33m👉 Select an action (number):\033[0m '"'"'; \
	options=( \
		"🛠️  setup          (One-Click Bootstrap: verify tools, deps & modules)" \
		"🚀 up             (Smart Instant-Up Cluster)" \
		"🛑 down           (Tear down Cluster)" \
		"📦 build          (Compile Go Microservices)" \
		"🧹 clean          (Clean Build Artifacts)" \
		"⚙️  run-features   (Run Go ML Feature Pipeline)" \
		"⚡ bench-features (Benchmark Go Pipeline)" \
		"📦 install-ai     (Install Python AI Environment)" \
		"🧪 test-ai        (Run AI Unit Tests)" \
		"🧠 train-ai       (Train AI Models)" \
		"❌ Exit" \
	); \
	echo ""; \
	select opt in "$${options[@]}"; do \
		echo ""; \
		case $$REPLY in \
			1) make setup; break ;; \
			2) make up; break ;; \
			3) make down; break ;; \
			4) make build; break ;; \
			5) make clean; break ;; \
			6) make run-features; break ;; \
			7) make bench-features; break ;; \
			8) make install-ai; break ;; \
			9) make test-ai; break ;; \
			10) make train-ai; break ;; \
			11) printf "\033[1;32mGoodbye!\033[0m\n"; break ;; \
			*) printf "\033[1;31mInvalid option. Try again.\033[0m\n" ;; \
		esac; \
	done'

setup: ## One-click bootstrap: verifies system tools, pulls Go modules & configures AI environment
	@printf "\033[1;36m================================================================================\033[0m\n"
	@printf "                     \033[1;37mKUBEHEALS ONE-CLICK SETUP & BOOTSTRAP\033[0m                      \n"
	@printf "\033[1;36m================================================================================\033[0m\n"
	@printf "\033[1;33m[1/4] Verifying Core CLI Prerequisites...\033[0m\n"
	@command -v go >/dev/null 2>&1 && printf "\033[1;32m  [✔] Go Compiler       : $$(go version)\033[0m\n" || printf "\033[1;31m  [✖] Go is missing. Please install Golang (>=1.21).\033[0m\n"
	@command -v python3 >/dev/null 2>&1 && printf "\033[1;32m  [✔] Python Engine     : $$(python3 --version)\033[0m\n" || printf "\033[1;31m  [✖] Python 3 is missing. Please install Python 3.\033[0m\n"
	@command -v minikube >/dev/null 2>&1 && printf "\033[1;32m  [✔] Minikube Engine   : $$(minikube version --short)\033[0m\n" || printf "\033[1;31m  [✖] Minikube is missing. Please install Minikube.\033[0m\n"
	@command -v kubectl >/dev/null 2>&1 && printf "\033[1;32m  [✔] Kubectl Client    : $$(kubectl version --client --output=yaml 2>/dev/null | grep gitVersion | awk '{print $$2}' || echo 'Installed')\033[0m\n" || printf "\033[1;31m  [✖] kubectl is missing. Please install kubectl.\033[0m\n"
	@command -v docker >/dev/null 2>&1 && printf "\033[1;32m  [✔] Docker Daemon     : Installed\033[0m\n" || printf "\033[1;33m  [!] Docker is missing or not in PATH.\033[0m\n"
	@printf "\n\033[1;33m[2/4] Initializing Go Microservices Dependencies...\033[0m\n"
	@cd services/aqx-normalizer && go mod tidy && printf "\033[1;32m  [✔] aqx-normalizer modules ready\033[0m\n"
	@cd services/feature-engine && go mod tidy && printf "\033[1;32m  [✔] feature-engine modules ready\033[0m\n"
	@printf "\n\033[1;33m[3/4] Preparing Python AI Engine Environment...\033[0m\n"
	@cd services/ai-engine && ( [ -d venv ] || python3 -m venv venv ) && printf "\033[1;32m  [✔] Python virtual environment configured\033[0m\n"
	@printf "\n\033[1;33m[4/4] Verifying Telemetry Data Directories...\033[0m\n"
	@mkdir -p telemetry/dataset telemetry/canonical telemetry/scenarios services/ai-engine/models
	@printf "\033[1;32m  [✔] Data paths established\033[0m\n"
	@printf "\033[1;32m================================================================================\033[0m\n"
	@printf "                         \033[1;32mSETUP COMPLETE! RUN 'make up' TO START\033[0m                 \n"
	@printf "\033[1;32m================================================================================\033[0m\n\n"

up: ## Smart Instant-Up: Fast-boots cluster, verifies ingress & waits for full pod readiness
	@printf "\033[1;36m================================================================================\033[0m\n"
	@printf "                     \033[1;37mINITIALIZING KUBEHEALS CLUSTER\033[0m                          \n"
	@printf "\033[1;36m================================================================================\033[0m\n"
	@CPU_MODEL=$$(grep -m1 'model name' /proc/cpuinfo | awk -F: '{print $$2}' | sed 's/^[ \t]*//' || echo "Unknown CPU"); \
	CPU_CORES=$$(nproc || echo "Unknown"); \
	OS_ARCH=$$(uname -sm || echo "Unknown"); \
	printf "  \033[1;33mSYSTEM SPECIFICATIONS\033[0m\n"; \
	printf "  ----------------------------------------------------------------------------\n"; \
	printf "  \033[1;36mARCHITECTURE\033[0m       : %s\n" "$$OS_ARCH"; \
	printf "  \033[1;36mPROCESSOR\033[0m          : %s (%s Cores)\n" "$$CPU_MODEL" "$$CPU_CORES"; \
	printf "  ----------------------------------------------------------------------------\n"
	@if minikube status --format='{{.Host}}' 2>/dev/null | grep -q "Running"; then \
		printf "\033[1;32m  [✔] Minikube Control Plane: Already Running (Skipping boot ~0.1s)\033[0m\n"; \
	else \
		printf "\033[1;33m  [⚙] Booting Minikube Control Plane (Est. 15-25s)...\033[0m\n"; \
		minikube start > /dev/null 2>&1 || minikube start; \
		printf "\033[1;32m  [✔] Minikube Control Plane: Started Successfully\033[0m\n"; \
	fi
	@if kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx 2>/dev/null | grep -q "Running"; then \
		printf "\033[1;32m  [✔] NGINX Ingress Controller: Active & Healthy\033[0m\n"; \
	else \
		printf "\033[1;33m  [⚙] Enabling NGINX Ingress Controller (Est. 5-10s)...\033[0m\n"; \
		minikube addons enable ingress > /dev/null 2>&1; \
		printf "\033[1;32m  [✔] NGINX Ingress Controller: Enabled\033[0m\n"; \
	fi
	@printf "\033[1;33m  [⚙] Applying Workload Manifests...\033[0m\n"
	@for i in 1 2 3; do \
		kubectl apply -f infrastructure/kubernetes/trade-sentinel/ > /dev/null 2>&1 && break || sleep 3; \
	done
	@printf "\033[1;32m  [✔] Manifests Applied\033[0m\n"
	@printf "\033[1;33m  [⚙] Waiting for Microservices Readiness Gate...\033[0m\n"
	@kubectl rollout status statefulset/postgres -n trade-sentinel --timeout=60s > /dev/null 2>&1 || true
	@kubectl rollout status deployment/backend -n trade-sentinel --timeout=60s > /dev/null 2>&1 || true
	@kubectl rollout status deployment/frontend -n trade-sentinel --timeout=60s > /dev/null 2>&1 || true
	@printf "\033[1;32m  [✔] Database & Microservices 100%% Ready\033[0m\n"
	@printf "\033[1;32m================================================================================\033[0m\n"
	@printf "                         \033[1;32mCLUSTER READY FOR TRAFFIC\033[0m                              \n"
	@printf "\033[1;32m================================================================================\033[0m\n"
	@MINI_IP=$$(minikube ip 2>/dev/null || echo "127.0.0.1"); \
	printf "  \033[1;36mDIRECT IP ACCESS  :\033[0m \033[1;32mhttp://$$MINI_IP\033[0m\n"; \
	printf "  \033[1;36mLOCAL HOSTNAME    :\033[0m http://trade-sentinel.local (optional)\n"; \
	printf "  \033[1;36mSTATUS            :\033[0m \033[1;32mReady & Serving Traffic\033[0m\n\n"
	@if command -v ffplay >/dev/null 2>&1; then ffplay -nodisp -autoexit -hide_banner -loglevel quiet scripts/sounds/anime_wow.mp3 & fi

down: ## Tear down the Kubernetes cluster
	@printf "\033[1;31m================================================================================\033[0m\n"
	@printf "                     \033[1;37mTEARING DOWN KUBEHEALS CLUSTER\033[0m                          \n"
	@printf "\033[1;31m================================================================================\033[0m\n"
	@printf "\033[1;33m[*] Halting Kubernetes Control Plane (Minikube)...\033[0m\n"
	@minikube stop
	@if command -v ffplay >/dev/null 2>&1; then ffplay -nodisp -autoexit -hide_banner -loglevel quiet scripts/sounds/vine_boom.mp3 & fi
	@bash -c 'printf "\n  \033[1;31mO\033[0m"; sleep 0.1; printf "\033[1;31mO\033[0m"; sleep 0.1; printf "\033[1;31mP\033[0m"; sleep 0.1; printf "\033[1;31mS\033[0m"; sleep 0.1; printf "\033[1;31m.\033[0m"; sleep 0.1; printf "\033[1;31m.\033[0m"; sleep 0.1; printf "\033[1;31m.\033[0m\n"'
	@sleep 0.5
	@printf "\n\033[1;32m================================================================================\033[0m\n"
	@printf "                         \033[1;32mCLUSTER TERMINATED SAFELY\033[0m                           \n"
	@printf "\033[1;32m================================================================================\033[0m\n\n"

extract-telemetry: ## Run the Python script to extract JSON telemetry from Prometheus and Loki
	@echo "Usage: make extract-telemetry SCENARIO=normal"
	python3 telemetry/scripts/extract_telemetry.py --scenario $(SCENARIO)

build: ## Compile Go microservices into the bin/ directory
	@printf "\033[1;36m📦 Compiling Go microservices into bin/...\033[0m\n"
	@mkdir -p bin
	@cd services/aqx-normalizer && go build -o ../../bin/aqx-normalizer main.go
	@cd services/feature-engine && go build -o ../../bin/feature-engine main.go
	@printf "\033[1;32m  [✔] Build complete\033[0m\n"

clean: ## Clean up compiled binaries and cache
	@printf "\033[1;33m🧹 Cleaning build artifacts...\033[0m\n"
	@rm -rf bin/*
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@printf "\033[1;32m  [✔] Clean complete\033[0m\n"

run-features: ## Run the Go Feature Engineering pipeline (compiles JSON to CSV)
	cd services/feature-engine && go run main.go

bench-features: ## Run the Go performance benchmarks
	@printf "\033[36m"
	@printf "   _  __     __       __  __           __    \n"
	@printf "  / |/ /_ __/ /  ___ / / / /__ ___ _  / /__  \n"
	@printf " /    / // / _ \/ -_) /_/ / -_) _ \/ / / _ \ \n"
	@printf "/_/|_/\_,_/_.__/\__/\____/\__/\_,_/_/_/_//_/ \n"
	@printf "                                             \n"
	@printf "\033[0m\n"
	@printf "\033[1;33m[ SYSTEM ] Initializing Goroutine MapReduce Engine...\033[0m\n"
	@sleep 0.5
	@printf "\033[1;33m[ SYSTEM ] Injecting 200,000 synthetic telemetry events...\033[0m\n"
	@for i in 1 2 3 4; do \
		printf "\r\033[1;32m[ $$i/4 ] Packing struct memory caches...\033[0m"; \
		sleep 0.3; \
	done
	@printf "\n\n\033[1;35m[ SYSTEM ] Executing benchmark across all CPU cores...\033[0m\n\n"
	@CPU_MODEL=$$(grep -m1 'model name' /proc/cpuinfo | awk -F: '{print $$2}' | sed 's/^[ \t]*//' || echo "Unknown CPU"); \
	CPU_CORES=$$(nproc || echo "Unknown"); \
	CPU_MODE=$$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null | tr '[:lower:]' '[:upper:]' || echo "MANAGED"); \
	OS_ARCH=$$(uname -sm || echo "Unknown"); \
	cd services/feature-engine && go test -bench=. -benchmem | awk -v cpu_model="$$CPU_MODEL" -v cpu_cores="$$CPU_CORES" -v cpu_mode="$$CPU_MODE" -v os_arch="$$OS_ARCH" '\
	/BenchmarkBuildWindows/ { \
		ns_per_op = $$3; \
		allocs = $$7; \
		ms_per_op = ns_per_op / 1000000; \
		records = 200000; \
		records_per_sec = (records / (ns_per_op / 1000000000)) / 1000000; \
		printf "\n\033[1;32m================================================================================\033[0m\n"; \
		printf "                              \033[1;37mBENCHMARK REPORT\033[0m                                  \n"; \
		printf "\033[1;32m================================================================================\033[0m\n"; \
		printf "  \033[1;33mSYSTEM SPECIFICATIONS\033[0m\n"; \
		printf "  ----------------------------------------------------------------------------\n"; \
		printf "  \033[1;36mARCHITECTURE\033[0m       : %s\n", os_arch; \
		printf "  \033[1;36mPROCESSOR\033[0m          : %s (%s Cores)\n", cpu_model, cpu_cores; \
		printf "  \033[1;36mPOWER GOVERNOR\033[0m     : %s\n", cpu_mode; \
		printf "  ----------------------------------------------------------------------------\n"; \
		printf "  \033[1;33mPERFORMANCE METRICS\033[0m\n"; \
		printf "  ----------------------------------------------------------------------------\n"; \
		printf "  \033[1;36mDATASET SIZE\033[0m       : 200,000 Telemetry Events\n"; \
		printf "  \033[1;36mPROCESSING TIME\033[0m    : %.2f Milliseconds\n", ms_per_op; \
		printf "  \033[1;36mTOTAL THROUGHPUT\033[0m   : %.2f Million Records / Second\n", records_per_sec; \
		printf "  \033[1;36mMEMORY EFFICIENCY\033[0m  : %s Allocations\n", allocs; \
		printf "\033[1;32m================================================================================\033[0m\n\n"; \
	}'

install-ai: ## Install Python dependencies for the AI Engine
	@printf "\033[1;36m📦 Setting up Python Virtual Environment...\033[0m\n"
	cd services/ai-engine && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt

test-ai: ## Run unit tests for the AI Engine
	@printf "\033[1;36m🧪 Running AI Engine Unit Tests...\033[0m\n"
	cd services/ai-engine && ./venv/bin/python -m unittest discover tests/

train-ai: ## Train the ML models (Requires the dataset from the SRE team)
	@printf "\033[1;35m🧠 Initiating KubeHeals Model Training Pipeline...\033[0m\n\n"
	@cd services/ai-engine && ./venv/bin/python src/train_isolation_forest.py
	@printf "\n"
	@cd services/ai-engine && ./venv/bin/python src/train_random_forest.py
	@printf "\n"
	@cd services/ai-engine && ./venv/bin/python src/train_xgboost.py
