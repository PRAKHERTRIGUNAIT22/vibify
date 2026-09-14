#include "../include/LRUCache.h"

LRUCache::LRUCache(int capacity) : capacity(capacity) {}

void LRUCache::access(const Song& song) {
    const std::string& id = song.getSongId();

    auto it = lookup.find(id);
    if (it != lookup.end()) {
        // Already cached — move it to the front (most recently used)
        usageOrder.erase(it->second);
        lookup.erase(it);
    } else if (static_cast<int>(usageOrder.size()) >= capacity) {
        // At capacity — evict the least recently used (back of list)
        const Song& lru = usageOrder.back();
        lookup.erase(lru.getSongId());
        usageOrder.pop_back();
    }

    usageOrder.push_front(song);
    lookup[id] = usageOrder.begin();
}

bool LRUCache::contains(const std::string& songId) const {
    return lookup.find(songId) != lookup.end();
}

Song* LRUCache::get(const std::string& songId) {
    auto it = lookup.find(songId);
    if (it == lookup.end()) {
        return nullptr;
    }
    // Reading counts as usage too — refresh its position
    Song song = *(it->second);
    access(song);
    return &(*lookup[songId]);
}

std::vector<Song> LRUCache::getAllInOrder() const {
    return std::vector<Song>(usageOrder.begin(), usageOrder.end());
}

int LRUCache::size() const {
    return static_cast<int>(usageOrder.size());
}
