FROM node:20 as build

### Build the app from source ###

WORKDIR /usr/app/build

# Copy the package and package-lock files to the working directory and install dependencies
# We need dev dependencies for the TypeScript compiler and type declarations
COPY package*.json /usr/app/build/
RUN npm ci --save-dev

# Copy the rest of the source. Do this last so that the packages will be cached if the dependencies haven't changed
COPY . /usr/app/build/

# Build the app from source
RUN npm run build

# React is served as static files, a Node runtime would be overkill
FROM nginx:1.24-alpine
# Copy from the build container. This container will not exist at runtime
COPY --from=build /usr/app/build/dist /usr/share/nginx/html
# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the HTTP port
EXPOSE 80
# Nginx handles the entrypoint, no need to specify it here
