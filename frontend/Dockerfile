# Use an official Node.js runtime as a parent image
# Choose a version compatible with your React app and dependencies (e.g., LTS like 18.x)
FROM node:18-alpine AS development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
# This leverages Docker's layer caching
COPY package*.json ./

# Install app dependencies
# For React development, we typically need all dependencies.
RUN npm install

# Bundle app source
# This copies all files from the frontend directory into the container's WORKDIR
COPY . .

# Expose the port the React development server runs on
# Create React App typically uses 3000 by default, but can be configured via PORT env var.
# Let's assume it might be different from the backend, e.g., 3001 if backend is 3000.
# The EXPOSE instruction is for documentation; actual mapping is in docker-compose.
EXPOSE ${PORT:-3001}
# Note: create-react-app's start script often defaults to port 3000. If backend uses 3000,
# one of them will need to be configured to use a different port in docker-compose.yml.
# Or, ensure PORT env var is set appropriately for this container.

# Define the command to run the app (React development server)
CMD [ "npm", "start" ]

# --- Production Build Stage (Example) ---
# FROM node:18-alpine AS builder
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
#
# # Stage 2: Serve the static files using Nginx
# FROM nginx:stable-alpine
# COPY --from=builder /usr/src/app/build /usr/share/nginx/html
# # Copy a custom nginx config if needed, e.g., for SPA routing
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
