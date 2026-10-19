// Add a public web entry without changing the Android or Telegram entry.
const fs=require('node:fs'),path=require('node:path');
function build(source=path.resolve(__dirname,'..'),output=path.join(source,'patch-dist')){
 const dest=path.join(output,'web');fs.mkdirSync(dest,{recursive:true});
 let html=fs.readFileSync(path.join(source,'web/index.html'),'utf8')
  .replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>','')
  .replace('<script src="telegram.js"></script>','<script src="browser.js"></script>')
  .replace('<title>Nova Striker • RTS</title>','<title>NOVA — เล่นบนเว็บ</title><meta name="description" content="สร้างฐาน จัดกองทัพ และออกบุกใน NOVA เล่นผ่านเว็บโดยไม่ต้องติดตั้ง"><meta property="og:title" content="NOVA — สร้างฐานและบัญชาการกองทัพ"><meta property="og:description" content="เข้าเล่นผ่านเว็บ สมัครบัญชีแล้วเริ่มภารกิจได้เลย"><meta property="og:type" content="website">');
 fs.writeFileSync(path.join(dest,'index.html'),html);
 // Existing engine accepts Storage; scope all engine storage to this web account.
 fs.writeFileSync(path.join(dest,'game.js'),fs.readFileSync(path.join(source,'game.js'),'utf8').replace(/\blocalStorage\b/g,'NovaWebStorage'));
 fs.copyFileSync(path.join(source,'web/browser.js'),path.join(dest,'browser.js'));
 fs.mkdirSync(path.join(dest,'assets'),{recursive:true});
 for(const file of fs.readdirSync(path.join(source,'assets')).filter(f=>f.endsWith('.webp')))fs.copyFileSync(path.join(source,'assets',file),path.join(dest,'assets',file));
 return dest;
}
if(require.main===module)console.log('Public web game:',build());
module.exports={build};
