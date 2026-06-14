FROM node:20-alpine AS builder

LABEL org.opencontainers.image.source=https://github.com/maxbrc/photo-portfolio
LABEL org.opencontainers.image.description="Node/React SSR container image for the photo-portfolio application"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3010
CMD ["node", "/app/server/dist/index.js"]