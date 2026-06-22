FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Comando padrão
CMD ["node", "genieacs-sim"]
