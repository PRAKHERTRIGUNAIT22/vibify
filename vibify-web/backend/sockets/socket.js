let ioInstance = null;

function init(server) {
    const { Server } = require('socket.io');
    ioInstance = new Server(server, {
        cors: { origin: '*' }   // fine for development; lock this down in production
    });
    return ioInstance;
}

function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io not initialized yet — call init(server) first.');
    }
    return ioInstance;
}

module.exports = { init, getIO };