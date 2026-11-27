(() => {
  const css = document.createElement('style');
  css.textContent = `
    #app {background:#e5f4db url('duck/assets/welcome.webp') center/cover no-repeat!important}
    #app > :not(#welcome):not(#baseNameGate):not(#modal):not(#toast):not(#boot) {display:none!important}
    #modal, #welcome, #baseNameGate {bottom:52px!important}
    #duck-account-nav {position:fixed;z-index:2147483646;inset:auto 0 0;display:flex;justify-content:center;gap:5px;padding:4px;background:#fff7e6}
    #duck-account-nav button {min-height:40px;border:1px solid #9fba7a;border-radius:12px;background:#fff;color:#263c29;font-weight:700;padding:4px 10px}
  `;
  document.head.append(css);
  const nav = document.createElement('nav');
  nav.id = 'duck-account-nav';
  nav.setAttribute('aria-label', 'บริการผู้เล่น');
  const actions = [
    ['กลับเกมเป็ด', () => DuckHost.backToDucks()],
    ['บัญชี', () => Game.cloud()],
    ['กระเป๋า', () => Game.treasury()],
    ['ร้านค้า', () => Game.shop348('nova')],
    ['เช็กอิน', () => Game.openDaily340()]
  ];
  actions.forEach(([label, action]) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = action;
    nav.append(button);
  });
  document.body.append(nav);
  if (window.NovaCloud.hasAccount()) Game.treasury();
})();
