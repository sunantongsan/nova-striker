const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'vendor/duck-war/web');
const integration = path.join(root, 'features/duck-war');
const output = path.join(root, 'app/build/generated/duckAssets/duck');
if (!fs.existsSync(path.join(source, 'game.js'))) throw Error('Initialize the pinned Duck War submodule with git submodule update --init');
fs.mkdirSync(output, {recursive: true});
fs.cpSync(path.join(source, 'assets'), path.join(output, 'assets'), {recursive: true});
const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
const marker = '<script src="game.js"></script>';
if (!html.includes(marker)) throw Error('Missing Duck War startup script');
fs.writeFileSync(path.join(output, 'index.html'), html.replace(marker,
  fs.readFileSync(path.join(integration, 'controls.html'), 'utf8') + '\n' + marker + '\n<script src="transition.js"></script>'));
const game = fs.readFileSync(path.join(source, 'game.js'), 'utf8');
const key = "var SAVE_KEY = 'duckwar.save.v1';";
if (!game.includes(key)) throw Error('Review Duck War save schema before packaging');
fs.writeFileSync(path.join(output, 'game.js'), game.replace(key,
  "var SAVE_KEY = 'duckwar.save.v1.' + (window.NovaCloud ? JSON.parse(NovaCloud.accountInfo()).id || 'guest' : 'guest');"));
for (const script of ['transition.js', 'services.js']) {
  fs.copyFileSync(path.join(integration, script), path.join(output, script));
}
