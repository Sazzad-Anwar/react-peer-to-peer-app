const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const path = require('path');
require('colors');

app.use(express.static(path.join(__dirname, 'build')))

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.js'));
});

io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        socket.broadcast.emit("Call ended");
    });

    socket.on('calluser', ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit('calluser', { signal: signalData, from, name })
    });

    socket.on('answercall', (data) => {
        io.to(data.to).emit('callaccepted', data.signal);
    })
});

server.listen(PORT, () => console.log(`Server is running on Port ${PORT}`.underline.green));