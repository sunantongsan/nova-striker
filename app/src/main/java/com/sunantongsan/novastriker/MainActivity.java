package com.sunantongsan.novastriker;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.os.Bundle;
import android.webkit.*;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.view.Gravity;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private WebView game;
    private GameAds ads;
    private NovaCloud cloud;
    void cloudEvent(String event, org.json.JSONObject data) { game.evaluateJavascript("window.novaCloudEvent && window.novaCloudEvent("+org.json.JSONObject.quote(event)+","+data.toString()+")",null); }
    private boolean adsStarted, gameReady, destroyed, rolledBack;
    private GamePatcher patcher;
    private LinearLayout welcome;
    private TextView updateStatus;
    private ProgressBar updateProgress;
    private static final String GAME_URL="https://appassets.androidplatform.net/assets/index.html";
    private void showProgress(String message,int percent) {
        if(destroyed)return;
        updateStatus.setText(message);updateProgress.setIndeterminate(percent<0);
        if(percent>=0)updateProgress.setProgress(percent);
    }
    private void loadPreparedGame() {
        if(destroyed)return;
        game.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        game.loadUrl(GAME_URL);
    }
    private void finishBoot() {
        game.evaluateJavascript("!!window.novaPatchReady && !window.novaPatchError", value->{
            if(destroyed)return;
            if("true".equals(value)) {
                gameReady=true;welcome.setVisibility(View.GONE);patcher.bootSucceeded();
                if(!adsStarted){adsStarted=true;ads.begin();cloud.callback(getIntent().getData());}
            } else if(!rolledBack&&patcher.rollback()) {
                rolledBack=true;showProgress("กำลังกู้คืนข้อมูลเกมชุดก่อนหน้า…",-1);loadPreparedGame();
            } else showProgress("เปิดเกมไม่สำเร็จ กรุณาปิดแล้วเปิดเกมอีกครั้ง",0);
        });
    }
    private LinearLayout createWelcome() {
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);
        int gap=(int)(24*getResources().getDisplayMetrics().density);panel.setPadding(gap,gap,gap,gap);
        panel.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,new int[]{0xff38b9ef,0xff1375bd,0xff123f77}));
        ImageView art=new ImageView(this);art.setScaleType(ImageView.ScaleType.FIT_CENTER);
        try(java.io.InputStream in=getAssets().open("assets/garrison.webp")){art.setImageDrawable(android.graphics.drawable.Drawable.createFromStream(in,null));}catch(Exception ignored){}
        panel.addView(art,new LinearLayout.LayoutParams(-1,0,1));
        TextView title=new TextView(this);title.setText("NOVA STRIKER");title.setTextColor(0xffffdf72);title.setTextSize(30);title.setGravity(Gravity.CENTER);title.setTypeface(null,android.graphics.Typeface.BOLD);panel.addView(title);
        updateStatus=new TextView(this);updateStatus.setText("กำลังตรวจสอบข้อมูลเกม…");updateStatus.setTextColor(Color.WHITE);updateStatus.setTextSize(17);updateStatus.setGravity(Gravity.CENTER);updateStatus.setPadding(0,gap,0,gap);panel.addView(updateStatus,new LinearLayout.LayoutParams(-1,-2));
        updateProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);updateProgress.setMax(100);updateProgress.setIndeterminate(true);updateProgress.setProgressTintList(android.content.res.ColorStateList.valueOf(0xffb8ef7d));panel.addView(updateProgress,new LinearLayout.LayoutParams(-1,gap));
        TextView hint=new TextView(this);hint.setText("เมื่อข้อมูลพร้อม จะเข้าสู่เกมอัตโนมัติ");hint.setTextColor(0xffd0efff);hint.setTextSize(13);hint.setGravity(Gravity.CENTER);hint.setPadding(0,gap,0,gap);panel.addView(hint);
        return panel;
    }
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
        cloud=new NovaCloud(this);
        game.addJavascriptInterface(cloud, "NovaCloud");
        game.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                if (url.equals(GAME_URL)) finishBoot();
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response=null;
                if(patcher!=null && "https".equals(request.getUrl().getScheme()) && "appassets.androidplatform.net".equals(request.getUrl().getHost())) {
                    String path=request.getUrl().getPath();
                    if(path!=null && path.startsWith("/assets/"))response=patcher.resource(path.substring(8));
                }
                if(response==null)response = assets.shouldInterceptRequest(request.getUrl());
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
        welcome=createWelcome();root.addView(welcome,new FrameLayout.LayoutParams(-1,-1));
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
            FrameLayout.LayoutParams splash=(FrameLayout.LayoutParams)welcome.getLayoutParams();splash.setMargins(left,top,right,bottom);welcome.setLayoutParams(splash);
            return insets;
        });
        setContentView(root);
        root.requestApplyInsets();
        patcher=new GamePatcher(this,new GamePatcher.Listener(){
            public void progress(String text,int percent){runOnUiThread(()->showProgress(text,percent));}
            public void ready(){runOnUiThread(()->loadPreparedGame());}
        });
        patcher.start();
        if (android.os.Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, () -> game.evaluateJavascript("window.novaBack && window.novaBack()", null));
        }
    }
    @Override protected void onNewIntent(Intent intent) { super.onNewIntent(intent); setIntent(intent); if(cloud!=null&&gameReady)cloud.callback(intent.getData()); }
    @Override public void onBackPressed() { game.evaluateJavascript("window.novaBack && window.novaBack()", null); }
    @Override protected void onPause() {
        game.evaluateJavascript("typeof pauseGame === 'function' && pauseGame()", null);
        ads.pause(); game.onPause(); super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if(game != null) game.onResume(); if(ads != null) ads.resume(); }
    @Override protected void onDestroy() { destroyed=true;if(patcher!=null)patcher.destroy();cloud.destroy(); game.removeJavascriptInterface("NovaCloud"); ads.destroy(); game.removeJavascriptInterface("NovaAds"); game.destroy(); super.onDestroy(); }
}

