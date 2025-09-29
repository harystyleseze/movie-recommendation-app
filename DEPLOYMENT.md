# Deployment Guide

This document provides instructions for deploying the Movie Recommendation App using Docker and CI/CD pipelines.

## Prerequisites

- Docker and Docker Compose installed
- GitHub account with repository access
- Vercel account for frontend deployment
- Render account for backend deployment

## Local Development with Docker

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
```

The development environment includes:
- **Frontend**: React app with hot reload on http://localhost:5173
- **Backend**: Node.js API with nodemon on http://localhost:3000
- **MongoDB**: Database on localhost:27017
- **Nginx**: Reverse proxy on http://localhost:80

### Production Environment

```bash
# Start all services in production mode
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

## Environment Variables

### Development (.env.development)
Create `.env.development` file in the project root:

```env
# Database
MONGODB_URI=mongodb://mongodb:27017/moveere_dev
DB_NAME=moveere_dev

# JWT
JWT_SECRET=your-dev-jwt-secret
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:80
```

### Production (.env.production)
Set the following environment variables in your production environment:

```env
# Database (use your production MongoDB URI)
MONGODB_URI=mongodb://your-prod-db-uri/moveere_prod
DB_NAME=moveere_prod

# JWT (use a strong secret)
JWT_SECRET=your-strong-jwt-secret-key
JWT_EXPIRES_IN=1d

# Server
PORT=3000
NODE_ENV=production

# CORS (your actual frontend URLs)
CORS_ORIGIN=https://your-app.vercel.app,https://your-domain.com
```

## CI/CD Deployment

### Backend Deployment (Render)

1. **Setup Render Account**
   - Create account at render.com
   - Connect your GitHub repository

2. **Configure Environment Variables**
   Set these in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Render will automatically deploy from the `render.yaml` configuration
   - The backend will be available at your Render URL

### Frontend Deployment (Vercel)

1. **Setup Vercel Account**
   - Create account at vercel.com
   - Install Vercel CLI: `npm i -g vercel`
   - Connect your GitHub repository

2. **Configure Environment Variables**
   Set these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.render.com/api
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically deploy from the `vercel.json` configuration
   - The frontend will be available at your Vercel URL

### GitHub Actions

The `.github/workflows/deploy.yml` file automates:
- Running tests on both frontend and backend
- Building the applications
- Deploying to production environments

**Required GitHub Secrets:**
```
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
BACKEND_URL=https://your-backend.render.com
```

## Manual Deployment

### Using Docker in Production

1. **Build and Push Images**
   ```bash
   # Build production images
   docker build -f backend/Dockerfile.prod -t your-registry/movie-app-backend .
   docker build -f frontend/Dockerfile.prod -t your-registry/movie-app-frontend .

   # Push to registry
   docker push your-registry/movie-app-backend
   docker push your-registry/movie-app-frontend
   ```

2. **Deploy to Server**
   ```bash
   # On your production server
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Health Checks

All services include health checks:
- **Frontend**: `GET /health`
- **Backend**: `GET /api/health`
- **Database**: MongoDB ping command

## Monitoring

The production setup includes:
- Container health monitoring
- Automated restart on failure
- Resource limits and reservations
- Log aggregation through Docker

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Configure proper origins for production
3. **Rate Limiting**: Implemented in backend with configurable limits
4. **HTTPS**: Nginx configuration ready for SSL certificates
5. **Database**: Production MongoDB with authentication enabled

## Troubleshooting

### Common Issues

1. **Docker Build Fails**
   - Check Dockerfile syntax
   - Ensure all dependencies are listed in package.json

2. **Service Won't Start**
   - Check environment variables
   - Verify database connectivity
   - Review container logs

3. **CORS Issues**
   - Verify CORS_ORIGIN environment variable
   - Check nginx configuration

4. **Database Connection**
   - Ensure MongoDB is running and accessible
   - Verify connection string format
   - Check network connectivity between containers

### Debug Commands

```bash
# View container logs
docker-compose logs <service-name>

# Access container shell
docker exec -it <container-name> /bin/sh

# Check container status
docker-compose ps

# View resource usage
docker stats
```