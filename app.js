// 2027 消防公益月曆 電子書模擬（純前端，無外部套件）
// 內容對應：消防月曆_拍攝腳本_20261006.pptx 的 14 個鏡頭
'use strict';

// ===== 每頁內容（意境、場景） =====
const PAGES = [
  { key: 'cover', label: '封面', title: '守護', scene: '三川門石階｜全員 12 人＋福星 V 字陣型',
    mood: '廟守護一方，他們守護每一戶人家。' },
  { key: '01', m: 1, title: '初心', scene: '龍柱前｜男 A', mood: '不管多難，都要把人帶回來。' },
  { key: '02', m: 2, title: '破曉', scene: '側廊紅柱長廊｜女 A', mood: '天還沒亮，鈴聲就響了。' },
  { key: '03', m: 3, title: '守望', scene: '二樓欄杆與屋脊｜男 B', mood: '站在高處，是為了先看見危險。' },
  { key: '04', m: 4, title: '同袍', scene: '廊下｜男 C＋福星', mood: '這世界上，有一種戰友，叫福星。' },
  { key: '05', m: 5, title: '同心', scene: '廟埕｜男 D＋男 E 拉水帶', mood: '從來沒有人放手。' },
  { key: '06', m: 6, title: '忠義', scene: '廟埕・正殿外觀｜全員 12 人', mood: '十二個人，回答同一個字——義。' },
  { key: '07', m: 7, title: '柔韌', scene: '石雕欄杆｜女 B', mood: '溫柔，不代表脆弱。' },
  { key: '08', m: 8, title: '負重', scene: '長廊｜男 F 扛救援繩索', mood: '他肩上扛的，是別人的明天。' },
  { key: '09', m: 9, title: '信任', scene: '紅柱前｜男 G＋男 H 背靠背', mood: '你在，他就敢往前。' },
  { key: '10', m: 10, title: '守候', scene: '廟埕台階｜女 C＋福星', mood: '等下一次，有人需要她們。' },
  { key: '11', m: 11, title: '歸途', scene: '屋脊天際線・夕陽剪影｜男 I', mood: '他今天，又把誰平安帶回家。' },
  { key: '12', m: 12, title: '團圓', scene: '廟埕｜全員 12 人＋福星', mood: '最好的年終獎金：全員平安回家。' },
  { key: 'back', label: '封底', title: '平安', scene: '參天宮全景・藍調時刻', mood: '帝君守著四湖，四湖人守著彼此。' },
];
const MONTH_ZH = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

// ===== 安全的 DOM 建立工具（只用 textContent，不用 innerHTML，避免 XSS） =====
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function pad(n) { return String(n).padStart(2, '0'); }

// ===== 照片：有檔案就顯示，沒有就顯示「待拍攝」佔位 =====
function photoBlock(p) {
  const box = el('div', 'photo');
  const ph = el('div', 'ph');
  ph.append(el('span', 'cam', '照片待拍攝'), el('div', 'scene', p.scene));
  box.append(ph);
  const img = new Image();
  img.alt = (p.label || MONTH_ZH[p.m]) + '「' + p.title + '」';
  img.decoding = 'async';
  img.onload = () => {
    ph.remove(); box.prepend(img);
    box.append(el('span', 'demo', '情境示意圖'));
    const pg = box.closest('.page'); if (pg) pg.classList.add('has-img');
  };
  img.onerror = () => { /* 沒照片就保留佔位，不報錯 */ };
  img.src = 'photos/' + p.key + '.jpg';
  return box;
}

