package com.sunantongsan.novastriker;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.interstitial.*;
import com.google.android.gms.ads.rewarded.*;
import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.ump.*;

/** Interstitials only at transitions; rewarded ads only after an explicit request. No reward on dismissal. */
final class GameAds {
    private final MainActivity activity;
    private final SharedPreferences prefs;
    private final ConsentInformation consent;
    private InterstitialAd ready;
    private RewardedAd rewardReady;
    private boolean rewardLoading;
    private long rewardLoadedAt;
    private static final String REWARD_UNIT = "ca-app-pub-4585492700643566/9387691342"; // Nova optional reward; UI remains gated until verified rewards are ready.
    private void rewardStatus(String status) { if(!destroyed) activity.rewardStatus(status); }
    void deliverPending() {
        String pending=prefs.getString("rewardPending", "");
        if(!destroyed && !pending.isEmpty()) activity.rewardEarned(pending);
    }
    @JavascriptInterface public void acknowledgeReward(String id) {
        activity.runOnUiThread(() -> { if(id.equals(prefs.getString("rewardPending", ""))) prefs.edit().remove("rewardPending").apply(); });
    }
    @JavascriptInterface public void reward() { rewardStatus("unconfigured"); }
    @JavascriptInterface public void rewardVerified(String owner, String intent) {
        if(owner==null || intent==null || !owner.matches("[0-9a-fA-F-]{36}") || !intent.matches("[0-9a-fA-F-]{36}")) return;
        activity.runOnUiThread(() -> {
            if(destroyed || showing) return;
            if(!prefs.getString("rewardPending", "").isEmpty()) { deliverPending(); return; }
            String unit=BuildConfig.DEBUG?"ca-app-pub-3940256099942544/5224354917":REWARD_UNIT;
            if(unit.isEmpty()) { rewardStatus("unconfigured"); return; }
            if(!enabled() || !consent.canRequestAds()) { rewardStatus("disabled"); return; }
            if(rewardReady==null || SystemClock.elapsedRealtime()-rewardLoadedAt>3500000L) {
                if(rewardLoading) { rewardStatus("loading"); return; }
                rewardReady=null; rewardLoading=true; rewardStatus("loading"); final int gen=generation;
                Bundle extras=new Bundle(); extras.putString("npa","1");
                RewardedAd.load(activity,unit,new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class,extras).build(),new RewardedAdLoadCallback(){
                    @Override public void onAdLoaded(RewardedAd ad){rewardLoading=false;if(enabled()&&generation==gen){rewardReady=ad;rewardLoadedAt=SystemClock.elapsedRealtime();rewardStatus("ready");}}
                    @Override public void onAdFailedToLoad(LoadAdError error){rewardLoading=false;rewardReady=null;rewardStatus("unavailable");}
                }); return;
            }
            if(!foreground) return;
            RewardedAd ad=rewardReady;rewardReady=null;
            ad.setServerSideVerificationOptions(new ServerSideVerificationOptions.Builder().setUserId(owner).setCustomData(intent).build());
            showing=true;final boolean[] earned={false};
            ad.setFullScreenContentCallback(new FullScreenContentCallback(){
                @Override public void onAdDismissedFullScreenContent(){showing=false;if(!earned[0])rewardStatus("closed");deliverPending();}
                @Override public void onAdFailedToShowFullScreenContent(AdError error){showing=false;rewardStatus("unavailable");}
            });
            try { ad.show(activity,item -> {
                if(earned[0]||destroyed) return;earned[0]=true;
                long earnedAt=System.currentTimeMillis(),earnedDay=(earnedAt+25200000L)/86400000L;
                int count=earnedDay==prefs.getLong("rewardDay",-1)?prefs.getInt("rewardCount",0):0;
                String id=java.util.UUID.randomUUID().toString();
                prefs.edit().putLong("rewardDay",earnedDay).putInt("rewardCount",count+1).putLong("rewardLast",earnedAt).putString("rewardPending",id).commit();
                deliverPending();
            }); } catch(RuntimeException error){showing=false;rewardStatus("unavailable");}
        });
    }
    // Explicit demo-ad path. It never emits a production rewarded/SSV callback.
    private boolean testLoading248;
    private void deliverTest248() {
        String intent=prefs.getString("testIntent248", ""), owner=prefs.getString("testOwner248", "");
        if(!destroyed&&!intent.isEmpty())activity.testRewardEarned248(owner,intent);
    }
    @JavascriptInterface public void acknowledgeTest248(String intent) {
        activity.runOnUiThread(()->{if(intent.equals(prefs.getString("testIntent248","")))prefs.edit().remove("testIntent248").remove("testOwner248").apply();});
    }
    @JavascriptInterface public void rewardTest248(String owner,String intent) {
        if(owner==null||intent==null||!owner.matches("[0-9a-fA-F-]{36}")||!intent.matches("[0-9a-fA-F-]{36}"))return;
        activity.runOnUiThread(()->{
            if(destroyed)return;
            if(!prefs.getString("testIntent248","").isEmpty()){deliverTest248();return;}
            if(showing||testLoading248){rewardStatus("loading");return;}
            if(!enabled()||!consent.canRequestAds()){rewardStatus("disabled");return;}
            testLoading248=true;rewardStatus("loading");final int gen=generation;
            RewardedAd.load(activity,"ca-app-pub-3940256099942544/5224354917",new AdRequest.Builder().build(),new RewardedAdLoadCallback(){
                @Override public void onAdFailedToLoad(LoadAdError error){testLoading248=false;if(!destroyed)rewardStatus("unavailable");}
                @Override public void onAdLoaded(RewardedAd ad){
                    testLoading248=false;if(destroyed)return;
                    if(!enabled()||!consent.canRequestAds()||generation!=gen||!foreground||showing){rewardStatus("unavailable");return;}
                    showing=true;final boolean[] earned={false};rewardStatus("test_showing248");
                    ad.setFullScreenContentCallback(new FullScreenContentCallback(){
                        @Override public void onAdDismissedFullScreenContent(){showing=false;if(!earned[0])rewardStatus("closed");else deliverTest248();}
                        @Override public void onAdFailedToShowFullScreenContent(AdError error){showing=false;rewardStatus("unavailable");}
                    });
                    try{ad.show(activity,item->{if(earned[0]||destroyed)return;earned[0]=true;prefs.edit().putString("testIntent248",intent).putString("testOwner248",owner).commit();deliverTest248();});}
                    catch(RuntimeException error){showing=false;rewardStatus("unavailable");}
                }
            });
        });
    }

    @JavascriptInterface public void bannerLayoutAllowed(boolean allowed) {
        activity.runOnUiThread(() -> { if(!destroyed) activity.setBannerLayoutAllowed(allowed); });
    }
    private AdView banner;
    private boolean bannerLoaded;
    private final android.os.Handler bannerHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable bannerRetry = this::loadBanner;
    private void clearBanner() {
        bannerHandler.removeCallbacks(bannerRetry);
        bannerLoaded=false;
        activity.showBanner(null);
        if (banner!=null) { banner.destroy(); banner=null; }
    }
    private void loadBanner() {
        if (!initialized || !foreground || !enabled() || !consent.canRequestAds() || banner!=null) return;
        bannerHandler.removeCallbacks(bannerRetry);
        final AdView view=new AdView(activity);
        final int gen=generation;
        banner=view;
        view.setAdSize(AdSize.BANNER);
        view.setAdUnitId(BuildConfig.DEBUG ? "ca-app-pub-3940256099942544/6300978111" : "ca-app-pub-4585492700643566/9131827435");
        view.setAdListener(new AdListener() {
            @Override public void onAdLoaded() {
                if (banner!=view || destroyed || gen!=generation) return;
                if (!enabled() || !consent.canRequestAds()) { clearBanner(); return; }
                bannerLoaded=true;
                if (foreground) activity.showBanner(view);
            }
            @Override public void onAdFailedToLoad(LoadAdError error) {
                if (banner!=view || destroyed) return;
                clearBanner();
                if (foreground && enabled() && consent.canRequestAds()) bannerHandler.postDelayed(bannerRetry,60000);
            }
        });
        Bundle extras=new Bundle(); extras.putString("npa","1");
        view.loadAd(new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class,extras).build());
    }
    private boolean initialized, loading, showing, destroyed, foreground;
    private long lastShown = SystemClock.elapsedRealtime();
    private int generation;
    GameAds(MainActivity activity) {
        this.activity = activity;
        prefs = activity.getSharedPreferences("ads", 0);
        consent = UserMessagingPlatform.getConsentInformation(activity);
    }
    void begin() {
        deliverTest248();
        deliverPending();
        if (enabled()) requestConsent();
    }
    private boolean enabled() { return !destroyed; }
    // Ads are on by default, like other games. Google's consent form (UMP) appears by itself only
    // where the law requires it; this opens Google's privacy options there and does nothing elsewhere.
    @JavascriptInterface public boolean privacyRequired() {
        return consent.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
    }
    @JavascriptInterface public void settings() {
        activity.runOnUiThread(() -> {
            if (destroyed || showing || !privacyRequired()) return;
            ready=null; rewardReady=null; generation++; clearBanner();
            UserMessagingPlatform.showPrivacyOptionsForm(activity, error -> initialize());
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
        loadBanner();
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
    void resume() { foreground=true; if(banner!=null) { banner.resume(); if(bannerLoaded && enabled() && consent.canRequestAds()) activity.showBanner(banner); } else loadBanner(); }
    void pause() { foreground=false; bannerHandler.removeCallbacks(bannerRetry); if(banner!=null) banner.pause(); activity.showBanner(null); }
    void destroy() { destroyed=true; generation++; ready=null; rewardReady=null; clearBanner(); }
}



