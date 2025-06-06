# Use an official Node.js runtime as a parent image
# Using LTS version of Node.js (e.g., 18.x) is a good practice.
# Ensure this matches or is compatible with your project's Node version requirements.
FROM node:18-alpine AS development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
# This takes advantage of Docker's layer caching. These files change less often.
COPY package*.json ./

# Install app dependencies
# Using --only=production can be done for a production build,
# but for development, we often need devDependencies as well (e.g., nodemon).
# If you have a separate build stage for production, you'd use --only=production there.
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
# This should match the PORT environment variable used by your app (e.g., 3000)
EXPOSE ${PORT:-3000}
# The ${PORT:-3000} syntax means use the PORT env var if set, otherwise default to 3000.
# This EXPOSE is documentation; actual port mapping happens in docker-compose or .

# Define the command to run the app
# Using nodemon for development allows for auto-reloading on code changes.
# For a production build, you would typically use "node src/index.js".
CMD [ "npm", "run", "dev" ]

# --- Production Build Stage (Optional but good practice) ---
# If you want a leaner production image, you can add another stage.
# FROM node:18-alpine AS production
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --only=production
# COPY . .
# EXPOSE ${PORT:-3000}
# CMD [ "node", "src/index.js" ]
