package com.sunantongsan.novastriker;

import java.io.*;
import java.security.MessageDigest;

/** Pure Java integrity boundary, shared by updater and JVM tests. */
public final class PatchFiles {
    public static final long MAX_FILE = 16L * 1024 * 1024;
    public static boolean safePath(String path) {
        return path.equals("index.html") || path.equals("game.js") || path.matches("assets/[a-zA-Z0-9_-]+\\.webp");
    }
    public static boolean safeHash(String hash) { return hash.matches("[a-f0-9]{64}"); }
    public static String digest(InputStream input, long limit) throws Exception {
        MessageDigest hash = MessageDigest.getInstance("SHA-256");
        byte[] buf = new byte[32768]; int n; long total = 0;
        while ((n = input.read(buf)) != -1) {
            total += n; if(total > limit) throw new IOException("File exceeds limit");
            hash.update(buf, 0, n);
        }
        StringBuilder out = new StringBuilder();
        for(byte b : hash.digest()) out.append(String.format(java.util.Locale.ROOT, "%02x", b & 255));
        return out.toString();
    }
    public static boolean valid(File file, long size, String expected) {
        if (!safeHash(expected) || size < 1 || size > MAX_FILE || !file.isFile() || file.length() != size) return false;
        try(InputStream in=new FileInputStream(file)) { return digest(in,size).equals(expected); }
        catch(Exception e) { return false; }
    }
    public interface Progress { void update(long bytes); }
    public static void install(InputStream input, File destination, long size, String expected, Progress progress) throws Exception {
        if(!safeHash(expected)||size<1||size>MAX_FILE)throw new IOException("Invalid file metadata");
        File temporary=new File(destination.getPath()+".part");
        try {
            try(FileOutputStream out=new FileOutputStream(temporary)) {
                byte[] buf=new byte[32768];int n;long total=0;
                while((n=input.read(buf))!=-1) {
                    if(Thread.currentThread().isInterrupted())throw new InterruptedIOException();
                    total+=n;if(total>size)throw new IOException("Oversized file");
                    out.write(buf,0,n);progress.update(total);
                }
                out.getFD().sync();
            }
            if(!valid(temporary,size,expected))throw new IOException("Incomplete or corrupt download");
            java.nio.file.Files.move(temporary.toPath(),destination.toPath(),java.nio.file.StandardCopyOption.ATOMIC_MOVE,java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } finally { temporary.delete(); }
    }
}