// ===== 月曆格 =====
function calendar(m, data) {
  const wrap = el('div', 'cal');
  const head = el('div', 'cal-head');
  head.append(el('div', 'ym', '2027 年 ' + m + ' 月'), el('div', 'brand2', '四湖參天宮 × 消防公益月曆'));
  const grid = el('div', 'grid');
  WEEK.forEach((w, i) => grid.append(el('div', 'wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : ''), w)));
  const first = new Date(2027, m - 1, 1).getDay();
  const days = new Date(2027, m, 0).getDate();
  for (let i = 0; i < first; i++) grid.append(el('div', 'd empty'));
  for (let d = 1; d <= days; d++) {
    const iso = '2027-' + pad(m) + '-' + pad(d);
    const wd = (first + d - 1) % 7;
    const hol = (data.holidays[iso] || []);
    const ev = (data.events[iso] || []);
    const cell = el('div', 'd' + (wd === 0 ? ' sun' : '') + (hol.length ? ' hol' : '') + (ev.length ? ' ev' : ''));
    const top = el('div', 'top');
    const lunar = data.lunar[iso] ? data.lunar[iso].l : '';
    top.append(el('span', 'n', String(d)), el('span', 'l', lunar));
    cell.append(top);
    const tag = hol.concat(ev).join('・');
    if (tag) { const x = el('span', 'x', tag); x.title = tag; cell.append(x); }
    grid.append(cell);
  }
  wrap.append(head, grid);
  return wrap;
}

// ===== 建立各頁 =====
function buildPage(p, data) {
  const page = el('section', 'page');
  page.setAttribute('aria-label', p.label || MONTH_ZH[p.m]);
  if (p.key === 'cover') {
    page.classList.add('cover');
    const ph = photoBlock(p);
    const t = el('div', 'title');
    t.append(el('div', 'y', '2027'), el('div', 'n', '消防公益月曆'));
    const f = el('div', 'foot');
    f.textContent = '四湖參天宮 × 12 位消防員 × 搜救犬福星\n「守護」';
    f.style.whiteSpace = 'pre-line';
    ph.append(t, f);
    page.append(ph);
  } else if (p.key === 'back') {
    page.classList.add('cover', 'back');
    const ph = photoBlock(p);
    const info = el('div', 'info');
    const lines = [['平安', '帝君守著四湖，四湖人守著彼此。'], ['主辦', '四湖參天宮'], ['公益', '本月曆所得支持參天宮光明燈柱，並捐贈消防人員休整寢具'], ['地址', '雲林縣四湖鄉湖西村關聖路 87 號']];
    lines.forEach(([k, v]) => { const r = el('div'); r.append(el('b', '', k + '｜'), document.createTextNode(v)); info.append(r); });
    ph.append(info);
    page.append(ph);
  } else {
    const ph = photoBlock(p);
    const big = el('div', 'mbig', String(p.m));
    big.append(el('small', '', MONTH_ZH[p.m]));
    const mood = el('div', 'mood');
    mood.append(el('div', 't', '「' + p.title + '」'), el('div', 's', p.mood));
    ph.append(big, mood);
    page.append(ph, calendar(p.m, data));
  }
  return page;
}

// ===== 翻頁控制 =====
function init(data) {
  const book = document.getElementById('book');
  const pager = document.getElementById('pager');
  const thumbs = document.getElementById('thumbs');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const pages = PAGES.map((p, i) => {
    const node = buildPage(p, data);
    node.style.zIndex = String(PAGES.length - i); // 前面的頁疊在上面
    book.append(node);
    return node;
  });
  let cur = 0;
  const btns = PAGES.map((p, i) => {
    const b = el('button', '', p.label || String(p.m) + '月');
    b.type = 'button';
    b.addEventListener('click', () => go(i));
    thumbs.append(b);
    return b;
  });
  function go(n) {
    cur = Math.max(0, Math.min(PAGES.length - 1, n));
    pages.forEach((pg, i) => pg.classList.toggle('flipped', i < cur));
    btns.forEach((b, i) => b.classList.toggle('on', i === cur));
    const p = PAGES[cur];
    pager.textContent = (p.label || MONTH_ZH[p.m]) + '「' + p.title + '」　' + (cur + 1) + ' / ' + PAGES.length;
    prev.disabled = cur === 0; next.disabled = cur === PAGES.length - 1;
  }
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  // 點頁面左 1/3 回上一頁，其餘翻下一頁
  book.addEventListener('click', (e) => {
    const r = book.getBoundingClientRect();
    go(e.clientX - r.left < r.width / 3 ? cur - 1 : cur + 1);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(cur - 1);
  });
  // 手機滑動
  let sx = null;
  book.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  book.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
    sx = null;
  });
  // 網址加 #3 可直接打開第 3 頁（方便分享特定月份）
  const h = parseInt((location.hash || '').replace('#', ''), 10);
  go(Number.isFinite(h) ? h - 1 : 0);
  window.addEventListener('hashchange', () => { const n = parseInt(location.hash.replace('#', ''), 10); if (Number.isFinite(n)) go(n - 1); });
}

// ===== 讀取日曆資料：優先用 days.js 內嵌資料，否則向後端/JSON 讀取 =====
function valid(data) { return data && typeof data.lunar === 'object' && typeof data.holidays === 'object' && typeof data.events === 'object'; }
if (valid(window.CAL_DATA)) init(window.CAL_DATA); else fetch('days.json', { credentials: 'same-origin' })
  .then((r) => { if (!r.ok) throw new Error('days.json 讀取失敗'); return r.json(); })
  .then((data) => {
    // 基本資料驗證，避免壞資料讓頁面壞掉
    if (!valid(data)) throw new Error('資料格式錯誤');
    init(data);
  })
  .catch((err) => {
    const book = document.getElementById('book');
    book.textContent = '月曆資料載入失敗：' + err.message + '（請用 server.js 或 GitHub Pages 開啟，不要直接雙擊 index.html）';
  });
