/* =========================================================
   VIBIFY — Frontend Logic (Tailwind CSS Client)
   ========================================================= */

const API_BASE = 'http://localhost:5001/api';

// State
let allSongs = [];
let filteredSongs = [];
let currentSongIndex = -1;
let isPlaying = false;
let isLooping = false;
let playbackSeconds = 0;
let playbackTimer = null;

// User Collections
let myPlaylist = JSON.parse(localStorage.getItem('vibify_playlist') || '[]');
let recentlyPlayed = JSON.parse(localStorage.getItem('vibify_recent') || '[]');

// Jam Session
let activeJamSession = JSON.parse(sessionStorage.getItem('vibify_jam') || 'null');
let jamPollInterval = null;

// Real Audio Constants & HTML5 Player
const KESARIYA_AUDIO_URL = 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/4e/c3/214ec337-5c13-fdbf-e7dd-2738f2f9d3e2/mzaf_5009421294700453120.plus.aac.p.m4a';
const realAudio = new Audio();
let isUsingRealAudio = false;

// Web Audio API Synthesizer (Fallback for tracks without stream URLs)
let audioCtx = null;
let synthInterval = null;
let currentVolume = 0.8;
let isMuted = false;

// Dynamic Styling Maps
const genreThemes = {
    'Pop': { bg: 'from-pink-500 to-violet-600', icon: '🎤' },
    'Afrobeats': { bg: 'from-amber-500 to-red-600', icon: '🥁' },
    'Bollywood': { bg: 'from-orange-500 to-pink-600', icon: '✨' },
    'Rock': { bg: 'from-indigo-600 to-blue-600', icon: '🎸' },
    'Electronic': { bg: 'from-cyan-500 to-blue-600', icon: '🎛️' },
    'R&B': { bg: 'from-purple-600 to-indigo-600', icon: '🎷' },
    'Hip-Hop': { bg: 'from-emerald-500 to-cyan-600', icon: '🔥' }
};

// =========================================================
// Initialization
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    fetchSongs();
    renderPlaylist();
    renderRecentlyPlayed();

    if (activeJamSession) {
        setupActiveJamView(activeJamSession);
    }
});

function initEvents() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        clearSearch.classList.toggle('hidden', !val);
        applyFilters();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.classList.add('hidden');
        applyFilters();
    });

    // Mood Chips
    document.querySelectorAll('.chip-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip-filter').forEach(c => {
                c.classList.remove('active', 'bg-vibify-purple', 'text-white', 'shadow-glow-purple');
                c.classList.add('bg-white/5', 'text-slate-300');
            });
            btn.classList.add('active', 'bg-vibify-purple', 'text-white', 'shadow-glow-purple');
            btn.classList.remove('bg-white/5', 'text-slate-300');
            applyFilters();
        });
    });

    // Genre Filter
    document.getElementById('genreFilterSelect').addEventListener('change', applyFilters);

    // Sidebar Tabs
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-tab').forEach(t => {
                t.classList.remove('text-vibify-purple', 'border-vibify-purple');
                t.classList.add('text-slate-400', 'border-transparent');
            });
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

            tab.classList.add('text-vibify-purple', 'border-vibify-purple');
            tab.classList.remove('text-slate-400', 'border-transparent');
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });

    // Jam Session
    document.getElementById('btnOpenJam').addEventListener('click', () => {
        const jamTab = document.querySelector('[data-tab="tabJam"]');
        if (jamTab) jamTab.click();
    });
    document.getElementById('btnCreateJamSession').addEventListener('click', handleCreateJam);
    document.getElementById('btnJoinJamSession').addEventListener('click', handleJoinJam);
    document.getElementById('btnLeaveJamSession').addEventListener('click', handleLeaveJam);
    document.getElementById('btnCopyJoinCode').addEventListener('click', copyJoinCode);
    document.getElementById('btnHostSkipTrack').addEventListener('click', handleHostSkip);

    // Playlist Clear
    document.getElementById('btnClearAllPlaylist').addEventListener('click', () => {
        myPlaylist = [];
        localStorage.setItem('vibify_playlist', JSON.stringify(myPlaylist));
        renderPlaylist();
        applyFilters();
        showToast('Playlist cleared', 'info');
    });

    // Modal
    document.getElementById('btnOpenAddSong').addEventListener('click', () => {
        document.getElementById('addSongModal').classList.remove('hidden');
    });
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('btnCancelModal').addEventListener('click', closeModal);
    document.getElementById('addSongForm').addEventListener('submit', handleAddSong);

    // Player Bar
    document.getElementById('btnPlayPause').addEventListener('click', togglePlayPause);
    document.getElementById('btnNextTrack').addEventListener('click', playNext);
    document.getElementById('btnPrevTrack').addEventListener('click', playPrev);
    document.getElementById('btnLoopTrack').addEventListener('click', toggleLoop);
    document.getElementById('playerProgressBar').addEventListener('input', handleSeek);
    document.getElementById('playerVolumeBar').addEventListener('input', handleVolume);
    document.getElementById('btnVolumeMute').addEventListener('click', toggleMute);
}

