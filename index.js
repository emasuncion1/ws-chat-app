const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {path: `${process.env.PATH}`});
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', socket => {
  console.log('a user connected');
  socket.broadcast.emit('new user');

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`App running on *:${port}`);
});
