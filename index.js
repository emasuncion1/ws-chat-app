const express = require('express');
const app = express();
const fs = require('fs');
const redis = require('redis');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let credentials;
let client;
const port = process.env.PORT || 8080;

let chatters = [];
let chat_messages = [];

app.use(express.static(__dirname + '/public'));

server.listen(port, () => {
  console.log(`app started. listening on *:${port}`);
});

fs.readFile('credentials.json', 'utf-8', (err, data) => {
  if (err) {
    throw err;
  }

  credentials = JSON.parse(data);
  client = redis.createClient('redis://' + credentials.host + ':' + credentials.port);

  // Flush Redis DB
  client.flushdb();

  client.once('ready', () => {
    client.get('chat_users', (err, reply) => {
      if (reply) {
        chatters = JSON.parse(reply);
      }
    });

    client.get('chat_app_messages', (err, reply) => {
      if (reply) {
        chat_messages = JSON.parse(reply);
      }
    });
  });
});

const regex = /\/[\w\d]/;
const privateServer = io.of(regex);
const publicServer = io.of('/public');

privateServer.on('connection', socket => {
  let socketNum = socket.nsp.name;
  socketNum = socketNum.slice(-1);
  console.log(`${socket.id} connected to server ${socketNum}`);

  socket.broadcast.emit('new user', `User ${socket.id} connected to private server ${socketNum}!`);

  socket.join(`privateS${socketNum}`);

  socket.on('message', msg => {
    io.of(`/private${socketNum}`).in(`privateS${socketNum}`).emit('message', msg);
  });

  socket.on('disconnect', () => {
    socket.leave(`privateS${socketNum}`);
    console.log(`user disconnected from server ${socketNum}`);
  });
});

publicServer.on('connection', socket => {
  console.log(`${socket.id} connected to public server`);
  socket.broadcast.emit('new user', `User ${socket.id} connected to public server`);

  socket.join('publicRoom');

  socket.on('message', msg => {
    console.log(msg);
    io.of('/public').in('publicRoom').emit('message', msg);
  });

  socket.on('disconnect', () => {
    socket.leave('publicRoom');
    console.log('user disconnected from public server');
  });
});
