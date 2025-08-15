FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .env .
COPY app.js .
COPY classes ./classes
COPY data ./data
COPY interactions ./interactions