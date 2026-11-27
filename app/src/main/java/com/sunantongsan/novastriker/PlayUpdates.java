package com.sunantongsan.novastriker;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

final class PlayUpdates {
    private final Activity activity;
    private final AppUpdateManager manager;
    private boolean checking, offered;

    PlayUpdates(Activity activity) {
        this.activity = activity;
        manager = AppUpdateManagerFactory.create(activity);
    }
    void check() {
        if (checking) return;
        checking = true;
        manager.getAppUpdateInfo().addOnCompleteListener(task -> {
            checking = false;
            if (!task.isSuccessful() || activity.isFinishing() || activity.isDestroyed() || !activity.hasWindowFocus()) return;
            AppUpdateInfo info = task.getResult();
            if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                launch(info);
            } else if (!offered && info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
                offered = true;
                new AlertDialog.Builder(activity)
                    .setTitle("Duck War มีเวอร์ชันใหม่")
                    .setMessage("อัปเดตเกมผ่าน Google Play ได้เลย หรือเล่นต่อแล้วค่อยอัปเดตภายหลัง")
                    .setNegativeButton("ไว้ภายหลัง", null)
                    .setPositiveButton("อัปเดตเลย", (d, w) -> launch(info)).show();
            }
        });
    }
    private void launch(AppUpdateInfo info) {
        if (info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
            try {
                if (manager.startUpdateFlowForResult(info, AppUpdateType.IMMEDIATE, activity, 801)) return;
            } catch (android.content.IntentSender.SendIntentException ignored) {}
        }
        Uri uri = Uri.parse("https://play.google.com/store/apps/details?id=" + activity.getPackageName());
        try { activity.startActivity(new Intent(Intent.ACTION_VIEW, uri).setPackage("com.android.vending")); }
        catch (ActivityNotFoundException e) {
            try { activity.startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
            catch (ActivityNotFoundException ignored) {
                android.widget.Toast.makeText(activity, "กรุณาเปิด Google Play เพื่ออัปเดต Duck War", android.widget.Toast.LENGTH_LONG).show();
            }
        }
    }
}
