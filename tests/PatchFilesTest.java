package com.sunantongsan.novastriker;
import java.io.*;
import java.nio.file.*;
import java.util.*;
public class PatchFilesTest {
    static void check(boolean ok,String message){if(!ok)throw new AssertionError(message);}
    public static void main(String[] args)throws Exception {
        File dir=Files.createTempDirectory("nova-patch-test").toFile();File dest=new File(dir,"object");
        byte[] old="previous game".getBytes(),next="new tested game".getBytes();Files.write(dest.toPath(),old);
        String hash=PatchFiles.digest(new ByteArrayInputStream(next),next.length);
        for(byte[] bad:new byte[][]{"broken".getBytes(),"new tested game with trailing data".getBytes(),"new TESTED game".getBytes()}){
            boolean failed=false;try{PatchFiles.install(new ByteArrayInputStream(bad),dest,next.length,hash,n->{});}catch(IOException expected){failed=true;}
            check(failed,"bad content must fail");check(Arrays.equals(Files.readAllBytes(dest.toPath()),old),"failed update replaced valid game");check(!new File(dest+".part").exists(),"partial left behind");
        }
        InputStream interrupted=new InputStream(){int n;public int read()throws IOException{if(n++>3)throw new IOException("connection lost");return 'x';}};
        try{PatchFiles.install(interrupted,dest,next.length,hash,n->{});throw new AssertionError("expected disconnect");}catch(IOException expected){}
        check(Arrays.equals(Files.readAllBytes(dest.toPath()),old),"disconnect lost previous game");
        long[] progress={0};PatchFiles.install(new ByteArrayInputStream(next),dest,next.length,hash,n->progress[0]=n);
        check(PatchFiles.valid(dest,next.length,hash),"retry must install valid content");check(progress[0]==next.length,"incorrect progress");
        Files.write(dest.toPath(),"modified game".getBytes());check(!PatchFiles.valid(dest,next.length,hash),"tampering undetected");
        for(String bad:new String[]{"../game.js","assets/../../save","assets/x.apk","assets/x.dex","assets/x.so","https://evil/x","/game.js","assets/x/y.webp"})check(!PatchFiles.safePath(bad),"unsafe path accepted: "+bad);
        check(PatchFiles.safePath("assets/combat-parts-171.webp"),"valid asset rejected");
        check(!PatchFiles.safeHash("../../anything"),"invalid hash accepted");
        for(File f:dir.listFiles())f.delete();dir.delete();System.out.println("PASS patch integrity: interruption, retry, atomic replacement, corruption, path restrictions");
    }
}
