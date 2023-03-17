# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed dependencies
RUN npm install

# Expose the port that the app will listen on
EXPOSE 8000

# Start the app
CMD ["npm", "run", "server"]