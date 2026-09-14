const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET /api/songs — full catalog, optional filters: ?genre=Pop&mood=hype
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.genre) filter.genre = req.query.genre;
        if (req.query.mood) filter.moodTags = req.query.mood;

        const songs = await Song.find(filter).sort({ createdAt: -1 });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/songs/:id — single song
router.get('/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ error: 'Song not found' });
        res.json(song);
    } catch (err) {
        res.status(400).json({ error: 'Invalid song id' });
    }
});

// POST /api/songs — add a new song to the catalog
router.post('/', async (req, res) => {
    try {
        const { title, artist, album, durationInSeconds, genre, moodTags, audioUrl } = req.body;
        const song = new Song({ title, artist, album, durationInSeconds, genre, moodTags, audioUrl });
        await song.save();
        res.status(201).json(song);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/songs/:id — update song details (including audioUrl)
router.patch('/:id', async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!song) return res.status(404).json({ error: 'Song not found' });
        res.json(song);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /api/songs/:id/play — increment play count when a song is played
router.patch('/:id/play', async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(
            req.params.id,
            { $inc: { playCount: 1 } },
            { new: true }
        );
        if (!song) return res.status(404).json({ error: 'Song not found' });
        res.json(song);
    } catch (err) {
        res.status(400).json({ error: 'Invalid song id' });
    }
});

module.exports = router;
