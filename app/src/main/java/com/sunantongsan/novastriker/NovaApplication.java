package com.sunantongsan.novastriker;

import android.app.Application;
import android.app.ActivityManager;
import android.os.Build;
import android.os.Process;
import com.google.android.gms.games.PlayGamesSdk;

/** The main game process never initializes Play Games. */
public final class NovaApplication extends Application {
    @Override public void onCreate() {
        super.onCreate();
        String processName = Build.VERSION.SDK_INT >= 28 ? Application.getProcessName() : null;
        if (processName == null) {
            ActivityManager manager = (ActivityManager)getSystemService(ACTIVITY_SERVICE);
            if (manager != null && manager.getRunningAppProcesses() != null)
                for (ActivityManager.RunningAppProcessInfo info : manager.getRunningAppProcesses())
                    if (info.pid == Process.myPid()) processName = info.processName;
        }
        if ((getPackageName() + ":pgs").equals(processName)) PlayGamesSdk.initialize(this);
    }
}
