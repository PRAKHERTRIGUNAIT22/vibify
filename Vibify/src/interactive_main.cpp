#include <iostream>
#include <memory>
#include <limits>
#include "../include/Song.h"
#include "../include/User.h"
#include "../include/JamParticipant.h"
#include "../include/JamSession.h"
#include "../include/Playlist.h"
#include "../include/RecommendationEngine.h"
#include "../include/LRUCache.h"
#include "../include/NotificationService.h"

// ---------- Helpers ----------

void printDivider() {
    std::cout << "----------------------------------------" << std::endl;
}

int readIntChoice() {
    int choice;
    while (!(std::cin >> choice)) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Invalid input, enter a number: ";
    }
    return choice;
}

void showCatalog(const std::vector<Song>& catalog) {
    printDivider();
    std::cout << "SONG CATALOG" << std::endl;
    printDivider();
    for (size_t i = 0; i < catalog.size(); i++) {
        std::cout << i + 1 << ". ";
        catalog[i].display();
    }
    printDivider();
}

// ---------- Main ----------

int main() {
    // Preloaded catalog — in a real app this would come from a database
    std::vector<Song> catalog;
    catalog.push_back(Song("s1", "Blinding Lights", "The Weeknd", "After Hours", 200, "Pop"));
    catalog.push_back(Song("s2", "Levitating", "Dua Lipa", "Future Nostalgia", 203, "Pop"));
    catalog.push_back(Song("s3", "Calm Down", "Rema", "Rave & Roses", 239, "Afrobeats"));
    catalog.push_back(Song("s4", "Espresso", "Sabrina Carpenter", "Short n' Sweet", 175, "Pop"));
    catalog.push_back(Song("s5", "Kesariya", "Arijit Singh", "Brahmastra", 268, "Bollywood"));
    catalog[0].addMoodTag("hype");
    catalog[1].addMoodTag("hype");
    catalog[2].addMoodTag("chill");
    catalog[3].addMoodTag("hype");
    catalog[4].addMoodTag("chill");

    RecommendationEngine engine(catalog);
    LRUCache recentlyPlayed(5);

    std::cout << "===== WELCOME TO VIBIFY =====" << std::endl;
    std::cout << "Enter your name: ";
    std::string username;
    std::getline(std::cin, username);

    User currentUser("u1", username);
    Playlist myPlaylist("p1", username + "'s Playlist", currentUser.getUserId());

    bool running = true;
    while (running) {
        printDivider();
        std::cout << "Hi " << currentUser.getUsername() << "! What do you want to do?" << std::endl;
        std::cout << "1. Browse & play a song" << std::endl;
        std::cout << "2. Add a song to my playlist" << std::endl;
        std::cout << "3. View my playlist" << std::endl;
        std::cout << "4. Get recommendations (based on mood)" << std::endl;
        std::cout << "5. View recently played" << std::endl;
        std::cout << "6. Exit" << std::endl;
        std::cout << "Choice: ";

        int choice = readIntChoice();

        if (choice == 1) {
            showCatalog(catalog);
            std::cout << "Pick a song number to play: ";
            int pick = readIntChoice();
            if (pick >= 1 && pick <= static_cast<int>(catalog.size())) {
                Song& chosen = catalog[pick - 1];
                std::cout << "Now playing: ";
                chosen.display();
                chosen.incrementPlayCount();
                recentlyPlayed.access(chosen);
            } else {
                std::cout << "Invalid song number." << std::endl;
            }

        } else if (choice == 2) {
            showCatalog(catalog);
            std::cout << "Pick a song number to add to your playlist: ";
            int pick = readIntChoice();
            if (pick >= 1 && pick <= static_cast<int>(catalog.size())) {
                myPlaylist.addSong(catalog[pick - 1]);
                std::cout << "Added to your playlist!" << std::endl;
            } else {
                std::cout << "Invalid song number." << std::endl;
            }

        } else if (choice == 3) {
            myPlaylist.display();
            for (const auto& song : myPlaylist.getSongs()) {
                song.display();
            }

        } else if (choice == 4) {
            std::cout << "Pick a mood: 1. hype  2. chill : ";
            int m = readIntChoice();
            std::string mood = (m == 1) ? "hype" : "chill";
            std::vector<Song> recs = engine.recommendByMood({mood}, 3);
            std::cout << "Recommended for '" << mood << "':" << std::endl;
            for (const auto& song : recs) {
                song.display();
            }

        } else if (choice == 5) {
            std::vector<Song> recent = recentlyPlayed.getAllInOrder();
            if (recent.empty()) {
                std::cout << "Nothing played yet." << std::endl;
            } else {
                std::cout << "Recently played (most recent first):" << std::endl;
                for (const auto& song : recent) {
                    song.display();
                }
            }

        } else if (choice == 6) {
            std::cout << "Thanks for using Vibify, " << currentUser.getUsername() << "!" << std::endl;
            running = false;

        } else {
            std::cout << "Invalid choice, try again." << std::endl;
        }
    }

    return 0;
}
