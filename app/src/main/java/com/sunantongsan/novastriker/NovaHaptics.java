package com.sunantongsan.novastriker;

import android.os.Build;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.webkit.JavascriptInterface;

/** Short taps/thumps for game feedback. View haptics need no VIBRATE permission and follow the system touch-feedback setting. */
public final class NovaHaptics {
    private final View view;
    NovaHaptics(View view) { this.view = view; }

    @JavascriptInterface public void tap(String kind) {
        final int effect;
        if ("heavy".equals(kind)) effect = HapticFeedbackConstants.LONG_PRESS;
        else if ("success".equals(kind)) effect = Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
        else if ("medium".equals(kind)) effect = HapticFeedbackConstants.VIRTUAL_KEY;
        else if ("light".equals(kind)) effect = HapticFeedbackConstants.KEYBOARD_TAP;
        else effect = HapticFeedbackConstants.CLOCK_TICK;
        view.post(new Runnable() { @Override public void run() { view.performHapticFeedback(effect); } });
    }
}
