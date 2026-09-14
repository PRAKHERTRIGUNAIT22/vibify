#ifndef RECOMMENDATIONENGINE_H
#define RECOMMENDATIONENGINE_H

#include <string>
#include <vector>
#include "Song.h"

class RecommendationEngine {
private:
    std::vector<Song> songCatalog;   // all songs available to recommend from

    int computeMoodMatchScore(const Song& song, const std::vector<std::string>& targetMoods) const;

public:
    RecommendationEngine();
    explicit RecommendationEngine(const std::vector<Song>& catalog);

    void addToCatalog(const Song& song);

    // Recommend songs matching a set of mood tags (e.g. from recent listening history)
    std::vector<Song> recommendByMood(const std::vector<std::string>& moods, int maxResults = 5) const;

    // Recommend songs by genre
    std::vector<Song> recommendByGenre(const std::string& genre, int maxResults = 5) const;

    // Recommend based on a user's recently played songs (uses genre + mood overlap)
    std::vector<Song> recommendFromHistory(const std::vector<Song>& history, int maxResults = 5) const;
};

#endif // RECOMMENDATIONENGINE_H
