package com.sunantongsan.novastriker;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.os.Bundle;
import android.webkit.*;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private WebView game;
    private GameAds ads;
    private boolean adsStarted;
    void rewardStatus(String status) { game.evaluateJavascript("window.novaRewardStatus && window.novaRewardStatus("+org.json.JSONObject.quote(status)+")",null); }
    void rewardEarned(String id) { game.evaluateJavascript("window.novaRewardEarned && window.novaRewardEarned("+org.json.JSONObject.quote(id)+")",null); }
    void adFinished() { game.evaluateJavascript("window.novaAdDone && window.novaAdDone()", null); }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        game = new WebView(this);
        game.setBackgroundColor(0xff07021a);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        ads = new GameAds(this);
        game.addJavascriptInterface(ads, "NovaAds");
        game.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                if (!adsStarted && url.equals("https://appassets.androidplatform.net/assets/index.html")) { adsStarted=true; ads.begin(); }
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                return response != null ? response : new WebResourceResponse("text/plain", "UTF-8", new java.io.ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request.isForMainFrame() && request.getUrl().toString().equals("https://nova-striker-privacy.fit-rain-4305.chatgpt.site")) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())); }
                    catch (ActivityNotFoundException ignored) { /* Offline policy remains available in the game. */ }
                }
                return true;
            }
        });
        // Resize the WebView viewport itself; WebView padding does not protect fixed HTML overlays.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xff07021a);
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int left, top, right, bottom;
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                left = safe.left; top = safe.top; right = safe.right; bottom = safe.bottom;
            } else {
                left = insets.getSystemWindowInsetLeft(); top = insets.getSystemWindowInsetTop();
                right = insets.getSystemWindowInsetRight(); bottom = insets.getSystemWindowInsetBottom();
            }
            FrameLayout.LayoutParams layout = (FrameLayout.LayoutParams) game.getLayoutParams();
            layout.setMargins(left, top, right, bottom);
            game.setLayoutParams(layout);
            return insets;
        });
        setContentView(root);
        root.requestApplyInsets();
        game.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, () -> game.evaluateJavascript("window.novaBack && window.novaBack()", null));
        }
    }
    @Override public void onBackPressed() { game.evaluateJavascript("window.novaBack && window.novaBack()", null); }
    @Override protected void onPause() {
        game.evaluateJavascript("typeof pauseGame === 'function' && pauseGame()", null);
        ads.pause(); game.onPause(); super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if(game != null) game.onResume(); if(ads != null) ads.resume(); }
    @Override protected void onDestroy() { ads.destroy(); game.removeJavascriptInterface("NovaAds"); game.destroy(); super.onDestroy(); }
}

