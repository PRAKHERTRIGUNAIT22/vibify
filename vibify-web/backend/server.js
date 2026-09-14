require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const connectDB = require('./config/db');
const songRoutes = require('./routes/songRoutes');
const jamRoutes = require('./routes/jamRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve frontend static assets (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Vibify server is running' });
});

// Song routes: support both /api/songs and /api/song
app.use('/api/songs', songRoutes);
app.use('/api/song', songRoutes);
app.use('/api/jam', jamRoutes);

async function startServer() {
    await connectDB();

    // Ensure Kesariya has real audio URL in database
    try {
        const Song = require('./models/Song');
        await Song.updateMany(
            { title: /kesariya/i, $or: [{ audioUrl: { $exists: false } }, { audioUrl: '' }, { audioUrl: null }] },
            { $set: { audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/4e/c3/214ec337-5c13-fdbf-e7dd-2738f2f9d3e2/mzaf_5009421294700453120.plus.aac.p.m4a" } }
        );
    } catch (err) {
        console.log('Audio URL sync note:', err.message);
    }

    // Safely initialize sockets if socket.io is available
    try {
        const socketManager = require('./sockets/socket');
        const initJamSocket = require('./sockets/jamsocket');
        const io = socketManager.init(server);
        initJamSocket(io);
    } catch (err) {
        console.log('Socket initialization note:', err.message);
    }

    server.listen(PORT, () => {
        console.log(`Vibify server listening on http://localhost:${PORT}`);
    });
}

startServer();