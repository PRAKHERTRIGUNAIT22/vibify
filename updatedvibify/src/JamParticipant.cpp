#include "../include/JamParticipant.h"
#include <iostream>

JamParticipant::JamParticipant(const std::string& userId, const std::string& username, ParticipantRole role)
    : userId(userId), username(username), role(role) {}

std::string JamParticipant::getUserId() const { return userId; }
std::string JamParticipant::getUsername() const { return username; }
ParticipantRole JamParticipant::getRole() const { return role; }

bool JamParticipant::isHost() const {
    return role == ParticipantRole::HOST;
}

void JamParticipant::display() const {
    std::string roleStr = isHost() ? "Host" : "Member";
    std::cout << username << " - " << roleStr << std::endl;
}
