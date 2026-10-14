package com.sunantongsan.novastriker;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.util.Base64;
import org.json.JSONObject;
import org.json.JSONArray;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Optional private campaign backups. Tokens never enter JavaScript; PKCE browser login. */
final class NovaCloud {
    private final MainActivity activity;
    private final SharedPreferences prefs;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private boolean closed;
    private static final String CALLBACK="novastriker://auth/callback";
    NovaCloud(MainActivity activity){this.activity=activity;prefs=activity.getSharedPreferences("nova_cloud",0);}
    private void emit(String event,JSONObject data){activity.runOnUiThread(()->{if(!closed)activity.cloudEvent(event,data);});}
    private void status(String text){try{emit("status",new JSONObject().put("message",text));}catch(Exception ignored){}}
    private String encode(byte[] bytes){return Base64.encodeToString(bytes,Base64.URL_SAFE|Base64.NO_WRAP|Base64.NO_PADDING);}
    private SecretKey encryptionKey() throws Exception {
        KeyStore store=KeyStore.getInstance("AndroidKeyStore");store.load(null);
        if(!store.containsAlias("nova_cloud_session")){
            KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            gen.init(new KeyGenParameterSpec.Builder("nova_cloud_session",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());gen.generateKey();
        }
        return ((KeyStore.SecretKeyEntry)store.getEntry("nova_cloud_session",null)).getSecretKey();
    }
    private void keep(JSONObject session)throws Exception {
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,encryptionKey());
        byte[] encrypted=cipher.doFinal(session.toString().getBytes(StandardCharsets.UTF_8));
        prefs.edit().putString("session",encode(encrypted)).putString("iv",encode(cipher.getIV())).commit();
    }
    private JSONObject read()throws Exception {
        String encrypted=prefs.getString("session","");if(encrypted.isEmpty())throw new Exception("login_required");
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,encryptionKey(),new GCMParameterSpec(128,Base64.decode(prefs.getString("iv",""),Base64.URL_SAFE)));
        return new JSONObject(new String(cipher.doFinal(Base64.decode(encrypted,Base64.URL_SAFE)),StandardCharsets.UTF_8));
    }
    private String request(String path,String method,JSONObject body,String token)throws Exception {
        HttpsURLConnection c=(HttpsURLConnection)new URL(BuildConfig.NOVA_CLOUD_URL+path).openConnection();
        c.setConnectTimeout(15000);c.setReadTimeout(15000);c.setInstanceFollowRedirects(false);c.setRequestMethod(method);c.setRequestProperty("apikey",BuildConfig.NOVA_CLOUD_KEY);c.setRequestProperty("Content-Type","application/json");c.setRequestProperty("Prefer","return=representation");
        if(token!=null)c.setRequestProperty("Authorization","Bearer "+token);
        try{if(body!=null){c.setDoOutput(true);try(java.io.OutputStream out=c.getOutputStream()){out.write(body.toString().getBytes(StandardCharsets.UTF_8));}}
            int code=c.getResponseCode();java.io.InputStream input=code>=200&&code<300?c.getInputStream():c.getErrorStream();
            java.io.ByteArrayOutputStream buffer=new java.io.ByteArrayOutputStream();if(input!=null)try(java.io.InputStream in=input){byte[] bytes=new byte[4096];int n;while((n=in.read(bytes))!=-1){buffer.write(bytes,0,n);if(buffer.size()>262144)throw new Exception("response_too_large");}}
            if(code<200||code>=300)throw new Exception("http_"+code);
            return buffer.toString("UTF-8");
        }finally{c.disconnect();}
    }
    private JSONObject session()throws Exception {
        JSONObject s=read();if(s.optLong("expires_at")*1000<System.currentTimeMillis()+60000){s=new JSONObject(request("/auth/v1/token?grant_type=refresh_token","POST",new JSONObject().put("refresh_token",s.getString("refresh_token")),null));keep(s);}return s;
    }
    @JavascriptInterface public boolean available(){return BuildConfig.NOVA_CLOUD_ENABLED;}
    @JavascriptInterface public void login(){
        if(!available()){status("เซฟ Google กำลังรอตั้งค่าเปิดใช้งาน");return;}
        activity.runOnUiThread(()->{try{
            byte[] bytes=new byte[32];new SecureRandom().nextBytes(bytes);String verifier=encode(bytes),challenge=encode(MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII)));
            prefs.edit().putString("verifier",verifier).putLong("login_at",System.currentTimeMillis()).commit();
            Uri uri=Uri.parse(BuildConfig.NOVA_CLOUD_URL+"/auth/v1/authorize").buildUpon().appendQueryParameter("provider","google").appendQueryParameter("redirect_to",CALLBACK).appendQueryParameter("code_challenge",challenge).appendQueryParameter("code_challenge_method","s256").build();
            activity.startActivity(new Intent(Intent.ACTION_VIEW,uri));
        }catch(Exception e){status("เปิดหน้าล็อกอินไม่ได้ กรุณาลองใหม่");}});
    }
    void callback(Uri uri){
        if(!available()||uri==null||!"novastriker".equals(uri.getScheme())||!"auth".equals(uri.getHost())||!"/callback".equals(uri.getPath()))return;
        String code=uri.getQueryParameter("code"),verifier=prefs.getString("verifier","");long age=System.currentTimeMillis()-prefs.getLong("login_at",0);
        prefs.edit().remove("verifier").remove("login_at").commit();
        if(code==null||verifier.isEmpty()||age<0||age>600000){status("การล็อกอินหมดอายุหรือยกเลิก กรุณาลองใหม่");return;}
        worker.execute(()->{try{JSONObject s=new JSONObject(request("/auth/v1/token?grant_type=pkce","POST",new JSONObject().put("auth_code",code).put("code_verifier",verifier),null));keep(s);emit("signed_in",new JSONObject().put("id",s.getJSONObject("user").getString("id")));}catch(Exception e){status("ล็อกอินไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่");}});
    }
    @JavascriptInterface public void load(){if(!available()){status("เซฟ Google กำลังรอตั้งค่าเปิดใช้งาน");return;}worker.execute(()->{try{JSONObject s=session();JSONArray rows=new JSONArray(request("/rest/v1/nova_rts_saves?select=revision,payload,updated_at&user_id=eq."+s.getJSONObject("user").getString("id"),"GET",null,s.getString("access_token")));emit("loaded",new JSONObject().put("id",s.getJSONObject("user").getString("id")).put("save",rows.length()>0?rows.getJSONObject(0):JSONObject.NULL));}catch(Exception e){status("โหลดเซฟไม่ได้ กรุณาล็อกอินหรือตรวจอินเทอร์เน็ต");}});}
    @JavascriptInterface public void save(String json,long revision){if(!available()||json.length()>131072||revision<0)return;worker.execute(()->{try{JSONObject s=session(),payload=new JSONObject(json);String uid=s.getJSONObject("user").getString("id"),path="/rest/v1/nova_rts_saves";JSONObject body=new JSONObject().put("payload",payload).put("revision",revision+1);if(revision==0)body.put("user_id",uid);else path+="?user_id=eq."+uid+"&revision=eq."+revision;JSONArray rows=new JSONArray(request(path,revision==0?"POST":"PATCH",body,s.getString("access_token")));if(rows.length()!=1){status("มีเซฟใหม่จากอีกเครื่อง กรุณาโหลดจากคลาวด์ก่อน");return;}emit("saved",new JSONObject().put("revision",rows.getJSONObject(0).getLong("revision")).put("id",uid));}catch(Exception e){status("บันทึกออนไลน์ไม่สำเร็จหรือเซฟขัดแย้ง โหลดเซฟล่าสุดก่อนลองใหม่");}});}
    @JavascriptInterface public void deleteSave(){if(!available())return;worker.execute(()->{try{JSONObject s=session();request("/rest/v1/nova_rts_saves?user_id=eq."+s.getJSONObject("user").getString("id"),"DELETE",null,s.getString("access_token"));emit("deleted",new JSONObject());}catch(Exception e){status("ลบข้อมูลออนไลน์ไม่สำเร็จ");}});}
    @JavascriptInterface public void logout(){worker.execute(()->{try{JSONObject s=read();request("/auth/v1/logout?scope=local","POST",null,s.getString("access_token"));}catch(Exception ignored){}prefs.edit().clear().commit();emit("signed_out",new JSONObject());});}
    void destroy(){closed=true;worker.shutdownNow();}
}
