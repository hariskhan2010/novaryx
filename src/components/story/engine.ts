import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* Scroll-driven 3D story: a laptop + phone are "built" by a laser scan, then the
   laptop screen splits into its four layers (design, frontend, backend, AI),
   giant words fly past, then a ring orbits the devices.
   All stage motion reads sCur/time; no CSS animations. */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (s: number, a: number, b: number) => clamp((s - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
const eIn = (t: number) => t * t * t;
const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SPAN = 6;

type Ctx = CanvasRenderingContext2D;
/** Draws at 2x so screen text stays sharp when the camera is close. */
function canvasTex(draw: (x: Ctx, w: number, h: number) => void, w = 1024, h = 640, k = 2) {
  const c = document.createElement("canvas");
  c.width = w * k; c.height = h * k;
  const x = c.getContext("2d")!;
  x.scale(k, k);
  x.textBaseline = "alphabetic";
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}
/** Like canvasTex, but paints the real artwork later, when the browser is idle. The texture object
 *  (and so the shader) stays the same; only its image is swapped. */
const idleJobs: (() => void)[] = [];
function lazyTex(draw: (x: Ctx, w: number, h: number) => void, w = 1024, h = 640, k = 2) {
  const t = canvasTex((x) => { x.fillStyle = "#0b0b0b"; x.fillRect(0, 0, 4, 4); }, 4, 4, 1);
  idleJobs.push(() => {
    const c = document.createElement("canvas");
    c.width = w * k; c.height = h * k;
    const x = c.getContext("2d")!;
    x.scale(k, k);
    draw(x, w, h);
    t.image = c;
    t.needsUpdate = true;
  });
  return t;
}
function runIdleJobs() {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    ?? ((cb: () => void) => window.setTimeout(cb, 200));
  const next = () => { const job = idleJobs.shift(); if (!job) return; job(); ric(next, { timeout: 1500 }); };
  ric(next, { timeout: 1500 });
}

function rr(x: Ctx, c: string | CanvasGradient, a: number, b: number, w: number, h: number, r: number) {
  x.beginPath(); x.roundRect(a, b, w, h, r); x.fillStyle = c; x.fill();
}
function txt(x: Ctx, s: string, a: number, b: number, size: number, color: string, weight = 700, mono = false) {
  x.font = `${weight} ${size}px ${mono ? "ui-monospace, Consolas, monospace" : "system-ui, 'Segoe UI', Arial, sans-serif"}`;
  x.fillStyle = color; x.fillText(s, a, b);
}

// ── Screen artwork ─────────────────────────────────────
function drawSite(x: Ctx, w: number, h: number) {
  x.fillStyle = "#0b0b0b"; x.fillRect(0, 0, w, h);
  rr(x, "#141414", 0, 0, w, 64, 0);
  rr(x, "#e50914", 28, 20, 24, 24, 6);
  txt(x, "NOVARYX", 62, 41, 22, "#ffffff", 800);
  ["Projects", "Services", "About"].forEach((l, i) => txt(x, l, 600 + i * 100, 40, 17, "#9a9a9a", 600));
  rr(x, "#e50914", 900, 16, 100, 32, 16); txt(x, "Start", 928, 38, 15, "#ffffff", 700);
  txt(x, "We build it.", 48, 150, 54, "#ffffff", 800);
  txt(x, "You use it.", 48, 212, 54, "#e50914", 800);
  txt(x, "Apps, websites and AI tools, built for you.", 48, 250, 17, "#b5b5b5", 500);
  txt(x, "Reliable · Clear payments · On time", 48, 274, 15, "#7a7a7a", 500);
  rr(x, "#e50914", 48, 290, 180, 46, 23); txt(x, "See projects", 74, 320, 17, "#ffffff", 700);
  x.strokeStyle = "#3a3a3a"; x.lineWidth = 2; x.beginPath(); x.roundRect(242, 290, 150, 46, 23); x.stroke();
  txt(x, "Custom", 286, 320, 17, "#f5f5f1", 600);
  const g = x.createLinearGradient(600, 96, 976, 340);
  g.addColorStop(0, "#b20710"); g.addColorStop(1, "#ff5a5f");
  rr(x, g, 600, 96, 376, 250, 22);
  x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 5; x.beginPath();
  for (let i = 0; i <= 10; i++) { const px = 630 + i * 31, py = 300 - i * 14 - 26 * Math.sin(i * 0.9); if (i) x.lineTo(px, py); else x.moveTo(px, py); }
  x.stroke();
  txt(x, "Projects", 622, 130, 18, "rgba(255,255,255,.92)", 700);
  const cards: [string, string, string, string][] = [
    ["Web app", "#4fd1a1", "Booking system", "Next.js · Supabase"],
    ["Website", "#e50914", "Business site", "Fast · SEO ready"],
    ["AI tool", "#ff5a5f", "Chat assistant", "Answers 24/7"],
  ];
  cards.forEach(([t, c, d, m], i) => {
    const cx = 48 + i * 318;
    rr(x, "#161616", cx, 386, 296, 220, 18);
    rr(x, c, cx + 14, 400, 268, 110, 12);
    txt(x, d, cx + 30, 432, 17, "rgba(0,0,0,.75)", 800);
    rr(x, "rgba(0,0,0,.22)", cx + 30, 450, 150, 10, 5); rr(x, "rgba(0,0,0,.22)", cx + 30, 470, 110, 10, 5);
    txt(x, t, cx + 18, 548, 22, "#ffffff", 700);
    txt(x, m, cx + 18, 576, 15, "#9a9a9a", 500);
  });
}
function drawApp(x: Ctx, w: number, h: number) {
  rr(x, "#0b0b0b", 0, 0, w, h, 48);
  txt(x, "9:41", 34, 46, 20, "#ffffff", 700);
  rr(x, "#05060a", w / 2 - 50, 22, 100, 28, 14);
  rr(x, "#ffffff", w - 70, 32, 36, 14, 4);
  txt(x, "My projects", 30, 120, 34, "#ffffff", 800);
  txt(x, "Your builds", 30, 152, 17, "#9a9a9a", 500);
  const rows: [string, string, string][] = [["Web app", "Active", "#4fd1a1"], ["Website", "Active", "#4fd1a1"], ["AI tool", "Pending", "#ff5a5f"]];
  rows.forEach(([t, st, c], i) => {
    const y = 186 + i * 118;
    rr(x, "#161616", 22, y, w - 44, 100, 20);
    rr(x, c, 40, y + 22, 56, 56, 14);
    txt(x, t, 112, y + 46, 21, "#ffffff", 700);
    rr(x, c + "33", 112, y + 58, 84, 26, 13);
    txt(x, st, 124, y + 77, 14, c, 700);
  });
  rr(x, "#e50914", 22, h - 170, w - 44, 64, 32);
  txt(x, "Start a project", 74, h - 129, 21, "#ffffff", 800);
  [0, 1, 2, 3].forEach((i) => rr(x, i === 0 ? "#e50914" : "#2a2a2a", 50 + i * ((w - 140) / 3), h - 64, 40, 8, 4));
}
function drawKeys(x: Ctx, w: number, h: number) {
  x.fillStyle = "#2a2f3b"; x.fillRect(0, 0, w, h);
  rr(x, "#171a22", 60, 34, w - 120, 360, 14);
  const rows = [
    ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
    ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "enter"],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
    ["fn", "ctrl", "alt", "cmd", "space", "cmd", "alt", "‹", "›", "⌃", "⌄"],
  ];
  x.textAlign = "center";
  rows.forEach((keys, r) => {
    const n = keys.length, kw = (w - 150 - (n - 1) * 8) / n;
    keys.forEach((k, i) => {
      const kx = 75 + i * (kw + 8), ky = 50 + r * 66;
      rr(x, "#0d0f15", kx, ky, kw, 56, 8);
      const small = k.length > 1;
      txt(x, k, kx + kw / 2, ky + (small ? 36 : 42), small ? 19 : 34, "#f2f3f7", 800);
    });
  });
  x.textAlign = "start";
  rr(x, "#323846", w / 2 - 190, 430, 380, 230, 18);
}
// Layer artwork (shown when the screen splits apart)
function drawDesign(x: Ctx, w: number, h: number) {
  rr(x, "rgba(20,20,20,.92)", 0, 0, w, h, 26);
  x.setLineDash([12, 10]); x.strokeStyle = "#e8e8e8"; x.lineWidth = 3;
  [[48, 40, w - 96, 50], [48, 130, 430, 150], [520, 130, w - 568, 220], [48, 400, 290, 180], [366, 400, 290, 180], [684, 400, 292, 180]].forEach(([a, b, c, d]) => { x.beginPath(); x.roundRect(a, b, c, d, 14); x.stroke(); });
  x.setLineDash([]);
  txt(x, "Aa", 70, 250, 110, "#ffffff", 800);
  ["#e50914", "#ff5a5f", "#4fd1a1", "#f5f5f1"].forEach((c, i) => { x.beginPath(); x.arc(560 + i * 92, 260, 34, 0, 7); x.fillStyle = c; x.fill(); });
  txt(x, "DESIGN · UI/UX", 60, 74, 22, "#ff5a5f", 700, true);
}
function drawBackend(x: Ctx, w: number, h: number) {
  rr(x, "rgba(10,10,10,.94)", 0, 0, w, h, 26);
  rr(x, "#121212", 0, 0, w, 54, 0);
  ["#ff6b7a", "#ff5a5f", "#4fd1a1"].forEach((c, i) => { x.beginPath(); x.arc(32 + i * 26, 27, 8, 0, 7); x.fillStyle = c; x.fill(); });
  txt(x, "api/projects/route.ts", 130, 35, 18, "#9a9a9a", 500, true);
  const code: [string, string][] = [
    ["export async function GET() {", "#c792ea"],
    ["  const projects = await db", "#f5f5f1"],
    ["    .from(\"projects\")", "#4fd1a1"],
    ["    .select(\"*\")", "#4fd1a1"],
    ["    .eq(\"published\", true);", "#ff5a5f"],
    ["  return Response.json(projects);", "#e50914"],
    ["}", "#c792ea"],
  ];
  code.forEach(([l, c], i) => { txt(x, String(i + 1), 26, 110 + i * 56, 22, "#3a3a3a", 500, true); txt(x, l, 70, 110 + i * 56, 26, c, 500, true); });
  const dx = 840, dy = 160;
  for (let i = 2; i >= 0; i--) {
    x.fillStyle = "#b20710"; x.fillRect(dx - 80, dy + i * 70, 160, 50);
    x.beginPath(); x.ellipse(dx, dy + i * 70 + 50, 80, 22, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(dx, dy + i * 70, 80, 22, 0, 0, 7); x.fillStyle = "#e50914"; x.fill();
  }
  txt(x, "DATABASE", dx - 62, dy + 270, 20, "#9a9a9a", 700, true);
}
function drawAI(x: Ctx, w: number, h: number) {
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "rgba(90,8,14,.95)"); g.addColorStop(1, "rgba(12,12,12,.95)");
  x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, w, h, 26); x.fill();
  txt(x, "✦ AI Assistant", 48, 70, 30, "#ffffff", 800);
  rr(x, "#e50914", w - 520, 110, 470, 70, 24); txt(x, "Build me a booking app", w - 494, 155, 26, "#ffffff", 700);
  rr(x, "#1c1c1c", 48, 210, 600, 120, 24);
  txt(x, "Sure. Here is the plan:", 76, 256, 26, "#ffffff", 600);
  txt(x, "bookings, payments, reminders.", 76, 300, 26, "#e8e8e8", 500);
  rr(x, "#1c1c1c", 48, 360, 220, 60, 22);
  [0, 1, 2].forEach((i) => { x.beginPath(); x.arc(110 + i * 46, 390, 10, 0, 7); x.fillStyle = "#ff5a5f"; x.fill(); });
  rr(x, "rgba(255,255,255,.08)", 48, h - 110, w - 96, 66, 33);
  txt(x, "Ask anything…", 84, h - 68, 24, "#9a9a9a", 500);
  rr(x, "#ff5a5f", w - 120, h - 104, 54, 54, 27);
}

