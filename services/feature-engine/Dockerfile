# Build Stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
# (If we had a go.sum, we would copy it here)
COPY . .
# Build the binary statically
RUN CGO_ENABLED=0 GOOS=linux go build -o feature-engine main.go

# Run Stage (Scratch container - tiny and secure)
FROM scratch
WORKDIR /
COPY --from=builder /app/feature-engine /feature-engine
# Command to run the executable
ENTRYPOINT ["/feature-engine"]
