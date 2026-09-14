#ifndef LRUCACHE_H
#define LRUCACHE_H

#include <string>
#include <list>
#include <unordered_map>
#include "Song.h"

class LRUCache {
private:
    int capacity;
    // front of list = most recently used, back = least recently used
    std::list<Song> usageOrder;
    std::unordered_map<std::string, std::list<Song>::iterator> lookup; // songId -> position in list

public:
    explicit LRUCache(int capacity);

    void access(const Song& song);          // marks song as recently used (adds if new)
    bool contains(const std::string& songId) const;
    Song* get(const std::string& songId);   // returns pointer to song if present, else nullptr
    std::vector<Song> getAllInOrder() const; // most recent first

    int size() const;
};

#endif // LRUCACHE_H
