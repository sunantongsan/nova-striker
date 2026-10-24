export async function verifyPlayer(code, config, fetcher = fetch) {
  if (typeof code !== 'string' || code.length < 10 || code.length > 4096) throw Error('invalid_code');
  const response = await fetcher('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({code, client_id:config.clientId, client_secret:config.clientSecret,
      grant_type:'authorization_code', redirect_uri:''})
  });
  const token = await response.json();
  if (!response.ok || typeof token.access_token !== 'string') throw Error('invalid_code');
  const reply = await fetcher('https://games.googleapis.com/games/v1/players/me', {
    headers:{Authorization:'Bearer '+token.access_token}, signal:AbortSignal.timeout(10000)
  });
  const player = await reply.json();
  if (!reply.ok || typeof player.playerId !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(player.playerId)) throw Error('invalid_player');
  return player.playerId;
}

export async function createSession(playerId, auth) {
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode('nova-pgs:'+playerId));
  const subject = Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const email = 'pgs.'+subject+'@nova-playgames.invalid';
  const {error:creationError} = await auth.admin.createUser({email, email_confirm:true,
    app_metadata:{nova_pgs_subject:subject}, user_metadata:{display_name:'Play Games'}});
  if (creationError && !['email_exists','user_already_exists'].includes(creationError.code)) throw Error('account_unavailable');
  const {data:link,error} = await auth.admin.generateLink({type:'magiclink',email});
  // Never trust user_metadata or an email match as proof of a Play Games identity.
  if (error || link?.user?.app_metadata?.nova_pgs_subject !== subject || !link.properties?.hashed_token)
    throw Error('identity_mismatch');
  const result = await auth.verifyOtp({token_hash:link.properties.hashed_token,type:'email'});
  if (result.error || !result.data?.session || result.data.user?.id !== link.user.id) throw Error('session_unavailable');
  const s=result.data.session;
  return {access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at,user:s.user};
}
