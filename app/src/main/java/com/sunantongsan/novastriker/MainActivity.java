package com.sunantongsan.novastriker;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.view.View;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private WebView game;
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
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                return response != null ? response : new WebResourceResponse("text/plain", "UTF-8", new java.io.ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
        });
        setContentView(game);
        game.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        game.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, () -> game.evaluateJavascript("window.novaBack && window.novaBack()", null));
        }
    }
    @Override public void onBackPressed() { game.evaluateJavascript("window.novaBack && window.novaBack()", null); }
    @Override protected void onPause() {
        game.evaluateJavascript("typeof pauseGame === 'function' && pauseGame()", null);
        game.onPause(); super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if(game != null) game.onResume(); }
    @Override protected void onDestroy() { game.destroy(); super.onDestroy(); }
}
