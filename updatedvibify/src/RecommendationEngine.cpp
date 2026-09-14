#include "../include/RecommendationEngine.h"
#include <algorithm>
#include <map>

RecommendationEngine::RecommendationEngine() {}

RecommendationEngine::RecommendationEngine(const std::vector<Song>& catalog)
    : songCatalog(catalog) {}

void RecommendationEngine::addToCatalog(const Song& song) {
    songCatalog.push_back(song);
}

// Counts how many of the target moods this song's tags overlap with.
int RecommendationEngine::computeMoodMatchScore(const Song& song, const std::vector<std::string>& targetMoods) const {
    int score = 0;
    std::vector<std::string> songMoods = song.getMoodTags();
    for (const auto& mood : targetMoods) {
        if (std::find(songMoods.begin(), songMoods.end(), mood) != songMoods.end()) {
            score++;
        }
    }
    return score;
}

std::vector<Song> RecommendationEngine::recommendByMood(const std::vector<std::string>& moods, int maxResults) const {
    // Pair each song with its match score, then sort by score descending.
    std::vector<std::pair<Song, int>> scored;
    for (const auto& song : songCatalog) {
        int score = computeMoodMatchScore(song, moods);
        if (score > 0) {
            scored.push_back({song, score});
        }
    }

    std::sort(scored.begin(), scored.end(),
        [](const std::pair<Song, int>& a, const std::pair<Song, int>& b) {
            return a.second > b.second;
        });

    std::vector<Song> result;
    for (int i = 0; i < static_cast<int>(scored.size()) && i < maxResults; i++) {
        result.push_back(scored[i].first);
    }
    return result;
}

std::vector<Song> RecommendationEngine::recommendByGenre(const std::string& genre, int maxResults) const {
    std::vector<Song> result;
    for (const auto& song : songCatalog) {
        if (song.getGenre() == genre) {
            result.push_back(song);
            if (static_cast<int>(result.size()) >= maxResults) break;
        }
    }
    return result;
}

// Builds a "profile" from the user's history (most common genre + all mood tags seen),
// then recommends catalog songs matching that profile.
std::vector<Song> RecommendationEngine::recommendFromHistory(const std::vector<Song>& history, int maxResults) const {
    if (history.empty()) {
        return {};
    }

    std::map<std::string, int> genreCount;
    std::vector<std::string> allMoods;

    for (const auto& song : history) {
        genreCount[song.getGenre()]++;
        for (const auto& mood : song.getMoodTags()) {
            allMoods.push_back(mood);
        }
    }

    // Find the most listened-to genre
    std::string topGenre;
    int maxCount = 0;
    for (const auto& entry : genreCount) {
        if (entry.second > maxCount) {
            maxCount = entry.second;
            topGenre = entry.first;
        }
    }

    // Combine genre match + mood match, avoiding songs already in history
    std::vector<Song> byMood = recommendByMood(allMoods, maxResults);
    std::vector<Song> byGenre = recommendByGenre(topGenre, maxResults);

    std::vector<Song> combined = byMood;
    for (const auto& song : byGenre) {
        bool alreadyIn = std::any_of(combined.begin(), combined.end(),
            [&song](const Song& s) { return s.getSongId() == song.getSongId(); });
        if (!alreadyIn) {
            combined.push_back(song);
        }
    }

    if (static_cast<int>(combined.size()) > maxResults) {
        combined.erase(combined.begin() + maxResults, combined.end());
    }
    return combined;
}
