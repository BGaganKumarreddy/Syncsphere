# Docker Quick Reference Guide

## 🐳 Essential Docker Commands

### Project Setup & Running

```bash
# Start all services (development)
docker-compose up -d

# Start with rebuilding images
docker-compose up -d --build

# Start services in foreground (see logs)
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Production setup
docker-compose -f docker-compose.prod.yml up -d
```

### Viewing Logs

```bash
# All services logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service logs
docker-compose logs backend
docker-compose logs frontend

# Last 50 lines of backend logs
docker-compose logs --tail=50 backend

# Logs since last 10 minutes
docker-compose logs --since 10m
```

### Managing Containers

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker ps -a

# View detailed container info
docker inspect <container_id>

# Execute command in running container
docker-compose exec backend npm run seed

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend bash

# View resource usage
docker stats

# View detailed image info
docker image inspect syncsphere-backend:latest
```

### Building Images

```bash
# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache

# Build all services
docker-compose build

# Build individual Dockerfile
docker build -t syncsphere-backend:latest ./server
docker build -t syncsphere-frontend:latest ./client

# Build with build args
docker build --build-arg VITE_API_URL=http://api.example.com -t syncsphere-frontend:latest ./client
```

### Cleaning Up

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused networks
docker network prune

# Remove all unused volumes
docker volume prune

# Complete cleanup (containers, images, networks, volumes)
docker system prune -a

# Remove specific image
docker rmi <image_id>

# Remove specific container
docker rm <container_id>
```

### Network & Connectivity

```bash
# List networks
docker network ls

# Inspect network
docker network inspect syncsphere-network

# Check container IP
docker inspect -f '{{.NetworkSettings.IPAddress}}' <container_id>

# Test connectivity between containers
docker-compose exec backend ping frontend
```

### Debugging

```bash
# Check container logs for errors
docker-compose logs backend 2>&1 | grep -i error

# View environment variables in container
docker-compose exec backend printenv

# Check port bindings
docker port <container_id>

# Network troubleshooting
docker network inspect syncsphere-network

# Check container health
docker inspect --format='{{.State.Health.Status}}' <container_id>

# View container processes
docker top <container_id>
```

### Pushing to Registry

```bash
# Tag image
docker tag syncsphere-backend:latest username/syncsphere-backend:latest

# Login to Docker Hub
docker login

# Push image
docker push username/syncsphere-backend:latest

# Pull image
docker pull username/syncsphere-backend:latest
```

## 🔧 Docker Compose Overrides

### Development Override
Create `docker-compose.override.yml` for local development customizations:

```yaml
services:
  backend:
    environment:
      - DEBUG=true
    volumes:
      - ./server:/app
```

### Production Override
Use `docker-compose.prod.yml` for production deployment

## 📊 Docker File Sizes

Check built image sizes:

```bash
docker images
# REPOSITORY            TAG    SIZE
# syncsphere-frontend   latest ~100MB
# syncsphere-backend    latest ~400MB
```

### Optimize Image Size

```bash
# Use alpine base images (already done)
# Remove build dependencies
# Use multi-stage builds (already done)
```

## 🚨 Common Issues & Solutions

### Port Already in Use

**Issue:** `bind: address already in use`

```bash
# Find process using port
lsof -i :5000        # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check health
docker inspect syncsphere-backend | grep -A 10 Health

# Rebuild
docker-compose up -d --build --no-cache
```

### Network Connectivity Issues

```bash
# Restart network
docker network prune
docker-compose down
docker-compose up -d

# Check DNS
docker-compose exec backend nslookup frontend
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

## 📚 Useful Aliases

Add to your shell profile (~/.bash_profile, ~/.zshrc, etc.):

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dce='docker-compose exec'
alias dcp='docker-compose ps'
```

Usage:
```bash
dc up -d              # Start services
dcl backend           # View backend logs
dce backend npm test  # Run tests
dcd                   # Stop services
```

## 🔍 Monitoring Commands

```bash
# Real-time container stats
watch docker stats

# Memory usage
docker stats --no-stream

# CPU usage
docker stats --no-stream | awk '{print $1, $2}'

# Storage usage
docker system df -v
```

## 📖 More Resources

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/compose-file-v3/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

For comprehensive deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)
