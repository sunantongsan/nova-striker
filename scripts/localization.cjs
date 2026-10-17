// Keep locale data inside the existing game.js patch payload (Android 19–22).
const fs=require('node:fs'),path=require('node:path');
function build(root=path.resolve(__dirname,'..')){const catalog=JSON.parse(fs.readFileSync(path.join(root,'localization/en.json'),'utf8'));const runtime=fs.readFileSync(path.join(root,'localization/runtime.js'),'utf8').replace('/* NOVA_CATALOG */{}',JSON.stringify(catalog));const target=path.join(root,'game.js'),source=fs.readFileSync(target,'utf8').replace(/\/\* locale232:start \*\/[\s\S]*?\/\* locale232:end \*\/\n?/,'');fs.writeFileSync(target,'/* locale232:start */\n'+runtime+fs.readFileSync(path.join(root,'localization/currency.js'),'utf8')+'/* locale232:end */\n'+source);}
if(require.main===module)build();module.exports={build};
