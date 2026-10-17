// Add the Mini App to the existing patch output; never publish backend sources.
const fs=require('node:fs'),path=require('node:path');
function build(source=path.resolve(__dirname,'..'),output=path.join(source,'patch-dist')){
 const dest=path.join(output,'play');fs.mkdirSync(dest,{recursive:true});
 let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
 html=html.replace('<head>','<head>\n<script src="https://telegram.org/js/telegram-web-app.js"></script>\n<script src="telegram.js"></script>');
 html=html.replace('ระบบจะรอ Google ยืนยัน','ระบบจะรอผู้ให้บริการยืนยัน');
 fs.writeFileSync(path.join(dest,'index.html'),html);
 fs.writeFileSync(path.join(dest,'game.js'),fs.readFileSync(path.join(source,'game.js'),'utf8').replace('ระบบจะรอ Google ยืนยัน','ระบบจะรอ Monetag ยืนยัน'));
 fs.copyFileSync(path.join(source,'web/telegram.js'),path.join(dest,'telegram.js'));
 fs.mkdirSync(path.join(dest,'assets'),{recursive:true});
 for(const file of fs.readdirSync(path.join(source,'assets')).filter(f=>f.endsWith('.webp')))fs.copyFileSync(path.join(source,'assets',file),path.join(dest,'assets',file));
 return dest;
}
if(require.main===module)console.log('Telegram Mini App:',build());
module.exports={build};
