const express = require('express');
const app = express();
const fs = require('fs');
const redis = require('redis');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let credentials;
let client;
const port = process.env.PORT || 8080;

let privateChat1 = [];
let privateChat2 = [];
let publicChat = [];

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
    client.get('server_chat_1', (err, reply) => {
      if (reply) {
        privateChat1 = JSON.parse(reply);
      }
    });

    client.get('server_chat_2', (err, reply) => {
      if (reply) {
        privateChat2 = JSON.parse(reply);
      }
    });

    client.get('public_chat', (err, reply) => {
      if (reply) {
        publicChat = JSON.parse(reply);
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

  let msg = {data: socketNum === '1' ? privateChat1 : privateChat2};

  socket.emit('new user', msg);
  socket.join(`privateS${socketNum}`);

  socket.on('message', msg => {
    if (socket.nsp.name === '/private1') {
      privateChat1.push(msg);
      client.set('server_chat_1', JSON.stringify(privateChat1));
    } else {
      privateChat2.push(msg);
      client.set('server_chat_2', JSON.stringify(privateChat2));
    }

    io.of(`/private${socketNum}`).in(`privateS${socketNum}`).emit('message', msg);
  });

  socket.on('disconnect', () => {
    socket.leave(`privateS${socketNum}`);
    console.log(`user disconnected from server ${socketNum}`);
  });
});

publicServer.on('connection', socket => {
  console.log(`${socket.id} connected to public server`);

  let msg = {
    msg: `User ${socket.id} connected to public server`,
    data: publicChat
  };

  socket.emit('new user', msg);
  socket.join('publicRoom');

  socket.on('message', msg => {
    publicChat.push(msg);
    client.set('public_chat', JSON.stringify(publicChat));

    io.of('/public').in('publicRoom').emit('message', msg);
  });

  socket.on('disconnect', () => {
    socket.leave('publicRoom');
    console.log('user disconnected from public server');
  });
});
