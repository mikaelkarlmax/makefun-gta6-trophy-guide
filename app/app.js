// Leonida Legend — GTA VI trophy guide & tracker.
// Loads only its own data files, keeps checklist progress in localStorage,
// and computes the audit strip live from the data it renders.
const KEY = 'gta6-trophy-checklist';
const REVEAL_KEY = 'gta6-trophy-revealed';
const $ = (id) => document.getElementById(id);

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const guideDoc = await (await fetch('data/guide.json')).json();
const trophies = trophiesDoc.trophies;
const sourcesById = new Map(guideDoc.sources.map((s) => [s.id, s]));
const trophiesById = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let revealed = new Set(JSON.parse(localStorage.getItem(REVEAL_KEY) ?? '[]'));

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(REVEAL_KEY, JSON.stringify([...revealed]));
}

function citeLinks(cites) {
  const span = document.createElement('span');
  span.className = 'cites';
  span.textContent = ' [';
  cites.forEach((id, i) => {
    if (i) span.append(', ');
    const a = document.createElement('a');
    a.href = `#source-${id}`;
    a.textContent = String(id);
    a.title = sourcesById.get(id)?.name ?? '';
    span.append(a);
  });
  span.append(']');
  return span;
}

function renderAudit() {
  let steps = 0, cited = 0, multi = 0, guided = 0, points = 0;
  for (const t of trophies) {
    points += t.points ?? 0;
    if (Array.isArray(t.steps) && t.steps.length) guided += 1;
    for (const st of t.steps ?? []) {
      steps += 1;
      if (Array.isArray(st.cites) && st.cites.length) cited += 1;
      if (Array.isArray(st.cites) && st.cites.length >= 2) multi += 1;
    }
  }
  $('stat-trophies').textContent = `${guided}/${trophies.length}`;
  $('stat-steps').textContent = String(steps);
  $('stat-cited').textContent = `${cited}/${steps} (${steps ? Math.round((cited / steps) * 100) : 0}%)`;
  $('stat-multi').textContent = String(multi);
  $('stat-sources').textContent = String(guideDoc.sources.length);
  $('stat-points').textContent = points.toLocaleString('en-US');
  $('audit-note').textContent =
    `Audit counted live from the guide data on this page: ${guideDoc.disputes.length} disputed points settled, ` +
    `${guideDoc.roadmap.length} roadmap stages, ${guideDoc.watchlist.length} watch-list warnings. Sources read ${guideDoc.readDate}.`;
}

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.replaceChildren();
  for (const st of guideDoc.roadmap) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${st.stage}: ${st.title}`;
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${st.hours} · ${st.goal}`;
    const ul = document.createElement('ul');
    for (const w of st.work) {
      const li = document.createElement('li');
      li.textContent = w;
      ul.append(li);
    }
    const names = document.createElement('p');
    names.className = 'hint';
    names.textContent = 'Trophies: ' + st.trophies.map((id) => trophiesById.get(id)?.name ?? id).join(' · ');
    div.append(h, meta, ul, names);
    wrap.append(div);
  }
}

function renderWatchlist() {
  const wrap = $('watchlist');
  wrap.replaceChildren();
  for (const w of guideDoc.watchlist) {
    const div = document.createElement('div');
    div.className = 'watch-item';
    const head = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = w.trophyName;
    head.append(strong, document.createTextNode(' — '));
    const win = document.createElement('span');
    win.className = 'window';
    win.textContent = w.window;
    head.append(win);
    const act = document.createElement('p');
    act.textContent = w.action;
    act.append(citeLinks(w.cites));
    div.append(head, act);
    wrap.append(div);
  }
}

function renderDisputes() {
  const wrap = $('disputes');
  wrap.replaceChildren();
  guideDoc.disputes.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'dispute';
    const h = document.createElement('h3');
    h.textContent = `${i + 1}. ${d.topic}`;
    const pa = document.createElement('p');
    pa.textContent = `Position A: ${d.a}`;
    const pb = document.createElement('p');
    pb.textContent = `Position B: ${d.b}`;
    const v = document.createElement('p');
    v.className = 'verdict';
    v.textContent = `Verdict: ${d.verdict}`;
    div.append(h, pa, pb, v);
    wrap.append(div);
  });
}

function renderSources() {
  const list = $('sources');
  list.replaceChildren();
  for (const s of guideDoc.sources) {
    const li = document.createElement('li');
    li.id = `source-${s.id}`;
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      li.append(a);
    } else {
      const b = document.createElement('strong');
      b.textContent = s.name;
      li.append(b);
    }
    const pub = document.createElement('span');
    pub.className = 'pub';
    pub.textContent = ` — ${s.publisher} · read ${guideDoc.readDate}`;
    const what = document.createElement('span');
    what.className = 'what';
    what.textContent = s.what;
    li.append(pub, what);
    list.append(li);
  }
  $('read-date').textContent = guideDoc.readDate;
}

