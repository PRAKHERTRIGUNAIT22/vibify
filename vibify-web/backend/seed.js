require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Song = require('./models/Song');

const initialSongs = [
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        durationInSeconds: 200,
        genre: "Pop",
        moodTags: ["hype"],
        audioUrl: 'https://music.youtube.com/watch?v=YyepU5ztLf4&list=RDCLAK5uy_nbTnrBv4CxZys35IAzhO0-fFCiKD58qzo'
    },
    {
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        durationInSeconds: 203,
        genre: "Pop",
        moodTags: ["hype"]
    },
    {
        title: "Calm Down",
        artist: "Rema",
        album: "Rave & Roses",
        durationInSeconds: 239,
        genre: "Afrobeats",
        moodTags: ["chill"]
    },
    {
        title: "Espresso",
        artist: "Sabrina Carpenter",
        album: "Short n' Sweet",
        durationInSeconds: 175,
        genre: "Pop",
        moodTags: ["hype", "lowkey"]
    },
    {
        title: "Kesariya",
        artist: "Arijit Singh",
        album: "Brahmastra",
        durationInSeconds: 268,
        genre: "Bollywood",
        moodTags: ["chill"],
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/4e/c3/214ec337-5c13-fdbf-e7dd-2738f2f9d3e2/mzaf_5009421294700453120.plus.aac.p.m4a"
    }
];

async function seedDatabase() {
    await connectDB();
    const count = await Song.countDocuments();
    if (count === 0) {
        console.log('Seeding initial songs into Atlas database...');
        await Song.insertMany(initialSongs);
        console.log(`Successfully seeded ${initialSongs.length} songs!`);
    } else {
        console.log(`Database already has ${count} songs.`);
        // Update Kesariya audioUrl if missing
        const updated = await Song.updateMany(
            { title: /kesariya/i },
            { $set: { audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/4e/c3/214ec337-5c13-fdbf-e7dd-2738f2f9d3e2/mzaf_5009421294700453120.plus.aac.p.m4a" } }
        );
        console.log(`Updated Kesariya with real audio URL (modified: ${updated.modifiedCount})`);
    }
    await mongoose.disconnect();
    console.log('Done.');
}

seedDatabase().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
