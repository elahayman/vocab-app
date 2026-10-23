// Persistence layer. Today everything lives in this device's localStorage.
// When Firebase is configured, profiles and the shared island sync through
// the same three calls (loadAll / saveProfile / saveShared), so app.js does
// not need to change.
(function () {
  const KEY = 'vocab-city-v2';

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

  window.Store = {
    loadAll() {
      const d = read();
      return {
        profiles: d.profiles || {},
        shared: d.shared || { island: [], weekly: {} },
        activeId: d.activeId || null,
      };
    },
    saveProfile(profile) {
      const d = read();
      d.profiles = d.profiles || {};
      d.profiles[profile.id] = profile;
      write(d);
    },
    deleteProfile(id) {
      const d = read();
      if (d.profiles) delete d.profiles[id];
      if (d.activeId === id) d.activeId = null;
      write(d);
    },
    saveShared(shared) {
      const d = read();
      d.shared = shared;
      write(d);
    },
    setActive(id) {
      const d = read();
      d.activeId = id;
      write(d);
    },
  };
})();