// =========================================================
// API & Fetching
// =========================================================
async function fetchSongs() {
    const grid = document.getElementById('songGrid');
    try {
        const res = await fetch(`${API_BASE}/songs`);
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        allSongs = data;
        updateStats();
        applyFilters();
    } catch (err) {
        console.error('Fetch error:', err);
        grid.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center text-center px-4 space-y-3">
                <span class="text-3xl">⚠️</span>
                <p class="text-sm font-semibold text-rose-400">Cannot connect to Vibify backend on localhost:5001.</p>
                <p class="text-xs text-slate-400 max-w-sm">Make sure your backend server is running via <code class="bg-white/10 px-1.5 py-0.5 rounded text-white">npm start</code> in the backend directory.</p>
                <button onclick="fetchSongs()" class="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-white transition">
                    Retry Connection
                </button>
            </div>
        `;
    }
}

function updateStats() {
    document.getElementById('statTotalSongs').textContent = allSongs.length;
    const totalPlays = allSongs.reduce((sum, s) => sum + (s.playCount || 0), 0);
    document.getElementById('statTotalPlays').textContent = totalPlays;
}

function applyFilters() {
    const query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    const activeChip = document.querySelector('.chip-filter.active');
    const moodFilter = activeChip ? activeChip.dataset.filter : 'all';
    const genreFilter = document.getElementById('genreFilterSelect').value;

    filteredSongs = allSongs.filter(song => {
        const matchSearch = !query ||
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            (song.album && song.album.toLowerCase().includes(query)) ||
            song.genre.toLowerCase().includes(query);

        const matchMood = (moodFilter === 'all') || (song.moodTags && song.moodTags.includes(moodFilter));
        const matchGenre = !genreFilter || (song.genre === genreFilter);

        return matchSearch && matchMood && matchGenre;
    });

    renderSongGrid(filteredSongs);
}

// =========================================================
// Grid Rendering (Tailwind CSS Component Cards)
// =========================================================
function renderSongGrid(songs) {
    const grid = document.getElementById('songGrid');
    document.getElementById('catalogCountBadge').textContent = `(${songs.length})`;

    if (songs.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <p class="text-sm">No songs match your criteria.</p>
                <button onclick="resetFilters()" class="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = songs.map(song => {
        const theme = genreThemes[song.genre] || { bg: 'from-violet-600 to-indigo-600', icon: '🎵' };
        const duration = formatTime(song.durationInSeconds);
        const inPlaylist = myPlaylist.some(p => p._id === song._id);

        const moodBadges = (song.moodTags || []).map(m => {
            const colorClass = m === 'hype' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                               m === 'chill' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                               'bg-purple-500/10 text-purple-400 border-purple-500/20';
            return `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}">#${escapeHTML(m)}</span>`;
        }).join('');

        return `
            <div class="bg-vibify-card border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-vibify-purple/40 hover:-translate-y-1 transition-all duration-200 backdrop-blur-md group">
                <div>
                    <!-- Album Cover Art Box -->
                    <div class="relative w-full aspect-square rounded-xl bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-4xl shadow-md overflow-hidden mb-3">
                        <span>${theme.icon}</span>
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button onclick="playSong('${song._id}')" class="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-base font-bold shadow-xl hover:scale-110 transition" title="Play ${escapeHTML(song.title)}">
                                ▶
                            </button>
                        </div>
                    </div>

                    <!-- Song Info -->
                    <h4 class="font-bold text-sm text-white truncate" title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</h4>
                    <p class="text-xs text-slate-400 truncate mb-2.5">${escapeHTML(song.artist)} • ${escapeHTML(song.album || song.genre)}</p>

                    <!-- Badges -->
                    <div class="flex flex-wrap gap-1 mb-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">${escapeHTML(song.genre)}</span>
                        ${(song.audioUrl || song.title.toLowerCase().includes('kesariya')) ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><span>🎵</span> Real Audio</span>' : ''}
                        ${moodBadges}
                    </div>
                </div>

                <!-- Footer Meta & Actions -->
                <div class="pt-2 border-t border-white/5 space-y-2">
                    <div class="flex items-center justify-between text-[11px] text-slate-400">
                        <span>⏳ ${duration}</span>
                        <span>🔥 ${song.playCount || 0} plays</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="togglePlaylist('${song._id}')" class="py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition">
                            ${inPlaylist ? '💖 Saved' : '➕ Playlist'}
                        </button>
                        <button onclick="addToJamQueue('${song._id}')" class="py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition">
                            🎧 Jam
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').classList.add('hidden');
    document.getElementById('genreFilterSelect').value = '';
    const allChip = document.querySelector('[data-filter="all"]');
    if (allChip) allChip.click();
}

// =========================================================
// Audio Player & Synthesizer Engine
// =========================================================
function playSong(songId) {
    const song = allSongs.find(s => s._id === songId);
    if (!song) return;

    addToRecent(song);

    // Increment play count in database
    fetch(`${API_BASE}/songs/${songId}/play`, { method: 'PATCH' })
        .then(res => res.json())
        .then(updated => {
            song.playCount = updated.playCount;
            updateStats();
            applyFilters();
        })
        .catch(err => console.log('Play counter error:', err));

    startAudioPlayback(song);
}

function startAudioPlayback(song) {
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = `${song.artist} • ${song.album || song.genre}`;
    
    const theme = genreThemes[song.genre] || { bg: 'from-violet-600 to-indigo-600', icon: '🎵' };
    const thumb = document.getElementById('playerThumb');
    thumb.className = `w-12 h-12 rounded-xl bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-xl shadow-lg flex-shrink-0`;
    thumb.textContent = theme.icon;

    const audioSource = song.audioUrl || (song.title.toLowerCase().includes('kesariya') ? KESARIYA_AUDIO_URL : null);
    const progressBar = document.getElementById('playerProgressBar');
    const audioModeIndicator = document.getElementById('audioModeIndicator');
    const audioModeDot = document.getElementById('audioModeDot');
    const audioModeLabel = document.getElementById('audioModeLabel');

    // Clean up any running timers / synth notes
    if (playbackTimer) {
        clearInterval(playbackTimer);
        playbackTimer = null;
    }
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
    if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
    }

    if (audioSource) {
        // Real Audio Playback Mode (HTML5 Audio)
        isUsingRealAudio = true;
        realAudio.src = audioSource;
        realAudio.volume = isMuted ? 0 : currentVolume;
        realAudio.loop = isLooping;

        if (audioModeIndicator && audioModeLabel && audioModeDot) {
            audioModeIndicator.className = "flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400";
            audioModeDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse";
            audioModeLabel.textContent = "REAL AUDIO";
        }

        realAudio.onloadedmetadata = () => {
            const dur = Math.round(realAudio.duration);
            progressBar.max = dur || song.durationInSeconds;
            document.getElementById('playerTotalTime').textContent = formatTime(dur || song.durationInSeconds);
        };

        realAudio.ontimeupdate = () => {
            progressBar.value = realAudio.currentTime;
            playbackSeconds = realAudio.currentTime;
            document.getElementById('playerCurrentTime').textContent = formatTime(realAudio.currentTime);
        };

        realAudio.onended = () => {
            if (!isLooping) playNext();
        };

        realAudio.play()
            .then(() => {
                isPlaying = true;
                document.getElementById('btnPlayPause').textContent = '⏸';
            })
            .catch(err => {
                console.warn('Real audio autoplay error:', err);
                isPlaying = false;
                document.getElementById('btnPlayPause').textContent = '▶';
            });

        document.getElementById('playerTotalTime').textContent = formatTime(song.durationInSeconds);
        progressBar.max = song.durationInSeconds;
        progressBar.value = 0;
        playbackSeconds = 0;

    } else {
        // Fallback Synth Mode
        isUsingRealAudio = false;
        realAudio.pause();

        if (audioModeIndicator && audioModeLabel && audioModeDot) {
            audioModeIndicator.className = "flex items-center gap-1 px-2 py-0.5 rounded-full bg-vibify-cyan/10 border border-vibify-cyan/20 text-[10px] font-bold text-vibify-cyan";
            audioModeDot.className = "w-1.5 h-1.5 rounded-full bg-vibify-cyan animate-pulse";
            audioModeLabel.textContent = "SYNTH";
        }

        document.getElementById('playerTotalTime').textContent = formatTime(song.durationInSeconds);
        progressBar.max = song.durationInSeconds;
        progressBar.value = 0;
        playbackSeconds = 0;

        isPlaying = true;
        document.getElementById('btnPlayPause').textContent = '⏸';

        initSynth(song);

        playbackTimer = setInterval(() => {
            if (!isPlaying) return;
            playbackSeconds += 1;
            progressBar.value = playbackSeconds;
            document.getElementById('playerCurrentTime').textContent = formatTime(playbackSeconds);

            if (playbackSeconds >= song.durationInSeconds) {
                if (isLooping) {
                    playbackSeconds = 0;
                } else {
                    playNext();
                }
            }
        }, 1000);
    }
}

function togglePlayPause() {
    if (!isPlaying && playbackSeconds === 0 && allSongs.length > 0) {
        playSong(allSongs[0]._id);
        return;
    }
    isPlaying = !isPlaying;
    document.getElementById('btnPlayPause').textContent = isPlaying ? '⏸' : '▶';

    if (isUsingRealAudio) {
        if (isPlaying) {
            realAudio.play().catch(e => console.log(e));
        } else {
            realAudio.pause();
        }
    } else if (audioCtx) {
        if (isPlaying) audioCtx.resume();
        else audioCtx.suspend();
    }
}

function playNext() {
    if (allSongs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % allSongs.length;
    playSong(allSongs[currentSongIndex]._id);
}

function playPrev() {
    if (allSongs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
    playSong(allSongs[currentSongIndex]._id);
}

function toggleLoop() {
    isLooping = !isLooping;
    if (isUsingRealAudio) {
        realAudio.loop = isLooping;
    }
    const btn = document.getElementById('btnLoopTrack');
    btn.classList.toggle('text-vibify-cyan', isLooping);
    btn.classList.toggle('text-slate-400', !isLooping);
    showToast(isLooping ? 'Loop enabled' : 'Loop disabled', 'info');
}

function handleSeek(e) {
    const seekVal = parseFloat(e.target.value);
    playbackSeconds = seekVal;
    if (isUsingRealAudio) {
        realAudio.currentTime = seekVal;
    }
    document.getElementById('playerCurrentTime').textContent = formatTime(seekVal);
}

function handleVolume(e) {
    currentVolume = e.target.value / 100;
    isMuted = false;
    if (isUsingRealAudio) {
        realAudio.volume = currentVolume;
    }
    document.getElementById('btnVolumeMute').textContent = currentVolume === 0 ? '🔇' : '🔊';
}

function toggleMute() {
    isMuted = !isMuted;
    if (isUsingRealAudio) {
        realAudio.volume = isMuted ? 0 : currentVolume;
    }
    document.getElementById('btnVolumeMute').textContent = isMuted ? '🔇' : '🔊';
}

function initSynth(song) {
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (synthInterval) clearInterval(synthInterval);

        const chordTones = song.genre === 'Afrobeats' ? [261.63, 329.63, 392.00, 440.00] :
                           song.genre === 'Bollywood' ? [293.66, 369.99, 440.00, 523.25] :
                           song.genre === 'Rock' ? [220.00, 277.18, 329.63, 415.30] :
                           [261.63, 329.63, 392.00, 523.25];

        let noteIdx = 0;
        synthInterval = setInterval(() => {
            if (!isPlaying || isMuted) return;
            const freq = chordTones[noteIdx % chordTones.length];
            noteIdx++;
            playTone(freq, 0.35);
        }, 550);
    } catch (e) {
        console.log('Audio synth:', e);
    }
}

function playTone(freq, duration) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    const vol = isMuted ? 0 : currentVolume * 0.07;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// =========================================================
// LRU Cache: Recently Played (Max 5)
// =========================================================
function addToRecent(song) {
    recentlyPlayed = recentlyPlayed.filter(s => s._id !== song._id);
    recentlyPlayed.unshift(song);
    if (recentlyPlayed.length > 5) recentlyPlayed.pop();
    localStorage.setItem('vibify_recent', JSON.stringify(recentlyPlayed));
    renderRecentlyPlayed();
}

function renderRecentlyPlayed() {
    const list = document.getElementById('recentItemsList');
    if (recentlyPlayed.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">No tracks played yet in this session.</p>`;
        return;
    }

    list.innerHTML = recentlyPlayed.map(song => {
        const theme = genreThemes[song.genre] || { bg: 'from-violet-600 to-indigo-600', icon: '🎵' };
        return `
            <div onclick="playSong('${song._id}')" class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer border border-white/5 transition">
                <div class="flex items-center gap-2.5 overflow-hidden">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-sm flex-shrink-0">
                        ${theme.icon}
                    </div>
                    <div class="overflow-hidden">
                        <div class="text-xs font-bold text-white truncate">${escapeHTML(song.title)}</div>
                        <div class="text-[10px] text-slate-400 truncate">${escapeHTML(song.artist)} • ${formatTime(song.durationInSeconds)}</div>
                    </div>
                </div>
                <button class="text-slate-400 hover:text-white text-xs">▶</button>
            </div>
        `;
    }).join('');
}

