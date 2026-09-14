#ifndef PLAYLIST_H
#define PLAYLIST_H

#include <string>
#include <vector>
#include "Song.h"

class Playlist {
private:
    std::string playlistId;
    std::string name;
    std::string ownerUserId;   // links back to User
    std::vector<Song> songs;

public:
    Playlist(const std::string& playlistId, const std::string& name, const std::string& ownerUserId);

    // Getters
    std::string getPlaylistId() const;
    std::string getName() const;
    std::string getOwnerUserId() const;
    std::vector<Song> getSongs() const;
    int getSongCount() const;

    // Behavior
    void addSong(const Song& song);
    void removeSong(const std::string& songId);
    bool containsSong(const std::string& songId) const;
    int getTotalDuration() const; // seconds

    void display() const;
};

#endif // PLAYLIST_H
