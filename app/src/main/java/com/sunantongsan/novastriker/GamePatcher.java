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
    private final File directory, chunkDirectory;
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
        chunkDirectory=new File(directory,"chunks");chunkDirectory.mkdirs();
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
            if(f.has("chunks")) {
                JSONArray chunks=f.getJSONArray("chunks");long chunkTotal=0;
                if(chunks.length()<1||chunks.length()>1024)throw new IOException("Invalid chunk count");
                for(int j=0;j<chunks.length();j++) {
                    JSONObject chunk=chunks.getJSONObject(j);long length=chunk.getLong("size");
                    if(length<1||length>PatchChunks.MAX||!PatchFiles.safeHash(chunk.getString("sha256")))throw new IOException("Invalid chunk");
                    chunkTotal+=length;
                }
                if(chunkTotal!=size)throw new IOException("Invalid chunk total");
            }
        }
        if(total>64L*1024*1024||!paths.contains("index.html")||!paths.contains("game.js"))throw new IOException("Invalid patch");
        return m;
    }
    private JSONObject load(String name) {
        try(InputStream in=new AtomicFile(new File(directory,name)).openRead()) {return parse(read(in,1024*1024));}catch(Exception e){return null;}
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
    private List<String> origins() {
        List<String> result=new ArrayList<>();
        for(String value:new String[]{BuildConfig.NOVA_PATCH_ORIGIN,BuildConfig.NOVA_PATCH_BACKUP_ORIGIN}) {
            String origin=value.trim();
            if(!origin.isEmpty()&&!result.contains(origin))result.add(origin);
        }
        return result;
    }
    private HttpURLConnection open(String origin,String path)throws IOException {
        URL base=new URL(origin);
        if(!base.getProtocol().equals("https")||base.getHost().isEmpty()||base.getUserInfo()!=null||base.getQuery()!=null||base.getRef()!=null||(!base.getPath().isEmpty()&&!base.getPath().equals("/")))throw new IOException("HTTPS required");
        HttpURLConnection c=(HttpURLConnection)new URL(base,path).openConnection();connection=c;
        c.setConnectTimeout(10000);c.setReadTimeout(15000);c.setInstanceFollowRedirects(false);c.setUseCaches(false);
        c.setRequestProperty("Accept-Encoding","identity");
        try {
            int code=c.getResponseCode();if(code!=200)throw new IOException("Patch server HTTP "+code);
            return c;
        } catch(IOException e) {c.disconnect();connection=null;throw e;}
    }
    private JSONObject fetch()throws Exception {
        Exception failure=new IOException("No patch server configured");
        JSONObject newest=null;
        for(String origin:origins()) {
            if(stopped)throw new InterruptedIOException();
            HttpURLConnection c=null;
            try {
                c=open(origin,"/patches/"+BuildConfig.NOVA_PATCH_CHANNEL+"/native-"+BuildConfig.VERSION_CODE+"/manifest.json");
                try(InputStream in=c.getInputStream()) {
                    JSONObject candidate=parse(read(in,1024*1024));
                    if(candidate.getLong("contentVersion")<Math.max(bundled.getLong("contentVersion"),previous.getLong("contentVersion"))||candidate.getString("id").equals(prefs.getString("rejected","")))throw new IOException("Stale or rejected patch");
                    if(newest==null||candidate.getLong("contentVersion")>newest.getLong("contentVersion"))newest=candidate;
                }
            } catch(Exception e) {failure=e;}
            finally {if(c!=null)c.disconnect();connection=null;}
            if(!stopped)status("กำลังตรวจสอบแหล่งอัปเดตสำรอง…",-1);
        }
        if(newest!=null)return newest;
        throw failure;
    }
    private void select(JSONObject manifest) throws Exception {
        Map<String,JSONObject> map=new HashMap<>();JSONArray files=manifest.getJSONArray("files");for(int i=0;i<files.length();i++){JSONObject f=files.getJSONObject(i);map.put(f.getString("path"),f);}
        selectedFiles=Collections.unmodifiableMap(map);selected=manifest;
    }
    private void prepare() {
        try {
            try(InputStream in=context.getAssets().open("patch-bundled.json")){bundled=parse(read(in,1024*1024));}
            JSONArray base=bundled.getJSONArray("files");for(int i=0;i<base.length();i++){JSONObject f=base.getJSONObject(i);bundledHashes.put(f.getString("path"),f.getString("sha256"));}
            previous=load("active.json");if(!complete(previous))previous=bundled;
            if(origins().isEmpty()){select(previous);status("กำลังเตรียมฐานทัพ…",100);listener.ready();return;}
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
            int retries=0;
            while(!stopped){
                try{if(!complete(target))save("pending.json",target);download(target);break;}
                catch(Exception e){
                    if(stopped)return;
                    retries++;
                    if(retries>=2||"Not enough storage".equals(e.getMessage())) {
                        select(previous);status("อัปเดตยังไม่พร้อม • ใช้ข้อมูลเกมที่พร้อมแล้ว",100);listener.ready();return;
                    }
                    int seconds=Math.min(15,3+retries*2);
                    for(int s=seconds;s>0&&!stopped;s--){status(("Not enough storage".equals(e.getMessage())?"พื้นที่ไม่พอ กรุณาเพิ่มพื้นที่ว่าง • ":"โหลดข้อมูลยังไม่ครบ • ")+"ลองใหม่ใน "+s+" วินาที",-1);Thread.sleep(1000);}
                }
            }
            if(stopped)return;
            select(target);status("อัปเดตพร้อมแล้ว • กำลังเข้าสู่ฐานทัพ",100);listener.ready();
        } catch(Exception e){if(!stopped){status("กำลังเปิดข้อมูลเกมที่ติดตั้งไว้",100);selected=null;selectedFiles=Collections.emptyMap();listener.ready();}}
    }
    private boolean local(JSONObject f)throws JSONException {
        return bundledFile(f)||PatchFiles.valid(object(f),f.getLong("size"),f.getString("sha256"));
    }
    private File chunk(JSONObject c)throws JSONException {return new File(chunkDirectory,c.getString("sha256"));}
    private void reuseChunks(JSONArray files)throws Exception {
        Map<String,Long> wanted=new HashMap<>();
        Map<String,JSONObject> oldFiles=new HashMap<>();
        if(previous!=null){JSONArray old=previous.getJSONArray("files");for(int i=0;i<old.length();i++)oldFiles.put(old.getJSONObject(i).getString("path"),old.getJSONObject(i));}
        for(int i=0;i<files.length();i++){
            JSONObject f=files.getJSONObject(i);if(local(f)||!f.has("chunks"))continue;
            JSONArray chunks=f.getJSONArray("chunks");
            for(int j=0;j<chunks.length();j++){JSONObject c=chunks.getJSONObject(j);wanted.put(c.getString("sha256"),c.getLong("size"));}
        }
        if(wanted.isEmpty())return;
        status("กำลังตรวจไฟล์เดิม • ดาวน์โหลดเฉพาะส่วนที่เปลี่ยน…",-1);
        for(int i=0;i<files.length();i++){
            if(stopped)throw new InterruptedIOException();
            JSONObject f=files.getJSONObject(i);if(local(f)||!f.has("chunks"))continue;
            String path=f.getString("path");
            // Even a legacy full-file cache can supply chunks for the first delta update.
            JSONObject old=oldFiles.get(path);
            if(old!=null&&!bundledFile(old)&&PatchFiles.valid(object(old),old.getLong("size"),old.getString("sha256"))) {
                try(InputStream in=new FileInputStream(object(old))){PatchChunks.reuse(in,chunkDirectory,wanted);}
            }
            if(bundledHashes.containsKey(path))try(InputStream in=context.getAssets().open(path)){PatchChunks.reuse(in,chunkDirectory,wanted);}
        }
    }
    private void download(JSONObject target)throws Exception {
        JSONArray files=target.getJSONArray("files");
        reuseChunks(files);
        Map<String,JSONObject> transfers=new LinkedHashMap<>();long assemblyBytes=0;
        for(int i=0;i<files.length();i++){
            JSONObject f=files.getJSONObject(i);if(local(f))continue;
            if(f.has("chunks")){
                assemblyBytes+=f.getLong("size");JSONArray chunks=f.getJSONArray("chunks");
                for(int j=0;j<chunks.length();j++){
                    JSONObject c=chunks.getJSONObject(j);
                    if(!PatchFiles.valid(chunk(c),c.getLong("size"),c.getString("sha256")))transfers.put("c:"+c.getString("sha256"),c);
                }
            }else transfers.put("f:"+f.getString("sha256"),f);
        }
        long total=0;for(JSONObject f:transfers.values())total+=f.getLong("size");
        final long required=total;long done=0;
        if((required+assemblyBytes)>0&&directory.getUsableSpace()<required+assemblyBytes+8L*1024*1024)throw new IOException("Not enough storage");
        for(Map.Entry<String,JSONObject> transfer:transfers.entrySet()){
            if(stopped)throw new InterruptedIOException();JSONObject f=transfer.getValue();
            File destination=transfer.getKey().startsWith("c:")?chunk(f):object(f);
            final long before=done;
            Exception failure=new IOException("No patch server configured");boolean installed=false;
            for(String origin:origins()) {
                if(stopped)throw new InterruptedIOException();
                HttpURLConnection c=null;
                try {
                    c=open(origin,"/objects/"+f.getString("sha256"));
                    try(InputStream in=c.getInputStream()) {
                        PatchFiles.install(in,destination,f.getLong("size"),f.getString("sha256"),n->{
                            long amount=before+n;int percent=(int)(amount*100/Math.max(1,required));
                            status(String.format(java.util.Locale.ROOT,"โหลดเฉพาะส่วนที่เปลี่ยน %d%%\n%.2f / %.2f MB",percent,amount/1048576.0,required/1048576.0),percent);
                        });
                    }
                    installed=true;break;
                } catch(Exception e) {failure=e;}
                finally {if(c!=null)c.disconnect();connection=null;}
                if(!stopped)status("กำลังดาวน์โหลดส่วนที่เหลือจากแหล่งสำรอง…",-1);
            }
            if(!installed)throw failure;
            done+=f.getLong("size");
        }
        for(int i=0;i<files.length();i++){
            if(stopped)throw new InterruptedIOException();JSONObject f=files.getJSONObject(i);
            if(local(f)||!f.has("chunks"))continue;
            status("กำลังประกอบและตรวจสอบไฟล์อัปเดต…",100);
            List<File> parts=new ArrayList<>();JSONArray chunks=f.getJSONArray("chunks");
            for(int j=0;j<chunks.length();j++){JSONObject c=chunks.getJSONObject(j);if(!PatchFiles.valid(chunk(c),c.getLong("size"),c.getString("sha256")))throw new IOException("Invalid cached chunk");parts.add(chunk(c));}
            PatchChunks.assemble(parts,object(f),f.getLong("size"),f.getString("sha256"));
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
                Set<String> keepChunks=new HashSet<>();
                for(JSONObject m:new JSONObject[]{selected,previous})if(m!=null){JSONArray fs=m.getJSONArray("files");for(int i=0;i<fs.length();i++){JSONArray cs=fs.getJSONObject(i).optJSONArray("chunks");if(cs!=null)for(int j=0;j<cs.length();j++)keepChunks.add(cs.getJSONObject(j).getString("sha256"));}}
                File[] parts=chunkDirectory.listFiles();if(parts!=null)for(File f:parts)if(PatchFiles.safeHash(f.getName())&&!keepChunks.contains(f.getName()))f.delete();
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


