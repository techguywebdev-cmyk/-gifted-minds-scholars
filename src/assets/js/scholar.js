/* Gifted Minds Scholars — Scholar Zone
   Progress is stored only on this device (localStorage). No accounts, no tracking. */
(() => {
  'use strict';
  const app = document.getElementById('sz-app');
  if (!app) return;

  // ---------- storage ----------
  const KEY = 'gms-scholar-zone-v1';
  let memory = null;
  const load = () => {
    try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch (e) { /* storage blocked */ }
    return memory || { active: null, scholars: [] };
  };
  let S = load();
  const save = () => { memory = S; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* keep in memory */ } };

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cur = () => S.scholars.find((s) => s.id === S.active);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GRADES = [['prek', 'Pre-K'], ['k', 'Kindergarten'], ['1', '1st grade'], ['2', '2nd grade'], ['3', '3rd grade'], ['4', '4th grade'], ['5', '5th grade']];
  const gradeName = (g) => (GRADES.find((x) => x[0] === g) || [, ''])[1];
  const AVATARS = ['🦉', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐙', '🦄', '🐢', '🐝', '🚀'];

  // Dolch sight words by level, plus upper-elementary challenge words
  const W = {
    prePrimer: 'a and away big blue can come down find for funny go help here I in is it jump little look make me my not one play red run said see the three to two up we where yellow you',
    primer: 'all am are at ate be black brown but came did do eat four get good have he into like must new no now on our out please pretty ran ride saw say she so soon that there they this too under want was well went what white who will with yes',
    first: 'after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when',
    second: "always around because been before best both buy call cold does don't fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your",
    third: 'about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm',
    challenge: 'although answer area become believe between brought built busy caught certain country decided different during early enough explain famous finally friend important island knowledge language measure minute notice ocean people question receive remember special straight thought through usually weather whole',
  };
  const split = (s) => s.split(' ');
  const WORDS = {
    prek: split(W.prePrimer), k: split(W.prePrimer + ' ' + W.primer), 1: split(W.primer + ' ' + W.first),
    2: split(W.second), 3: split(W.third), 4: split(W.third + ' ' + W.challenge), 5: split(W.challenge),
  };

  // ---------- badges ----------
  const streak = (s) => {
    let n = 0; const d = new Date();
    const active = (k) => s.days[k] && (s.days[k].words || s.days[k].math || s.days[k].read);
    if (!active(dayKey(d))) d.setDate(d.getDate() - 1);
    while (active(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };
  const mastered = (s) => Object.values(s.words).filter((c) => c >= 2).length;
  const BADGES = [
    { id: 'first', icon: '🌟', name: 'First Step', desc: 'Finish your first activity', test: (s) => s.wordRounds + s.mathRounds + s.books.length >= 1 },
    { id: 'words1', icon: '🔤', name: 'Word Explorer', desc: 'Finish a sight-word round', test: (s) => s.wordRounds >= 1 },
    { id: 'words25', icon: '🧙', name: 'Word Wizard', desc: 'Master 25 sight words', test: (s) => mastered(s) >= 25 },
    { id: 'words50', icon: '👑', name: 'Word Royalty', desc: 'Master 50 sight words', test: (s) => mastered(s) >= 50 },
    { id: 'math1', icon: '➕', name: 'Number Ninja', desc: 'Finish a math round', test: (s) => s.mathRounds >= 1 },
    { id: 'perfect', icon: '💯', name: 'Perfect Score', desc: 'Get 10 out of 10 in math', test: (s) => s.perfect >= 1 },
    { id: 'math10', icon: '🧮', name: 'Math Star', desc: 'Finish 10 math rounds', test: (s) => s.mathRounds >= 10 },
    { id: 'book1', icon: '📖', name: 'Bookworm', desc: 'Log your first book', test: (s) => s.books.length >= 1 },
    { id: 'book5', icon: '📚', name: 'Page Turner', desc: 'Read 5 books', test: (s) => s.books.length >= 5 },
    { id: 'book10', icon: '🏅', name: 'Super Reader', desc: 'Read 10 books', test: (s) => s.books.length >= 10 },
    { id: 'book25', icon: '🏆', name: 'Reading Champion', desc: 'Read 25 books', test: (s) => s.books.length >= 25 },
    { id: 'book50', icon: '🎓', name: 'Gifted Reader', desc: 'Read 50 books', test: (s) => s.books.length >= 50 },
    { id: 'streak3', icon: '🔥', name: 'On Fire', desc: 'Practice 3 days in a row', test: (s) => streak(s) >= 3 },
    { id: 'streak7', icon: '🌈', name: 'Week Warrior', desc: 'Practice 7 days in a row', test: (s) => streak(s) >= 7 },
    { id: 'allthree', icon: '🦸', name: 'Super Scholar', desc: 'Do all 3 practices in one day', test: (s) => Object.values(s.days).some((d) => d.words && d.math && d.read) },
    { id: 'stars100', icon: '✨', name: '100 Stars', desc: 'Collect 100 stars', test: (s) => s.stars >= 100 },
  ];

  // ---------- celebration ----------
  const confetti = () => {
    if (reduced) return;
    const box = document.createElement('div'); box.className = 'sz-confetti'; box.setAttribute('aria-hidden', 'true');
    const colors = ['#d9a63a', '#14245c', '#1f7a78', '#c4573a', '#6b4a8a', '#f1d48c'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.4 + 's'; p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`; box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3200);
  };
  const toast = (html) => {
    const t = document.createElement('div'); t.className = 'sz-toast'; t.setAttribute('role', 'status'); t.innerHTML = html;
    const n = document.querySelectorAll('.sz-toast').length; t.style.marginTop = n * 78 + 'px';
    document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('is-in'));
    setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 400); }, 3200);
  };
  const checkBadges = (s) => {
    const fresh = BADGES.filter((b) => !s.badges[b.id] && b.test(s));
    fresh.forEach((b) => { s.badges[b.id] = dayKey(); });
    save();
    fresh.forEach((b, i) => setTimeout(() => { toast(`<span class="sz-toast-ico">${b.icon}</span><span><strong>New badge!</strong>${esc(b.name)}</span>`); confetti(); }, i * 1400));
  };
  const markDay = (s, kind) => { const k = dayKey(); s.days[k] = s.days[k] || {}; s.days[k][kind] = true; };

  // ---------- speech ----------
  const say = (text) => {
    try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.8; speechSynthesis.speak(u); } catch (e) { /* no speech */ }
  };

  // ---------- views ----------
  let first = true;
  const go = (view, arg) => { views[view](arg); if (first) { first = false; return; } window.scrollTo({ top: app.getBoundingClientRect().top + window.scrollY - 90, behavior: reduced ? 'auto' : 'smooth' }); };
  const top = (s, title) => `
    <div class="sz-bar">
      <button class="sz-back" type="button" data-go="home" aria-label="Back to my dashboard"><svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></button>
      <h2 class="sz-bar-title">${title}</h2>
      <span class="sz-stars" aria-label="${s.stars} stars"><b>⭐</b>${s.stars}</span>
    </div>`;

  const views = {
    who() {
      const list = S.scholars.map((s) => `<button class="sz-who-btn" type="button" data-pick="${s.id}"><span class="sz-ava">${s.avatar}</span><strong>${esc(s.name)}</strong><span>${gradeName(s.grade)}</span></button>`).join('');
      app.innerHTML = `
        <div class="sz-panel sz-center">
          <p class="sz-kicker">Scholar Zone</p>
          <h2 class="sz-h">${S.scholars.length ? 'Who’s practicing today?' : 'Welcome, scholar!'}</h2>
          <p class="sz-sub">${S.scholars.length ? 'Tap your name to start.' : 'Let’s set up your Scholar Zone. It only takes a moment.'}</p>
          <div class="sz-who">${list}<button class="sz-who-btn sz-who-add" type="button" data-go="add"><span class="sz-ava">＋</span><strong>Add a scholar</strong><span>New player</span></button></div>
        </div>`;
    },

    add(edit) {
      const s = edit ? cur() : null;
      let grade = s ? s.grade : '1'; let avatar = s ? s.avatar : AVATARS[0];
      app.innerHTML = `
        <form class="sz-panel" data-form="profile" novalidate>
          <p class="sz-kicker">${s ? 'Edit scholar' : 'New scholar'}</p>
          <h2 class="sz-h">${s ? 'Update your profile' : 'Tell us about you!'}</h2>
          <label class="sz-label" for="sz-name">Your first name or nickname</label>
          <input class="sz-input" id="sz-name" name="name" maxlength="20" autocomplete="off" required value="${s ? esc(s.name) : ''}" placeholder="e.g. Maya">
          <p class="sz-label">What grade are you in?</p>
          <div class="sz-chips" data-group="grade">${GRADES.map(([g, n]) => `<button type="button" class="sz-chip${g === grade ? ' on' : ''}" data-val="${g}">${n}</button>`).join('')}</div>
          <p class="sz-label">Pick your buddy</p>
          <div class="sz-avatars" data-group="avatar">${AVATARS.map((a) => `<button type="button" class="sz-ava-pick${a === avatar ? ' on' : ''}" data-val="${a}" aria-label="Buddy ${a}">${a}</button>`).join('')}</div>
          <p class="sz-error" data-err hidden>Please type your name first.</p>
          <div class="sz-actions"><button class="btn btn-gold" type="submit">${s ? 'Save' : 'Let’s go!'} <svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></button>
          <button class="sz-link" type="button" data-go="${s ? 'home' : 'who'}">Cancel</button></div>
        </form>`;
      const form = app.querySelector('form');
      form.addEventListener('click', (e) => {
        const b = e.target.closest('[data-val]'); if (!b) return;
        const g = b.parentElement.dataset.group;
        b.parentElement.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); b.classList.add('on');
        if (g === 'grade') grade = b.dataset.val; else avatar = b.dataset.val;
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        if (!name) { form.querySelector('[data-err]').hidden = false; form.name.focus(); return; }
        if (s) { Object.assign(s, { name, grade, avatar }); }
        else {
          const id = Date.now().toString(36);
          S.scholars.push({ id, name, grade, avatar, stars: 0, words: {}, wordRounds: 0, mathRounds: 0, perfect: 0, books: [], days: {}, badges: {} });
          S.active = id;
        }
        save(); go('home');
      });
    },

    home() {
      const s = cur(); if (!s) return go('who');
      const t = s.days[dayKey()] || {};
      const st = streak(s); const earned = BADGES.filter((b) => s.badges[b.id]);
      const tasks = [
        ['words', '🔤', 'Sight Words', 'Read 10 word cards', 'sz-t-read'],
        ['math', '🧮', 'Math Facts', 'Answer 10 questions', 'sz-t-math'],
        ['books', '📚', 'Reading Log', 'Read a book & log it', 'sz-t-book', 'read'],
      ];
      const doneCount = tasks.filter((x) => t[x[5] || x[0]]).length;
      app.innerHTML = `
        <div class="sz-hello">
          <span class="sz-ava sz-ava-lg">${s.avatar}</span>
          <div><p class="sz-kicker">${gradeName(s.grade)}</p><h2 class="sz-h">Hi, ${esc(s.name)}!</h2>
          <p class="sz-sub">${doneCount === 3 ? 'You did all your practice today. Amazing! 🎉' : `You’ve done ${doneCount} of 3 practices today. Keep going!`}</p></div>
        </div>
        <div class="sz-stats">
          <div><b>⭐ ${s.stars}</b><span>Stars</span></div>
          <div><b>🔥 ${st}</b><span>Day streak</span></div>
          <div><b>📚 ${s.books.length}</b><span>Books read</span></div>
          <div><b>🏅 ${earned.length}</b><span>Badges</span></div>
        </div>
        <h3 class="sz-h3">Today’s practice</h3>
        <div class="sz-tasks">${tasks.map(([v, ico, name, sub, cls, key]) => `
          <button class="sz-task ${cls}${t[key || v] ? ' done' : ''}" type="button" data-go="${v}">
            <span class="sz-task-ico">${ico}</span><strong>${name}</strong><span>${sub}</span>
            <em class="sz-task-check">${t[key || v] ? '✓ Done today' : 'Start'}</em>
          </button>`).join('')}</div>
        <div class="sz-row-head"><h3 class="sz-h3">My badges</h3><button class="sz-link" type="button" data-go="badges">See all ${BADGES.length}</button></div>
        <div class="sz-badge-strip">${earned.length ? earned.slice(-6).reverse().map((b) => `<span class="sz-mini-badge" title="${esc(b.name)}">${b.icon}</span>`).join('') : '<p class="sz-empty">Finish an activity to earn your first badge!</p>'}</div>
        <div class="sz-foot">
          <button class="sz-link" type="button" data-go="who">Switch scholar</button>
          <button class="sz-link" type="button" data-go="parent">Grown-ups</button>
        </div>`;
    },

    words() {
      const s = cur(); const pool = WORDS[s.grade] || WORDS[1];
      const fresh = shuffle(pool.filter((w) => (s.words[w] || 0) < 2));
      const deck = (fresh.length >= 10 ? fresh : fresh.concat(shuffle(pool.filter((w) => !fresh.includes(w))))).slice(0, 10);
      let i = 0; let known = 0; let stars = 0;
      const card = () => {
        app.innerHTML = `${top(s, 'Sight Words')}
          <div class="sz-dots">${deck.map((_, n) => `<i class="${n < i ? 'done' : n === i ? 'now' : ''}"></i>`).join('')}</div>
          <div class="sz-card sz-pop"><p class="sz-card-hint">Can you read this word?</p><p class="sz-word">${esc(deck[i])}</p>
          <button class="sz-hear" type="button" data-say="${esc(deck[i])}">🔊 Hear it</button></div>
          <div class="sz-answer2">
            <button class="sz-big sz-yes" type="button" data-k="1">✓ I can read it!</button>
            <button class="sz-big sz-no" type="button" data-k="0">Not yet</button>
          </div>`;
      };
      const next = (k) => {
        const w = deck[i];
        if (k) { known++; stars++; s.words[w] = (s.words[w] || 0) + 1; } else { s.words[w] = Math.max(0, (s.words[w] || 0) - 1); }
        i++;
        if (i < deck.length) return card();
        stars += 3; s.stars += stars; s.wordRounds++; markDay(s, 'words'); save();
        done(s, 'Sight Words', `You read <strong>${known}</strong> of ${deck.length} words!`, stars, 'words');
      };
      app._handler = (e) => { const b = e.target.closest('[data-k]'); if (b) next(b.dataset.k === '1'); };
      card();
    },

    math() {
      const s = cur(); const g = s.grade;
      const make = () => {
        let q, a;
        if (g === 'prek') { a = rnd(1, 10); q = { kind: 'count', n: a }; }
        else if (g === 'k') { const x = rnd(0, 5), y = rnd(0, 5); a = x + y; q = `${x} + ${y}`; }
        else if (g === '1') { if (Math.random() < 0.5) { const x = rnd(0, 10), y = rnd(0, 10); a = x + y; q = `${x} + ${y}`; } else { const x = rnd(5, 18), y = rnd(0, Math.min(9, x)); a = x - y; q = `${x} − ${y}`; } }
        else if (g === '2') { if (Math.random() < 0.5) { const x = rnd(10, 60), y = rnd(5, 39); a = x + y; q = `${x} + ${y}`; } else { const x = rnd(20, 99), y = rnd(5, x - 5); a = x - y; q = `${x} − ${y}`; } }
        else if (g === '3') { const x = rnd(0, 10), y = rnd(1, 10); a = x * y; q = `${x} × ${y}`; }
        else { if (Math.random() < 0.55) { const x = rnd(2, 12), y = rnd(2, 12); a = x * y; q = `${x} × ${y}`; } else { const y = rnd(2, 12), a2 = rnd(2, 12); a = a2; q = `${a2 * y} ÷ ${y}`; } }
        const opts = new Set([a]); let tries = 0;
        while (opts.size < 4 && tries++ < 50) { const d = a + rnd(-5, 5) * (a > 30 ? rnd(1, 3) : 1); if (d >= 0 && d !== a) opts.add(d); }
        while (opts.size < 4) opts.add(a + opts.size);
        return { q, a, opts: shuffle([...opts]) };
      };
      const qs = Array.from({ length: 10 }, make);
      let i = 0; let right = 0; let locked = false;
      const show = () => {
        const { q, opts } = qs[i];
        const prompt = typeof q === 'object'
          ? `<p class="sz-card-hint">How many stars?</p><p class="sz-count">${'⭐'.repeat(q.n)}</p>`
          : `<p class="sz-card-hint">What’s the answer?</p><p class="sz-eq">${q} = <span>?</span></p>`;
        app.innerHTML = `${top(s, 'Math Facts')}
          <div class="sz-dots">${qs.map((_, n) => `<i class="${n < i ? 'done' : n === i ? 'now' : ''}"></i>`).join('')}</div>
          <div class="sz-card sz-pop">${prompt}</div>
          <div class="sz-answer4">${opts.map((o) => `<button class="sz-big sz-opt" type="button" data-a="${o}">${o}</button>`).join('')}</div>`;
        locked = false;
      };
      app._handler = (e) => {
        const b = e.target.closest('[data-a]'); if (!b || locked) return; locked = true;
        const ok = Number(b.dataset.a) === qs[i].a;
        if (ok) { right++; b.classList.add('right'); } else {
          b.classList.add('wrong');
          app.querySelector(`[data-a="${qs[i].a}"]`).classList.add('right');
        }
        setTimeout(() => {
          i++;
          if (i < qs.length) return show();
          let stars = right + 3; if (right === 10) { stars += 5; s.perfect++; }
          s.stars += stars; s.mathRounds++; markDay(s, 'math'); save();
          done(s, 'Math Facts', right === 10 ? 'Perfect score! <strong>10 out of 10!</strong>' : `You got <strong>${right}</strong> of 10 right!`, stars, 'math');
        }, ok ? 650 : 1300);
      };
      show();
    },

    books() {
      const s = cur(); let rating = '🤩';
      const ms = [1, 5, 10, 25, 50, 100]; const n = s.books.length;
      const next = ms.find((m) => m > n) || n + 25; const prev = [...ms].reverse().find((m) => m <= n) || 0;
      const pct = Math.round(((n - prev) / (next - prev)) * 100);
      app.innerHTML = `${top(s, 'Reading Log')}
        <div class="sz-milestone">
          <div class="sz-ms-top"><strong>📚 ${n} book${n === 1 ? '' : 's'} read</strong><span>Next goal: ${next} books</span></div>
          <div class="sz-ms-bar"><i style="width:${Math.max(4, pct)}%"></i></div>
          <p>${next - n === 1 ? 'Just 1 more book to your next goal!' : `${next - n} more books to reach ${next}!`}</p>
        </div>
        <form class="sz-panel sz-book-form" data-form="book" novalidate>
          <h3 class="sz-h3" style="margin-top:0">I finished a book!</h3>
          <label class="sz-label" for="sz-title">Book title</label>
          <input class="sz-input" id="sz-title" name="title" maxlength="80" autocomplete="off" placeholder="e.g. The Cat in the Hat">
          <label class="sz-label" for="sz-author">Author <span class="sz-opt-label">(optional)</span></label>
          <input class="sz-input" id="sz-author" name="author" maxlength="60" autocomplete="off">
          <p class="sz-label">How did you like it?</p>
          <div class="sz-rate" data-group="rate">${['😐', '🙂', '🤩'].map((r) => `<button type="button" class="sz-rate-btn${r === rating ? ' on' : ''}" data-val="${r}" aria-label="${r === '😐' ? 'It was okay' : r === '🙂' ? 'I liked it' : 'I loved it'}">${r}</button>`).join('')}</div>
          <p class="sz-error" data-err hidden>Please type the book title.</p>
          <button class="btn btn-gold" type="submit">Add to my log (+5 ⭐)</button>
        </form>
        ${n ? `<h3 class="sz-h3">My books</h3><ul class="sz-books">${s.books.slice().reverse().map((b) => `<li><span class="sz-book-r">${b.rating}</span><div><strong>${esc(b.title)}</strong>${b.author ? `<span>by ${esc(b.author)}</span>` : ''}</div><time>${new Date(b.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></li>`).join('')}</ul>` : ''}`;
      const form = app.querySelector('form');
      form.addEventListener('click', (e) => { const b = e.target.closest('[data-val]'); if (!b) return; form.querySelectorAll('.sz-rate-btn').forEach((x) => x.classList.remove('on')); b.classList.add('on'); rating = b.dataset.val; });
      form.addEventListener('submit', (e) => {
        e.preventDefault(); const title = form.title.value.trim();
        if (!title) { form.querySelector('[data-err]').hidden = false; form.title.focus(); return; }
        s.books.push({ title, author: form.author.value.trim(), rating, date: dayKey() });
        s.stars += 5; markDay(s, 'read'); save();
        toast(`<span class="sz-toast-ico">📖</span><span><strong>+5 stars!</strong>Great reading, ${esc(s.name)}!</span>`);
        confetti(); checkBadges(s); views.books();
      });
    },

    badges() {
      const s = cur();
      app.innerHTML = `${top(s, 'My Badges')}
        <p class="sz-sub sz-center">Every achievement counts! You’ve earned <strong>${BADGES.filter((b) => s.badges[b.id]).length}</strong> of ${BADGES.length} badges.</p>
        <div class="sz-badges">${BADGES.map((b) => `<div class="sz-badge${s.badges[b.id] ? ' got' : ''}"><span>${s.badges[b.id] ? b.icon : '🔒'}</span><strong>${b.name}</strong><em>${b.desc}</em></div>`).join('')}</div>`;
    },

    parent() {
      const s = cur();
      app.innerHTML = `${top(s, 'For grown-ups')}
        <div class="sz-panel">
          <h3 class="sz-h3" style="margin-top:0">About Scholar Zone</h3>
          <p>Scholar Zone gives your child quick daily practice with sight words, math facts and reading. Words and math questions are matched to the grade you chose, and words your child doesn’t know yet come back more often.</p>
          <p><strong>Privacy:</strong> progress is saved only on this device and browser. Nothing is sent to us, and we only ask for a first name or nickname. Clearing your browser data will reset progress.</p>
          <p>${esc(s.name)} has mastered <strong>${mastered(s)}</strong> sight words, finished <strong>${s.mathRounds}</strong> math rounds and read <strong>${s.books.length}</strong> books.</p>
          <div class="sz-actions">
            <button class="btn btn-navy btn-sm" type="button" data-go="add" data-edit="1">Change name, grade or buddy</button>
            <button class="sz-link sz-danger" type="button" data-del>Delete ${esc(s.name)}’s progress</button>
          </div>
          <p class="sz-sub" style="margin-top:22px">Want personalized help? <a href="/enroll/">Enroll with Mrs. Bonnick</a> for one-on-one tutoring.</p>
        </div>`;
      let armed = false;
      app.querySelector('[data-del]').addEventListener('click', (e) => {
        if (!armed) { armed = true; e.target.textContent = 'Tap again to delete for good'; return; }
        S.scholars = S.scholars.filter((x) => x.id !== s.id); S.active = null; save(); go('who');
      });
    },
  };

  const done = (s, title, line, stars, again) => {
    app.innerHTML = `${top(s, title)}
      <div class="sz-panel sz-center sz-done">
        <p class="sz-done-ico">🎉</p>
        <h2 class="sz-h">Great job, ${esc(s.name)}!</h2>
        <p class="sz-sub">${line}</p>
        <p class="sz-earned">+${stars} ⭐</p>
        <div class="sz-actions sz-center-row">
          <button class="btn btn-gold" type="button" data-go="${again}">Play again</button>
          <button class="btn btn-ghost" type="button" data-go="home">My dashboard</button>
        </div>
      </div>`;
    confetti(); checkBadges(s);
  };

  // ---------- events ----------
  app.addEventListener('click', (e) => {
    const sayBtn = e.target.closest('[data-say]'); if (sayBtn) { say(sayBtn.dataset.say); return; }
    const pick = e.target.closest('[data-pick]'); if (pick) { S.active = pick.dataset.pick; save(); go('home'); return; }
    const g = e.target.closest('[data-go]');
    if (g) { app._handler = null; go(g.dataset.go, g.dataset.edit === '1'); return; }
    if (app._handler) app._handler(e);
  });

  app.classList.add('is-ready');
  go(cur() ? 'home' : 'who');
})();
