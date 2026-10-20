package com.sunantongsan.novastriker;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import com.google.android.gms.games.PlayGames;
import org.json.JSONObject;

/**
 * Optional platform authentication, never an in-game login.
 * Does not read, replace, or clear NovaCloud sessions or player saves.
 * Recall session IDs stay native and are only delivered to a native backend caller.
 */
final class NovaPlayGames {
    interface RecallResult {
        void complete(String sessionId, String error);
    }

    private final MainActivity activity;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final PlayGamesRequestGate gate = new PlayGamesRequestGate();
    private boolean closed;
    private static final long TIMEOUT_MS = 20000;

    NovaPlayGames(MainActivity activity) {
        this.activity = activity;
    }

    /** Display-only status. This method never launches a profile creation dialog. */
    @JavascriptInterface public void check() {
        main.post(() -> authenticate(false, null));
    }

    /**
     * Native-only entry point for a future verified backend flow.
     * Call interactive=true only after an explicit player action.
     * No JavaScript interface exposes this identifier or changes game identity.
     */
    void requestRecall(boolean interactive, RecallResult result) {
        if (result == null) throw new IllegalArgumentException("result_required");
        main.post(() -> authenticate(interactive, result));
    }

    private void authenticate(boolean interactive, RecallResult result) {
        if (closed || activity.isFinishing() || activity.isDestroyed()) return;
        long request = gate.begin();
        if (request == 0) {
            if (result != null) result.complete(null, "busy");
            return;
        }
        Runnable timeout = () -> finish(request, null, result, null, "timeout", false);
        main.postDelayed(timeout, TIMEOUT_MS);
        try {
            com.google.android.gms.games.GamesSignInClient client =
                PlayGames.getGamesSignInClient(activity);
            com.google.android.gms.tasks.Task<com.google.android.gms.games.AuthenticationResult> task =
                interactive ? client.signIn() : client.isAuthenticated();
            task.addOnCompleteListener(activity, auth -> {
                if (!gate.active(request)) return;
                boolean connected = auth.isSuccessful() && auth.getResult() != null
                    && auth.getResult().isAuthenticated();
                if (!connected || result == null) {
                    finish(request, timeout, result, null,
                        connected ? null : "not_connected", connected);
                    return;
                }
                // The backend must verify this with Recall; a local Player ID is not proof.
                try {
                    PlayGames.getRecallClient(activity).requestRecallAccess()
                        .addOnCompleteListener(activity, recall -> {
                            String sessionId = recall.isSuccessful() && recall.getResult() != null
                                ? recall.getResult().getSessionId() : null;
                            if (sessionId == null || sessionId.isEmpty()) {
                                finish(request, timeout, result, null, "recall_unavailable", true);
                            } else {
                                finish(request, timeout, result, sessionId, null, true);
                            }
                        });
                } catch (RuntimeException error) {
                    finish(request, timeout, result, null, "recall_unavailable", true);
                }
            });
        } catch (RuntimeException error) {
            finish(request, timeout, result, null, "unavailable", false);
        }
    }

    private void finish(long request, Runnable timeout, RecallResult result,
                        String sessionId, String error, boolean connected) {
        if (!gate.finish(request)) return;
        if (timeout != null) main.removeCallbacks(timeout);
        if (closed || activity.isFinishing() || activity.isDestroyed()) return;
        if (result != null) {
            result.complete(sessionId, error);
            return;
        }
        try {
            activity.cloudEvent("play_games_status", new JSONObject()
                .put("connected", connected)
                .put("state", error == null ? "connected" : error)
                .put("game_account_authenticated", false));
        } catch (org.json.JSONException ignored) {
            // Optional status cannot interrupt gameplay.
        }
    }

    void destroy() {
        closed = true;
        gate.close();
        main.removeCallbacksAndMessages(null);
    }
}
