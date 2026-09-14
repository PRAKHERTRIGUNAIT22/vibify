#include "../include/Song.h"
#include <iostream>
#include <iomanip>
#include <sstream>

Song::Song(const std::string& songId,
           const std::string& title,
           const std::string& artist,
           const std::string& album,
           int durationInSeconds,
           const std::string& genre)
    : songId(songId), title(title), artist(artist), album(album),
      durationInSeconds(durationInSeconds), genre(genre), playCount(0) {}

std::string Song::getSongId() const { return songId; }
std::string Song::getTitle() const { return title; }
std::string Song::getArtist() const { return artist; }
std::string Song::getAlbum() const { return album; }
int Song::getDuration() const { return durationInSeconds; }
std::string Song::getGenre() const { return genre; }
std::vector<std::string> Song::getMoodTags() const { return moodTags; }
int Song::getPlayCount() const { return playCount; }

void Song::addMoodTag(const std::string& tag) {
    moodTags.push_back(tag);
}

void Song::incrementPlayCount() {
    playCount++;
}

std::string Song::getFormattedDuration() const {
    int minutes = durationInSeconds / 60;
    int seconds = durationInSeconds % 60;
    std::ostringstream oss;
    oss << minutes << ":" << std::setw(2) << std::setfill('0') << seconds;
    return oss.str();
}

void Song::display() const {
    std::cout << title << " - " << artist
              << " [" << getFormattedDuration() << "]"
              << " (" << genre << ")" << std::endl;
}
