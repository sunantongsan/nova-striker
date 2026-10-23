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
import com.google.android.gms.games.PlayGames;

public class MainActivity extends Activity {
    private WebView game;
    private GameAds ads;
    private NovaCloud cloud;
    void cloudEvent(String event, org.json.JSONObject data) { game.evaluateJavascript("window.novaCloudEvent && window.novaCloudEvent("+org.json.JSONObject.quote(event)+","+data.toString()+")",null); }
    private boolean adsStarted, gameReady, destroyed, rolledBack;
    private GamePatcher patcher;
    private FrameLayout welcome;
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
    private FrameLayout createWelcome() {
        FrameLayout scene=new FrameLayout(this);scene.setBackgroundColor(0xff08214b);
        ImageView art=new ImageView(this);art.setScaleType(ImageView.ScaleType.CENTER_CROP);
        try(java.io.InputStream in=getAssets().open("assets/nova-welcome-217.webp")){art.setImageDrawable(android.graphics.drawable.Drawable.createFromStream(in,null));}catch(Exception ignored){}
        scene.addView(art,new FrameLayout.LayoutParams(-1,-1));
        int gap=(int)(24*getResources().getDisplayMetrics().density);
        TextView title=new TextView(this);title.setText("NOVA\nSTRIKER");title.setTextColor(0xffffdf72);title.setTextSize(38);title.setGravity(Gravity.CENTER);title.setTypeface(null,android.graphics.Typeface.BOLD_ITALIC);title.setShadowLayer(5,0,4,0xff083760);title.setPadding(0,gap,0,0);scene.addView(title,new FrameLayout.LayoutParams(-1,-2,Gravity.TOP));
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setPadding(gap,gap,gap,gap);panel.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,new int[]{0x00081936,0xee081936,0xff081936}));
        updateStatus=new TextView(this);updateStatus.setText("กำลังตรวจสอบข้อมูลเกม…");updateStatus.setTextColor(Color.WHITE);updateStatus.setTextSize(16);updateStatus.setGravity(Gravity.CENTER);updateStatus.setPadding(0,gap,0,gap);panel.addView(updateStatus,new LinearLayout.LayoutParams(-1,-2));
        updateProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);updateProgress.setMax(100);updateProgress.setIndeterminate(true);updateProgress.setProgressTintList(android.content.res.ColorStateList.valueOf(0xffb8ef7d));panel.addView(updateProgress,new LinearLayout.LayoutParams(-1,gap));
        TextView hint=new TextView(this);hint.setText("เตรียมพร้อมสู่ภารกิจ NOVA");hint.setTextColor(0xffd0efff);hint.setTextSize(13);hint.setGravity(Gravity.CENTER);hint.setPadding(0,gap,0,0);panel.addView(hint);
        scene.addView(panel,new FrameLayout.LayoutParams(-1,-2,Gravity.BOTTOM));return scene;
    }
    void rewardStatus(String status) { game.evaluateJavascript("window.novaRewardStatus && window.novaRewardStatus("+org.json.JSONObject.quote(status)+")",null); }
    void rewardEarned(String id) { game.evaluateJavascript("window.novaRewardEarned && window.novaRewardEarned("+org.json.JSONObject.quote(id)+")",null); }
    void testRewardEarned248(String owner,String intent) { game.evaluateJavascript("window.novaTestRewardEarned248 && window.novaTestRewardEarned248("+org.json.JSONObject.quote(owner)+","+org.json.JSONObject.quote(intent)+")",null); }
    void adFinished() { game.evaluateJavascript("window.novaAdDone && window.novaAdDone()", null); }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        immersive303();
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
                if (url.equals(GAME_URL)) { finishBoot(); game.getRootView().requestApplyInsets(); immersive303(); }
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
        // Render the world to every edge; reserve cutout space for HUD controls only.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xff07021a);
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        welcome=createWelcome();root.addView(welcome,new FrameLayout.LayoutParams(-1,-1));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int left=0,top=0,right=0,bottom=0;
            if(android.os.Build.VERSION.SDK_INT>=28 && insets.getDisplayCutout()!=null){
                android.view.DisplayCutout c=insets.getDisplayCutout();
                left=c.getSafeInsetLeft();top=c.getSafeInsetTop();right=c.getSafeInsetRight();bottom=c.getSafeInsetBottom();
            }
            float density=getResources().getDisplayMetrics().density;
            String js="document.documentElement.style.setProperty('--safe-left303','"+(left/density)+"px');"
                +"document.documentElement.style.setProperty('--safe-right303','"+(right/density)+"px');"
                +"document.documentElement.style.setProperty('--safe-top303','"+(top/density)+"px');"
                +"document.documentElement.style.setProperty('--safe-bottom303','"+(bottom/density)+"px');";
            game.evaluateJavascript(js,null);
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
    @Override protected void onResume() { super.onResume(); immersive303(); if(game != null) game.onResume(); if(ads != null) ads.resume();
        // PGS handles automatic sign-in. Failure must never block local play or cloud login.
        PlayGames.getGamesSignInClient(this).isAuthenticated()
            .addOnCompleteListener(this, task -> {
                if (destroyed) return;
                boolean authenticated = task.isSuccessful() && task.getResult().isAuthenticated();
                android.util.Log.i("NovaPlayGames", authenticated
                    ? "Platform authentication ready" : "Platform authentication unavailable; continue playing");
            });
    }
    private void immersive303() {
        android.view.Window window=getWindow();
        if(android.os.Build.VERSION.SDK_INT>=28){
            android.view.WindowManager.LayoutParams p=window.getAttributes();
            p.layoutInDisplayCutoutMode=android.os.Build.VERSION.SDK_INT>=30
                ? android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                : android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(p);
        }
        if(android.os.Build.VERSION.SDK_INT>=30){
            window.setDecorFitsSystemWindows(false);
            android.view.WindowInsetsController c=window.getInsetsController();
            if(c!=null){c.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);c.hide(WindowInsets.Type.systemBars());}
        }else{
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }
    @Override public void onWindowFocusChanged(boolean focused){super.onWindowFocusChanged(focused);if(focused)immersive303();}
    @Override protected void onDestroy() { destroyed=true;if(patcher!=null)patcher.destroy();cloud.destroy(); game.removeJavascriptInterface("NovaCloud"); ads.destroy(); game.removeJavascriptInterface("NovaAds"); game.destroy(); super.onDestroy(); }
}



