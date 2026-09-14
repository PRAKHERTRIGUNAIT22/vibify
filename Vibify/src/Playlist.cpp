#include "../include/Playlist.h"
#include <iostream>
#include <algorithm>
#include <numeric>

Playlist::Playlist(const std::string& playlistId, const std::string& name, const std::string& ownerUserId)
    : playlistId(playlistId), name(name), ownerUserId(ownerUserId) {}

std::string Playlist::getPlaylistId() const { return playlistId; }
std::string Playlist::getName() const { return name; }
std::string Playlist::getOwnerUserId() const { return ownerUserId; }
std::vector<Song> Playlist::getSongs() const { return songs; }
int Playlist::getSongCount() const { return static_cast<int>(songs.size()); }

void Playlist::addSong(const Song& song) {
    if (!containsSong(song.getSongId())) {
        songs.push_back(song);
    }
}

void Playlist::removeSong(const std::string& songId) {
    songs.erase(
        std::remove_if(songs.begin(), songs.end(),
            [&songId](const Song& s) { return s.getSongId() == songId; }),
        songs.end());
}

bool Playlist::containsSong(const std::string& songId) const {
    return std::any_of(songs.begin(), songs.end(),
        [&songId](const Song& s) { return s.getSongId() == songId; });
}

int Playlist::getTotalDuration() const {
    int total = 0;
    for (const auto& s : songs) {
        total += s.getDuration();
    }
    return total;
}

void Playlist::display() const {
    std::cout << "Playlist: " << name << " (" << songs.size() << " songs)" << std::endl;
}
