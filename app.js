/* ============================================================
app.js  –  Fapowski
images/ に連番で入れるだけで自動検出
profile.jpg / live01-06.jpg / work01.jpg, work02.jpg …
============================================================ */

(function () {
const CORRECT_PASS = ‘hillock7’;
const SESSION_KEY  = ‘fapowski_unlocked’;
const screen    = document.getElementById(‘passcode-screen’);
const input     = document.getElementById(‘passInput’);
const btn       = document.getElementById(‘passBtn’);
const errorMsg  = document.getElementById(‘passError’);
const toggleBtn = document.getElementById(‘passToggle’);

if (sessionStorage.getItem(SESSION_KEY) === ‘1’) {
screen.style.display = ‘none’;
return;
}

toggleBtn.addEventListener(‘click’, () => {
const isText = input.type === ‘text’;
input.type = isText ? ‘password’ : ‘text’;
toggleBtn.querySelector(’.material-icons’).textContent =
isText ? ‘visibility’ : ‘visibility_off’;
});

function tryUnlock() {
if (input.value === CORRECT_PASS) {
sessionStorage.setItem(SESSION_KEY, ‘1’);
screen.classList.add(‘unlocked’);
screen.addEventListener(‘animationend’, () => { screen.style.display = ‘none’; }, { once: true });
} else {
errorMsg.textContent = ‘Nieprawidłowe hasło. Spróbuj ponownie.’;
errorMsg.classList.add(‘show’);
input.classList.add(‘shake’);
input.value = ‘’;
input.addEventListener(‘animationend’, () => { input.classList.remove(‘shake’); }, { once: true });
setTimeout(() => errorMsg.classList.remove(‘show’), 3000);
}
}

btn.addEventListener(‘click’, tryUnlock);
input.addEventListener(‘keydown’, (e) => { if (e.key === ‘Enter’) tryUnlock(); });
})();

(function () {
const ham  = document.getElementById(‘hamburger’);
const side = document.getElementById(‘sidebar’);
if (!ham || !side) return;
ham.addEventListener(‘click’, (e) => { e.stopPropagation(); side.classList.toggle(‘open’); });
document.addEventListener(‘click’, (e) => {
if (!side.contains(e.target) && !ham.contains(e.target)) side.classList.remove(‘open’);
});
})();

(function () {
document.querySelectorAll(’.sidebar-nav a’).forEach(link => {
link.addEventListener(‘click’, (e) => {
e.preventDefault();
document.querySelectorAll(’.sidebar-nav a’).forEach(l => l.classList.remove(‘active’));
link.classList.add(‘active’);
});
});
})();

(function () {
const likeBtn = document.getElementById(‘likeBtn’);
if (!likeBtn) return;
likeBtn.addEventListener(‘click’, () => {
likeBtn.classList.toggle(‘liked’);
likeBtn.querySelector(’.material-icons’).textContent =
likeBtn.classList.contains(‘liked’) ? ‘favorite’ : ‘favorite_border’;
});
})();

const fadeObserver = new IntersectionObserver((entries) => {
entries.forEach((entry, i) => {
if (entry.isIntersecting) {
setTimeout(() => entry.target.classList.add(‘visible’), i * 55);
fadeObserver.unobserve(entry.target);
}
});
}, { threshold: 0.08 });

document.querySelectorAll(’.fade-up’).forEach(el => fadeObserver.observe(el));

function imageExists(src) {
return fetch(src, { method: ‘HEAD’ }).then(r => r.ok).catch(() => false);
}

async function detectSequential(prefix, ext, start, max) {
const found = [];
for (let i = start; i <= max; i++) {
const n = String(i).padStart(2, ‘0’);
const src = `${prefix}${n}${ext}`;
const ok = await imageExists(src);
if (!ok) break;
found.push(src);
}
return found;
}

// 各work画像の固定Like数（10枚分プリセット、11枚目以降は自動計算）
const WORK_LIKES = [6, 9, 7, 8, 6, 9, 7, 8, 6, 9];

function getLikesForIndex(index) {
if (index < WORK_LIKES.length) return WORK_LIKES[index];
// 11枚目以降はインデックスを元に疑似固定値
const seed = (index * 2654435761) >>> 0;
return Math.floor(6 + (seed % 1000) / 1000 * 3);
}

function calcTotalLikes(count) {
let total = 0;
for (let i = 0; i < count; i++) total += getLikesForIndex(i);
return total;
}

const INITIAL_COUNT = 6;
const LOAD_COUNT    = 4;
const GC_COLORS = [‘gc-1’,‘gc-2’,‘gc-3’,‘gc-4’,‘gc-5’,‘gc-6’,‘gc-7’,‘gc-8’,‘gc-9’,‘gc-10’,‘gc-11’,‘gc-12’];

(async function () {
if (await imageExists(‘images/profile.jpg’)) {
const inner = document.querySelector(’.avatar-inner’);
if (inner) inner.innerHTML = ‘<img src="images/profile.jpg" alt="Profile">’;
}

const liveCards = document.querySelectorAll(’.live-card’);
for (let i = 0; i < liveCards.length; i++) {
const n = String(i + 1).padStart(2, ‘0’);
const src = `images/live${n}.jpg`;
if (await imageExists(src)) {
const img = document.createElement(‘img’);
img.className = ‘live-card-img’;
img.src = src;
liveCards[i].insertBefore(img, liveCards[i].firstChild);
}
}

const workSrcs = await detectSequential(‘images/work’, ‘.jpg’, 1, 99);

// Media & Likes カウント更新
const mediaEl  = document.getElementById(‘mediaCount’);
const likesEl  = document.getElementById(‘likesCount’);
if (mediaEl) mediaEl.textContent = workSrcs.length;
if (likesEl) likesEl.textContent = calcTotalLikes(workSrcs.length);

applyGallery(workSrcs);
})();

function applyGallery(srcs) {
const grid    = document.getElementById(‘galleryGrid’);
const loadBtn = document.getElementById(‘loadMoreBtn’);
if (!grid) return;

// 画像がない場合はプレースホルダーを表示しない
if (srcs.length === 0) {
if (loadBtn) loadBtn.style.display = ‘none’;
return;
}

const list = srcs.map((src, i) => ({ src, label: `Work ${String(i + 1).padStart(2, '0')}` }));
let displayed = 0;

function createCard(work, index) {
const card = document.createElement(‘div’);
card.className = `gallery-card ${GC_COLORS[index % GC_COLORS.length]} fade-up`;
const img = document.createElement(‘img’);
img.src = work.src; img.alt = work.label;
card.appendChild(img);
const overlay = document.createElement(‘div’);
overlay.className = ‘gallery-overlay’;
overlay.innerHTML = `<span class="gallery-label">${work.label}</span>`;
card.appendChild(overlay);
return card;
}

function renderCards(count) {
const end = Math.min(displayed + count, list.length);
for (let i = displayed; i < end; i++) {
const card = createCard(list[i], i);
grid.appendChild(card);
fadeObserver.observe(card);
}
displayed = end;
if (displayed >= list.length && loadBtn) loadBtn.style.display = ‘none’;
}

renderCards(INITIAL_COUNT);
if (loadBtn) loadBtn.addEventListener(‘click’, () => renderCards(LOAD_COUNT));
}
