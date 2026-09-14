#ifndef USER_H
#define USER_H

#include <string>

class User {
private:
    std::string userId;
    std::string username;

public:
    User(const std::string& userId, const std::string& username);

    // Getters
    std::string getUserId() const;
    std::string getUsername() const;

    void display() const;
};

#endif // USER_H
