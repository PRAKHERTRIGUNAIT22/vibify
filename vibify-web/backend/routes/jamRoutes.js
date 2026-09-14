const express = require('express');
const router = express.Router();
const JamSession = require('../models/JamSession');
const Song = require('../models/Song');
const { generateJoinCode } = require('../utils/joinCode');
let getIO;
try {
    getIO = require('../sockets/socket').getIO;
} catch (e) {
    getIO = () => null;
}

// POST /api/jam/create — starts a new session, creator becomes Host (Participant #1)
router.post('/create', async (req, res) => {
    try {
        const { socketId } = req.body;
        if (!socketId) return res.status(400).json({ error: 'socketId is required' });

        let joinCode;
        let isUnique = false;
        // Regenerate on the rare chance of a collision
        while (!isUnique) {
            joinCode = generateJoinCode();
            const existing = await JamSession.findOne({ joinCode });
            if (!existing) isUnique = true;
        }

        const session = new JamSession({
            joinCode,
            hostParticipantNumber: 1,
            nextParticipantNumber: 2,
            participants: [{ participantNumber: 1, socketId, isHost: true }]
        });

        await session.save();
        res.status(201).json({ joinCode: session.joinCode, participantNumber: 1, sessionId: session._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/jam/join — joins an existing session by code, gets the next available number
router.post('/join', async (req, res) => {
    try {
        const { joinCode, socketId } = req.body;
        if (!joinCode || !socketId) {
            return res.status(400).json({ error: 'joinCode and socketId are required' });
        }

        const session = await JamSession.findOne({ joinCode, isActive: true });
        if (!session) return res.status(404).json({ error: 'Jam session not found or has ended' });

        const assignedNumber = session.nextParticipantNumber;
        session.participants.push({ participantNumber: assignedNumber, socketId, isHost: false });
        session.nextParticipantNumber += 1;
        await session.save();

        res.json({ participantNumber: assignedNumber, sessionId: session._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/jam/:sessionId/queue — add a song to the queue (host priority applies)
router.post('/:sessionId/queue', async (req, res) => {
    try {
        const { songId, participantNumber } = req.body;
        const session = await JamSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const song = await Song.findById(songId);
        if (!song) return res.status(404).json({ error: 'Song not found' });

        session.addSongToQueue(songId, participantNumber);
        await session.save();

        const populated = await session.populate('songQueue.song');

        try {
            const io = getIO && getIO();
            if (io) io.to(req.params.sessionId).emit('queue-updated', { queue: populated.songQueue });
        } catch (e) {
            // socket broadcast optional
        }

        res.json({ queue: populated.songQueue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/jam/:sessionId/skip — host-only skip
router.post('/:sessionId/skip', async (req, res) => {
    try {
        const { participantNumber } = req.body;
        const session = await JamSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const allowed = session.skipCurrent(participantNumber);
        if (!allowed) return res.status(403).json({ error: 'Only the host can skip' });

        await session.save();
        const populated = await session.populate('songQueue.song');

        // Broadcast the skip to everyone in the room
        try {
            const io = getIO && getIO();
            if (io) io.to(req.params.sessionId).emit('song-skipped', { queue: populated.songQueue });
        } catch (e) {
            // socket broadcast optional
        }

        res.json({ queue: populated.songQueue });

    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/jam/:sessionId — current session state
router.get('/:sessionId', async (req, res) => {
    try {
        const session = await JamSession.findById(req.params.sessionId).populate('songQueue.song');
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(400).json({ error: 'Invalid session id' });
    }
});

module.exports = router;
