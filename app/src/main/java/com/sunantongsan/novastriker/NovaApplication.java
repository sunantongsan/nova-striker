package com.sunantongsan.novastriker;
import android.app.Application;
import com.google.android.gms.games.PlayGamesSdk;
public final class NovaApplication extends Application {
 @Override public void onCreate(){super.onCreate();if(BuildConfig.NOVA_PGS_ENABLED)PlayGamesSdk.initialize(this);}
}
