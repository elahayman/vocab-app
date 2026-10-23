// Persistence layer. Everything is kept in this device's localStorage, so the app
// starts instantly and works offline. When firebase-config.js holds a config and the
// device has joined a family, profiles and the shared city also sync through Firestore:
//   families/{code}               the family (created by the first device)
//   families/{code}/members/{uid} one per device that joined (anonymous sign-in)
//   families/{code}/data/shared   the shared city, prizes, feed and settings
//   families/{code}/profiles/{id} one per player
// Documents hold the object as JSON text, so Firestore's type limits never apply.
(function () {
  const KEY = 'vocab-city-v2';
  const FAMILY_KEY = 'vocab-city-family';
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const FEED_MAX = 40;

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      // Storage full or blocked: the session still works, it just won't persist.
    }
  }

  function getFamily() {
    try { return localStorage.getItem(FAMILY_KEY) || null; } catch (e) { return null; }
  }
  function setFamily(code) {
    try { localStorage.setItem(FAMILY_KEY, code); } catch (e) { /* ignore */ }
  }

  // ---------- Merging the shared document ----------
  // Two devices can save the shared city at nearly the same moment; merge instead of overwriting.
  function unionById(a, b) {
    const map = {};
    (a || []).concat(b || []).forEach((x) => {
      const old = map[x.id];
      // Keep a decided status over a pending one.
      map[x.id] = old && old.status && old.status !== 'pending' && x.status === 'pending' ? old : x;
    });
    return Object.values(map);
  }

  function mergeShared(remote, local) {
    if (!remote) return local;
    if (!local) return remote;
    const m = Object.assign({}, remote, local); // settings, prizes, password: the latest writer wins
    m.feed = unionById(remote.feed, local.feed).sort((x, y) => x.t - y.t).slice(-FEED_MAX);
    m.suggestions = unionById(remote.suggestions, local.suggestions);
    m.decisions = Object.assign({}, remote.decisions, local.decisions);
    m.weekly = Object.assign({}, remote.weekly);
    Object.entries(local.weekly || {}).forEach(([k, v]) => { m.weekly[k] = Math.max(v, m.weekly[k] || 0); });
    m.weeklyClaimed = Object.assign({}, remote.weeklyClaimed, local.weeklyClaimed);
    const rc = remote.city || {};
    const lc = local.city || {};
    m.city = Object.assign({}, (lc.bricks || 0) >= (rc.bricks || 0) ? lc : rc);
    m.city.items = Object.assign({}, rc.items, lc.items);
    return m;
  }

  // ---------- Firebase ----------
  const config = window.FIREBASE_CONFIG || null;
  let db = null;
  let uid = null;
  const listeners = [];
  let unsub = [];
  let ready = null; // promise: SDK loaded and signed in
  const dirty = { shared: false, profiles: {}, deleted: {} };
  let remoteShared = null;
  const remoteProfiles = {};

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function start() {
    if (!config) return Promise.reject(new Error('no config'));
    if (ready) return ready;
    ready = (window.firebase ? Promise.resolve() : loadScript(SDK + 'firebase-app-compat.js')
      .then(() => Promise.all([loadScript(SDK + 'firebase-auth-compat.js'), loadScript(SDK + 'firebase-firestore-compat.js')])))
      .then(() => {
        if (!firebase.apps.length) firebase.initializeApp(config);
        db = firebase.firestore();
        return new Promise((resolve, reject) => {
          const off = firebase.auth().onAuthStateChanged((user) => {
            if (user) { off(); uid = user.uid; resolve(); }
          });
          firebase.auth().signInAnonymously().catch(reject);
        });
      });
    ready.catch(() => { ready = null; }); // offline: try again later
    return ready;
  }

  const fam = () => db.collection('families').doc(getFamily());

  function emit() {
    const d = read();
    if (remoteShared && !dirty.shared) d.shared = remoteShared;
    d.profiles = d.profiles || {};
    Object.entries(remoteProfiles).forEach(([id, p]) => {
      if (p === null) delete d.profiles[id];
      else if (!dirty.profiles[id]) d.profiles[id] = p;
    });
    write(d);
    listeners.forEach((cb) => cb({ profiles: d.profiles, shared: d.shared }));
  }

  function listen() {
    unsub.forEach((u) => u());
    unsub = [
      fam().collection('data').doc('shared').onSnapshot((snap) => {
        if (!snap.exists) return;
        remoteShared = JSON.parse(snap.data().json);
        emit();
      }, () => {}),
      fam().collection('profiles').onSnapshot((qs) => {
        qs.docChanges().forEach((ch) => {
          remoteProfiles[ch.doc.id] = ch.type === 'removed' ? null : JSON.parse(ch.doc.data().json);
        });
        emit();
      }, () => {}),
    ];
  }

  // Unsent changes survive a reload.
  function saveDirty() {
    try { localStorage.setItem(KEY + '-dirty', JSON.stringify(dirty)); } catch (e) { /* ignore */ }
  }
  try { Object.assign(dirty, JSON.parse(localStorage.getItem(KEY + '-dirty')) || {}); } catch (e) { /* ignore */ }

  let flushing = false;
  let again = false;
  let retry = null;
  async function flush() {
    if (!config || !getFamily()) return;
    if (flushing) { again = true; return; }
    flushing = true;
    try {
      await start();
      const d = read();
      for (const id of Object.keys(dirty.deleted)) {
        await fam().collection('profiles').doc(id).delete();
        delete dirty.deleted[id];
      }
      for (const id of Object.keys(dirty.profiles)) {
        const p = d.profiles && d.profiles[id];
        if (p) await fam().collection('profiles').doc(id).set({ json: JSON.stringify(p), updatedAt: Date.now() });
        delete dirty.profiles[id];
      }
      if (dirty.shared && d.shared) {
        const ref = fam().collection('data').doc('shared');
        const merged = await db.runTransaction(async (tx) => {
          const snap = await tx.get(ref);
          const m = mergeShared(snap.exists ? JSON.parse(snap.data().json) : null, read().shared);
          tx.set(ref, { json: JSON.stringify(m), updatedAt: Date.now() });
          return m;
        });
        dirty.shared = false;
        remoteShared = merged;
        emit();
      }
      saveDirty();
    } catch (e) {
      clearTimeout(retry);
      retry = setTimeout(flush, 15000); // offline or a conflict: try again soon
    } finally {
      flushing = false;
      if (again) { again = false; flush(); }
    }
  }

  function code8() {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const r = crypto.getRandomValues(new Uint32Array(8));
    return Array.from(r, (x) => abc[x % abc.length]).join('');
  }

  // Everything already on this device is sent up once it joins a family.
  function markAllDirty() {
    const d = read();
    Object.keys(d.profiles || {}).forEach((id) => { dirty.profiles[id] = true; });
    if (d.shared) dirty.shared = true;
    saveDirty();
  }

  async function join(code) {
    await db.collection('families').doc(code).collection('members').doc(uid).set({ joined: Date.now() });
    setFamily(code);
    markAllDirty();
    // Fetch what the family already has, so the first screen shows the other players.
    const shared = await fam().collection('data').doc('shared').get();
    if (shared.exists) remoteShared = JSON.parse(shared.data().json);
    (await fam().collection('profiles').get()).forEach((doc) => { remoteProfiles[doc.id] = JSON.parse(doc.data().json); });
    emit();
    listen();
    await flush();
    return code;
  }

  window.Store = {
    // True when Firebase is set up for this app (even before this device joins a family).
    syncAvailable: !!config,
    family: getFamily,

    loadAll() {
      const d = read();
      return {
        profiles: d.profiles || {},
        shared: d.shared || { weekly: {} },
        activeId: d.activeId || null,
      };
    },
    saveProfile(profile) {
      const d = read();
      d.profiles = d.profiles || {};
      d.profiles[profile.id] = profile;
      write(d);
      dirty.profiles[profile.id] = true;
      saveDirty();
      flush();
    },
    deleteProfile(id) {
      const d = read();
      if (d.profiles) delete d.profiles[id];
      if (d.activeId === id) d.activeId = null;
      write(d);
      delete dirty.profiles[id];
      dirty.deleted[id] = true;
      saveDirty();
      flush();
    },
    saveShared(shared) {
      const d = read();
      d.shared = shared;
      write(d);
      dirty.shared = true;
      saveDirty();
      flush();
    },
    setActive(id) {
      const d = read();
      d.activeId = id;
      write(d);
    },

    // Called with { profiles, shared } whenever the synced data changes.
    onRemote(cb) { listeners.push(cb); },

    async createFamily() {
      await start();
      for (let i = 0; i < 5; i++) {
        const code = code8();
        try {
          await db.collection('families').doc(code).set({ created: Date.now() });
        } catch (e) {
          continue; // taken (or offline): try another code
        }
        return join(code);
      }
      throw new Error('create failed');
    },
    async joinFamily(raw) {
      const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 8) throw new Error('bad code');
      await start();
      return join(code);
    },
  };

  // Reconnect on start and whenever the network comes back.
  // A device that lost its sign-in gets a new one: register it again with the saved family code.
  const rejoin = () => fam().collection('members').doc(uid).set({ joined: Date.now() });
  if (config && getFamily()) {
    start().then(rejoin).then(() => { listen(); flush(); }).catch(() => {});
  }
  window.addEventListener('online', () => {
    if (config && getFamily()) start().then(() => { if (!unsub.length) listen(); flush(); }).catch(() => {});
  });
})();
