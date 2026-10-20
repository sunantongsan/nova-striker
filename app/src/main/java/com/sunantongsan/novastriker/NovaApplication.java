package com.sunantongsan.novastriker;

import android.app.Application;
import android.util.Log;
import com.google.android.gms.games.PlayGamesSdk;

/** Platform identity only. Supabase remains the owner of the game session. */
public final class NovaApplication extends Application {
    @Override public void onCreate() {
        super.onCreate();
        try {
            PlayGamesSdk.initialize(this);
        } catch (RuntimeException error) {
            // Optional platform features must never stop Google login or local play.
            Log.w("NovaPlayGames", "Play Games initialization unavailable");
        }
    }
}