// =========================================================
// Personal Playlist Management
// =========================================================
function togglePlaylist(songId) {
    const song = allSongs.find(s => s._id === songId);
    if (!song) return;

    const exists = myPlaylist.some(p => p._id === song._id);
    if (exists) {
        myPlaylist = myPlaylist.filter(p => p._id !== song._id);
        showToast(`Removed "${song.title}" from playlist`, 'info');
    } else {
        myPlaylist.push(song);
        showToast(`Saved "${song.title}" to playlist!`, 'success');
    }

    localStorage.setItem('vibify_playlist', JSON.stringify(myPlaylist));
    renderPlaylist();
    applyFilters();
}

function renderPlaylist() {
    const list = document.getElementById('playlistItemsList');
    document.getElementById('playlistBadge').textContent = myPlaylist.length;

    if (myPlaylist.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">No saved songs yet. Click "➕" on any card to add here!</p>`;
        return;
    }

    list.innerHTML = myPlaylist.map(song => {
        const theme = genreThemes[song.genre] || { bg: 'from-violet-600 to-indigo-600', icon: '🎵' };
        return `
            <div class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between border border-white/5 transition">
                <div onclick="playSong('${song._id}')" class="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-sm flex-shrink-0">
                        ${theme.icon}
                    </div>
                    <div class="overflow-hidden">
                        <div class="text-xs font-bold text-white truncate">${escapeHTML(song.title)}</div>
                        <div class="text-[10px] text-slate-400 truncate">${escapeHTML(song.artist)}</div>
                    </div>
                </div>
                <button onclick="togglePlaylist('${song._id}')" class="text-slate-500 hover:text-rose-400 text-xs px-2" title="Remove">✕</button>
            </div>
        `;
    }).join('');
}

