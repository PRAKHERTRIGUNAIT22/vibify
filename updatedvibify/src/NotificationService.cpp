#include "../include/NotificationService.h"
#include <iostream>
#include <algorithm>

ParticipantDevice::ParticipantDevice(const std::string& userId) : userId(userId) {}

void ParticipantDevice::onNotify(const std::string& sessionId, const std::string& event) {
    std::cout << "[Notify -> " << userId << "] Session " << sessionId << ": " << event << std::endl;
}

void NotificationService::subscribe(const std::shared_ptr<IJamObserver>& observer) {
    observers.push_back(observer);
}

void NotificationService::unsubscribe(const std::shared_ptr<IJamObserver>& observer) {
    observers.erase(
        std::remove(observers.begin(), observers.end(), observer),
        observers.end());
}

void NotificationService::broadcast(const std::string& sessionId, const std::string& event) const {
    for (const auto& observer : observers) {
        observer->onNotify(sessionId, event);
    }
}
