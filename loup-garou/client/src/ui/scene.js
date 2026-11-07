import {
  PALETTE, ROLE_META, SPECIAL_ROLES, SETTING_BOUNDS, LIMITS, autoWolves, DEFAULT_SETTINGS,
} from '@shared/constants.js';
import { h, icon, clear } from './dom.js';
import { store, now } from '../net/store.js';
import { emit, saved, socket } from '../net/socket.js';
import { err, phaseTitle, roleName, SLEEP_LINES, CAUSE, WINNER } from '../texts.js';
import { roleCard } from './card.js';
import { colorPicker } from './colors.js';
import { openModal } from './modal.js';
import { openRules, openCredits } from './pages.js';
import { showBanner, popIn } from '../fx/fx.js';

const HEX = Object.fromEntries(PALETTE.map((c) => [c.id, c.hex]));
const NIGHT_PHASES = new Set(['lobby', 'deal', 'night']);
const MAX_SEL = { wolf_vote: 1, seer_look: 1, vote: 1, mayor_vote: 1, hunter_shot: 1, cupid_link: 2, witch: 1 };

const DURATIONS = {
  dealSeconds: ['Distribution', [8, 14, 20, 30]],
  nightSeconds: ['Étape de nuit', [15, 25, 40, 60]],
  discussionSeconds: ['Discussion', [60, 90, 120, 180, 300, 480]],
  voteSeconds: ['Vote', [20, 30, 45, 60, 90]],
};
const fmt = (s) => (s % 60 === 0 ? `${s / 60} min` : s > 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

export function mountScene(root) {
  const ui = {
    sel: [], tab: 'action', phaseKey: '', seenLog: -1, witchMode: null, unread: 0,
    seenChat: new Set(), dealCard: null, sig: '', total: 1, lastEnds: null, promptKey: '',
  };
  let st = null;

  // ---------- squelette ----------
  const ttl = h('h1', { class: 'display ttl' });
  const sub = h('p', { class: 'sub' });
  const clockFill = h('div', { class: 'clock-fill' });
  const clockTxt = h('span', { class: 'clock-txt' });
  const clock = h('div', { class: 'clock', hidden: true, role: 'timer' }, h('div', { class: 'clock-bar' }, clockFill), clockTxt);
  const roleBtn = h('button', { class: 'chip-btn', hidden: true, title: 'Voir mon rôle', onclick: () => showMyRole() }, icon('seal'), h('span', {}, 'Mon rôle'));
  const top = h('header', { class: 'top' },
    h('div', { class: 'top-l' }, ttl, sub),
    clock,
    h('div', { class: 'top-r' },
      roleBtn,
      h('button', { class: 'chip-btn', title: 'Règles', onclick: openRules }, icon('scroll'), h('span', {}, 'Règles')),
      h('button', { class: 'chip-btn', title: 'Quitter la table', onclick: leave }, icon('tomb'), h('span', {}, 'Quitter')),
    ));

  const fire = h('div', { class: 'fire', 'aria-hidden': 'true' }, icon('campfire'));
  const centerTxt = h('p', { class: 'center-txt' });
  const table = h('div', { class: 'table' }, h('div', { class: 'ring' }), fire, centerTxt);
  const watchers = h('div', { class: 'watchers' });
  const stage = h('section', { class: 'stage' }, table, watchers);

  const tabAction = h('button', { class: 'tab on', onclick: () => setTab('action') }, 'Action');
  const chatBadge = h('b', { class: 'badge', hidden: true });
  const tabChat = h('button', { class: 'tab', onclick: () => setTab('chat') }, 'Chat', chatBadge);
  const tabLog = h('button', { class: 'tab', onclick: () => setTab('log') }, 'Journal');
  const paneAction = h('div', { class: 'pane pane-action' });
  const chatList = h('div', { class: 'chat-list', 'aria-live': 'polite' });
  const chatInput = h('input', { type: 'text', maxlength: LIMITS.chatMax, autocomplete: 'off', placeholder: '…', 'aria-label': 'Message' });
  const chatForm = h('form', { class: 'chat-form', onsubmit: onChat }, chatInput, h('button', { class: 'btn small', type: 'submit' }, 'Dire'));
  const paneChat = h('div', { class: 'pane pane-chat', hidden: true }, chatList, chatForm);
  const logList = h('ol', { class: 'log' });
  const paneLog = h('div', { class: 'pane pane-log', hidden: true }, logList);
  const panel = h('aside', { class: 'panel paper nailed' },
    h('nav', { class: 'tabs', role: 'tablist' }, tabAction, tabChat, tabLog), paneAction, paneChat, paneLog);

  const conn = h('div', { class: 'conn', hidden: true }, 'Reconnexion au village…');
  const scene = h('div', { class: 'scene' }, top, stage, panel, conn);
  root.appendChild(scene);

  function setTab(t) {
    ui.tab = t;
    tabAction.classList.toggle('on', t === 'action');
    tabChat.classList.toggle('on', t === 'chat');
    tabLog.classList.toggle('on', t === 'log');
    paneAction.hidden = t !== 'action';
    paneChat.hidden = t !== 'chat';
    paneLog.hidden = t !== 'log';
    if (t === 'chat') { markChatRead(); chatList.scrollTop = chatList.scrollHeight; }
    if (t === 'log') logList.scrollTop = logList.scrollHeight;
  }

  // ---------- utilitaires ----------
  const P = (id) => st.players.find((p) => p.id === id);
  const nameTag = (id) => {
    const p = P(id);
    return h('span', { class: 'ntag', style: { '--c': HEX[p?.color] || '#999' } }, p ? p.pseudo : '?');
  };
  const submit = async (payload) => {
    const r = await emit('action:submit', payload);
    if (!r.ok) store.toast(err(r.code));
    return r;
  };
  async function leave() {
    if (!confirm('Quitter la table ? Tu perdras ta place.')) return;
    await emit('table:leave', {});
    saved.token = null;
    socket.disconnect();
    store.set({ state: null, joined: false });
  }
  function showMyRole() {
    if (!st?.you.role) return;
    const body = h('div', { class: 'role-modal' }, roleCard(st.you.role, { flipped: true }));
    openModal({ title: 'Ton rôle', body });
  }

  // ---------- table ----------
  const tokens = new Map();
  function tokenFor(p) {
    let t = tokens.get(p.id);
    if (t) return t;
    t = {
      root: h('div', { class: 'token' }),
      pawn: h('button', { class: 'pawn', type: 'button' }),
      nm: h('span', { class: 'nm' }),
      rl: h('span', { class: 'rl' }),
      seals: h('div', { class: 'vseals' }),
      init: h('span', { class: 'initial' }),
      badges: h('div', { class: 'badges' }),
    };
    t.pawn.append(t.init, t.badges);
    t.root.append(t.pawn, t.nm, t.rl, t.seals);
    t.pawn.addEventListener('click', () => onPawn(p.id));
    tokens.set(p.id, t);
    table.appendChild(t.root);
    popIn(t.root);
    return t;
  }

  function onPawn(id) {
    const pr = st.you.prompt;
    if (!pr || !isSelectable(id)) return;
    const max = MAX_SEL[pr.kind] || 1;
    const i = ui.sel.indexOf(id);
    if (i >= 0) ui.sel.splice(i, 1);
    else { ui.sel.push(id); if (ui.sel.length > max) ui.sel.shift(); }
    ui.sig = '';
    renderAll();
  }

  function isSelectable(id) {
    const pr = st?.you.prompt;
    if (!pr || !pr.targets || pr.done) return false;
    if (pr.kind === 'witch' && ui.witchMode !== 'poison') return false;
    return pr.targets.includes(id);
  }

  function votesMap() {
    if (st.votes) return st.votes;
    if (st.mayorVotes) return st.mayorVotes;
    const pr = st.you.prompt;
    if (pr?.kind === 'wolf_vote') return pr.votes;
    return null;
  }

  function renderTable() {
    const gamers = st.players.filter((p) => !p.spectator);
    const n = gamers.length || 1;
    const seen = new Set();
    const vm = votesMap() || {};
    const against = {};
    for (const [voter, target] of Object.entries(vm)) if (target) (against[target] ||= []).push(voter);
    gamers.forEach((p, i) => {
      seen.add(p.id);
      const t = tokenFor(p);
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      t.root.style.left = `${50 + 40.5 * Math.cos(a)}%`;
      t.root.style.top = `${50 + 40.5 * Math.sin(a)}%`;
      t.root.style.setProperty('--c', HEX[p.color] || '#999');
      const sel = isSelectable(p.id);
      t.root.className = ['token', p.alive ? '' : 'dead', p.connected ? '' : 'off', p.id === st.you.id ? 'me' : '', sel ? 'selectable' : '', ui.sel.includes(p.id) ? 'selected' : '', p.lover ? 'lover' : ''].filter(Boolean).join(' ');
      t.pawn.disabled = !sel;
      t.pawn.setAttribute('aria-label', p.pseudo + (p.alive ? '' : ' (mort)'));
      t.pawn.setAttribute('aria-pressed', ui.sel.includes(p.id) ? 'true' : 'false');
      t.init.textContent = p.pseudo.slice(0, 2);
      t.nm.textContent = p.pseudo;
      t.rl.textContent = p.role ? roleName(p.role) : '';
      t.rl.className = `rl${p.role === 'werewolf' ? ' wolf' : ''}`;
      // badges
      const b = [];
      if (p.isHost && st.status === 'lobby') b.push(icon('crown', 'b-crown'));
      if (p.mayor) b.push(icon('crown', 'b-mayor'));
      if (p.lover) b.push(h('span', { class: 'b-heart' }, '♥'));
      if (!p.alive) b.push(icon('tomb', 'b-tomb'));
      if (st.status === 'lobby' && p.ready) b.push(h('span', { class: 'b-ready' }, '✓'));
      t.badges.replaceChildren(...b);
      // cachets de vote
      const ss = (against[p.id] || []).map((vid) => h('span', { class: 'vs', style: { '--c': HEX[P(vid)?.color] || '#999' }, title: P(vid)?.pseudo || '' }));
      t.seals.replaceChildren(...ss);
    });
    for (const [id, t] of tokens) if (!seen.has(id)) { t.root.remove(); tokens.delete(id); }

    // spectateurs
    const specs = st.players.filter((p) => p.spectator);
    watchers.replaceChildren(...(specs.length ? [h('span', { class: 'wlbl' }, 'Spectateurs')] : []),
      ...specs.map((p) => h('span', { class: 'ntag', style: { '--c': HEX[p.color] } }, p.pseudo)));

    // texte central
    const ph = st.phase;
    let c = '';
    if (st.status === 'lobby') c = n < LIMITS.minPlayers ? `${n} / ${LIMITS.minPlayers} minimum` : `${n} autour du feu`;
    else if (st.status === 'ended') c = 'La partie est terminée';
    else c = `${st.players.filter((p) => !p.spectator && p.alive).length} en vie`;
    if (st.status === 'playing' && ph.name === 'night' && ph.step && ph.step !== 'sleep') c += ' · la nuit murmure';
    centerTxt.textContent = c;
  }

  // ---------- panneau d'action ----------
  function chips(pr, onToggleExtra) {
    const wrap = h('div', { class: 'chips' });
    for (const id of pr.targets || []) {
      const p = P(id);
      if (!p) continue;
      wrap.appendChild(h('button', {
        type: 'button', class: `chip${ui.sel.includes(id) ? ' on' : ''}`, style: { '--c': HEX[p.color] },
        disabled: !isSelectable(id), onclick: () => { onPawn(id); onToggleExtra?.(); },
      }, h('i', { class: 'dot' }), p.pseudo));
    }
    return wrap;
  }

  function notesBlock() {
    const out = [];
    const lover = st.you.notes.find((x) => x.type === 'lover');
    if (lover) out.push(h('p', { class: 'note love' }, '♥ Tu es lié(e) par amour à ', nameTag(lover.partnerId), '. Si l’un de vous meurt, l’autre le suit.'));
    for (const nt of st.you.notes) {
      if (nt.type === 'seer') out.push(h('p', { class: 'note' }, icon('seer'), 'Nuit ', String(nt.round), ' : ', nameTag(nt.targetId), ' est ', h('strong', {}, roleName(nt.role)), '.'));
      if (nt.type === 'spy') out.push(h('p', { class: 'note' }, icon('littlegirl'), nt.wolfId ? ['Tu entrevois ', nameTag(nt.wolfId), ' parmi les loups.'] : 'Tu n’as rien vu.', nt.caught ? ' Mais on t’a vue… ' : ''));
      if (nt.type === 'caught') out.push(h('p', { class: 'note warn' }, 'Nuit ', String(nt.round), ' : la Petite Fille vous espionnait. Elle est maintenant votre cible.'));
      if (nt.type === 'witch_save') out.push(h('p', { class: 'note' }, 'Tu as sauvé ', nameTag(nt.targetId), '.'));
      if (nt.type === 'witch_poison') out.push(h('p', { class: 'note' }, 'Tu as empoisonné ', nameTag(nt.targetId), '.'));
      if (nt.type === 'cupid') out.push(h('p', { class: 'note' }, 'Tu as lié ', nameTag(nt.a), ' et ', nameTag(nt.b), '.'));
      if (nt.type === 'thief') out.push(h('p', { class: 'note' }, 'Tu es devenu : ', h('strong', {}, roleName(nt.role)), '.'));
    }
    return out.length ? h('div', { class: 'notes' }, out) : null;
  }

  const confirmBtn = (label, enabled, fn, cls = 'primary') => h('button', { class: `btn ${cls}`, type: 'button', disabled: !enabled, onclick: fn }, label);
  const hint = (t) => h('p', { class: 'hint' }, t);
  const title = (t, sub) => h('div', { class: 'ptitle' }, h('h3', { class: 'display' }, t), sub ? h('p', {}, sub) : null);

  function actionNodes() {
    const you = st.you;
    const pr = you.prompt;
    const nodes = [];
    if (st.status === 'lobby') return lobbyNodes();
    if (st.status === 'ended') return endNodes();

    if (you.spectator) return [title('Tu observes', 'Une partie est en cours. Tu rejoindras la table à la prochaine.'), hint('Tu ne vois aucun rôle. Tu peux lire le village, mais pas lui parler.')];

    const nb = notesBlock();
    if (!pr) {
      if (!you.alive) {
        const me = P(you.id);
        nodes.push(title('Tu es mort', me?.deathCause ? `Tu as été ${CAUSE[me.deathCause] || 'emporté'}.` : ''), hint('Tu vois tous les rôles. Chuchote avec les autres morts dans le chat, et ne révèle rien aux vivants.'));
        if (st.phase.name === 'hunter') nodes.push(hint('Le Chasseur tire son dernier coup de feu…'));
      } else nodes.push(title('Patience…'));
      if (nb) nodes.push(nb);
      return nodes;
    }

    switch (pr.kind) {
      case 'deal': {
        if (!ui.dealCard || ui.dealCard.dataset.role !== you.role) {
          ui.dealCard = roleCard(you.role, { interactive: true });
          ui.dealCard.dataset.role = you.role;
        }
        nodes.push(title('Ta carte', 'Touche la carte pour la retourner. Retouche-la pour la cacher.'), h('div', { class: 'deal' }, ui.dealCard), hint('Ne montre ton écran à personne.'));
        break;
      }
      case 'sleep':
        nodes.push(h('div', { class: 'sleep' }, icon('moon', 'zzz'), h('p', { class: 'sleep-line' }, SLEEP_LINES[(st.phase.round + (st.phase.step?.length || 0)) % SLEEP_LINES.length])));
        if (you.role === 'werewolf') nodes.push(hint('Tu es un loup : écris à ta meute dans le chat.'));
        break;
      case 'wolf_vote': {
        const mine = pr.votes[you.id];
        nodes.push(title('Choisissez votre proie', 'Les loups doivent s’accorder. Le plus voté est dévoré.'), chips(pr),
          mine ? h('p', { class: 'cur' }, 'Ton choix : ', nameTag(mine)) : null,
          confirmBtn('Planter les crocs', ui.sel.length === 1, async () => { await submit({ type: 'wolf_vote', targetId: ui.sel[0] }); ui.sel = []; renderAll(); }));
        break;
      }
      case 'seer_look':
        nodes.push(title('Ta vision', 'Choisis un habitant dont tu veux connaître le rôle.'));
        if (pr.done) nodes.push(hint('Ta vision est faite. Ferme les yeux.'));
        else nodes.push(chips(pr), confirmBtn('Regarder', ui.sel.length === 1, async () => { await submit({ type: 'seer_look', targetId: ui.sel[0] }); ui.sel = []; renderAll(); }));
        break;
      case 'witch': {
        nodes.push(title('Tes fioles'));
        if (pr.done) { nodes.push(hint('C’est fait. Ferme les yeux.')); break; }
        nodes.push(pr.victimId ? h('p', { class: 'victim' }, icon('dagger'), 'Cette nuit, les loups ont choisi ', nameTag(pr.victimId), '.') : h('p', { class: 'victim' }, 'Les loups n’ont désigné personne.'));
        const row = h('div', { class: 'row' });
        if (pr.canSave) row.appendChild(h('button', { class: 'btn heal', onclick: () => submit({ type: 'witch', choice: 'save' }) }, icon('heartbottle'), 'Sauver'));
        if (pr.canPoison) row.appendChild(h('button', { class: `btn poison${ui.witchMode === 'poison' ? ' on' : ''}`, onclick: () => { ui.witchMode = ui.witchMode === 'poison' ? null : 'poison'; ui.sel = []; ui.sig = ''; renderAll(); } }, icon('poison'), 'Empoisonner'));
        row.appendChild(h('button', { class: 'btn', onclick: () => submit({ type: 'witch', choice: 'pass' }) }, 'Ne rien faire'));
        nodes.push(row);
        if (!pr.canSave && !pr.canPoison) nodes.push(hint('Tes deux fioles sont vides.'));
        if (ui.witchMode === 'poison' && pr.canPoison) nodes.push(chips(pr), confirmBtn('Verser le poison', ui.sel.length === 1, async () => { await submit({ type: 'witch', choice: 'poison', targetId: ui.sel[0] }); ui.sel = []; ui.witchMode = null; renderAll(); }, 'blood'));
        break;
      }
      case 'cupid_link':
        nodes.push(title('Ta flèche', 'Désigne deux habitants qui s’aimeront à la vie, à la mort.'));
        if (pr.done) nodes.push(hint('Le sort est jeté.'));
        else nodes.push(chips(pr), confirmBtn('Décocher la flèche', ui.sel.length === 2, async () => { await submit({ type: 'cupid_link', targets: ui.sel.slice() }); ui.sel = []; renderAll(); }));
        break;
      case 'thief_pick':
        nodes.push(title('Les deux cartes de côté', 'Tu peux échanger la tienne contre l’une d’elles.'));
        if (pr.done) { nodes.push(hint('Tu as choisi.')); break; }
        nodes.push(h('div', { class: 'two-cards' }, pr.options.map((r, i) => h('div', { class: 'tc' }, roleCard(r, { flipped: true, small: true }), h('button', { class: 'btn small', onclick: () => submit({ type: 'thief_pick', index: i }) }, 'Prendre')))),
          h('button', { class: 'btn', onclick: () => submit({ type: 'thief_pick', index: -1 }) }, 'Garder ma carte'));
        break;
      case 'spy':
        nodes.push(title('Les loups sont dehors', 'Tu peux entrouvrir les yeux. Mais ils pourraient te surprendre.'),
          confirmBtn('Épier les loups', !pr.used, () => submit({ type: 'spy' }), 'blood'), pr.used ? hint('Tu as déjà épié cette nuit.') : null);
        break;
      case 'mayor_vote': {
        nodes.push(title('Élection du maire', 'Sa voix comptera double. Choisis quelqu’un de fiable.'), chips(pr),
          pr.myVote ? h('p', { class: 'cur' }, 'Ton choix : ', nameTag(pr.myVote)) : null,
          confirmBtn('Voter', ui.sel.length === 1, async () => { await submit({ type: 'mayor_vote', targetId: ui.sel[0] }); ui.sel = []; renderAll(); }));
        break;
      }
      case 'discuss':
        nodes.push(title('Le village parle', 'Débattez dans le chat ou à voix haute.'),
          confirmBtn(pr.skipped ? 'Tu veux passer au vote' : 'Passer au vote', !pr.skipped, () => submit({ type: 'skip_discussion' }), 'primary'),
          hint(`${pr.skipCount} / ${pr.skipNeed} veulent voter maintenant.`));
        break;
      case 'vote':
        nodes.push(title('Qui pendre ?', 'Pose ton cachet sur le coupable. Tu peux changer d’avis jusqu’à la fin.'), chips(pr),
          pr.voted ? h('p', { class: 'cur' }, pr.myVote ? ['Ton cachet est sur ', nameTag(pr.myVote)] : 'Tu as voté blanc.') : null,
          h('div', { class: 'row' },
            confirmBtn('Poser mon cachet', ui.sel.length === 1, async () => { await submit({ type: 'vote', targetId: ui.sel[0] }); ui.sel = []; renderAll(); }),
            h('button', { class: 'btn', onclick: async () => { await submit({ type: 'vote', targetId: null }); ui.sel = []; renderAll(); } }, 'Vote blanc')));
        break;
      case 'hunter_shot':
        nodes.push(title('Dernier souffle', 'Emporte quelqu’un avec toi, ou renonce.'), chips(pr),
          h('div', { class: 'row' },
            confirmBtn('Tirer', ui.sel.length === 1, async () => { await submit({ type: 'hunter_shot', targetId: ui.sel[0] }); ui.sel = []; renderAll(); }, 'blood'),
            h('button', { class: 'btn', onclick: () => submit({ type: 'hunter_shot', targetId: null }) }, 'Renoncer')));
        break;
      default:
    }
    if (nb) nodes.push(nb);
    return nodes;
  }

  // ---------- lobby ----------
  function lobbyNodes() {
    const you = st.you;
    const gamers = st.players.filter((p) => !p.spectator);
    const n = gamers.length;
    const nodes = [title('La table', n < LIMITS.minPlayers ? `Il faut au moins ${LIMITS.minPlayers} joueurs.` : 'Tout le monde est là ? L’hôte peut lancer la partie.')];

    const list = h('ul', { class: 'roster-list' }, gamers.map((p) => h('li', { class: p.connected ? '' : 'off' },
      h('i', { class: 'dot', style: { '--c': HEX[p.color] } }),
      h('span', { class: 'rn', style: { '--c': HEX[p.color] } }, p.pseudo),
      p.isHost ? icon('crown', 'mini') : null,
      p.ready ? h('span', { class: 'ok' }, 'prêt') : null,
      !p.connected ? h('span', { class: 'ok off' }, 'absent') : null,
      you.isHost && p.id !== you.id ? h('button', { class: 'x', title: `Chasser ${p.pseudo}`, onclick: () => { if (confirm(`Chasser ${p.pseudo} de la table ?`)) emit('host:kick', { id: p.id }); } }, '×') : null)));
    nodes.push(list);

    const me = P(you.id);
    nodes.push(h('div', { class: 'row' },
      h('button', { class: `btn${me?.ready ? ' on' : ''}`, onclick: () => emit('lobby:ready', { ready: !me?.ready }) }, me?.ready ? 'Je ne suis plus prêt' : 'Je suis prêt'),
      h('button', { class: 'btn', onclick: editProfile }, 'Pseudo & couleur')));

    // Réglages
    const s = st.settings;
    const sug = autoWolves(Math.max(n, 4));
    const cfg = h('details', { class: 'settings', open: you.isHost }, h('summary', {}, 'Réglages de la partie'));
    const dis = !you.isHost;
    const rolesBox = h('div', { class: 'role-toggles' }, SPECIAL_ROLES.map((r) => h('label', { class: `rt${s.roles[r] ? ' on' : ''}`, title: ROLE_META[r].desc },
      h('input', { type: 'checkbox', checked: !!s.roles[r], disabled: dis, onchange: (e) => emit('host:config', { roles: { [r]: e.target.checked } }) }),
      icon(ROLE_META[r].icon), h('span', {}, ROLE_META[r].name))));
    const wolfSel = h('select', { disabled: dis, onchange: (e) => emit('host:config', { wolves: Number(e.target.value) }) },
      h('option', { value: 0, selected: s.wolves === 0 }, `Auto (${sug})`),
      ...[1, 2, 3, 4, 5, 6].map((k) => h('option', { value: k, selected: s.wolves === k }, String(k))));
    const durSel = (key) => h('label', { class: 'sel' }, h('span', {}, DURATIONS[key][0]),
      h('select', { disabled: dis, onchange: (e) => emit('host:config', { [key]: Number(e.target.value) }) },
        ...[...new Set([...DURATIONS[key][1], s[key]])].sort((a, b) => a - b).filter((v) => v >= SETTING_BOUNDS[key][0] && v <= SETTING_BOUNDS[key][1]).map((v) => h('option', { value: v, selected: v === s[key] }, fmt(v)))));
    cfg.append(
      h('div', { class: 'cfg-group' }, h('span', { class: 'lbl' }, 'Rôles spéciaux'), rolesBox),
      h('div', { class: 'cfg-grid' },
        h('label', { class: 'sel' }, h('span', {}, 'Loups-garous'), wolfSel),
        h('label', { class: 'rt inline' }, h('input', { type: 'checkbox', checked: s.mayor, disabled: dis, onchange: (e) => emit('host:config', { mayor: e.target.checked }) }), h('span', {}, 'Élection du maire')),
        durSel('dealSeconds'), durSel('nightSeconds'), durSel('discussionSeconds'), durSel('voteSeconds')),
      hint(dis ? 'Seul l’hôte peut modifier les réglages.' : 'Trop de rôles pour peu de joueurs ? Les derniers sont retirés automatiquement.'));
    nodes.push(cfg);

    if (you.isHost) {
      nodes.push(confirmBtn('Lancer la partie', n >= LIMITS.minPlayers, async () => {
        const r = await emit('host:start', {});
        if (!r.ok) store.toast(err(r.code));
      }, 'primary big'));
    } else nodes.push(hint('En attente de l’hôte…'));

    const sts = st.stats;
    if (sts.village + sts.wolves + sts.lovers + sts.none > 0) {
      nodes.push(h('p', { class: 'stats' }, `Victoires de la session : village ${sts.village} · loups ${sts.wolves} · amoureux ${sts.lovers}`));
    }
    return nodes;
  }

  function editProfile() {
    const me = P(st.you.id);
    const taken = new Set(st.players.filter((p) => p.id !== me.id).map((p) => p.color));
    const pseudo = h('input', { type: 'text', maxlength: LIMITS.pseudoMax, value: me.pseudo });
    const msg = h('p', { class: 'form-msg', role: 'alert' });
    const pk = colorPicker({ selected: me.color, taken, onPick: () => {} });
    pk.value = me.color;
    let close;
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      const r = await emit('profile:update', { pseudo: pseudo.value, color: pk.value });
      if (!r.ok) { msg.textContent = err(r.code); return; }
      saved.profile = { pseudo: pseudo.value, color: pk.value };
      close();
    } }, h('label', { class: 'field' }, h('span', { class: 'lbl' }, 'Pseudo'), pseudo), h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Couleur'), pk.el), msg,
    h('button', { class: 'btn primary', type: 'submit' }, 'Enregistrer'));
    close = openModal({ title: 'Ton identité', body: f });
  }

  // ---------- fin de partie ----------
  function endNodes() {
    const w = WINNER[st.winner] || WINNER.none;
    const nodes = [h('div', { class: `victory v-${st.winner}` }, icon(st.winner === 'wolves' ? 'howl' : st.winner === 'lovers' ? 'cupid' : st.winner === 'village' ? 'sunrise' : 'skull'), h('h3', { class: 'display' }, w.title), h('p', {}, w.sub))];
    const gamers = st.players.filter((p) => !p.spectator);
    nodes.push(h('ul', { class: 'reveal' }, gamers.map((p) => h('li', { class: p.alive ? '' : 'dead' },
      h('i', { class: 'dot', style: { '--c': HEX[p.color] } }),
      h('span', { class: 'rn', style: { '--c': HEX[p.color] } }, p.pseudo),
      p.mayor ? icon('crown', 'mini') : null,
      h('span', { class: `rr${p.role === 'werewolf' ? ' wolf' : ''}` }, roleName(p.role)),
      h('span', { class: 'rs' }, p.alive ? 'en vie' : (CAUSE[p.deathCause] || 'mort'))))));
    if (st.you.isHost) {
      nodes.push(h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: async () => { const r = await emit('host:start', {}); if (!r.ok) store.toast(err(r.code)); } }, 'Rejouer'),
        h('button', { class: 'btn', onclick: () => emit('host:reset', {}) }, 'Retour au lobby')));
    } else nodes.push(hint('L’hôte peut relancer une partie.'));
    nodes.push(h('p', { class: 'stats' }, `Session : village ${st.stats.village} · loups ${st.stats.wolves} · amoureux ${st.stats.lovers}`));
    return nodes;
  }

  // ---------- chat ----------
  const CH_LABEL = { lobby: 'table', village: 'village', wolves: 'loups', dead: 'morts' };
  function renderChat() {
    const ph = st.you.chatChannel;
    chatInput.disabled = !ph;
    chatForm.querySelector('button').disabled = !ph;
    chatInput.placeholder = ph === 'wolves' ? 'Murmure à ta meute…' : ph === 'dead' ? 'Chuchote aux morts…' : ph === 'village' ? 'Parle au village…' : ph === 'lobby' ? 'Dire quelque chose à la table…' : 'Tu dors, silence…';
    const have = new Set([...chatList.children].map((c) => c.dataset.id));
    let added = false;
    for (const m of st.chat) {
      if (have.has(m.id)) continue;
      const p = P(m.from);
      chatList.appendChild(h('div', { class: `msg ch-${m.channel}`, dataset: { id: m.id } },
        m.channel !== 'lobby' && m.channel !== 'village' ? h('em', { class: 'ch' }, CH_LABEL[m.channel]) : null,
        h('b', { style: { '--c': HEX[p?.color] || '#999' } }, p?.pseudo || '?'), h('span', {}, m.text)));
      added = true;
      if (ui.tab !== 'chat' && m.from !== st.you.id && !ui.seenChat.has(m.id)) ui.unread++;
    }
    // purge
    const ids = new Set(st.chat.map((m) => m.id));
    for (const c of [...chatList.children]) if (!ids.has(c.dataset.id)) c.remove();
    if (added && ui.tab === 'chat') chatList.scrollTop = chatList.scrollHeight;
    chatBadge.hidden = ui.unread === 0;
    chatBadge.textContent = String(ui.unread);
    if (ui.tab === 'chat') markChatRead();
  }
  function markChatRead() { ui.unread = 0; chatBadge.hidden = true; for (const m of st?.chat || []) ui.seenChat.add(m.id); }
  async function onChat(e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    const r = await emit('chat:send', { text });
    if (!r.ok) { store.toast(err(r.code)); chatInput.value = text; }
  }

  // ---------- journal et narration ----------
  function renderLog() {
    const have = new Set([...logList.children].map((c) => c.dataset.n));
    const fresh = [];
    for (const l of st.log) {
      if (have.has(String(l.n))) continue;
      logList.appendChild(h('li', { class: `l-${l.kind}`, dataset: { n: l.n } }, l.text));
      if (l.n > ui.seenLog) fresh.push(l);
    }
    const first = ui.seenLog === -1;
    ui.seenLog = Math.max(ui.seenLog, ...st.log.map((l) => l.n), 0);
    if (!first) {
      const nar = fresh.filter((l) => l.kind.startsWith('narration')).pop();
      const info = fresh.filter((l) => l.kind === 'death').pop();
      const delay = ui.phaseJustChanged ? 1900 : 0;
      if (nar) setTimeout(() => showBanner(nar.text), delay);
      else if (info && !nar) setTimeout(() => showBanner(info.text, { ms: 3500 }), delay);
    }
    ui.phaseJustChanged = false;
    if (ui.tab === 'log') logList.scrollTop = logList.scrollHeight;
  }

  // ---------- thème et horloge ----------
  function theme() {
    const ph = st.phase.name;
    let time = NIGHT_PHASES.has(ph) ? 'night' : 'day';
    if (ph === 'end') time = st.winner === 'wolves' || st.winner === 'none' ? 'night' : 'day';
    document.body.dataset.time = time;
    const key = `${ph}:${st.phase.round}`;
    if (key !== ui.phaseKey) {
      const firstTime = ui.phaseKey === '';
      ui.phaseKey = key;
      if (!firstTime && st.status !== 'lobby') { showBanner(phaseTitle(st), { big: true, ms: 1900 }); ui.phaseJustChanged = true; }
      if (ph !== 'deal') ui.dealCard = null;
      ui.sel = []; ui.witchMode = null; ui.sig = '';
    }
  }

  function tickClock() {
    if (!st) return;
    const ends = st.phase.endsAt;
    if (!ends || st.status !== 'playing') { clock.hidden = true; return; }
    if (ends !== ui.lastEnds) { ui.lastEnds = ends; ui.total = Math.max(1000, ends - now()); }
    const left = Math.max(0, ends - now());
    clock.hidden = false;
    clockFill.style.transform = `scaleX(${Math.min(1, left / ui.total)})`;
    const s = Math.ceil(left / 1000);
    clockTxt.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    clock.classList.toggle('urgent', s <= 10);
  }
  const clockIv = setInterval(tickClock, 250);

  // ---------- rendu global ----------
  function renderAll() {
    if (!st) return;
    ttl.textContent = phaseTitle(st);
    const role = st.you.role;
    sub.textContent = st.you.spectator ? 'Spectateur' : st.status === 'playing' && role ? `Tu es ${roleName(role)}` : '';
    roleBtn.hidden = !(st.status === 'playing' && role && st.phase.name !== 'deal');
    renderTable();
    const pk = JSON.stringify([st.status, st.phase.name, st.phase.step, st.phase.round, st.you.prompt, st.you.alive, st.you.notes, st.you.isHost, st.settings, st.stats, st.winner,
      st.players.map((p) => [p.id, p.pseudo, p.color, p.ready, p.alive, p.connected, p.role, p.isHost, p.mayor, p.lover]), st.votes, st.mayorVotes, ui.sel, ui.witchMode]);
    if (pk !== ui.sig) {
      ui.sig = pk;
      const sc = paneAction.scrollTop;
      const nodes = actionNodes();
      clear(paneAction);
      paneAction.append(...nodes.filter(Boolean));
      paneAction.scrollTop = sc;
    }
  }

  function update(state) {
    st = state;
    conn.hidden = store.get().connected;
    theme();
    renderAll();
    renderChat();
    renderLog();
    tickClock();
  }

  return {
    update,
    setConnected(c) { conn.hidden = c; },
    destroy() { clearInterval(clockIv); scene.remove(); document.body.dataset.time = 'night'; },
  };
}

export { openRules, openCredits };
