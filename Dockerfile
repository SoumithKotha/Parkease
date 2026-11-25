FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    redis-server \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY Backend/ ./
RUN if [ -f package.json ]; then \
    npm install --omit=dev; \
    else \
    npm init -y && npm install --omit=dev express cors qrcode pg ioredis dotenv; \
    fi

WORKDIR /app

COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3000 5001 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
