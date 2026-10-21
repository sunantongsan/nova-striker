package com.sunantongsan.novastriker;

import android.app.Application;
import com.google.android.gms.games.PlayGamesSdk;

/** Initializes platform authentication independently of the game's cloud account. */
public final class NovaApplication extends Application {
    @Override public void onCreate() {
        super.onCreate();
        PlayGamesSdk.initialize(this);
    }
}
