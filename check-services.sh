#!/bin/bash

echo "🔍 Checking Docker Compose Services Status..."
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker ps --filter "name=ecommerce" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Could not check containers"

echo ""
echo "🌐 Service URLs:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "  Traefik:   http://localhost:8090 (if working)"
echo ""

# Test backend
echo "🧪 Testing Backend..."
if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "  ✅ Backend is responding"
else
    echo "  ❌ Backend is not responding"
fi

# Test frontend
echo "🧪 Testing Frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "  ✅ Frontend is responding"
else
    echo "  ❌ Frontend is not responding"
fi

echo ""
echo "💡 If Traefik errors appear but services work, you can ignore them."
echo "   Access services directly via their ports (5173, 8000)"

