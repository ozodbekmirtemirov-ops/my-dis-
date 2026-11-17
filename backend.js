/* Data layer shared by the teacher page (teacher.html) and the student page (index.html).
   Two implementations with one interface:
   - cloud: Supabase (Postgres + Auth + Realtime), used when config.js is filled in;
   - local: localStorage + BroadcastChannel, for trying the site in one browser without a server. */
(function () {
  "use strict";
  const cfg = window.KL_CONFIG || {};
  const cloud = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase && window.supabase.createClient);
  const KL = (window.KL = { mode: cloud ? "cloud" : "local" });
  /* config.js is filled in but the Supabase library did not load (no internet or blocked CDN) */
  KL.configError = !cloud && !!(cfg.supabaseUrl || cfg.supabaseKey);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ts = (v) => (v ? new Date(v).getTime() : 0);

  if (cloud) {
    const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 20 } },
    });
    KL.sb = sb;
    const fail = (error) => {
      if (error) {
        const e = new Error(error.message || "request failed");
        e.code = error.code;
        throw e;
      }
    };
    let me = null;

    /* ---------- teacher account ---------- */
    KL.getUser = async () => {
      const { data } = await sb.auth.getSession();
      me = data && data.session ? data.session.user : null;
      return me ? { id: me.id, email: me.email } : null;
    };
    KL.signIn = async (email, password) => {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      fail(error);
      me = data.user;
      return { id: me.id, email: me.email };
    };
    KL.signUp = async (email, password) => {
      const { data, error } = await sb.auth.signUp({ email, password });
      fail(error);
      if (!data.session) return { confirm: true };
      me = data.user;
      return { id: me.id, email: me.email };
    };
    KL.signOut = async () => {
      await sb.auth.signOut();
      me = null;
    };

    /* ---------- teacher documents (classes, tests, results, settings) ---------- */
    KL.loadAll = async () => {
      const out = {};
      for (let from = 0; ; from += 1000) {
        const { data, error } = await sb.from("docs").select("col,id,data").range(from, from + 999);
        fail(error);
        for (const r of data) (out[r.col] = out[r.col] || []).push({ id: r.id, ...r.data });
        if (data.length < 1000) break;
      }
      return out;
    };
    KL.putDoc = async (col, id, data) => {
      const { error } = await sb
        .from("docs")
        .upsert({ owner: me.id, col, id, data, updated_at: new Date().toISOString() }, { onConflict: "owner,col,id" });
      fail(error);
    };
    KL.delDoc = async (col, id) => {
      const { error } = await sb.from("docs").delete().match({ owner: me.id, col, id });
      fail(error);
    };

    /* ---------- live game: teacher side ---------- */
    KL.createGame = async (code, state) => {
      const { error } = await sb.from("games").insert({ code, owner: me.id, state });
      fail(error);
    };
    /* Saves the public game state. start=true stamps the question start with the server clock. */
    KL.setGameState = async (code, state, start) => {
      const { data, error } = await sb.rpc("kl_set_state", { p_code: code, p_state: state, p_start: !!start });
      fail(error);
      return ts(data);
    };
    KL.watchPlayers = (code, cb) => {
      let alive = true;
      const pull = async () => {
        const { data } = await sb.from("players").select("pid,nick").eq("code", code);
        if (alive && data) cb(data);
      };
      const ch = sb
        .channel("pl-" + code)
        .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: "code=eq." + code }, pull)
        .subscribe();
      pull();
      const t = setInterval(pull, 4000);
      return () => {
        alive = false;
        clearInterval(t);
        sb.removeChannel(ch);
      };
    };
    /* Delivers every answer to question qi as {pid, choice, at}; duplicates are possible, callers dedupe by pid. */
    KL.watchAnswers = (code, qi, cb) => {
      let alive = true;
      const emit = (r) => alive && r.qi === qi && cb({ pid: r.pid, choice: r.choice, at: ts(r.created_at) });
      const pull = async () => {
        const { data } = await sb.from("answers").select("pid,qi,choice,created_at").eq("code", code).eq("qi", qi);
        (data || []).forEach(emit);
      };
      const ch = sb
        .channel("an-" + code + "-" + qi)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "answers", filter: "code=eq." + code },
          (p) => emit(p.new)
        )
        .subscribe();
      pull();
      const t = setInterval(pull, 2000);
      return () => {
        alive = false;
        clearInterval(t);
        sb.removeChannel(ch);
      };
    };
    KL.kick = async (code, pid) => {
      const { error } = await sb.from("players").delete().match({ code, pid });
      fail(error);
    };
    /* Removes nicknames and individual answers; the game row keeps only the final public state. */
    KL.clearGameData = async (code) => {
      await sb.from("answers").delete().eq("code", code);
      await sb.from("players").delete().eq("code", code);
    };
    KL.deleteGame = async (code) => {
      await KL.clearGameData(code);
      await sb.from("games").delete().eq("code", code);
    };
    KL.listGames = async () => {
      const { data, error } = await sb.from("games").select("code").eq("owner", me.id);
      fail(error);
      return (data || []).map((r) => r.code);
    };

    /* ---------- live game: student side ---------- */
    KL.findGame = async (code) => {
      const { data, error } = await sb.from("games").select("code,state").eq("code", code).maybeSingle();
      fail(error);
      return data;
    };
    KL.joinGame = async (code, pid, nick) => {
      const { error } = await sb.from("players").insert({ code, pid, nick });
      fail(error);
    };
    KL.isPlayer = async (code, pid) => {
      const { data } = await sb.rpc("kl_is_player", { p_code: code, p_pid: pid });
      return !!data;
    };
    KL.watchGame = (code, cb) => {
      let alive = true,
        last = "";
      const emit = (state) => {
        const k = JSON.stringify(state);
        if (alive && k !== last) {
          last = k;
          cb(state);
        }
      };
      const pull = async () => {
        const { data } = await sb.from("games").select("state").eq("code", code).maybeSingle();
        if (alive) emit(data ? data.state : null);
      };
      const ch = sb
        .channel("gm-" + code + "-" + Math.random().toString(36).slice(2))
        .on("postgres_changes", { event: "*", schema: "public", table: "games", filter: "code=eq." + code }, (p) =>
          emit(p.eventType === "DELETE" ? null : p.new.state)
        )
        .subscribe();
      pull();
      const t = setInterval(pull, 2500);
      return () => {
        alive = false;
        clearInterval(t);
        sb.removeChannel(ch);
      };
    };
    KL.answer = async (code, pid, qi, choice) => {
      const { error } = await sb.from("answers").insert({ code, pid, qi, choice });
      if (error && error.code === "23505") return; // already answered
      fail(error);
    };
    return;
  }

  /* ======================= local mode ======================= */
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("kl-games") : null;
  const subs = new Set();
  const notify = () => {
    if (bc) bc.postMessage(1);
    subs.forEach((f) => f());
  };
  if (bc) bc.onmessage = () => subs.forEach((f) => f());
  window.addEventListener("storage", (e) => {
    if (e.key === "kl-games") subs.forEach((f) => f());
  });
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem("kl-games")) || {};
    } catch (e) {
      return {};
    }
  };
  const write = (g) => {
    localStorage.setItem("kl-games", JSON.stringify(g));
    notify();
  };
  const watch = (fn) => {
    subs.add(fn);
    fn();
    return () => subs.delete(fn);
  };

  KL.getUser = async () => ({ id: "local", email: "" });
  KL.signIn = KL.signUp = KL.getUser;
  KL.signOut = async () => {};
  KL.loadAll = async () => {
    try {
      return JSON.parse(localStorage.getItem("kl-data")) || {};
    } catch (e) {
      return {};
    }
  };
  /* Teacher documents are saved as a whole by the page itself in local mode. */
  KL.putDoc = KL.delDoc = async () => {};

  KL.createGame = async (code, state) => {
    const g = read();
    g[code] = { state, q: 0, players: {}, answers: [] };
    write(g);
  };
  KL.setGameState = async (code, state, start) => {
    const g = read();
    if (!g[code]) throw new Error("game not found");
    g[code].state = state;
    if (start) g[code].q = Date.now();
    write(g);
    return g[code].q;
  };
  KL.watchPlayers = (code, cb) =>
    watch(() => {
      const x = read()[code];
      cb(x ? Object.entries(x.players).map(([pid, nick]) => ({ pid, nick })) : []);
    });
  KL.watchAnswers = (code, qi, cb) =>
    watch(() => {
      const x = read()[code];
      (x ? x.answers : []).filter((a) => a.qi === qi).forEach((a) => cb({ pid: a.pid, choice: a.choice, at: a.at }));
    });
  KL.kick = async (code, pid) => {
    const g = read();
    if (g[code]) delete g[code].players[pid];
    write(g);
  };
  KL.clearGameData = async (code) => {
    const g = read();
    if (g[code]) {
      g[code].players = {};
      g[code].answers = [];
    }
    write(g);
  };
  KL.deleteGame = async (code) => {
    const g = read();
    delete g[code];
    write(g);
  };
  KL.listGames = async () => Object.keys(read());
  KL.findGame = async (code) => {
    const x = read()[code];
    return x ? { code, state: x.state } : null;
  };
  KL.joinGame = async (code, pid, nick) => {
    const g = read();
    if (!g[code]) throw new Error("game not found");
    g[code].players[pid] = nick;
    write(g);
  };
  KL.isPlayer = async (code, pid) => {
    const x = read()[code];
    return !!(x && x.players[pid]);
  };
  KL.watchGame = (code, cb) => {
    let last = "";
    return watch(() => {
      const x = read()[code];
      const st = x ? x.state : null,
        k = JSON.stringify(st);
      if (k !== last) {
        last = k;
        cb(st);
      }
    });
  };
  KL.answer = async (code, pid, qi, choice) => {
    await sleep(0);
    const g = read(),
      x = g[code];
    if (!x || !x.players[pid]) throw new Error("not a player");
    const s = x.state || {};
    if (s.phase !== "question" || s.qi !== qi) throw new Error("question closed");
    if (Date.now() > x.q + (s.secs + 1) * 1000) throw new Error("time is up");
    if (x.answers.some((a) => a.pid === pid && a.qi === qi)) return;
    x.answers.push({ pid, qi, choice, at: Date.now() });
    write(g);
  };
})();
