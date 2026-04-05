@echo off

:: stop and remove old containers (ignore errors if they don't exist)
docker stop zoro sanji nami 2>NUL
docker rm zoro sanji nami 2>NUL

:: build the images
docker build -f Dockerfile-Zoro -t zoro-backend ./backend
docker build -f Dockerfile-Sanji -t sanji-genai ./genAI
docker build -f Dockerfile-Nami -t nami-frontend ./frontend

:: create docker network (ignore if already exists)
docker network create strawhats 2>NUL

:: start the containers
docker run -d --env-file .env --network strawhats --name sanji -p 4000:4000 sanji-genai
docker run -d --env-file .env --network strawhats --name zoro -p 3000:3000 zoro-backend
docker run -d --network strawhats --name nami -p 8080:80 nami-frontend

:: wait for containers to be ready
timeout /t 3 /nobreak >NUL

:: health checks
echo --- Health Checks ---
curl -s http://localhost:4000/health
echo.
curl -s http://localhost:3000/health
echo.
:: Since Windows doesn't easily support 'head', we'll just check if it's reachable.
curl -s -I http://localhost:8080 | findstr HTTP
echo.
