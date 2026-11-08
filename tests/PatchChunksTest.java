package com.sunantongsan.novastriker;
import java.io.*;
import java.nio.file.*;
import java.util.*;
public class PatchChunksTest {
    static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);}
    public static void main(String[] args)throws Exception {
        File root=new File(args[0]),cache=new File(root,"cache");cache.mkdirs();
        Map<String,Long> wanted=new LinkedHashMap<>();List<String> order=new ArrayList<>();
        for(String line:Files.readAllLines(new File(root,"chunks.tsv").toPath())){String[] p=line.split("\t");wanted.put(p[0],Long.parseLong(p[1]));order.add(p[0]);}
        List<String> expected=Files.readAllLines(new File(root,"expected.txt").toPath());
        try(InputStream in=new FileInputStream(new File(root,"old.bin"))){PatchChunks.reuse(in,cache,wanted);}
        long missing=0;List<String> absent=new ArrayList<>();
        for(String h:wanted.keySet())if(!PatchFiles.valid(new File(cache,h),wanted.get(h),h)){missing+=wanted.get(h);absent.add(h);}
        check(missing==Long.parseLong(expected.get(1)),"Java and JS content boundaries differ");
        File stable=new File(root,"installed");byte[] old=Files.readAllBytes(new File(root,"old.bin").toPath());Files.write(stable.toPath(),old);
        int saved=cache.list().length;
        // Failed chunk never replaces previous content or deletes completed chunks.
        String first=absent.get(0);
        try{PatchFiles.install(new ByteArrayInputStream(new byte[]{1,2,3}),new File(cache,first),wanted.get(first),first,n->{});throw new AssertionError("accepted truncated chunk");}catch(IOException expectedError){}
        check(cache.list().length==saved,"disconnect removed completed chunks");check(Arrays.equals(Files.readAllBytes(stable.toPath()),old),"disconnect changed installed game");
        for(String h:absent)try(InputStream in=new FileInputStream(new File(root,"output/objects/"+h))){PatchFiles.install(in,new File(cache,h),wanted.get(h),h,n->{});}
        List<File> parts=new ArrayList<>();for(String h:order)parts.add(new File(cache,h));
        long size=new File(root,"next.bin").length();PatchChunks.assemble(parts,stable,size,expected.get(0));
        check(Arrays.equals(Files.readAllBytes(stable.toPath()),Files.readAllBytes(new File(root,"next.bin").toPath())),"delta assembly differs from target");
        for(String h:wanted.keySet())check(PatchFiles.valid(new File(cache,h),wanted.get(h),h),"retry must reuse all verified chunks");
        byte[] valid=Files.readAllBytes(stable.toPath());Files.write(parts.get(0).toPath(),new byte[]{99});
        try{PatchChunks.assemble(parts,stable,size,expected.get(0));throw new AssertionError("accepted corrupt assembly");}catch(IOException expectedError){}
        check(Arrays.equals(valid,Files.readAllBytes(stable.toPath())),"bad assembly replaced good game");
        System.out.println("PASS delta: cross-language boundaries, local reuse, interrupted chunk, retry, exact assembly and corrupt rollback; network bytes="+missing);
    }
}
