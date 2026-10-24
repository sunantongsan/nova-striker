package com.sunantongsan.novastriker;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.view.Gravity;
import com.google.android.gms.games.PlayGames;

/** Non-exported activity, launched only by the player's Play Games button. */
public final class PlayGamesLoginActivity extends Activity {
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        setResult(RESULT_CANCELED);
        TextView message=new TextView(this);message.setText("Play Games…");message.setGravity(Gravity.CENTER);setContentView(message);
        String clientId=getIntent().getStringExtra("client_id");
        if(clientId==null||!clientId.endsWith(".apps.googleusercontent.com")){finish();return;}
        PlayGames.getGamesSignInClient(this).signIn().addOnCompleteListener(this,login->{
            if(!login.isSuccessful()||!login.getResult().isAuthenticated()){finish();return;}
            PlayGames.getGamesSignInClient(this).requestServerSideAccess(clientId,false)
                .addOnCompleteListener(this,access->{
                    if(access.isSuccessful()&&access.getResult()!=null&&!access.getResult().isEmpty())
                        setResult(RESULT_OK,new Intent().putExtra("auth_code",access.getResult()));
                    finish();
                });
        });
    }
}
