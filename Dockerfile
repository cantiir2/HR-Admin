# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY Frontend/package.json Frontend/package-lock.json* ./Frontend/
COPY Backend/package.json ./Backend/
RUN cd Frontend && npm install
COPY Frontend/ ./Frontend/
# Vite outDir is ../Backend/public, so it outputs to /build/Backend/public
RUN cd Frontend && npm run build

# Stage 2: Production Backend
FROM node:22-alpine AS production
WORKDIR /app

# Copy backend source
COPY Backend/package.json Backend/package-lock.json* ./
RUN npm install --omit=dev
COPY Backend/ ./

# Copy frontend build output from stage 1
COPY --from=frontend-build /build/Backend/public ./public

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "index.js"]
