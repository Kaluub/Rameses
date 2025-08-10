FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .env ./
COPY app.js ./
COPY classes ./
COPY data ./
COPY interactions ./