# Build stage
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum and download deps
COPY go.mod go.sum ./
RUN go mod download

# Copy backend source
COPY . .

# Build the binary
RUN go build -o server .

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/server .

# Expose port (e.g., 8080)
EXPOSE 8080

# Run the server
CMD ["./server"]
