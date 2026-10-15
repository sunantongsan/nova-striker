package com.sunantongsan.novastriker;

import android.content.Context;
import android.util.AtomicFile;
import android.webkit.WebResourceResponse;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** Downloads data/JS only; never installs APK, dex, native libraries or permissions. */
final class GamePatcher {
    interface Listener { void progress(String message,int percent); void ready(); }
    private final Context context;
    private final Listener listener;
    private final File directory;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private volatile boolean stopped;
    private volatile HttpURLConnection connection;
    private volatile JSONObject selected;
    private JSONObject bundled, previous;
    private final Map<String,String> bundledHashes=new HashMap<>();
    private volatile Map<String,JSONObject> selectedFiles=Collections.emptyMap();
    private final android.content.SharedPreferences prefs;
    GamePatcher(Context ctx,Listener listener) {
        this.context=ctx;this.listener=listener;
        directory=new File(ctx.getFilesDir(),"game-patches");directory.mkdirs();
        prefs=ctx.getSharedPreferences("game-patches",Context.MODE_PRIVATE);
    }
    void start() { worker.execute(this::prepare); }
    private void status(String message,int percent) { if(!stopped)listener.progress(message,percent); }
    private byte[] read(InputStream in,int maximum) throws IOException {
        ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[16384];int n;
        while((n=in.read(buf))!=-1){if(out.size()+n>maximum)throw new IOException("Manifest too large");out.write(buf,0,n);}return out.toByteArray();
    }
    private JSONObject parse(byte[] bytes) throws Exception {
        JSONObject m=new JSONObject(new String(bytes,StandardCharsets.UTF_8));
        if(m.getInt("schema")!=1||!m.getString("channel").equals(BuildConfig.NOVA_PATCH_CHANNEL)||m.getInt("nativeVersion")!=BuildConfig.VERSION_CODE||m.getLong("contentVersion")<1||!PatchFiles.safeHash(m.getString("id")))throw new IOException("Incompatible manifest");
        JSONArray files=m.getJSONArray("files");Set<String> paths=new HashSet<>();long total=0;
        if(files.length()<2||files.length()>512)throw new IOException("Invalid file count");
        for(int i=0;i<files.length();i++){
            JSONObject f=files.getJSONObject(i);String path=f.getString("path");long size=f.getLong("size");
            if(!PatchFiles.safePath(path)||!paths.add(path)||!PatchFiles.safeHash(f.getString("sha256"))||size<1||size>PatchFiles.MAX_FILE)throw new IOException("Invalid patch file");total+=size;
        }
        if(total>64L*1024*1024||!paths.contains("index.html")||!paths.contains("game.js"))throw new IOException("Invalid patch");
        return m;
    }
    private JSONObject load(String name) {
        try(InputStream in=new AtomicFile(new File(directory,name)).openRead()) {return parse(read(in,256*1024));}catch(Exception e){return null;}
    }
    private void save(String name,JSONObject value) throws IOException {
        AtomicFile file=new AtomicFile(new File(directory,name));FileOutputStream out=null;
        try{out=file.startWrite();out.write(value.toString().getBytes(StandardCharsets.UTF_8));file.finishWrite(out);}catch(IOException e){file.failWrite(out);throw e;}
    }
    private boolean bundledFile(JSONObject file)throws JSONException {return file.getString("sha256").equals(bundledHashes.get(file.getString("path")));}
    private File object(JSONObject file)throws JSONException {return new File(directory,file.getString("sha256"));}
    private boolean complete(JSONObject manifest) {
        if(manifest==null)return false;
        try{JSONArray fs=manifest.getJSONArray("files");for(int i=0;i<fs.length();i++){JSONObject f=fs.getJSONObject(i);if(!bundledFile(f)&&!PatchFiles.valid(object(f),f.getLong("size"),f.getString("sha256")))return false;}return true;}catch(Exception e){return false;}
    }
    private HttpURLConnection open(String path)throws IOException {
        URL base=new URL(BuildConfig.NOVA_PATCH_ORIGIN);
        if(!base.getProtocol().equals("https")||base.getUserInfo()!=null)throw new IOException("HTTPS required");
        HttpURLConnection c=(HttpURLConnection)new URL(base,path).openConnection();connection=c;
        c.setConnectTimeout(10000);c.setReadTimeout(15000);c.setInstanceFollowRedirects(false);c.setUseCaches(false);
        c.setRequestProperty("Accept-Encoding","identity");
        int code=c.getResponseCode();if(code!=200){c.disconnect();throw new IOException("Patch server HTTP "+code);}return c;
    }
    private JSONObject fetch()throws Exception {
        HttpURLConnection c=open("/patches/"+BuildConfig.NOVA_PATCH_CHANNEL+"/native-"+BuildConfig.VERSION_CODE+"/manifest.json");
        try(InputStream in=c.getInputStream()){return parse(read(in,256*1024));}finally{c.disconnect();connection=null;}
    }
    private void select(JSONObject manifest) throws Exception {
        Map<String,JSONObject> map=new HashMap<>();JSONArray files=manifest.getJSONArray("files");for(int i=0;i<files.length();i++){JSONObject f=files.getJSONObject(i);map.put(f.getString("path"),f);}
        selectedFiles=Collections.unmodifiableMap(map);selected=manifest;
    }
    private void prepare() {
        try {
            try(InputStream in=context.getAssets().open("patch-bundled.json")){bundled=parse(read(in,256*1024));}
            JSONArray base=bundled.getJSONArray("files");for(int i=0;i<base.length();i++){JSONObject f=base.getJSONObject(i);bundledHashes.put(f.getString("path"),f.getString("sha256"));}
            previous=load("active.json");if(!complete(previous))previous=bundled;
            JSONObject pending=load("pending.json"),target=null;
            {
                for(int attempt=0;attempt<2&&!stopped;attempt++){
                    try{status("กำลังตรวจสอบข้อมูลเกม…",-1);target=fetch();break;}
                    catch(Exception e){if(attempt==0)status("กำลังเชื่อมต่อศูนย์อัปเดตอีกครั้ง…",-1);}
                }
            }
            if(stopped)return;
            if(target==null)target=pending;
            if(target==null){select(previous);status("ออฟไลน์ • ใช้ข้อมูลเกมที่พร้อมแล้ว",100);listener.ready();return;}
            if(target.getLong("contentVersion")<Math.max(bundled.getLong("contentVersion"),previous.getLong("contentVersion"))||target.getString("id").equals(prefs.getString("rejected","")))target=previous;
            if(!complete(target))save("pending.json",target);
            int retries=0;
            while(!stopped){
                try{download(target);break;}
                catch(Exception e){
                    if(stopped)return;
                    retries++;int seconds=Math.min(15,3+retries*2);
                    for(int s=seconds;s>0&&!stopped;s--){status(("Not enough storage".equals(e.getMessage())?"พื้นที่ไม่พอ กรุณาเพิ่มพื้นที่ว่าง • ":"โหลดข้อมูลยังไม่ครบ • ")+"ลองใหม่ใน "+s+" วินาที",-1);Thread.sleep(1000);}
                }
            }
            if(stopped)return;
            select(target);status("อัปเดตพร้อมแล้ว • กำลังเข้าสู่ฐานทัพ",100);listener.ready();
        } catch(Exception e){if(!stopped){status("กำลังเปิดข้อมูลเกมที่ติดตั้งไว้",100);selected=null;selectedFiles=Collections.emptyMap();listener.ready();}}
    }
    private void download(JSONObject target)throws Exception {
        JSONArray files=target.getJSONArray("files");long total=0;
        for(int i=0;i<files.length();i++){JSONObject f=files.getJSONObject(i);if(!bundledFile(f)&&!PatchFiles.valid(object(f),f.getLong("size"),f.getString("sha256")))total+=f.getLong("size");}
        final long required=total;long done=0;
        if(required>0&&directory.getUsableSpace()<required+8L*1024*1024)throw new IOException("Not enough storage");
        for(int i=0;i<files.length();i++){
            if(stopped)throw new InterruptedIOException();JSONObject f=files.getJSONObject(i);
            if(bundledFile(f)||PatchFiles.valid(object(f),f.getLong("size"),f.getString("sha256")))continue;
            long before=done;HttpURLConnection c=open("/objects/"+f.getString("sha256"));
            try(InputStream in=c.getInputStream()){
                PatchFiles.install(in,object(f),f.getLong("size"),f.getString("sha256"),n->{
                    long amount=before+n;int percent=(int)(amount*100/Math.max(1,required));
                    status(String.format(java.util.Locale.ROOT,"กำลังอัปเดตข้อมูลเกม %d%%\n%.1f / %.1f MB",percent,amount/1048576.0,required/1048576.0),percent);
                });
            }finally{c.disconnect();connection=null;}
            done+=f.getLong("size");
        }
        if(!complete(target))throw new IOException("Patch incomplete");
    }
    WebResourceResponse resource(String path) {
        JSONObject f=selectedFiles.get(path);if(f==null)return null;
        try {
            InputStream in=bundledFile(f)?context.getAssets().open(path):new FileInputStream(object(f));
            String mime=path.endsWith(".html")?"text/html":path.endsWith(".js")?"application/javascript":"image/webp";
            WebResourceResponse response=new WebResourceResponse(mime,"UTF-8",in);
            Map<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-store");response.setResponseHeaders(headers);return response;
        }catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));}
    }
    void bootSucceeded() {
        worker.execute(()->{
            try{if(selected!=null)save("active.json",selected);new AtomicFile(new File(directory,"pending.json")).delete();
                Set<String> keep=new HashSet<>();for(JSONObject m:new JSONObject[]{selected,previous})if(m!=null){JSONArray files=m.getJSONArray("files");for(int i=0;i<files.length();i++)keep.add(files.getJSONObject(i).getString("sha256"));}
                File[] all=directory.listFiles();if(all!=null)for(File f:all)if(PatchFiles.safeHash(f.getName())&&!keep.contains(f.getName()))f.delete();
            }catch(Exception ignored){}
        });
    }
    boolean rollback() {
        if(selected==null||selected.optString("id").equals(bundled.optString("id")))return false;
        prefs.edit().putString("rejected",selected.optString("id")).apply();new AtomicFile(new File(directory,"pending.json")).delete();
        try{select(previous!=null&&!previous.optString("id").equals(selected.optString("id"))?previous:bundled);return true;}catch(Exception e){return false;}
    }
    void destroy(){stopped=true;HttpURLConnection c=connection;if(c!=null)c.disconnect();worker.shutdownNow();}
}
