// Telegram production Ed25519 validation. No bot token is shipped or required.
export const BOT_ID = '8963029286';
export const PUBLIC_KEY = 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d';
export async function validateInitData(raw, options = {}) {
  if (typeof raw !== 'string' || raw.length > 16384) throw Error('invalid_init_data');
  const params = new URLSearchParams(raw), seen = new Set();
  for (const [key] of params) { if (seen.has(key)) throw Error('duplicate_field'); seen.add(key); }
  const signature = params.get('signature');
  if (!signature || !/^[A-Za-z0-9_-]{86}(==)?$/.test(signature)) throw Error('invalid_signature');
  const date = Number(params.get('auth_date')), now = options.now ?? Math.floor(Date.now()/1000);
  if (!Number.isSafeInteger(date) || date > now + 30 || now-date > 300) throw Error('expired_init_data');
  const fields = [...params].filter(([key])=>key !== 'hash' && key !== 'signature').sort(([a],[b])=>a < b ? -1 : a > b ? 1 : 0);
  const data = `${options.botId ?? BOT_ID}:WebAppData\n` + fields.map(([k,v])=>`${k}=${v}`).join('\n');
  const hex = options.publicKey ?? PUBLIC_KEY;
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(hex.match(/../g), x=>parseInt(x,16)), 'Ed25519', false, ['verify']);
  const bytes = Uint8Array.from(atob(signature.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4-signature.length%4)%4)), c=>c.charCodeAt(0));
  if (!await crypto.subtle.verify('Ed25519',key,bytes,new TextEncoder().encode(data))) throw Error('invalid_signature');
  const user = JSON.parse(params.get('user') || 'null');
  if (!user || !Number.isSafeInteger(user.id) || user.id <= 0 || user.is_bot) throw Error('invalid_user');
  return {id:String(user.id)};
}
