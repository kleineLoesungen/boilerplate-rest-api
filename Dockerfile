FROM node:current-alpine3.18 AS BUILD_IMAGE

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
RUN npx tsc

# Next stage
FROM node:current-alpine3.18

# Create app directory
WORKDIR /usr/src/app

# Copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/build ./

# Install app dependencies (only production)
COPY package*.json ./
RUN npm install --omit=dev

# Remove unnecessary files from dependencies
RUN npm prune --production

# EXPOSE 3000

CMD [ "node", "server.js" ]