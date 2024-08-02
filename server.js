const { PeerServer } = require('peer');
const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();

// Set up the PeerServer with Express and WebSocketServer
const peerServer = PeerServer({
  port: 9000,
  path: '/myapp',
  createWebSocketServer: (options) => {
    return new WebSocketServer(options);
  },
});

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.send('PeerServer is running');
});

app.listen(9001, () => {
  console.log('Server running on port 9001 and PeerServer running on port 9000');
});
