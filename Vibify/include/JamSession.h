#ifndef JAMSESSION_H
#define JAMSESSION_H

#include <string>
#include <vector>
#include <deque>
#include "Song.h"
#include "JamParticipant.h"

class JamSession {
private:
    std::string sessionId;
    std::string hostUserId;
    std::vector<JamParticipant> participants;
    std::deque<Song> songQueue;   // front = plays next
    bool isActive;
    bool isPaused;

public:
    JamSession(const std::string& sessionId, const std::string& hostUserId);

    // Getters
    std::string getSessionId() const;
    std::string getHostUserId() const;
    std::vector<JamParticipant> getParticipants() const;
    std::deque<Song> getSongQueue() const;

    // Participant management
    void addParticipant(const JamParticipant& participant);
    void removeParticipant(const std::string& userId);

    // Queue management (host priority enforced here)
    void addSong(const std::string& requestingUserId, const Song& song);
    Song playNext();
    bool skipCurrent(const std::string& requestingUserId);

    // Session lifecycle (host-only actions)
    bool pause(const std::string& requestingUserId);
    bool resume(const std::string& requestingUserId);
    bool endJam(const std::string& requestingUserId);

    // Status getters
    bool getIsActive() const;
    bool getIsPaused() const;

    void display() const;
};

#endif // JAMSESSION_H
