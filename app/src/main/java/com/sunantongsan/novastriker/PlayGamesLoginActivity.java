package com.sunantongsan.novastriker;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.view.Gravity;
import com.google.android.gms.games.PlayGames;

/** Non-exported activity, launched only by the player's Play Games button. */
public final class PlayGamesLoginActivity extends Activity {
    private final android.os.Handler timeout=new android.os.Handler(android.os.Looper.getMainLooper());
    @Override protected void onDestroy(){timeout.removeCallbacksAndMessages(null);super.onDestroy();}
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        int attempt=getIntent().getIntExtra("attempt",-1);
        setResult(RESULT_CANCELED,new Intent().putExtra("attempt",attempt));
        timeout.postDelayed(()->{if(!isFinishing())finish();},40000);
        TextView message=new TextView(this);message.setText("Play Games…");message.setGravity(Gravity.CENTER);setContentView(message);
        String clientId=getIntent().getStringExtra("client_id");
        if(clientId==null||!clientId.endsWith(".apps.googleusercontent.com")){finish();return;}
        PlayGames.getGamesSignInClient(this).signIn().addOnCompleteListener(this,login->{
            if(!login.isSuccessful()||!login.getResult().isAuthenticated()){finish();return;}
            PlayGames.getGamesSignInClient(this).requestServerSideAccess(clientId,false)
                .addOnCompleteListener(this,access->{
                    if(access.isSuccessful()&&access.getResult()!=null&&!access.getResult().isEmpty())
                        setResult(RESULT_OK,new Intent().putExtra("attempt",attempt).putExtra("auth_code",access.getResult()));
                    finish();
                });
        });
    }
}
