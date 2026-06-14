FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download
RUN apk add --no-cache gcc musl-dev libwebp-dev build-base

COPY backend/ .
RUN go build -o server ./cmd/main.go

FROM alpine:latest
WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/config ./config

EXPOSE 3000
CMD ["./server"]