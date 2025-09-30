# Production-Ready Deployment Guide

This comprehensive guide covers deploying the Movie Recommendation App with enterprise-grade security, scalability, and operational best practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Requirements](#security-requirements)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [Production Architecture](#production-architecture)
6. [Database Security & Management](#database-security--management)
7. [Container Security](#container-security)
8. [SSL/TLS Configuration](#ssltls-configuration)
9. [Monitoring & Observability](#monitoring--observability)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Backup & Disaster Recovery](#backup--disaster-recovery)
12. [Performance Optimization](#performance-optimization)
13. [Incident Response](#incident-response)
14. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development

- Docker 24.0+ and Docker Compose v2.20+
- Node.js 20.18+ with npm 10+
- Git 2.40+

### Production

- **Infrastructure**: Kubernetes cluster or Docker Swarm
- **Database**: MongoDB Atlas (recommended) or self-hosted MongoDB 7.0+
- **SSL Certificates**: Let's Encrypt or commercial CA
- **Secrets Management**: HashiCorp Vault, AWS Secrets Manager, or Kubernetes Secrets
- **Monitoring**: Prometheus + Grafana stack
- **CI/CD**: GitHub Actions with production secrets
- **Container Registry**: Docker Hub, ECR, or private registry

The current CI/CD pipeline does not automatically push to Docker registry yet. Let me clarify what's currently set up
versus what would happen in production:

Current Status:

✅ What's Working:

- Local Docker builds (frontend & backend containers build successfully)
- CI/CD pipeline structure is complete
- GitHub Actions workflow file exists

❌ What's Missing for Auto-Push:

- The pipeline needs to be triggered by an actual Git push to main or develop branch
- Docker registry authentication secrets need to be configured in GitHub
- The workflow needs to run in GitHub Actions (not locally)

How Docker Registry Push Works:

The CI/CD pipeline (/.github/workflows/ci-cd.yml) is configured to:

1. Build Docker images during CI
2. Push to GitHub Container Registry (GHCR) automatically
3. Deploy to production (Render/Vercel)

But this only happens when:

- Code is pushed to main or develop branch
- GitHub Actions runs the workflow
- Proper secrets are configured

To Enable Auto-Push:

You would need to:

1. Push code to GitHub (triggers the workflow)
2. Configure GitHub secrets:

   - GITHUB_TOKEN (usually automatic)
   - Any deployment secrets for Render/Vercel

3. The workflow runs automatically and pushes to ghcr.io/your-username/movie-recommendation-app

Currently, we've only tested the pipeline locally - the actual Docker registry push happens when the GitHub Actions workflow runs in the cloud.

## Security Requirements

### Secret Generation

Generate cryptographically secure secrets for production:

```bash
# JWT Secret (256-bit)
openssl rand -base64 32

# MongoDB Admin Password (32 characters, mixed case + symbols)
openssl rand -base64 24 | tr -d "=+/" | cut -c1-32

# API Keys (64 characters)
openssl rand -hex 32
```

### Environment Variables Security

**❌ NEVER DO:**

- Commit secrets to version control
- Use predictable passwords
- Share secrets via email/chat
- Use development secrets in production

**✅ ALWAYS DO:**

- Use secrets management systems
- Rotate secrets regularly (every 90 days)
- Use different secrets per environment
- Implement least-privilege access

## Environment Setup

### Development (.env.development)

```env
# Database (No authentication for local development)
MONGODB_URI=mongodb://mongodb:27017/moveere_dev
DB_NAME=moveere_dev

# JWT Configuration
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:80,http://localhost:3000,http://localhost:5173

# API Configuration
API_BASE_URL=http://localhost/api

# Logging
LOG_LEVEL=debug

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Production (.env.production)

```env
# Database (WITH AUTHENTICATION - REQUIRED)
MONGODB_URI=mongodb://moveere_prod_user:${MONGODB_PASSWORD}@mongodb:27017/moveere_prod?authSource=moveere_prod&ssl=true&replicaSet=rs0
DB_NAME=moveere_prod

# JWT Configuration (MUST BE UNIQUE)
JWT_SECRET=${JWT_SECRET_FROM_VAULT}
JWT_EXPIRES_IN=1d

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration (WHITELIST ONLY PRODUCTION DOMAINS)
CORS_ORIGIN=https://yourapp.vercel.app,https://yourdomain.com

# API Configuration
API_BASE_URL=https://api.yourdomain.com

# Security Headers
HELMET_ENABLED=true
TRUST_PROXY=1

# External APIs
TMDB_API_KEY=${TMDB_API_KEY}
OMDB_API_KEY=${OMDB_API_KEY}

# Logging
LOG_LEVEL=warn
SENTRY_DSN=${SENTRY_DSN}

# Security (PRODUCTION VALUES)
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000

# Rate Limiting (STRICTER)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50
LOGIN_RATE_LIMIT_MAX=5

# Performance
MONGODB_POOL_SIZE=10
MONGODB_BUFFER_MAX_ENTRIES=0
```

## Local Development

### Development Environment

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up --build

# Start in detached mode
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Clean up volumes (reset database)
docker-compose -f docker-compose.dev.yml down -v
```

**Development Services:**

- **Frontend**: React + Vite with HMR on http://localhost:5173
- **Backend**: Node.js + nodemon with hot reload on http://localhost:3000
- **MongoDB**: Local instance on localhost:27017 (no auth)
- **Nginx**: Reverse proxy on http://localhost:80

## Production Architecture

### High-Availability Setup

```yaml
# docker-compose.prod.yml (Enhanced)
version: "3.8"

services:
  # MongoDB Replica Set (Primary)
  mongodb-primary:
    image: mongo:7.0.8
    restart: always
    command: mongod --replSet rs0 --auth --bind_ip_all
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${DB_NAME}
    volumes:
      - mongodb_primary_data:/data/db
      - ./scripts/mongo-init-prod.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - backend-network
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
        reservations:
          memory: 1G
          cpus: "0.5"

  # MongoDB Replica Set (Secondary)
  mongodb-secondary:
    image: mongo:7.0.8
    restart: always
    command: mongod --replSet rs0 --auth --bind_ip_all
    depends_on:
      - mongodb-primary
    volumes:
      - mongodb_secondary_data:/data/db
    networks:
      - backend-network

  # Backend (Multiple Instances)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
    env_file:
      - .env.production
    depends_on:
      - mongodb-primary
    networks:
      - backend-network
      - frontend-network
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: "0.5"
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
    networks:
      - frontend-network
    deploy:
      replicas: 2

  # Load Balancer (Nginx)
  nginx:
    image: nginx:1.25.5-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    networks:
      - frontend-network
    depends_on:
      - backend
      - frontend

  # Redis (Session Store & Caching)
  redis:
    image: redis:7.2-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend-network

networks:
  frontend-network:
    driver: overlay
  backend-network:
    driver: overlay
    internal: true

volumes:
  mongodb_primary_data:
  mongodb_secondary_data:
  redis_data:
```

## Database Security & Management

### MongoDB Production Setup

1. **Create Production Init Script** (`scripts/mongo-init-prod.js`):

```javascript
// MongoDB production initialization script
print("Setting up production database...");

db = db.getSiblingDB("admin");

// Create application database
db = db.getSiblingDB(process.env.DB_NAME);

// Create application user with minimal privileges
db.createUser({
  user: process.env.MONGODB_APP_USER,
  pwd: process.env.MONGODB_APP_PASSWORD,
  roles: [
    {
      role: "readWrite",
      db: process.env.DB_NAME,
    },
  ],
});

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { bsonType: "string", minLength: 2, maxLength: 50 },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
        password: { bsonType: "string", minLength: 60 },
        role: { enum: ["user", "admin"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
});

// Create indexes for performance and uniqueness
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ "preferences.genres": 1 });

db.movies.createIndex({ title: "text", description: "text" });
db.movies.createIndex({ genres: 1 });
db.movies.createIndex({ releaseYear: 1 });
db.movies.createIndex({ rating: 1 });
db.movies.createIndex({ imdbId: 1 }, { unique: true, sparse: true });

db.recommendations.createIndex({ userId: 1, createdAt: -1 });
db.recommendations.createIndex({ movieId: 1 });
db.recommendations.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
); // 30 days

print("Production database setup completed successfully");
```

2. **MongoDB Replica Set Configuration**:

```bash
# Initialize replica set
docker exec -it mongodb-primary mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb-primary:27017', priority: 1 },
    { _id: 1, host: 'mongodb-secondary:27017', priority: 0.5 }
  ]
})
"
```

3. **Database Backup Strategy**:

```bash
#!/bin/bash
# scripts/backup-mongodb.sh

set -euo pipefail

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="moveere_backup_${DATE}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Perform backup
docker exec mongodb-primary mongodump \
  --host mongodb-primary:27017 \
  --db "${DB_NAME}" \
  --username "${MONGODB_APP_USER}" \
  --password "${MONGODB_APP_PASSWORD}" \
  --authenticationDatabase "${DB_NAME}" \
  --out "/backup/${BACKUP_NAME}"

# Compress backup
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "/tmp" "${BACKUP_NAME}"

# Upload to cloud storage (AWS S3 example)
aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://your-backup-bucket/mongodb/"

# Clean up old backups (keep last 30 days)
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_NAME}.tar.gz"
```

## Container Security

### Production Dockerfiles

**Backend Dockerfile.prod**:

```dockerfile
# Multi-stage build for production
FROM node:20.18.1-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20.18.1-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Remove development files
RUN rm -rf .env* *.md .git* tests/ docs/

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Security: Run with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
```

**Frontend Dockerfile.prod**:

```dockerfile
# Multi-stage build for production
FROM node:20.18.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:1.25.5-alpine AS production

# Install security updates
RUN apk update && apk upgrade

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

# Create non-root user for Nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Change ownership
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html /var/cache/nginx /var/run

# Switch to non-root user
USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Container Security Scanning

```bash
# Scan images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image movie-app-backend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image movie-app-frontend:latest
```

## SSL/TLS Configuration

### Nginx Production Configuration

**nginx/nginx.prod.conf**:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Security: Hide server version
server_tokens off;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=global:10m rate=50r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Upstream backends
    upstream backend_api {
        least_conn;
        server backend-1:3000 max_fails=3 fail_timeout=30s;
        server backend-2:3000 max_fails=3 fail_timeout=30s;
        server backend-3:3000 max_fails=3 fail_timeout=30s;
    }

    upstream frontend_app {
        least_conn;
        server frontend-1:80 max_fails=3 fail_timeout=30s;
        server frontend-2:80 max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

        # Global rate limiting
        limit_req zone=global burst=100 nodelay;

        # Security: Deny access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://backend_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### SSL Certificate Setup

```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Using Certbot for Let's Encrypt
certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## Monitoring & Observability

### Prometheus Configuration

**monitoring/prometheus.yml**:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: "backend"
    static_configs:
      - targets: ["backend:3000"]
    metrics_path: "/api/metrics"
    scrape_interval: 30s

  - job_name: "nginx"
    static_configs:
      - targets: ["nginx:9113"]

  - job_name: "mongodb"
    static_configs:
      - targets: ["mongodb-exporter:9216"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

### Alert Rules

**monitoring/alert_rules.yml**:

```yaml
groups:
  - name: application_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseConnectionFailure
        expr: mongodb_up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "MongoDB is down"
          description: "MongoDB has been down for more than 2 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"
```

### Application Metrics (Backend)

Add to your Express app:

```javascript
const prometheus = require("prom-client");

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "status_code", "endpoint"],
});

const httpRequestsTotal = new prometheus.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "status_code", "endpoint"],
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, res.statusCode, endpoint)
      .observe(duration);

    httpRequestsTotal.labels(req.method, res.statusCode, endpoint).inc();
  });

  next();
});

// Metrics endpoint
app.get("/api/metrics", (req, res) => {
  res.set("Content-Type", prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

## CI/CD Pipeline

### GitHub Actions Production Workflow

**.github/workflows/production.yml**:

```yaml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: "trivy-results.sarif"

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: security-scan

    services:
      mongodb:
        image: mongo:7.0.8
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.18.1"
          cache: "npm"
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install Backend Dependencies
        run: |
          cd backend
          npm ci

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Run Backend Tests
        run: |
          cd backend
          npm run test:coverage
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test-secret

      - name: Run Frontend Tests
        run: |
          cd frontend
          npm run test:coverage

      - name: Upload Backend Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

      - name: Upload Frontend Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  build-and-push:
    name: Build and Push Images
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile.prod
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile.prod
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

          # Update image tags in k8s manifests
          sed -i "s|IMAGE_TAG|${{ github.sha }}|g" k8s/production/*.yaml

          # Apply manifests
          kubectl apply -f k8s/production/

          # Wait for rollout
          kubectl rollout status deployment/backend-deployment -n production
          kubectl rollout status deployment/frontend-deployment -n production

      - name: Run Post-Deployment Tests
        run: |
          # Health check
          curl -f https://api.yourdomain.com/api/health

          # Smoke tests
          npm run test:e2e:production
```

## Backup & Disaster Recovery

### Automated Backup Strategy

**scripts/backup-strategy.sh**:

```bash
#!/bin/bash
# Comprehensive backup strategy

set -euo pipefail

# Configuration
BACKUP_ROOT="/backups"
S3_BUCKET="your-backup-bucket"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/backup.log
}

backup_mongodb() {
    log "Starting MongoDB backup..."

    local backup_dir="${BACKUP_ROOT}/mongodb/${DATE}"
    mkdir -p "${backup_dir}"

    # Backup with compression
    docker exec mongodb-primary mongodump \
        --host mongodb-primary:27017 \
        --db "${DB_NAME}" \
        --username "${MONGODB_APP_USER}" \
        --password "${MONGODB_APP_PASSWORD}" \
        --authenticationDatabase "${DB_NAME}" \
        --gzip \
        --out "${backup_dir}"

    # Create archive
    tar -czf "${BACKUP_ROOT}/mongodb_${DATE}.tar.gz" -C "${BACKUP_ROOT}/mongodb" "${DATE}"
    rm -rf "${backup_dir}"

    log "MongoDB backup completed: mongodb_${DATE}.tar.gz"
}

backup_application_data() {
    log "Starting application data backup..."

    # Backup uploaded files, logs, etc.
    tar -czf "${BACKUP_ROOT}/appdata_${DATE}.tar.gz" \
        /app/uploads \
        /app/logs \
        /etc/nginx/ssl

    log "Application data backup completed: appdata_${DATE}.tar.gz"
}

upload_to_cloud() {
    log "Uploading backups to cloud storage..."

    aws s3 sync "${BACKUP_ROOT}/" "s3://${S3_BUCKET}/backups/" \
        --exclude "*" \
        --include "*_${DATE}.tar.gz" \
        --storage-class STANDARD_IA

    log "Cloud upload completed"
}

cleanup_old_backups() {
    log "Cleaning up old backups..."

    # Local cleanup
    find "${BACKUP_ROOT}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

    # Cloud cleanup (using lifecycle policy is preferred)
    aws s3 ls "s3://${S3_BUCKET}/backups/" --recursive | \
        while read -r line; do
            file_date=$(echo "$line" | awk '{print $1}')
            file_name=$(echo "$line" | awk '{print $4}')

            if [[ $(date -d "$file_date" +%s) -lt $(date -d "-${RETENTION_DAYS} days" +%s) ]]; then
                aws s3 rm "s3://${S3_BUCKET}/${file_name}"
                log "Deleted old backup: ${file_name}"
            fi
        done

    log "Cleanup completed"
}

# Main execution
main() {
    log "Starting backup process..."

    backup_mongodb
    backup_application_data
    upload_to_cloud
    cleanup_old_backups

    log "Backup process completed successfully"
}

# Error handling
trap 'log "Backup failed with error on line $LINENO"' ERR

main "$@"
```

### Disaster Recovery Plan

**scripts/disaster-recovery.sh**:

```bash
#!/bin/bash
# Disaster recovery restoration script

set -euo pipefail

BACKUP_DATE="${1:-latest}"
S3_BUCKET="your-backup-bucket"
RESTORE_DIR="/tmp/restore"

restore_from_backup() {
    log "Starting disaster recovery for date: ${BACKUP_DATE}"

    # Download backups from cloud
    if [[ "${BACKUP_DATE}" == "latest" ]]; then
        MONGODB_BACKUP=$(aws s3 ls "s3://${S3_BUCKET}/backups/" --recursive | \
            grep "mongodb_" | sort | tail -1 | awk '{print $4}')
    else
        MONGODB_BACKUP="backups/mongodb_${BACKUP_DATE}.tar.gz"
    fi

    mkdir -p "${RESTORE_DIR}"
    aws s3 cp "s3://${S3_BUCKET}/${MONGODB_BACKUP}" "${RESTORE_DIR}/"

    # Extract and restore MongoDB
    cd "${RESTORE_DIR}"
    tar -xzf "$(basename ${MONGODB_BACKUP})"

    # Stop current MongoDB
    docker-compose -f docker-compose.prod.yml stop mongodb-primary

    # Restore database
    docker run --rm \
        -v "${RESTORE_DIR}:/backup" \
        -v "mongodb_primary_data:/data/db" \
        mongo:7.0.8 \
        mongorestore --drop /backup/$(basename ${MONGODB_BACKUP} .tar.gz)

    # Restart services
    docker-compose -f docker-compose.prod.yml up -d

    log "Disaster recovery completed"
}

restore_from_backup
```

## Performance Optimization

### Database Optimization

```javascript
// backend/src/config/database.js (Enhanced)
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // Buffer settings
      bufferMaxEntries: parseInt(process.env.MONGODB_BUFFER_MAX_ENTRIES) || 0,
      bufferCommands: false,

      // Write concern for production
      writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 1000,
      },

      // Read preference
      readPreference: "primaryPreferred",

      // Compression
      compressors: ["zlib"],
    });

    // Enable monitoring
    conn.connection.on("connected", () => {
      console.log("📦 MongoDB Connected successfully");
    });

    conn.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    conn.connection.on("disconnected", () => {
      console.log("📦 MongoDB disconnected");
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Caching Strategy

```javascript
// backend/src/middleware/cache.middleware.js
const redis = require("redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("Redis server refused connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await client.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json;
      res.json = function (data) {
        if (res.statusCode === 200) {
          client.setex(key, duration, JSON.stringify(data));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};

module.exports = { cache };
```

## Incident Response

### Runbook for Common Issues

**1. Database Connection Issues**:

```bash
# Check MongoDB status
docker exec mongodb-primary mongosh --eval "rs.status()"

# Check connection pool
docker exec backend node -e "
const mongoose = require('mongoose');
console.log('Pool size:', mongoose.connection.db?.serverConfig?.poolSize);
"

# Restart MongoDB cluster
docker-compose -f docker-compose.prod.yml restart mongodb-primary mongodb-secondary
```

**2. High Memory Usage**:

```bash
# Check container memory usage
docker stats --no-stream

# Check Node.js heap usage
docker exec backend node -e "
console.log('Memory usage:', process.memoryUsage());
console.log('Heap used:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
"

# Scale backend services
docker service scale production_backend=5
```

**3. SSL Certificate Expiry**:

```bash
# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -dates

# Renew Let's Encrypt certificate
certbot renew --force-renewal

# Reload Nginx
docker exec nginx nginx -s reload
```

### Alert Response Procedures

```yaml
# monitoring/alertmanager.yml
global:
  smtp_smarthost: "localhost:587"
  smtp_from: "alerts@yourdomain.com"

route:
  group_by: ["alertname"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: "web.hook"

receivers:
  - name: "web.hook"
    email_configs:
      - to: "ops-team@yourdomain.com"
        subject: "[ALERT] {{ .GroupLabels.alertname }}"
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Severity: {{ .Labels.severity }}
          {{ end }}
    slack_configs:
      - api_url: "YOUR_SLACK_WEBHOOK_URL"
        channel: "#ops-alerts"
        title: "Production Alert"
        text: "{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
```

## Troubleshooting

### Debugging Commands

```bash
# Check all service status
docker-compose -f docker-compose.prod.yml ps

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Check resource usage
docker system df
docker system prune -f

# Network debugging
docker network ls
docker network inspect production_backend-network

# Database debugging
docker exec -it mongodb-primary mongosh
> use moveere_prod
> db.stats()
> db.currentOp()

# Backend debugging
docker exec -it backend npm run debug

# Check SSL certificate
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Performance Debugging

```bash
# Monitor Node.js performance
docker exec backend node --inspect=0.0.0.0:9229 src/server.js

# MongoDB slow query analysis
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()

# Network latency check
docker exec nginx ping -c 4 backend

# Memory leak detection
docker exec backend node --heapdump-on-signal=SIGUSR2 src/server.js
kill -USR2 $(docker exec backend pidof node)
```

### Log Analysis

```bash
# Aggregate error logs
docker-compose logs 2>&1 | grep -i error | tail -20

# Monitor HTTP response codes
docker exec nginx tail -f /var/log/nginx/access.log | awk '{print $9}' | sort | uniq -c

# Database query analysis
docker exec mongodb-primary mongosh --eval "
db.runCommand({
  currentOp: true,
  '$all': true
}).inprog.filter(op => op.secs_running > 5)
"
```

---

## Security Checklist

- [ ] All secrets stored in secure vault
- [ ] MongoDB authentication enabled in production
- [ ] SSL/TLS certificates properly configured
- [ ] Rate limiting implemented and tested
- [ ] Container images scanned for vulnerabilities
- [ ] Non-root users in all containers
- [ ] Security headers implemented
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (NoSQL injection)
- [ ] Regular security updates scheduled

## Operational Checklist

- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented and tested
- [ ] Disaster recovery plan documented
- [ ] Performance baselines established
- [ ] Log aggregation configured
- [ ] Health checks implemented
- [ ] CI/CD pipeline secured
- [ ] Documentation up to date
- [ ] Team training completed
- [ ] Incident response procedures defined

---

This deployment guide provides enterprise-grade security, monitoring, and operational procedures for production deployment. Regular reviews and updates of these procedures are essential for maintaining security and reliability.