function matchesFilters(t) {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('grade').value;
  const kind = $('kind').value;
  if (grade !== 'all' && t.grade !== grade) return false;
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'online') return false; // the official list has no online trophies
  if (kind !== 'all' && kind !== 'missable' && kind !== 'online' && t.kind !== kind) return false;
  if ($('only-left').checked && earned.has(t.name)) return false;
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderCards() {
  const wrap = $('cards');
  wrap.replaceChildren();
  const shieldOn = $('spoiler').checked;
  let shown = 0;
  for (const t of trophies) {
    if (!matchesFilters(t)) continue;
    shown += 1;
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
    const isShielded = shieldOn && t.hidden && !revealed.has(t.name) && !earned.has(t.name);
    if (isShielded) card.classList.add('blurred');

    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderCards();
      renderProgress();
    });
    const titleWrap = document.createElement('div');
    const h = document.createElement('h3');
    h.className = 'shielded';
    h.textContent = t.name;
    const desc = document.createElement('p');
    desc.className = 'desc shielded';
    desc.textContent = t.description;
    titleWrap.append(h, desc);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = `${t.grade} · ${t.points} pts`;
    head.append(box, titleWrap, grade);
    if (t.missable) {
      const f = document.createElement('span');
      f.className = 'flag';
      f.textContent = 'MISSABLE';
      head.append(f);
    }
    if (t.hidden) {
      const f = document.createElement('span');
      f.className = 'flag hidden-flag';
      f.textContent = 'HIDDEN';
      head.append(f);
    }
    card.append(head);

    if (isShielded) {
      const note = document.createElement('p');
      note.className = 'blur-note';
      note.textContent = 'Spoiler shield is on: this trophy is hidden on PlayStation until earned. ';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Reveal anyway';
      btn.addEventListener('click', () => {
        revealed.add(t.name);
        save();
        renderCards();
      });
      note.append(btn);
      card.append(note);
    }

    if (t.count) {
      const c = document.createElement('p');
      c.className = 'count';
      c.textContent = `Target: ${t.count.toLocaleString('en-US')} — ${t.countLabel}`;
      card.append(c);
    }
    const g = document.createElement('p');
    g.className = 'guide shielded';
    g.textContent = t.guide;
    card.append(g);

    const ol = document.createElement('ol');
    ol.className = 'steps';
    for (const st of t.steps ?? []) {
      const li = document.createElement('li');
      li.textContent = st.text;
      if (st.cites?.length) li.append(citeLinks(st.cites));
      ol.append(li);
    }
    card.append(ol);

    const union = [...new Set((t.steps ?? []).flatMap((st) => st.cites ?? []))].sort((a, b) => a - b);
    if (union.length) {
      const srcLine = document.createElement('p');
      srcLine.className = 'hint';
      srcLine.append(document.createTextNode(`Sources for this trophy (${union.length}):`));
      srcLine.append(citeLinks(union));
      card.append(srcLine);
    }

    const meta = document.createElement('p');
    meta.className = 'hint';
    meta.textContent = `Roadmap stage ${t.stage} · Kind: ${t.kind}`;
    card.append(meta);
    wrap.append(card);
  }
  $('no-results').hidden = shown > 0;
  $('online-note').hidden = $('kind').value !== 'online';
}

function renderProgress() {
  const totalPoints = trophies.reduce((a, t) => a + (t.points ?? 0), 0);
  const banked = trophies.filter((t) => earned.has(t.name)).reduce((a, t) => a + (t.points ?? 0), 0);
  $('progress').textContent = `${earned.size} of ${trophies.length} earned`;
  $('bar-fill').style.width = `${(earned.size / trophies.length) * 100}%`;
  $('points-line').textContent =
    `${banked.toLocaleString('en-US')} PSN points banked · ${totalPoints.toLocaleString('en-US')} available`;
}

$('export').addEventListener('click', () => {
  const payload = JSON.stringify({ earned: [...earned], revealed: [...revealed] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
    if (Array.isArray(data.revealed)) revealed = new Set(data.revealed);
    save();
    renderCards();
    renderProgress();
  } catch {
    alert('That file is not a trophy progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  earned.clear();
  revealed.clear();
  save();
  renderCards();
  renderProgress();
});
for (const id of ['search', 'grade', 'kind', 'spoiler', 'only-left']) {
  $(id).addEventListener('input', renderCards);
  $(id).addEventListener('change', renderCards);
}

renderAudit();
renderRoadmap();
renderWatchlist();
renderDisputes();
renderSources();
renderCards();
renderProgress();
