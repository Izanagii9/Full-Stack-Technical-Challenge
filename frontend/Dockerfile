# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React application
FROM public.ecr.aws/docker/library/node:18-alpine AS build

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite will embed VITE_API_URL at build time)
RUN npm run build

# Stage 2: Serve with nginx
FROM public.ecr.aws/nginx/nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
