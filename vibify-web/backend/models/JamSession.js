const mongoose = require('mongoose');

// A participant is identified only by a number scoped to this session — no username stored.
const participantSchema = new mongoose.Schema({
    participantNumber: {
        type: Number,
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
    isHost: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// A queued song tracks who added it (by number) so we can enforce host priority.
const queuedSongSchema = new mongoose.Schema({
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    addedByParticipantNumber: {
        type: Number,
        required: true
    }
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

const jamSessionSchema = new mongoose.Schema({
    joinCode: {
        type: String,
        required: true,
        unique: true   // short shareable code, e.g. "AB12CD"
    },
    hostParticipantNumber: {
        type: Number,
        required: true,
        default: 1
    },
    nextParticipantNumber: {
        type: Number,
        default: 2   // host takes #1, next joiner gets #2, and so on
    },
    participants: {
        type: [participantSchema],
        default: []
    },
    songQueue: {
        type: [queuedSongSchema],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPaused: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ---------- Instance methods (mirrors the C++ JamSession logic) ----------

// Host's song jumps to the FRONT of the queue; everyone else goes to the BACK.
jamSessionSchema.methods.addSongToQueue = function (songId, requestingParticipantNumber) {
    const pNum = Number(requestingParticipantNumber);
    const entry = { song: songId, addedByParticipantNumber: pNum };
    if (pNum === this.hostParticipantNumber) {
        this.songQueue.unshift(entry);
    } else {
        this.songQueue.push(entry);
    }
};

// Only the host can skip the current song.
jamSessionSchema.methods.skipCurrent = function (requestingParticipantNumber) {
    if (Number(requestingParticipantNumber) !== this.hostParticipantNumber) {
        return false;
    }
    if (this.songQueue.length > 0) {
        this.songQueue.shift();
    }
    return true;
};

module.exports = mongoose.model('JamSession', jamSessionSchema);
