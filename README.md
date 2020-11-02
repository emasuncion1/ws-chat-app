# Chat Application

This is an application made using Node.js that integrates [socket.io](https://github.com/socketio/socket.io#readme) for the real-time bidirectional and event-based communication.

This applications aims to demonstrate mesh networking using web sockets.

## Requirements
- Node.js
- Redis server

## Instructions
```bash
# clone the project
git clone https://github.com/emasuncion1/ws-chat-app.git

# Navigate to the directory and install dependencies
cd ws-chat-app

yarn install # if using yarn package manager
### or ###
npm i # if using npm package manager

# Copy the credentials.json.example (for redis config) and fill in the necessary configuration
cp credentials.json.example credentials.json

# Run the server
yarn start

# Open any browser and navigate to localhost:8080
```

### TODO:

- [x] Create an express application
- [x] Create a chat application template (web app) that will use the express backend
- [x] Integrate Socket.io for real-time data communication
- [x] Apply namespace and room on sockets
- [x] Integrate Redis
- [x] Clean up the styling of the web application
- [ ] Dockerize the application
