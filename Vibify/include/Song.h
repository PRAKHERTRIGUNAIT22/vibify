#ifndef SONG_H
#define SONG_H

#include <string>
#include <vector>

class Song {
private:
    std::string songId;
    std::string title;
    std::string artist;
    std::string album;
    int durationInSeconds;
    std::string genre;
    std::vector<std::string> moodTags;   // e.g. "chill", "lowkey", "hype"
    int playCount;

public:
    // Constructor
    Song(const std::string& songId,
         const std::string& title,
         const std::string& artist,
         const std::string& album,
         int durationInSeconds,
         const std::string& genre);

    // Getters
    std::string getSongId() const;
    std::string getTitle() const;
    std::string getArtist() const;
    std::string getAlbum() const;
    int getDuration() const;
    std::string getGenre() const;
    std::vector<std::string> getMoodTags() const;
    int getPlayCount() const;

    // Setters / behavior
    void addMoodTag(const std::string& tag);
    void incrementPlayCount();

    // Utility
    std::string getFormattedDuration() const; // mm:ss
    void display() const;
};

#endif // SONG_H
