const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    album: {
        type: String,
        trim: true
    },
    durationInSeconds: {
        type: Number,
        required: true,
        min: 1
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    moodTags: {
        type: [String],
        default: []
    },
     audioUrl: {
        type: String,
        default: ''
    },
    playCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
