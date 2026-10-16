FROM golang:1.25-alpine AS builder
WORKDIR /app

LABEL org.opencontainers.image.source=https://github.com/maxbrc/photo-portfolio
LABEL org.opencontainers.image.description="Go backend container image for the photo-portfolio application"
LABEL org.opencontainers.image.licenses=MIT

COPY backend/go.mod backend/go.sum ./
RUN go mod download
RUN apk add --no-cache gcc musl-dev libwebp-dev build-base

COPY backend/ .
RUN go build -o server ./cmd/main.go

FROM alpine:latest
WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/config ./config

ENV NODE_URL http://frontend:3100
ENV DB_HOST db

EXPOSE 3000
CMD ["./server"]