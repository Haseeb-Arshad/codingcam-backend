FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose the port
EXPOSE 3001

# Command to run the app
CMD ["node", "index.js"] 