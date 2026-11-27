// Prepare the server receipt while the offer is visible. Only a player tap may show a video.
(function installReadyVideos() {
 var ads = root.NovaAds;
 if (!ads || !ads.rewardVerified || !ads.cancelRewardLoad254 || ads.provider === 'monetag') return;
 var reservations = new Map(), serial = 0, timer, legacyRetryAt = 0;
 function enabled(kind) {
  if (kind === 'checkin') return testWallet && testWallet.admob230 && !testWallet.test_checkin248;
  return liveAds400 || E.d.admob230 || (testWallet && testWallet.admob230);
 }
 function offer(kind, id) {
  if (!root.NovaCloud || !root.NovaCloud.warRequest) return null;
  if (!enabled(kind)) return null;
  var checkin = kind === 'checkin';
  var owner = checkin ? testWallet.owner : E.d.onlineCrystal && E.d.onlineCrystal.owner;
  if (!owner) return null;
  if (checkin && (!checkinState233 || checkinState233.claimed ||
      Date.now() - dailyClockOffset340 >= Date.parse(checkinState233.next_reset))) return null;
  if (checkin ? E.d.pendingAd230 : E.d.pendingSpeed264) return null;
  var target = checkin ? null : speedSnapshot264(kind, id);
  if (!checkin && !target) return null;
  var key = JSON.stringify([owner, kind, checkin ? checkinState233.day : target]);
  return {key:key, owner:owner, kind:kind, target:target};
 }
 function prepare(o) {
  var now = Date.now();
  var entry = reservations.get(o.key);
  if (entry && entry.receipt && Date.parse(entry.receipt.expires_at) <= now + 5000) {
   reservations.delete(o.key);
   entry = null;
  }
  if (!entry) {
   entry = {offer:o, id:nonce160(), retryAt:0};
   // Do not accumulate reservations for completed or abandoned jobs.
   for (var [key, old] of reservations) {
    if (old.created < now - 1800000) reservations.delete(key);
   }
   entry.created = now;
   reservations.set(o.key, entry);
  }
  if (entry.receipt || now < entry.retryAt) return entry;
  entry.call = 'warm-ad-' + (++serial);
  entry.retryAt = now + 30000;
  var payload = {owner:o.owner, request_id:entry.id};
  if (o.target) { payload.speed264 = 'prepare'; payload.target = o.target; }
  else { payload.admob230 = 'prepare'; payload.kind = 'checkin'; }
  try {root.NovaCloud.warRequest(o.target ? 'test_status' : 'research', JSON.stringify(payload), entry.call);}
  catch (e) {entry.call = null;}
  return entry;
 }
 var previousCloud = root.novaCloudEvent;
 root.novaCloudEvent = function(event, data) {
  if (event === 'signed_out' || event === 'signed_in') reservations.clear();
  var call = data && data.request_id;
  if (typeof call !== 'string' || !call.startsWith('warm-ad-')) return previousCloud(event, data);
  for (var entry of reservations.values()) {
   if (entry.call !== call) continue;
   entry.call = null;
   var result = data.data, target = entry.offer.target;
   var receipt = result && (target ? result.receipt : result.ad_reward);
   if (event === 'war' && receipt && result.owner === entry.offer.owner && receipt.id === entry.id &&
       !receipt.claimed && !receipt.cancelled && !receipt.verified && Date.parse(receipt.expires_at) > Date.now() &&
       (target ? receipt.provider === 'admob' && receipt.target && Object.keys(target).every(k=>JSON.stringify(target[k])===JSON.stringify(receipt.target[k])) :
        receipt.kind === 'checkin' && receipt.day === checkinState233?.day)) {
    entry.receipt = receipt;
    entry.message = null;
   } else entry.message = data.message;
   break;
  }
  refreshSoon();
 };
 function videoAvailable() {
  return typeof ads.rewardCached === 'function' ? ads.rewardCached() : Date.now() >= legacyRetryAt && !ads.rewardProblem254?.();
 }
 function buttonOffer(button) {
  var handler = button.getAttribute('onclick') || '';
  if (handler === 'Game.checkin()') return offer('checkin');
  if (/^Game\.productionAd359\(\d+\)$/.test(handler)) return offer('training','selection359');
  if (handler === 'Game.zBoostAd412()') return offer('zfluid','z412');
  var match = /^Game\.speedAd264\('([^']+)','([^']*)'\)$/.exec(handler);
  return match && offer(match[1],match[2]);
 }
 function refreshSoon() {
  clearTimeout(timer);
  timer = setTimeout(refreshButtons, 0);
 }
 function refreshButtons() {
  clearTimeout(timer);
  if (document.hidden || modal.style.display !== 'flex') return;
  var active = false;
  for (var button of modal.querySelectorAll('button[onclick]')) {
   if (button.disabled && !button.hasAttribute('data-wait-video')) continue;
   var o = buttonOffer(button);
   var entry = o && prepare(o);
   if (entry) active = true;
   if (entry && (!entry.receipt || !videoAvailable())) {
    if (!button.hasAttribute('data-wait-video')) button.setAttribute('data-wait-video',button.innerHTML);
    button.disabled = true;
    var message = entry.message || mt251('กำลังเตรียมวิดีโอ…','Preparing video…');
    if (button.textContent !== message) button.textContent = message;
   } else if (button.hasAttribute('data-wait-video')) {
    button.innerHTML = button.getAttribute('data-wait-video');
    button.removeAttribute('data-wait-video');
    button.disabled = false;
   }
  }
  if (active) timer = setTimeout(refreshButtons,1000);
 }
 var previousOpen = open;
 open = function(html) {
  previousOpen(html);
  refreshSoon();
 };
 document.addEventListener('visibilitychange',refreshSoon);
 function consume(o) {
  var entry = prepare(o);
  if (!entry.receipt || !videoAvailable()) {
   toast(entry.message || mt251('วิดีโอยังไม่พร้อม เล่นต่อได้เลย','Video not ready yet. You can keep playing.'));
   refreshSoon();
   return null;
  }
  return entry;
 }
 function otherVideoActive() {
  return speedBusy264 || mineShow251 || !mediaAllowed250() ||
   (typeof titanAd342 !== 'undefined' && titanAd342);
 }
 var previousCheckin = Game.checkin;
 Game.checkin = function() {
  if (otherVideoActive() || document.hidden) return;
  var o = offer('checkin');
  if (!o) return previousCheckin.apply(this,arguments);
  if (warBusy && lastWarRequest?.payload?.checkin395 === 'free') return;
  var entry = consume(o);
  if (!entry) return;
  E.d.pendingAd230 = {kind:'checkin', job:null, owner:o.owner, request_id:entry.id, receipt:entry.receipt};
  if (!E.save()) {delete E.d.pendingAd230;return;}
  reservations.delete(o.key);
  Game.showAd230();
 };
 Game.promoClaim = Game.checkin;
 var previousSpeed = Game.speedAd264;
 Game.speedAd264 = function(kind,id) {
  if (otherVideoActive() || document.hidden) return;
  var o = offer(kind,id);
  if (!o) return previousSpeed.apply(this,arguments);
  if (E.d.siegeLocked || liveRoom && !liveRoom.finished) return;
  var entry = consume(o);
  if (!entry) return;
  var p = {owner:o.owner, target:o.target, request_id:entry.id, expires_at:entry.receipt.expires_at, provider:'admob'};
  E.d.pendingSpeed264 = p;
  if (!E.save()) {delete E.d.pendingSpeed264;return;}
  reservations.delete(o.key);
  speedRetry264 = null;
  speedAttempts264 = 0;
  speedAdShow264(p);
 };
 // Older Android builds have a preload but no readiness getter. Cancel a cache miss
 // immediately; the download continues without opening a video later by itself.
 var previousStatus = root.novaRewardStatus;
 root.novaRewardStatus = function(status) {
  var pending = speedShowing264 ? E.d.pendingSpeed264 : E.d.pendingAd230?.showRequested && E.d.pendingAd230;
  if (status === 'loading' && pending && (pending.provider === 'admob' || pending.kind === 'checkin')) {
   if (!speedShowing264) ads.cancelRewardLoad254(pending.request_id);
   legacyRetryAt = Date.now()+3000;
   return previousStatus('unavailable');
  }
  return previousStatus(status);
 };
})();
