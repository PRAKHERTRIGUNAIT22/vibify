// Each jam session gets its own "room" — sessionId is the room name.
// Clients join the room after creating/joining a session via the REST routes,
// then everyone in that room receives live broadcasts (queue updates, skips, etc.)

function initJamSocket(io) {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join-room', ({ sessionId, participantNumber }) => {
            socket.join(sessionId);
            console.log(`Socket ${socket.id} (participant #${participantNumber}) joined room ${sessionId}`);

            // Let everyone else in the room know someone new joined
            socket.to(sessionId).emit('participant-joined', { participantNumber });
        });

        socket.on('leave-room', ({ sessionId, participantNumber }) => {
            socket.leave(sessionId);
            socket.to(sessionId).emit('participant-left', { participantNumber });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
            // Note: we don't know which session this socket belonged to here without
            // extra tracking — acceptable for now, can add a socketId -> sessionId map later.
        });
    });
}

module.exports = initJamSocket;