import gsap from 'gsap';

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Braises et lucioles sur un seul canvas, mises en pause quand l'onglet est caché.
export function startEmbers() {
  const cv = document.getElementById('embers');
  if (!cv || reduce()) return;
  const ctx = cv.getContext('2d');
  let w = 0; let h = 0; let raf = 0;
  const N = 34;
  const ps = [];
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (p = {}) => Object.assign(p, {
    x: Math.random() * w, y: h * (0.55 + Math.random() * 0.5), r: 0.6 + Math.random() * 1.6,
    vy: -(0.12 + Math.random() * 0.4), vx: (Math.random() - 0.5) * 0.25, a: Math.random(), da: 0.004 + Math.random() * 0.01,
  });
  resize();
  for (let i = 0; i < N; i++) ps.push(spawn());
  addEventListener('resize', resize);
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    const night = document.body.dataset.time !== 'day';
    for (const p of ps) {
      p.x += p.vx + Math.sin((p.y + p.x) * 0.01) * 0.2; p.y += p.vy; p.a += p.da;
      if (p.y < -10 || p.x < -10 || p.x > w + 10) spawn(p);
      const o = (0.5 + 0.5 * Math.sin(p.a * 6)) * (night ? 0.8 : 0.35);
      ctx.beginPath();
      ctx.fillStyle = night ? `rgba(255,190,90,${o})` : `rgba(255,230,170,${o})`;
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(tick); };
  document.addEventListener('visibilitychange', onVis);
  raf = requestAnimationFrame(tick);
}

export function flipCard(card, toFront = true) {
  const inner = card.querySelector('.card-inner');
  if (reduce()) { card.classList.toggle('flipped', toFront); inner.style.transform = ''; return; }
  gsap.to(inner, {
    rotationY: toFront ? 180 : 0, duration: 0.9, ease: 'power3.inOut',
    onStart: () => gsap.fromTo(card, { y: 0 }, { y: -14, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' }),
    onComplete: () => card.classList.toggle('flipped', toFront),
  });
}

let bannerTimer = null;
export function showBanner(text, { big = false, ms = 4200 } = {}) {
  const root = document.getElementById('banner');
  if (!root || !text) return;
  root.className = big ? 'big' : '';
  root.textContent = text;
  if (reduce()) { root.style.opacity = 1; } else {
    gsap.killTweensOf(root);
    gsap.fromTo(root, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  }
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    if (reduce()) root.style.opacity = 0;
    else gsap.to(root, { opacity: 0, duration: 0.9 });
  }, ms);
}

export function popIn(el) {
  if (reduce()) return;
  gsap.fromTo(el, { scale: 0.6, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: 'back.out(2)' });
}
