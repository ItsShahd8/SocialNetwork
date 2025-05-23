# Stage 1: Build Go binary
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

# Copy everything including migration files
COPY . .

RUN go build -o main server.go

# Stage 2: Runtime image
FROM alpine:latest

WORKDIR /app

# Copy built binary
COPY --from=builder /app/main .

# Copy migration files and source structure
COPY --from=builder /app/pkg ./pkg

EXPOSE 8080
CMD ["./main"]
