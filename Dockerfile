# Stage 1: Build Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend & Static Serving
FROM node:20-alpine AS production
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

# Create data folder for persistent lowdb JSON/keys
RUN mkdir -p /app/backend/data && chmod -R 777 /app/backend/data

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "server.js"]
