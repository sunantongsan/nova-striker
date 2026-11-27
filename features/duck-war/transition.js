(() => {
  const services = document.getElementById('duck-services');
  const note = document.getElementById('duck-note');
  const sheet = document.getElementById('sheet');
  const home = document.getElementById('home-ui');
  home.querySelector('.dock').append(services);
  services.onclick = () => { writeSave(); window.DuckHost?.openServices(); };
  const key = 'duckwar.nova-welcome.v1';
  if (!localStorage.getItem(key) && (localStorage.getItem('novaRTS1') || window.NovaCloud?.hasAccount() || window.DuckHost?.upgraded())) {
    note.showModal();
  } else {
    localStorage.setItem(key, '1');
  }
  document.getElementById('duck-note-ok').onclick = () => note.close();
  note.addEventListener('close', () => localStorage.setItem(key, '1'));
  window.DuckHaptics = window.NovaHaptics;
  let lastAllowed;
  function banner() {
    const allowed = !document.hidden && !home.hidden && !note.open && !sheet.classList.contains('open') &&
      innerWidth >= 800 && innerHeight >= 300 && !document.getElementById('panel').classList.contains('open') &&
      document.getElementById('confirm').hidden;
    if (allowed !== lastAllowed) window.NovaAds?.bannerLayoutAllowed(allowed);
    lastAllowed = allowed;
  }
  window.novaBannerLayout39 = active => document.documentElement.toggleAttribute('data-duck-banner', active);
  const observer = new MutationObserver(banner);
  [home, note, sheet, document.getElementById('panel'), document.getElementById('confirm')].forEach(el => observer.observe(el, {attributes:true}));
  window.addEventListener('resize', banner);
  document.addEventListener('visibilitychange', banner);
  banner();
})();