export function initStory(root: HTMLElement): () => void {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scroller = root.querySelector<HTMLElement>(".story-scroller")!;
  const stage = root.querySelector<HTMLElement>(".story-stage")!;
  const canvas = root.querySelector<HTMLCanvasElement>(".story-gl")!;
  const scenes = [...root.querySelectorAll<HTMLElement>(".story-front [data-r]")].map((el) => ({ el, r: el.dataset.r!.split(",").map(Number) }));
  const back = root.querySelector<HTMLElement>(".story-back")!;
  const wordmark = root.querySelector<HTMLElement>(".wordmark")!;
  const hint = root.querySelector<HTMLElement>("[data-hint]")!;
  const words = [...back.querySelectorAll<HTMLElement>(".story-word")];
  const lbls = [...root.querySelectorAll<HTMLElement>(".lbl")];
  const rls = [...root.querySelectorAll<HTMLElement>(".rl")];
  const leaders = root.querySelector<SVGSVGElement>(".leaders")!;
  leaders.innerHTML = lbls.map(() => "<line/><circle r='3'/>").join("");
  const lines = [...leaders.querySelectorAll("line")];
  const dots = [...leaders.querySelectorAll("circle")];
  const pct = root.querySelector<HTMLElement>("[data-pct]")!;
  const pbar = root.querySelector<HTMLElement>("[data-pbar]")!;
  const layerNow = root.querySelector<HTMLElement>("[data-layer]")!;
  const LAYER_NAMES = ["Design", "Frontend", "Backend", "AI"];
  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  let sTarget = 0, sCur = 0, time = 0, raf = 0, last = performance.now();

  const domScenes = (s: number) => {
    for (const { el, r } of scenes) {
      const o = eOut(seg(s, r[0], r[1])) * (1 - eIn(seg(s, r[2], r[3])));
      el.style.setProperty("--o", o.toFixed(3));
      el.style.setProperty("--ty", ((1 - o) * 24).toFixed(1) + "px");
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    }
  };

  // ── WebGL ─────────────────────────────────────────
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    if (!renderer.capabilities.isWebGL2) throw new Error("no webgl2");
  } catch {
    renderer = null;
    root.classList.add("no-gl");
  }

  let frame: () => void = () => domScenes(sCur);
  let onTheme = () => {};
  let onResize = () => {};
  let govern: (dt: number) => void = () => {};
  const disposers: (() => void)[] = [];

  if (renderer) {
    const r = renderer;
    let maxDpr = innerWidth < 760 ? 1.5 : 1.75;
    r.setPixelRatio(Math.min(Math.max(devicePixelRatio, 1.5), maxDpr));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    // The sync shader-error check blocks the main thread while shaders compile (~2 s on slow GPUs).
    r.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    // Environment for the metal reflections is built after its shaders compile off-thread (see below).
    const pm = new THREE.PMREMGenerator(r);
    const room = new RoomEnvironment();
    scene.environmentIntensity = 0.9;
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff9fa3, 1.2);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const accent = new THREE.Color(), hot = new THREE.Color();
    // Laser "build": while it sweeps down, screen content shows only above the cut.
    // Done by cropping the screen mesh + its texture (not clipping planes, which add a shader variant).

    const tilt = new THREE.Group(), group = new THREE.Group();
    tilt.add(group); scene.add(tilt);

    const siteTex = canvasTex(drawSite);
    const appTex = canvasTex(drawApp, 400, 820);
    const keyTex = canvasTex(drawKeys, 1024, 700);
    // Layer art is only seen after scrolling, so it is painted when the browser is idle.
    const layerTex = [lazyTex(drawDesign), siteTex, lazyTex(drawBackend), lazyTex(drawAI)];

    const alu = new THREE.MeshPhysicalMaterial({ color: 0x4a5163, metalness: 0.9, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.3 });
    const bezel = new THREE.MeshPhysicalMaterial({ color: 0x07080c, metalness: 0.2, roughness: 0.12, clearcoat: 1 });

    // Laptop: base + hinged lid
    const LW = 3.4, BH = 0.1, LD = 2.3, LH = 2.2, LT = 0.06;
    const laptop = new THREE.Group();
    laptop.position.y = -1.0;
    group.add(laptop);
    const base = new THREE.Mesh(new RoundedBoxGeometry(LW, BH, LD, 4, 0.045), alu);
    laptop.add(base);
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.16, LD - 0.16), new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.6, metalness: 0.4 }));
    deck.rotation.x = -Math.PI / 2; deck.position.y = BH / 2 + 0.002; base.add(deck);
    const lid = new THREE.Group();
    lid.position.set(0, BH / 2, -LD / 2 + 0.04);
    lid.rotation.x = -0.2;
    laptop.add(lid);
    const lidBody = new THREE.Mesh(new RoundedBoxGeometry(LW, LH, LT, 4, 0.025), alu);
    lidBody.position.set(0, LH / 2, 0); lid.add(lidBody);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.04, LH - 0.04), bezel);
    glass.position.set(0, LH / 2, LT / 2 + 0.001); lid.add(glass);
    const SW = LW - 0.2, SH = SW / 1.6;
    const screenTex = siteTex.clone(); // own UV crop; shares the image with the Frontend layer
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat);
    const SY = LH / 2 + 0.03;
    screen.position.set(0, SY, LT / 2 + 0.003); lid.add(screen);

    // The four layers that split out of the laptop screen
    const layers: THREE.Mesh[] = [];
    const layerEdges: THREE.LineSegments[] = [];
    layerTex.forEach((t) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      m.visible = false; lid.add(m); layers.push(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0xe50914, transparent: true, opacity: 0 }));
      m.add(e); layerEdges.push(e);
    });

    // Phone standing to the front-right
    const PW = 0.78, PH = 1.56, PT = 0.08;
    const phone = new THREE.Group();
    phone.position.set(2.35, -0.4, 0.75); phone.rotation.y = -0.38;
    group.add(phone);
    const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, PT, 4, 0.038), alu);
    phone.add(phoneBody);
    const phoneGlass = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.03, PH - 0.03), bezel);
    phoneGlass.position.z = PT / 2 + 0.001; phone.add(phoneGlass);
    const PSH = (PW - 0.07) * 2.05;
    const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.07, PSH), new THREE.MeshBasicMaterial({ map: appTex, toneMapped: false, transparent: true }));
    phoneScreen.position.z = PT / 2 + 0.003; phone.add(phoneScreen);
    group.position.x = -0.35;

    const laserTex = canvasTex((x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(229,9,20,0)"); g.addColorStop(0.5, "rgba(255,120,125,1)"); g.addColorStop(1, "rgba(229,9,20,0)");
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    }, 64, 64);
    const laser = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.4), new THREE.MeshBasicMaterial({ color: 0xff5a5f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    laser.rotation.x = -Math.PI / 2; scene.add(laser);
    const laserLine = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.035), new THREE.MeshBasicMaterial({ map: laserTex, color: 0xffd0a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(laserLine);

    const ringG = new THREE.Group(); scene.add(ringG);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.012, 8, 180), new THREE.MeshBasicMaterial({ color: 0xe50914, transparent: true }));
    ringG.add(ring);
    const nodes = [0, 1, 2].map(() => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff5a5f, transparent: true })); ringG.add(n); return n; });
    const comet = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    ringG.add(comet);

    const N = innerWidth < 760 ? 260 : 620, pg = new THREE.BufferGeometry(), pp = new Float32Array(N * 3);
    let sd = 3; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < N; i++) { pp[i * 3] = (rnd() - 0.5) * 16; pp[i * 3 + 1] = (rnd() - 0.5) * 9; pp[i * 3 + 2] = (rnd() - 0.5) * 6 - 2; }
    pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.025, color: 0xff9fa3, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(pts);

    onTheme = () => {
      accent.set(css("--cobalt")); hot.set(css("--amber"));
      layerEdges.forEach((w) => (w.material as THREE.LineBasicMaterial).color.copy(accent));
      (ring.material as THREE.MeshBasicMaterial).color.copy(accent);
      (pts.material as THREE.PointsMaterial).color.copy(accent);
      nodes.forEach((n) => (n.material as THREE.MeshBasicMaterial).color.copy(hot));
      (laser.material as THREE.MeshBasicMaterial).color.copy(hot);
    };
    onTheme();

    let Wpx = 1, Hpx = 1;
    onResize = () => {
      Wpx = stage.clientWidth; Hpx = stage.clientHeight;
      r.setSize(Wpx, Hpx, false); camera.aspect = Wpx / Hpx; camera.updateProjectionMatrix();
    };
    onResize();

    // [s, x, y, scale] keyframes, desktop and phone
    const KD = [[0, 2.2, 0, 0.92], [2.0, 2.2, 0, 0.92], [2.4, 1.5, 0, 0.82], [3.4, 1.5, 0, 0.82], [3.8, 0, 0, 0.5], [4.6, 0, 0, 0.5], [5.0, 2.2, 0, 0.8], [6, 2.2, 0, 0.8]];
    const KP = [[0, 0, -1.25, 0.5], [2.0, 0, -1.25, 0.5], [2.4, -0.45, -0.5, 0.46], [3.4, -0.45, -0.5, 0.46], [3.8, 0, -0.2, 0.36], [4.6, 0, -0.2, 0.36], [5.0, 0, -1.3, 0.44], [6, 0, -1.3, 0.44]];
    const kf = (K: number[][], s: number) => {
      for (let i = 0; i < K.length - 1; i++) {
        const a = K[i], b = K[i + 1];
        if (s <= b[0]) { const t = eIO(seg(s, a[0], b[0])); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)]; }
      }
      return K[K.length - 1].slice(1);
    };
    const v = new THREE.Vector3();
    const edge = new THREE.Vector3();
    /** Shows only the part of a screen above world height cutY, by cropping mesh and UVs together. */
    const reveal = (m: THREE.Mesh, tex: THREE.Texture, baseY: number, h: number, cutY: number) => {
      const top = m.parent!.localToWorld(edge.set(0, baseY + h / 2, m.position.z)).y;
      const bot = m.parent!.localToWorld(edge.set(0, baseY - h / 2, m.position.z)).y;
      const k = clamp((top - cutY) / Math.max(1e-6, top - bot));
      m.visible = k > 0.001;
      m.scale.y = Math.max(k, 0.001);
      m.position.y = baseY + (h / 2) * (1 - k);
      tex.repeat.set(1, k);
      tex.offset.set(0, 1 - k);
    };
    const toPx = (p: THREE.Vector3) => { v.copy(p).project(camera); return [((v.x + 1) / 2) * Wpx, ((1 - v.y) / 2) * Hpx]; };
    const tmp = new THREE.Vector3();

    frame = () => {
      const s = sCur, ph = Wpx < 760;
      domScenes(s);
      const [x, y, sc] = kf(ph ? KP : KD, s);
      const ex = eIO(seg(s, 2.1, 2.7)) * (1 - eIO(seg(s, 3.3, 3.75)));
      tilt.position.set(x, y, 0); tilt.scale.setScalar(sc);
      tilt.rotation.x = lerp(0.24, 0.1, seg(s, 2, 3)) + Math.sin(time * 0.5) * 0.02;
      group.rotation.y = lerp(-0.42, -0.62, ex) + Math.sin(time * 0.35) * 0.12 + seg(s, 3.8, 6) * 0.35;

      const comp = eIO(seg(s, 0.95, 2.05));
      const top = 1.3 * sc + y, bot = -1.25 * sc + y;
      // Screens are off (dark glass) until the scan starts, then switch on line by line.
    const cutY = comp <= 0 ? 99 : comp >= 1 ? -99 : lerp(top, bot, comp);
      tilt.updateMatrixWorld(true);
      reveal(screen, screenTex, SY, SH, cutY);
      reveal(phoneScreen, appTex, 0, PSH, cutY);
      const lo = comp > 0 && comp < 1 ? 1 : 0;
      (laser.material as THREE.MeshBasicMaterial).opacity = lo * 0.22;
      (laserLine.material as THREE.MeshBasicMaterial).opacity = lo;
      laser.position.set(x, cutY, 0); laser.scale.setScalar(sc); laser.rotation.z = group.rotation.y;
      laserLine.position.set(x, cutY, 1.8 * sc); laserLine.scale.x = sc;
      pct.textContent = Math.round(comp * 100) + "%";
      pbar.style.setProperty("--p", (comp * 100).toFixed(1) + "%");
      layerNow.textContent = "Layer: " + LAYER_NAMES[Math.min(3, Math.floor(comp * 4))];

      // Screen splits into its four layers, fanned out toward the viewer.
      screenMat.color.setScalar(lerp(1, 0.25, ex));
      layers.forEach((m, i) => {
        m.visible = ex > 0.01;
        m.position.set(ex * (i - 1.5) * -0.22, SY + ex * ((1.5 - i) * 0.6 + 0.62), LT / 2 + 0.01 + ex * (0.5 + i * 0.42));
        m.scale.setScalar(lerp(1, 0.74, ex));
        (m.material as THREE.MeshBasicMaterial).opacity = ex * 0.96;
        (layerEdges[i].material as THREE.LineBasicMaterial).opacity = ex * 0.8;
      });
      tilt.updateMatrixWorld(true);
      let phoneRight = 0;
      for (const [cx, cy] of [[PW / 2, PH / 2], [PW / 2, -PH / 2], [-PW / 2, PH / 2], [-PW / 2, -PH / 2]]) {
        tmp.set(cx, cy, PT / 2); phone.localToWorld(tmp); phoneRight = Math.max(phoneRight, toPx(tmp)[0]);
      }
      const lo2 = eOut(seg(s, 2.45, 2.75)) * (1 - eIn(seg(s, 3.25, 3.45)));
      // Labels follow their layer but never overlap each other (min gap between rows).
      const GAP = ph ? 30 : 58;
      let prevY = -1e9;
      lbls.forEach((l, i) => {
        tmp.set(SW / 2, 0, 0); layers[i].localToWorld(tmp);
        const [px, py] = toPx(tmp);
        const ly = Math.max(py, prevY + GAP); prevY = ly;
        const lx = ph ? Wpx - 104 : Math.min(Wpx - 250, Math.max(px + 70, phoneRight + 36));
        l.style.setProperty("--o", lo2.toFixed(3)); l.style.setProperty("--x", lx + "px"); l.style.setProperty("--y", ly - 22 + "px");
        lines[i].setAttribute("x1", String(px)); lines[i].setAttribute("y1", String(py));
        lines[i].setAttribute("x2", String(lx - 10)); lines[i].setAttribute("y2", String(ly));
        lines[i].style.opacity = String(lo2);
        dots[i].setAttribute("cx", String(px)); dots[i].setAttribute("cy", String(py)); dots[i].style.opacity = String(lo2);
      });

      const wo = eOut(seg(s, 3.55, 3.9)) * (1 - eIn(seg(s, 4.5, 4.75)));
      back.style.opacity = wo.toFixed(3);
      words.forEach((w, i) => (w.style.translate = `${((i % 2 ? -1 : 1) * (seg(s, 3.4, 4.9) - 0.5) * -28 - (i % 2 ? 18 : 4)).toFixed(2)}vw 0`));

      wordmark.style.opacity = (eOut(seg(s, 4.9, 5.4)) * 0.9).toFixed(3);
      wordmark.style.translate = ph ? "0 22vh" : "0 0";
      hint.style.setProperty("--o", (1 - seg(s, 0, 0.4)).toFixed(3));
      const ro = eOut(seg(s, 4.85, 5.25));
      ringG.visible = ro > 0.01; ringG.position.set(x, y, 0); ringG.scale.setScalar(sc * (0.85 + 0.15 * ro));
      ringG.rotation.set(1.18, 0, time * 0.1);
      (ring.material as THREE.MeshBasicMaterial).opacity = ro;
      const prog = (((time * 0.25) % 1) + 1) % 1, act = Math.floor(prog * 3);
      nodes.forEach((n, i) => {
        const a = (i / 3) * Math.PI * 2;
        n.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
        (n.material as THREE.MeshBasicMaterial).opacity = ro; n.scale.setScalar(i === act ? 1.6 : 1);
      });
      const ca = prog * Math.PI * 2;
      comet.position.set(Math.cos(ca) * 2.6, Math.sin(ca) * 2.6, 0);
      (comet.material as THREE.MeshBasicMaterial).opacity = ro;
      ringG.updateMatrixWorld(true);
      rls.forEach((l, i) => {
        const [px, py] = toPx(nodes[i].getWorldPosition(tmp));
        l.style.setProperty("--o", ro.toFixed(3));
        l.style.setProperty("--x", Math.min(px + 12, Wpx - l.offsetWidth - 12) + "px");
        l.style.setProperty("--y", py - 14 + "px");
        l.classList.toggle("on", i === act);
      });
      pts.rotation.y = time * 0.02; pts.position.y = -s * 0.25;
      if (glReady) r.render(scene, camera);
    };

    // Compile every shader (including the hidden layers and ring) off the main thread, then fade the 3D in.
    let glReady = false;
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity .6s ease";
    const envCam = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(16));
    r.compileAsync(room, envCam.children[0] as THREE.Camera).catch(() => {})
      .then(() => { scene.environment = pm.fromScene(room, 0.04).texture; envCam.renderTarget.dispose(); })
      .then(() => r.compileAsync(scene, camera)).catch(() => {}).finally(() => {
      glReady = true;
      canvas.style.opacity = "1";
      runIdleJobs();
    });

    let slow = 0;
    govern = (dt) => {
      if (dt > 0.034) slow++; else slow = Math.max(0, slow - 1);
      if (slow > 45 && maxDpr > 1) { maxDpr = Math.max(1, maxDpr - 0.35); r.setPixelRatio(Math.min(Math.max(devicePixelRatio, 1.5), maxDpr)); onResize(); slow = 0; }
    };

    disposers.push(() => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      [siteTex, screenTex, appTex, keyTex, laserTex, ...layerTex].forEach((t) => t.dispose());
      pm.dispose(); r.dispose();
    });
  }

  const readScroll = () => {
    const rect = scroller.getBoundingClientRect();
    const span = rect.height - innerHeight;
    sTarget = clamp(-rect.top / span) * SPAN;
    return rect.bottom > 0 && rect.top < innerHeight;
  };
  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const vis = readScroll();
    sCur += (sTarget - sCur) * (1 - Math.exp(-dt * 7));
    if (RM) sCur = sTarget; else time += dt;
    if (vis && !document.hidden) { frame(); govern(dt); }
    raf = requestAnimationFrame(tick);
  };
  readScroll(); sCur = sTarget; frame();
  raf = requestAnimationFrame(tick);

  const themeMq = matchMedia("(prefers-color-scheme: light)");
  const themeHandler = () => onTheme();
  themeMq.addEventListener("change", themeHandler);
  addEventListener("nvx-theme", themeHandler);
  addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    themeMq.removeEventListener("change", themeHandler);
    removeEventListener("nvx-theme", themeHandler);
    removeEventListener("resize", onResize);
    disposers.forEach((d) => d());
  };
}
