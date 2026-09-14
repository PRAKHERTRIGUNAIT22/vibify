#ifndef NOTIFICATIONSERVICE_H
#define NOTIFICATIONSERVICE_H

#include <string>
#include <vector>
#include <memory>

// Observer interface — anything that wants jam session updates implements this
class IJamObserver {
public:
    virtual void onNotify(const std::string& sessionId, const std::string& event) = 0;
    virtual ~IJamObserver() = default;
};

// Concrete observer: a participant's device/app instance
class ParticipantDevice : public IJamObserver {
private:
    std::string userId;

public:
    explicit ParticipantDevice(const std::string& userId);
    void onNotify(const std::string& sessionId, const std::string& event) override;
};

// Subject: manages observers and broadcasts events (e.g. "host skipped song")
class NotificationService {
private:
    std::vector<std::shared_ptr<IJamObserver>> observers;

public:
    void subscribe(const std::shared_ptr<IJamObserver>& observer);
    void unsubscribe(const std::shared_ptr<IJamObserver>& observer);
    void broadcast(const std::string& sessionId, const std::string& event) const;
};

#endif // NOTIFICATIONSERVICE_H
