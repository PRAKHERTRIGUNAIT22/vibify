#include "../include/JamSession.h"
#include <iostream>
#include <algorithm>
#include <stdexcept>

JamSession::JamSession(const std::string& sessionId, const std::string& hostUserId)
    : sessionId(sessionId), hostUserId(hostUserId), isActive(true), isPaused(false) {}

std::string JamSession::getSessionId() const { return sessionId; }
std::string JamSession::getHostUserId() const { return hostUserId; }
std::vector<JamParticipant> JamSession::getParticipants() const { return participants; }
std::deque<Song> JamSession::getSongQueue() const { return songQueue; }

void JamSession::addParticipant(const JamParticipant& participant) {
    participants.push_back(participant);
}

void JamSession::removeParticipant(const std::string& userId) {
    participants.erase(
        std::remove_if(participants.begin(), participants.end(),
            [&userId](const JamParticipant& p) { return p.getUserId() == userId; }),
        participants.end());
}

// Host priority: host's picks jump to the front of the queue,
// everyone else's picks go to the back (normal FIFO).
void JamSession::addSong(const std::string& requestingUserId, const Song& song) {
    if (requestingUserId == hostUserId) {
        songQueue.push_front(song);
    } else {
        songQueue.push_back(song);
    }
}

Song JamSession::playNext() {
    if (songQueue.empty()) {
        throw std::runtime_error("Queue is empty");
    }
    Song next = songQueue.front();
    songQueue.pop_front();
    return next;
}

// Only the host can skip the currently playing song.
bool JamSession::skipCurrent(const std::string& requestingUserId) {
    if (requestingUserId != hostUserId) {
        return false; // not authorized
    }
    if (!songQueue.empty()) {
        songQueue.pop_front();
    }
    return true;
}

// Only the host can pause/resume/end the session.
bool JamSession::pause(const std::string& requestingUserId) {
    if (requestingUserId != hostUserId || !isActive) {
        return false;
    }
    isPaused = true;
    return true;
}

bool JamSession::resume(const std::string& requestingUserId) {
    if (requestingUserId != hostUserId || !isActive) {
        return false;
    }
    isPaused = false;
    return true;
}

bool JamSession::endJam(const std::string& requestingUserId) {
    if (requestingUserId != hostUserId) {
        return false;
    }
    isActive = false;
    songQueue.clear();
    return true;
}

bool JamSession::getIsActive() const { return isActive; }
bool JamSession::getIsPaused() const { return isPaused; }

void JamSession::display() const {
    std::cout << "Jam Session [" << sessionId << "] Host: " << hostUserId << std::endl;
    std::cout << "Participants: " << participants.size()
              << " | Queue size: " << songQueue.size() << std::endl;
}
