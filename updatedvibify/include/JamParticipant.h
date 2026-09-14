#ifndef JAMPARTICIPANT_H
#define JAMPARTICIPANT_H

#include <string>

enum class ParticipantRole { HOST, MEMBER };

class JamParticipant {
private:
    std::string userId;      // links back to a User
    std::string username;
    ParticipantRole role;

public:
    JamParticipant(const std::string& userId, const std::string& username, ParticipantRole role);

    // Getters
    std::string getUserId() const;
    std::string getUsername() const;
    ParticipantRole getRole() const;

    bool isHost() const;

    void display() const;
};

#endif // JAMPARTICIPANT_H
