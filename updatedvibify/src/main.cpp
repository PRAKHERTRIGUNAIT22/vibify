#include <iostream>
#include <memory>
#include "../include/Song.h"
#include "../include/User.h"
#include "../include/JamParticipant.h"
#include "../include/JamSession.h"
#include "../include/Playlist.h"
#include "../include/RecommendationEngine.h"
#include "../include/LRUCache.h"
#include "../include/NotificationService.h"

int main() {
    std::cout << "===== VIBIFY DEMO =====" << std::endl << std::endl;

    // ---------- 1. Create some songs ----------
    Song s1("s1", "Blinding Lights", "The Weeknd", "After Hours", 200, "Pop");
    Song s2("s2", "Levitating", "Dua Lipa", "Future Nostalgia", 203, "Pop");
    Song s3("s3", "Calm Down", "Rema", "Rave & Roses", 239, "Afrobeats");
    Song s4("s4", "Espresso", "Sabrina Carpenter", "Short n' Sweet", 175, "Pop");

    s1.addMoodTag("hype");
    s2.addMoodTag("hype");
    s3.addMoodTag("chill");
    s4.addMoodTag("hype");
    s4.addMoodTag("lowkey");

    // ---------- 2. Create users ----------
    User rahul("u1", "Rahul");
    User priya("u2", "Priya");

    std::cout << "--- Users ---" << std::endl;
    rahul.display();
    priya.display();
    std::cout << std::endl;

    // ---------- 3. Playlist demo ----------
    Playlist myMix("p1", "Rahul's Mix", rahul.getUserId());
    myMix.addSong(s1);
    myMix.addSong(s2);
    std::cout << "--- Playlist ---" << std::endl;
    myMix.display();
    std::cout << "Total duration: " << myMix.getTotalDuration() << "s" << std::endl << std::endl;

    // ---------- 4. Jam Session with Host Priority ----------
    std::cout << "--- Jam Session (Host Priority) ---" << std::endl;
    JamSession jam("jam1", rahul.getUserId());
    jam.addParticipant(JamParticipant(rahul.getUserId(), rahul.getUsername(), ParticipantRole::HOST));
    jam.addParticipant(JamParticipant(priya.getUserId(), priya.getUsername(), ParticipantRole::MEMBER));

    // Priya adds a song first (goes to back of queue)
    jam.addSong(priya.getUserId(), s3);
    // Rahul (host) adds a song after — jumps to FRONT due to host priority
    jam.addSong(rahul.getUserId(), s1);

    jam.display();
    std::cout << "Playing next: ";
    jam.playNext().display();  // should be s1 (host's pick), not s3
    std::cout << std::endl;

    // ---------- 5. Notification Service (Observer pattern) ----------
    std::cout << "--- Notifications ---" << std::endl;
    NotificationService notifier;
    auto rahulDevice = std::make_shared<ParticipantDevice>(rahul.getUserId());
    auto priyaDevice = std::make_shared<ParticipantDevice>(priya.getUserId());
    notifier.subscribe(rahulDevice);
    notifier.subscribe(priyaDevice);

    jam.skipCurrent(rahul.getUserId());
    notifier.broadcast(jam.getSessionId(), "Host skipped the current song");
    std::cout << std::endl;

    // ---------- 6. LRU Cache demo ----------
    std::cout << "--- LRU Cache (capacity 3) ---" << std::endl;
    LRUCache cache(3);
    cache.access(s1);
    cache.access(s2);
    cache.access(s3);
    cache.access(s4); // should evict s1 (least recently used)

    std::cout << "Cache contains s1 (should be evicted)? "
              << (cache.contains("s1") ? "yes" : "no") << std::endl;
    std::cout << "Cache size: " << cache.size() << std::endl << std::endl;

    // ---------- 7. Recommendation Engine demo ----------
    std::cout << "--- Recommendations ---" << std::endl;
    RecommendationEngine engine;
    engine.addToCatalog(s1);
    engine.addToCatalog(s2);
    engine.addToCatalog(s3);
    engine.addToCatalog(s4);

    std::vector<Song> recs = engine.recommendByMood({"hype"}, 3);
    std::cout << "Recommended for 'hype' mood:" << std::endl;
    for (const auto& song : recs) {
        song.display();
    }

    std::cout << std::endl << "===== END DEMO =====" << std::endl;
    return 0;
}
