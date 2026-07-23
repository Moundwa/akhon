(function () {
  const cfg = window.APION_CONFIG || {};
  const BACKEND_URL = cfg.backendUrl || '';
  const AVATAR_SRC = cfg.avatarSrc || '';

  if (!BACKEND_URL) {
    console.warn('Apion: APION_CONFIG.backendUrl non défini — le widget restera inactif.');
  }

  const STORAGE_KEY = 'apion_history_v1';

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.textContent = `
    #apion-launcher{position:fixed;bottom:22px;right:22px;width:64px;height:64px;border-radius:50%;
      background:linear-gradient(135deg,#1f6fb2,#0b2a52);border:3px solid #fff;box-shadow:0 10px 28px rgba(11,42,82,.35);
      cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;
      transition:transform .18s ease;}
    #apion-launcher:hover{transform:scale(1.06);}
    #apion-launcher img{width:100%;height:100%;object-fit:cover;}
    #apion-badge{position:absolute;top:-2px;right:-2px;background:#e8792a;color:#fff;font-size:10px;font-weight:700;
      padding:2px 6px;border-radius:999px;font-family:'Inter',sans-serif;border:2px solid #fff;}
    #apion-panel{position:fixed;bottom:100px;right:22px;width:360px;max-width:92vw;height:500px;max-height:75vh;
      background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(11,42,82,.3);display:none;flex-direction:column;
      overflow:hidden;z-index:9999;font-family:'Inter',sans-serif;border:1px solid #e1e6ec;}
    #apion-panel.open{display:flex;}
    #apion-head{background:linear-gradient(120deg,#081d3a,#0b2a52 60%,#1f6fb2);color:#fff;padding:16px 18px;
      display:flex;align-items:center;gap:12px;flex-shrink:0;}
    #apion-head img{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.5);}
    #apion-head .apion-name{font-family:'Poppins',sans-serif;font-weight:700;font-size:15px;}
    #apion-head .apion-sub{font-size:11.5px;color:#bcdcf2;}
    #apion-close{margin-left:auto;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;
      padding:4px 6px;opacity:.85;}
    #apion-close:hover{opacity:1;}
    #apion-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f5f7fa;}
    .apion-msg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:13.8px;line-height:1.45;white-space:pre-wrap;}
    .apion-msg.user{align-self:flex-end;background:#1f6fb2;color:#fff;border-bottom-right-radius:4px;}
    .apion-msg.bot{align-self:flex-start;background:#fff;color:#1b2430;border:1px solid #e1e6ec;border-bottom-left-radius:4px;}
    .apion-msg.typing{align-self:flex-start;background:#fff;border:1px solid #e1e6ec;border-bottom-left-radius:4px;
      display:flex;gap:4px;padding:12px 14px;}
    .apion-dot{width:6px;height:6px;border-radius:50%;background:#9aa8b6;animation:apion-bounce 1.2s infinite;}
    .apion-dot:nth-child(2){animation-delay:.15s;} .apion-dot:nth-child(3){animation-delay:.3s;}
    @keyframes apion-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-4px);opacity:1;}}
    #apion-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eef1f4;background:#fff;flex-shrink:0;}
    #apion-input{flex:1;border:1.5px solid #e1e6ec;border-radius:999px;padding:10px 16px;font-size:13.5px;
      font-family:inherit;outline:none;}
    #apion-input:focus{border-color:#1f6fb2;}
    #apion-send{background:#1f6fb2;color:#fff;border:none;border-radius:50%;width:38px;height:38px;flex-shrink:0;
      cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
    #apion-send:hover{background:#154f80;}
    #apion-send:disabled{opacity:.5;cursor:not-allowed;}
    #apion-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;background:#f5f7fa;}
    .apion-chip{background:#fff;border:1px solid #cfe2f3;color:#0b2a52;font-size:12px;padding:6px 11px;
      border-radius:999px;cursor:pointer;transition:background .15s;}
    .apion-chip:hover{background:#eaf3fb;}
    @media (max-width:480px){#apion-panel{right:12px;bottom:88px;width:calc(100vw - 24px);}
      #apion-launcher{right:14px;bottom:14px;}}
  `;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const launcher = document.createElement('button');
  launcher.id = 'apion-launcher';
  launcher.setAttribute('aria-label', 'Ouvrir Apion, assistant Akhon Transit');
  launcher.innerHTML = AVATAR_SRC
    ? `<img src="${AVATAR_SRC}" alt="Apion">`
    : `<span style="color:#fff;font-weight:700;font-family:Poppins,sans-serif;">A</span>`;
  const badge = document.createElement('span');
  badge.id = 'apion-badge';
  badge.textContent = 'IA';
  launcher.appendChild(badge);

  const panel = document.createElement('div');
  panel.id = 'apion-panel';
  panel.innerHTML = `
    <div id="apion-head">
      ${AVATAR_SRC ? `<img src="${AVATAR_SRC}" alt="Apion">` : ''}
      <div>
        <div class="apion-name">Apion</div>
        <div class="apion-sub">Assistant Akhon Transit</div>
      </div>
      <button id="apion-close" aria-label="Fermer">×</button>
    </div>
    <div id="apion-messages"></div>
    <div id="apion-suggestions">
      <button class="apion-chip" data-q="Quels sont vos services ?">Vos services ?</button>
      <button class="apion-chip" data-q="Quels sont vos horaires et contacts ?">Horaires &amp; contact</button>
      <button class="apion-chip" data-q="C'est quoi le BESC-BIC ?">C'est quoi le BESC-BIC ?</button>
    </div>
    <form id="apion-form">
      <input id="apion-input" type="text" placeholder="Posez votre question..." autocomplete="off" maxlength="500">
      <button id="apion-send" type="submit" aria-label="Envoyer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector('#apion-messages');
  const formEl = panel.querySelector('#apion-form');
  const inputEl = panel.querySelector('#apion-input');
  const sendBtn = panel.querySelector('#apion-send');
  const closeBtn = panel.querySelector('#apion-close');
  const suggestionsEl = panel.querySelector('#apion-suggestions');

  // ---------- State ----------
  let history = [];
  try {
    history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    history = [];
  }

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-16)));
    } catch (e) {}
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'apion-msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'apion-msg typing';
    div.id = 'apion-typing';
    div.innerHTML = '<span class="apion-dot"></span><span class="apion-dot"></span><span class="apion-dot"></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('apion-typing');
    if (t) t.remove();
  }

  function renderHistory() {
    messagesEl.innerHTML = '';
    if (history.length === 0) {
      addMessage('bot', "Bonjour 👋 Je suis Apion, l'assistant d'Akhon Transit. Je peux vous renseigner sur nos services de transit, dédouanement, nos atouts ou vous aider à préparer votre demande de devis. Que puis-je faire pour vous ?");
    } else {
      history.forEach((h) => addMessage(h.role, h.text));
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || !BACKEND_URL) return;
    addMessage('user', text);
    history.push({ role: 'user', text });
    persist();
    inputEl.value = '';
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      hideTyping();
      const reply = data.reply || data.error || "Désolé, une erreur est survenue.";
      addMessage('assistant', reply);
      history.push({ role: 'assistant', text: reply });
      persist();
    } catch (err) {
      hideTyping();
      const msg = "Je n'arrive pas à me connecter pour le moment. Vous pouvez nous joindre directement au (+242) 04 432 73 04 ou via le formulaire de contact.";
      addMessage('assistant', msg);
      history.push({ role: 'assistant', text: msg });
      persist();
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(inputEl.value);
  });

  suggestionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.apion-chip');
    if (btn) sendMessage(btn.dataset.q);
  });

  function openPanel() {
    panel.classList.add('open');
    renderHistory();
    setTimeout(() => inputEl.focus(), 100);
  }
  function closePanel() {
    panel.classList.remove('open');
  }

  launcher.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
})();
