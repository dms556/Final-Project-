const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const Rummy = require('./game');
const Player =  require('./player')

const app = express();

const clientPath = `${__dirname}/../client`;

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

const players = [] 
const lobby = []
let requiredPlayers = 4;

// ==========================
// ===   Event Handling   ===
// ==========================

io.on('connection', (sock) => {

    sock.on('name', (name) => {
        if (players.length === 0) {
            players.push(new Player(sock, sock.id, name, true));
            lobby.push(name)
        }
        else if (players.length < requiredPlayers) {
            players.push(new Player(sock, sock.id, name, false));
            lobby.push(name)
        } else {
            while(players.length > requiredPlayers) {
                players.pop();
                lobby.pop();
            }
        }

        /*
            players.forEach((player) => {
            if (player.id === sock.id) {
                player.playerSignedIn(name);
                lobby.push(name)
            }
            */
        io.emit('lobby', lobby);

        if(requiredPlayers == players.length) {
            io.emit('start'); 
            console.log('everyone is here')
        } else { 
            io.emit('waiting'); 
        }

    });

    sock.on('num players', (data) => {
        requiredPlayers = data;
        if(requiredPlayers == players.length) {
            io.emit('start');
            console.log('the lobby is now full')
        }
    })
});


server.listen(5000, () => {
    console.log('Server started on 5000');
});

