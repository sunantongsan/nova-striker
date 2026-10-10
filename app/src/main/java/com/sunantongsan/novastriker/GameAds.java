package com.sunantongsan.novastriker;

import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.interstitial.*;
import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.ump.*;

/** Ads can only appear at the completed-level transition, never at app/level start. */
final class GameAds {
    private final MainActivity activity;
    private final SharedPreferences prefs;
    private final ConsentInformation consent;
    private InterstitialAd ready;
    private boolean initialized, loading, showing, destroyed, foreground;
    private long lastShown = SystemClock.elapsedRealtime();
    private int generation;
    GameAds(MainActivity activity) {
        this.activity = activity;
        prefs = activity.getSharedPreferences("ads", 0);
        consent = UserMessagingPlatform.getConsentInformation(activity);
    }
    void begin() {
        if (!prefs.contains("enabled")) settings();
        else if (enabled()) requestConsent();
    }
    private boolean enabled() { return !destroyed && prefs.getBoolean("enabled", false); }
    @JavascriptInterface public void settings() {
        activity.runOnUiThread(() -> {
            if (destroyed || showing) return;
            new AlertDialog.Builder(activity).setTitle("โฆษณาและความเป็นส่วนตัว")
                .setMessage("เกมเล่นได้โดยไม่เปิดโฆษณา หากอายุ 18 ปีขึ้นไป คุณเลือกเปิดโฆษณาหลังจบด่านเพื่อสนับสนุนเกมได้ Google อาจใช้ IP รหัสอุปกรณ์ การโต้ตอบและข้อมูลวินิจฉัยเพื่อโฆษณาและป้องกันทุจริต เปลี่ยนได้ที่เมนูความเป็นส่วนตัว")
                .setPositiveButton("อายุ 18+ และเปิดโฆษณา", (d,w) -> {
                    prefs.edit().putBoolean("enabled", true).apply(); requestConsent();
                })
                .setNegativeButton("ไม่เปิด / อายุต่ำกว่า 18", (d,w) -> {
                    prefs.edit().putBoolean("enabled", false).apply(); generation++; ready=null;
                })
                .setNeutralButton("จัดการความยินยอม", (d,w) -> {
                    if (consent.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED) {
                        ready=null; generation++;
                        UserMessagingPlatform.showPrivacyOptionsForm(activity, error -> initialize());
                    }
                }).show();
        });
    }
    private void requestConsent() {
        if (!enabled()) return;
        consent.requestConsentInfoUpdate(activity, new ConsentRequestParameters.Builder().build(),
            () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity, error -> initialize()),
            error -> initialize());
        initialize();
    }
    private void initialize() {
        if (!enabled() || !consent.canRequestAds()) return;
        if (initialized) { load(); return; }
        initialized=true;
        MobileAds.setRequestConfiguration(new RequestConfiguration.Builder()
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG).build());
        new Thread(() -> MobileAds.initialize(activity, status -> activity.runOnUiThread(this::load))).start();
    }
    private void load() {
        if (!enabled() || !consent.canRequestAds() || loading || ready!=null) return;
        loading=true;
        final int requestGeneration=generation;
        Bundle extras = new Bundle(); extras.putString("npa", "1");
        AdRequest request = new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class, extras).build();
        String unit = BuildConfig.DEBUG ? "ca-app-pub-3940256099942544/1033173712" : "ca-app-pub-4585492700643566/3978484391";
        InterstitialAd.load(activity, unit, request, new InterstitialAdLoadCallback() {
            @Override public void onAdLoaded(InterstitialAd ad) {
                loading=false;
                if (enabled() && generation==requestGeneration) ready=ad;
            }
            @Override public void onAdFailedToLoad(LoadAdError error) { loading=false; ready=null; }
        });
    }
    @JavascriptInterface public void levelComplete() {
        activity.runOnUiThread(() -> {
            if (showing || destroyed) return;
            if (!enabled() || !foreground || !consent.canRequestAds() || ready==null || SystemClock.elapsedRealtime()-lastShown<90000) {
                done(); if (enabled() && initialized) load(); return;
            }
            InterstitialAd ad=ready; ready=null; showing=true;
            ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() { showing=false; lastShown=SystemClock.elapsedRealtime();done();load(); }
                @Override public void onAdFailedToShowFullScreenContent(AdError error) { showing=false;done();load(); }
            });
            try { ad.show(activity); }
            catch (RuntimeException error) { showing=false;done(); }
        });
    }
    private void done() { if (!destroyed) activity.adFinished(); }
    void resume() { foreground=true; }
    void pause() { foreground=false; }
    void destroy() { destroyed=true; generation++; ready=null; }
}