// =========================================================
// Jam Session Logic
// =========================================================
async function handleCreateJam() {
    try {
        const dummySocketId = 'client_' + Math.random().toString(36).substring(2, 9);
        const res = await fetch(`${API_BASE}/jam/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socketId: dummySocketId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create session');

        activeJamSession = {
            sessionId: data.sessionId,
            joinCode: data.joinCode,
            participantNumber: data.participantNumber,
            isHost: true
        };

        sessionStorage.setItem('vibify_jam', JSON.stringify(activeJamSession));
        setupActiveJamView(activeJamSession);
        showToast(`Session created! Code: ${data.joinCode}`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleJoinJam() {
    const input = document.getElementById('joinCodeInput');
    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast('Please enter a join code', 'error');
        return;
    }

    try {
        const dummySocketId = 'client_' + Math.random().toString(36).substring(2, 9);
        const res = await fetch(`${API_BASE}/jam/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinCode: code, socketId: dummySocketId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to join session');

        activeJamSession = {
            sessionId: data.sessionId,
            joinCode: code,
            participantNumber: data.participantNumber,
            isHost: data.participantNumber === 1
        };

        sessionStorage.setItem('vibify_jam', JSON.stringify(activeJamSession));
        setupActiveJamView(activeJamSession);
        showToast(`Joined as Participant #${data.participantNumber}!`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function setupActiveJamView(session) {
    document.getElementById('jamLobbyForm').classList.add('hidden');
    document.getElementById('jamActiveContainer').classList.remove('hidden');
    document.getElementById('activeCodeDisplay').textContent = session.joinCode;

    const roleBadge = document.getElementById('participantRoleBadge');
    roleBadge.textContent = session.isHost ? 'Host (#1)' : `Participant #${session.participantNumber}`;

    const statusPill = document.getElementById('jamStatusPill');
    statusPill.textContent = 'ACTIVE';
    statusPill.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

    const hostSkipBtn = document.getElementById('btnHostSkipTrack');
    hostSkipBtn.classList.toggle('hidden', !session.isHost);

    pollJamQueue();
    if (jamPollInterval) clearInterval(jamPollInterval);
    jamPollInterval = setInterval(pollJamQueue, 3000);
}

async function pollJamQueue() {
    if (!activeJamSession) return;
    try {
        const res = await fetch(`${API_BASE}/jam/${activeJamSession.sessionId}`);
        if (!res.ok) return;
        const session = await res.json();
        renderJamQueue(session.songQueue || []);
    } catch (e) {
        console.log('Jam poll error:', e);
    }
}

function renderJamQueue(queue) {
    const list = document.getElementById('jamQueueList');
    if (queue.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Queue is empty. Click "+ Jam" on any song to add!</p>`;
        return;
    }

    list.innerHTML = queue.map((item, idx) => {
        const song = item.song;
        if (!song) return '';
        const isCurrent = idx === 0;
        const isHost = item.addedByParticipantNumber === 1;

        return `
            <div class="p-2 rounded-xl text-xs flex items-center justify-between ${isCurrent ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}">
                <div class="overflow-hidden">
                    <div class="font-bold text-white truncate">${isCurrent ? '▶ ' : ''}${escapeHTML(song.title)}</div>
                    <div class="text-[10px] text-slate-400">
                        ${isHost ? '👑 Host Priority' : `Participant #${item.addedByParticipantNumber}`}
                    </div>
                </div>
                <span class="text-[10px] text-slate-400">${formatTime(song.durationInSeconds)}</span>
            </div>
        `;
    }).join('');
}

async function addToJamQueue(songId) {
    if (!activeJamSession) {
        showToast('Start or join a Jam Session first!', 'info');
        const jamTab = document.querySelector('[data-tab="tabJam"]');
        if (jamTab) jamTab.click();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/jam/${activeJamSession.sessionId}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                songId,
                participantNumber: activeJamSession.participantNumber
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to queue song');

        showToast('Song queued in Jam Session!', 'success');
        pollJamQueue();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleHostSkip() {
    if (!activeJamSession || !activeJamSession.isHost) return;
    try {
        const res = await fetch(`${API_BASE}/jam/${activeJamSession.sessionId}/skip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantNumber: activeJamSession.participantNumber })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Skip failed');

        showToast('Current song skipped by Host', 'info');
        pollJamQueue();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function handleLeaveJam() {
    activeJamSession = null;
    sessionStorage.removeItem('vibify_jam');
    if (jamPollInterval) clearInterval(jamPollInterval);

    document.getElementById('jamLobbyForm').classList.remove('hidden');
    document.getElementById('jamActiveContainer').classList.add('hidden');

    const statusPill = document.getElementById('jamStatusPill');
    statusPill.textContent = 'INACTIVE';
    statusPill.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-400';

    showToast('Left Jam Session', 'info');
}

function copyJoinCode() {
    if (!activeJamSession) return;
    navigator.clipboard.writeText(activeJamSession.joinCode)
        .then(() => showToast(`Code ${activeJamSession.joinCode} copied!`, 'success'))
        .catch(() => showToast('Failed to copy', 'error'));
}

// =========================================================
// Add Song Modal
// =========================================================
async function handleAddSong(e) {
    e.preventDefault();
    const title = document.getElementById('inputTitle').value.trim();
    const artist = document.getElementById('inputArtist').value.trim();
    const album = document.getElementById('inputAlbum').value.trim();
    const durationInSeconds = parseInt(document.getElementById('inputDuration').value);
    const genre = document.getElementById('inputGenre').value;
    const moodTags = Array.from(document.querySelectorAll('input[name="moodTags"]:checked')).map(cb => cb.value);
    const audioUrl = (document.getElementById('inputAudioUrl') ? document.getElementById('inputAudioUrl').value.trim() : '') || undefined;

    try {
        const res = await fetch(`${API_BASE}/songs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                artist,
                album: album || title,
                durationInSeconds,
                genre,
                moodTags,
                audioUrl
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save song');

        showToast(`"${title}" added to catalog!`, 'success');
        closeModal();
        document.getElementById('addSongForm').reset();
        await fetchSongs();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function closeModal() {
    document.getElementById('addSongModal').classList.add('hidden');
}

// =========================================================
// Utility Functions
// =========================================================
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
    const box = document.getElementById('toastBox');
    const toast = document.createElement('div');
    const borderClass = type === 'success' ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200' :
                        type === 'error' ? 'border-rose-500/50 bg-rose-950/90 text-rose-200' :
                        'border-vibify-purple/50 bg-slate-900/90 text-slate-200';

    toast.className = `px-4 py-2.5 rounded-xl border text-xs font-semibold backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 ${borderClass}`;
    toast.textContent = message;
    box.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
