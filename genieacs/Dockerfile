FROM node:18-slim

RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install && npm install @tailwindcss/oxide-linux-x64-gnu

COPY . .
RUN git config --global --add safe.directory /app && \
    git config --global user.email "docker@build.local" && \
    git config --global user.name "Docker Build" && \
    git add -A && git commit -m "docker build" || true && \
    npm run build

EXPOSE 3000 7547 7557 7567

# O comando real será sobrescrito pelo docker-compose para cada microsserviço
CMD ["node", "dist/bin/genieacs-cwmp"]
