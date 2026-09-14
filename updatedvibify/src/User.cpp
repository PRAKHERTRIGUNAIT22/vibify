#include "../include/User.h"
#include <iostream>

User::User(const std::string& userId, const std::string& username)
    : userId(userId), username(username) {}

std::string User::getUserId() const { return userId; }
std::string User::getUsername() const { return username; }

void User::display() const {
    std::cout << "User: " << username << " (ID: " << userId << ")" << std::endl;
}
