package com.sunantongsan.novastriker;

/** UI-thread request generation guard. Late SDK callbacks cannot finish a newer request. */
final class PlayGamesRequestGate {
    private long generation;
    private long pending;
    private boolean closed;

    long begin() {
        if (closed || pending != 0) return 0;
        pending = ++generation;
        return pending;
    }

    boolean active(long request) {
        return !closed && request != 0 && request == pending;
    }

    boolean finish(long request) {
        if (closed || request == 0 || request != pending) return false;
        pending = 0;
        return true;
    }

    void close() {
        closed = true;
        pending = 0;
    }
}
