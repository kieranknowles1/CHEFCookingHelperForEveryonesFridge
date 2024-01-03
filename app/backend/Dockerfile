# Latest LTS version as of 2024-01-03
FROM node:20

### Build the app from source ###

# Make a directory for the app and use it as the working directory for the rest of the RUN commands
RUN mkdir --parents /usr/app /data
WORKDIR /usr/app

# Copy the package and package-lock files to the working directory and install dependencies
# We need dev dependencies for the TypeScript compiler and type declarations
COPY package*.json /usr/app
RUN npm ci --save-dev

# Copy the rest of the source. Do this last so that the packages will be cached if the dependencies haven't changed
COPY . /usr/app

# Make sure all the tests pass
RUN npm test

# Build the app from source
RUN npm run build

### Prepare the app for production ###

# Remove all dev dependencies and source files
RUN npm prune --omit=dev && rm -rf src tsconfig.json build/tests

# Give the node user ownership of everything in the working directory
RUN chown -R node:node /usr/app /data
# Switch to the node user, this is more secure than running as root
USER node

# Expose the port that the app will listen on. This environment variable is exposed to the app in environment.ts
EXPOSE ${CHEF_PORT}
CMD ["npm", "start"]
