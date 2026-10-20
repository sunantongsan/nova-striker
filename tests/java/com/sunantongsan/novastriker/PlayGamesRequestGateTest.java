package com.sunantongsan.novastriker;

public final class PlayGamesRequestGateTest {
    private static void expect(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }

    public static void main(String[] args) {
        PlayGamesRequestGate gate = new PlayGamesRequestGate();
        long first = gate.begin();
        expect(first != 0, "first request starts");
        expect(gate.begin() == 0, "double tap cannot start another request");
        expect(!gate.finish(0), "missing request cannot complete");
        expect(!gate.finish(first + 100), "unrelated response cannot complete");
        expect(gate.active(first), "current SDK response is accepted");
        expect(gate.finish(first), "timeout or completion releases request");
        expect(!gate.active(first), "timed-out response cannot request Recall");
        long second = gate.begin();
        expect(second != 0 && second != first, "retry has a new generation");
        expect(!gate.finish(first), "late callback cannot finish newer request");
        expect(gate.begin() == 0, "new request still pending after stale callback");
        expect(gate.finish(second), "new callback succeeds exactly once");
        expect(!gate.finish(second), "duplicate callback ignored");
        long third = gate.begin();
        gate.close();
        expect(!gate.finish(third), "destroyed activity ignores callback");
        expect(gate.begin() == 0, "destroyed activity cannot restart");
        System.out.println("Play Games request lifecycle tests passed");
    }
}
