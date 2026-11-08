package com.sunantongsan.novastriker;

import java.io.*;
import java.util.*;

/** Must match scripts/patch-chunks.cjs; hashes, not offsets, identify reusable bytes. */
public final class PatchChunks {
    public static final int MIN=16*1024, MAX=128*1024;
    private static final int[] GEAR=new int[256];
    static {int seed=0x12345678;for(int i=0;i<256;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;GEAR[i]=seed;}}
    public interface Sink {void accept(byte[] bytes) throws Exception;}
    public static void split(InputStream input,Sink sink)throws Exception {
        byte[] buffer=new byte[16384];ByteArrayOutputStream chunk=new ByteArrayOutputStream(MAX);
        int rolling=0,n;long total=0;
        while((n=input.read(buffer))!=-1){
            if(Thread.currentThread().isInterrupted())throw new InterruptedIOException();
            total+=n;if(total>PatchFiles.MAX_FILE)throw new IOException("File exceeds limit");
            for(int i=0;i<n;i++){
                int b=buffer[i]&255;chunk.write(b);rolling=(rolling<<1)+GEAR[b];
                if(chunk.size()>=MAX||(chunk.size()>=MIN&&(rolling&65535)==0)){
                    sink.accept(chunk.toByteArray());chunk.reset();rolling=0;
                }
            }
        }
        if(chunk.size()>0)sink.accept(chunk.toByteArray());
    }
    public static void reuse(InputStream input,File directory,Map<String,Long> wanted)throws Exception {
        split(input,bytes->{
            String hash=PatchFiles.digest(new ByteArrayInputStream(bytes),bytes.length);
            Long size=wanted.get(hash);if(size==null||size!=bytes.length)return;
            File file=new File(directory,hash);
            if(!PatchFiles.valid(file,size,hash))PatchFiles.install(new ByteArrayInputStream(bytes),file,size,hash,n->{});
        });
    }
    public static void assemble(List<File> chunks,File destination,long size,String hash)throws Exception {
        try(InputStream input=new InputStream(){
            final Iterator<File> remaining=chunks.iterator();InputStream current;
            public int read()throws IOException {byte[] one=new byte[1];int n=read(one,0,1);return n<0?-1:one[0]&255;}
            public int read(byte[] bytes,int off,int len)throws IOException {
                if(len==0)return 0;
                while(true){
                    if(current==null){if(!remaining.hasNext())return -1;current=new FileInputStream(remaining.next());}
                    int n=current.read(bytes,off,len);if(n>=0)return n;current.close();current=null;
                }
            }
            public void close()throws IOException {if(current!=null)current.close();}
        }){PatchFiles.install(input,destination,size,hash,n->{});}
    }
}
