// Theme toggle (persist like original site)
const root = document.documentElement;
const saved = localStorage.getItem("portfolio-theme");
if (saved) root.dataset.theme = saved;
document.getElementById("themeToggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("portfolio-theme", root.dataset.theme);
});

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));

// Greeting + year + live WAT clock
const h = new Date().getHours();
document.getElementById("greeting").textContent =
  h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
document.getElementById("year").textContent = new Date().getFullYear();
function tick() {
  try {
    const t = new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos", hour12: false });
    document.getElementById("liveClock").textContent = t;
  } catch { document.getElementById("liveClock").textContent = new Date().toLocaleTimeString(); }
}
tick(); setInterval(tick, 1000);

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// 3D tilt on orbit stage (homepage only)
const visual = document.getElementById("heroVisual");
const stage = document.getElementById("orbitStage");
const mouse = { x: -9999, y: -9999, active: false };
if (visual && stage) {
  visual.addEventListener("mousemove", e => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
  });
  visual.addEventListener("mouseleave", () => {
    stage.style.transform = "rotateY(0) rotateX(0)";
    mouse.active = false;
  });
}

// Skill chips burst
document.querySelectorAll("[data-chip]").forEach(chip => {
  chip.addEventListener("click", () => {
    chip.style.transform = "scale(1.25) rotate(-4deg)";
    setTimeout(() => chip.style.transform = "", 220);
    if (typeof burst === "function") burst();
  });
});

// --- Constellation canvas: particles react to cursor (homepage only) ---
const canvas = document.getElementById("constellation");
if (canvas && visual) {
const ctx = canvas.getContext("2d");
let pts = [];
function resize() {
  const r = visual.getBoundingClientRect();
  canvas.width = r.width; canvas.height = r.height;
  const n = Math.min(90, Math.floor(r.width / 8));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1
  }));
}
resize(); window.addEventListener("resize", resize);
function accent() {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#8B5CF6";
}
function burst() { pts.forEach(p => { p.vx += (Math.random() - 0.5) * 3; p.vy += (Math.random() - 0.5) * 3; }); }
function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const col = accent();
  for (const p of pts) {
    // gentle drift
    p.x += p.vx; p.y += p.vy;
    // cursor repel
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const d = Math.hypot(dx, dy);
    if (mouse.active && d < 130 && d > 0.1) { p.x += dx / d * 2.2; p.y += dy / d * 2.2; }
    // bounce
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    p.vx *= 0.995; p.vy *= 0.995;
    if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.02;
    if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.02;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fillStyle = col; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
  }
  // links
  ctx.strokeStyle = col; ctx.lineWidth = 1;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 110) { ctx.globalAlpha = (1 - d / 110) * 0.35; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  requestAnimationFrame(frame);
}
frame();
} // end constellation guard

// --- Full-page cosmic starfield with twinkle + shooting stars ---
const sky = document.getElementById("starfield");
const sctx = sky.getContext("2d");
let stars = [], meteors = [], nextMeteor = 0;
function skyResize() {
  sky.width = window.innerWidth; sky.height = window.innerHeight;
  const n = Math.min(220, Math.floor(window.innerWidth * window.innerHeight / 9000));
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * sky.width, y: Math.random() * sky.height,
    r: Math.random() * 1.4 + 0.3, ph: Math.random() * 7, sp: 0.3 + Math.random() * 0.9
  }));
}
skyResize(); window.addEventListener("resize", skyResize);
function skyFrame(t) {
  sctx.clearRect(0, 0, sky.width, sky.height);
  const light = root.dataset.theme === "light";
  for (const s of stars) {
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t / 1000 * s.sp + s.ph));
    sctx.globalAlpha = (light ? 0.45 : 0.9) * tw;
    sctx.fillStyle = light ? "#0C1524" : "#F5F3FF";
    sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 7); sctx.fill();
  }
  sctx.globalAlpha = 1;
  if (t > nextMeteor) {
    nextMeteor = t + 4000 + Math.random() * 6000;
    if (!light) meteors.push({
      x: Math.random() * sky.width * 0.8 + sky.width * 0.1, y: -20,
      vx: -6 - Math.random() * 4, vy: 4 + Math.random() * 3, life: 1
    });
  }
  meteors = meteors.filter(m => m.life > 0 && m.y < sky.height + 100);
  for (const m of meteors) {
    m.x += m.vx; m.y += m.vy; m.life -= 0.012;
    const g = sctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
    g.addColorStop(0, `rgba(255,250,240,${0.9 * m.life})`);
    g.addColorStop(1, "rgba(46,168,255,0)");
    sctx.strokeStyle = g; sctx.lineWidth = 2;
    sctx.beginPath(); sctx.moveTo(m.x, m.y); sctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12); sctx.stroke();
  }
  requestAnimationFrame(skyFrame);
}
requestAnimationFrame(skyFrame);

// --- Works page: filter archive by stack ---
const filterBar = document.getElementById("filterBar");
if (filterBar) {
  const rows = [...document.querySelectorAll("#allRows .showcase")];
  const count = document.getElementById("workCount");
  filterBar.addEventListener("click", e => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    filterBar.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter.toLowerCase();
    let shown = 0;
    rows.forEach(r => {
      const show = f === "all" || (r.dataset.tags || "").toLowerCase().includes(f);
      r.style.display = show ? "" : "none";
      if (show) shown++;
    });
    if (count) count.textContent = shown + (shown === 1 ? " project" : " projects");
  });
}
