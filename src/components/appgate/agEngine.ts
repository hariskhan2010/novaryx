import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* AppGate case-study film: a laptop whose screen tells one idea per scene, cause then effect.
   0 problem: a game silently downloads an update        1 fix: cursor switches its internet off in AppGate
   2 effect: the game shows "No internet", browser online 3 Wi-Fi only option
   4 trust: every block is checked and recorded           5 undo: "Restore all" on the real AppGate Home screen
   Only one scene's content is on screen at a time. Motion reads sCur/time; shaders compile off-thread. */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (s: number, a: number, b: number) => clamp((s - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
const eIn = (t: number) => t * t * t;
const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const AG_SPAN = 6;

type Ctx = CanvasRenderingContext2D;
const FONT = "system-ui, 'Segoe UI', Arial, sans-serif";
function tex(draw: (x: Ctx, w: number, h: number) => void, w: number, h: number, k = 2) {
  const c = document.createElement("canvas");
  c.width = w * k; c.height = h * k;
  const x = c.getContext("2d")!;
  x.scale(k, k);
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const rr = (x: Ctx, c: string, a: number, b: number, w: number, h: number, r: number) => { x.beginPath(); x.roundRect(a, b, w, h, r); x.fillStyle = c; x.fill(); };
const tx = (x: Ctx, s: string, a: number, b: number, size: number, c: string, wt = 600) => { x.font = `${wt} ${size}px ${FONT}`; x.fillStyle = c; x.fillText(s, a, b); };

// ── Screen artwork ───────────────────────────────────────
function wallpaper(x: Ctx, w: number, h: number) {
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#1a0608"); g.addColorStop(1, "#050505");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  rr(x, "rgba(20,20,20,.92)", 0, h - 44, w, 44, 0);
  ["#e50914", "#3a3a3a", "#3a3a3a", "#3a3a3a"].forEach((c, i) => rr(x, c, w / 2 - 70 + i * 36, h - 34, 26, 26, 6));
}
function windowChrome(x: Ctx, w: number, h: number, title: string, light: boolean) {
  rr(x, light ? "#f6f7f9" : "#141414", 0, 0, w, h, 18);
  rr(x, light ? "#ffffff" : "#1c1c1c", 0, 0, w, 46, 18);
  x.fillStyle = light ? "#ffffff" : "#1c1c1c"; x.fillRect(0, 30, w, 16);
  tx(x, title, 20, 30, 17, light ? "#1a1a1a" : "#ffffff", 700);
  ["—", "▢", "✕"].forEach((g, i) => tx(x, g, w - 110 + i * 36, 30, 15, light ? "#666" : "#999", 500));
}
function gameWindow(x: Ctx, w: number, h: number) {
  windowChrome(x, w, h, "Game launcher", false);
  rr(x, "#1c1c1c", 36, 80, 120, 120, 22); // app icon is painted here once it loads
  tx(x, "Game launcher update", 184, 120, 30, "#ffffff", 800);
  tx(x, "Downloading 2.1 GB in the background", 184, 156, 19, "#9a9a9a", 500);
  rr(x, "#2a2a2a", 36, 250, w - 72, 18, 9); // progress track (the fill is a separate mesh)
  tx(x, "Using your internet connection", 36, 310, 18, "#9a9a9a", 500);
}
function noInternet(x: Ctx, w: number) {
  rr(x, "rgba(10,10,10,.95)", 0, 0, w, 300, 16);
  x.strokeStyle = "#e50914"; x.lineWidth = 10; x.lineCap = "round";
  for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(w / 2, 150, 30 + i * 26, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); }
  x.beginPath(); x.arc(w / 2, 150, 7, 0, 7); x.fillStyle = "#e50914"; x.fill();
  x.beginPath(); x.moveTo(w / 2 - 70, 70); x.lineTo(w / 2 + 70, 175); x.stroke();
  x.textAlign = "center";
  tx(x, "No internet connection", w / 2, 230, 30, "#ffffff", 800);
  tx(x, "AppGate has switched off this app's internet", w / 2, 264, 18, "#b5b5b5", 500);
  x.textAlign = "start";
}
function browserWindow(x: Ctx, w: number, h: number) {
  windowChrome(x, w, h, "Browser", true);
  rr(x, "#eceef2", 18, 60, w - 36, 34, 17);
  tx(x, "example.com", 38, 83, 15, "#555", 500);
  rr(x, "#dfe3ea", 18, 110, w - 36, 120, 12);
  rr(x, "#dfe3ea", 18, 244, (w - 46) / 2, 80, 12); rr(x, "#dfe3ea", 28 + (w - 46) / 2, 244, (w - 46) / 2, 80, 12);
  rr(x, "#1f9d6b", w - 130, h - 52, 110, 34, 17);
  tx(x, "● Online", w - 112, h - 29, 16, "#ffffff", 700);
}
type Row = { name: string; file: string; on: boolean; tag?: string };
function appGateApps(rows: Row[], menu = false) {
  return (x: Ctx, w: number, h: number) => {
    rr(x, "#ffffff", 0, 0, w, h, 16);
    rr(x, "#f3f4f6", 0, 0, 200, h, 16); x.fillStyle = "#f3f4f6"; x.fillRect(180, 0, 20, h);
    rr(x, "#1d4ed8", 18, 20, 34, 34, 9); tx(x, "⛨", 26, 45, 20, "#ffffff", 800);
    tx(x, "AppGate", 62, 36, 17, "#111", 800); tx(x, "Per-app internet control", 62, 52, 10, "#666", 500);
    ["Home", "Apps", "Websites", "Activity", "Settings"].forEach((n, i) => {
      if (n === "Apps") rr(x, "#dbe5f6", 12, 76 + i * 38, 176, 32, 8);
      tx(x, n, 30, 97 + i * 38, 14, "#222", n === "Apps" ? 700 : 500);
    });
    tx(x, "Apps", 224, 50, 26, "#111", 800);
    tx(x, "Switch the internet off for any app.", 224, 74, 13, "#555", 500);
    rows.forEach((r, i) => {
      const y = 96 + i * 66;
      rr(x, "#ffffff", 220, y, w - 240, 56, 10);
      x.strokeStyle = "#e5e7eb"; x.lineWidth = 1; x.beginPath(); x.roundRect(220, y, w - 240, 56, 10); x.stroke();
      rr(x, "#eef0f3", 232, y + 10, 36, 36, 8);
      tx(x, r.name, 282, y + 26, 15, "#111", 700); tx(x, r.file, 282, y + 44, 11, "#777", 500);
      const st = r.on ? "Internet on" : r.tag ?? "Blocked";
      tx(x, st, w - 210, y + 33, 13, r.on ? "#1f7a4f" : r.tag ? "#b45309" : "#c81e1e", 700);
      rr(x, r.on ? "#1d4ed8" : "#c4c9d2", w - 84, y + 17, 46, 24, 12);
      x.beginPath(); x.arc(r.on ? w - 50 : w - 72, y + 29, 9, 0, 7); x.fillStyle = "#fff"; x.fill();
    });
    if (menu) {
      const y = 96 + 2 * 66 + 50;
      rr(x, "rgba(0,0,0,.12)", w - 262, y + 4, 230, 112, 12);
      rr(x, "#ffffff", w - 266, y, 230, 112, 12);
      ["Block everywhere", "Block on Wi-Fi only", "Allow"].forEach((o, i) => {
        if (i === 1) rr(x, "#dbe5f6", w - 260, y + 6 + i * 34, 218, 32, 8);
        tx(x, o, w - 246, y + 28 + i * 34, 14, "#111", i === 1 ? 700 : 500);
      });
    }
  };
}
const ROWS: Row[] = [
  { name: "Browser", file: "browser.exe", on: true },
  { name: "Game launcher", file: "launcher.exe", on: true },
  { name: "Chat", file: "chat.exe", on: true },
  { name: "Music", file: "music.exe", on: true },
];
function activity(x: Ctx, w: number, h: number) {
  rr(x, "#ffffff", 0, 0, w, h, 16);
  tx(x, "Activity", 32, 56, 28, "#111", 800);
  tx(x, "What AppGate did when you blocked Game launcher", 32, 84, 14, "#555", 500);
  ["Request checked: allowed caller, safe file path", "Firewall rule created for launcher.exe", "Rule read back from Windows Firewall", "Saved in the database", "Written to the activity log"].forEach((t, i) => {
    const y = 112 + i * 62;
    rr(x, "#f6f7f9", 28, y, w - 56, 50, 10);
    x.beginPath(); x.arc(56, y + 25, 13, 0, 7); x.fillStyle = "#1f9d6b"; x.fill();
    tx(x, "✓", 49, y + 31, 16, "#fff", 800);
    tx(x, t, 84, y + 31, 16, "#111", 600);
  });
}
function keyboardArt(x: Ctx, w: number, h: number) {
  x.fillStyle = "#16171a"; x.fillRect(0, 0, w, h);
  const rows = [
    ["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "⏻"],
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫"],
    ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "\'", "enter"],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
    ["ctrl", "fn", "⊞", "alt", "", "alt", "ctrl", "◀", "▲▼", "▶"],
  ];
  const gap = 7, top = 14, rh = (h - top * 2 - gap * 5) / 6;
  x.textAlign = "center";
  rows.forEach((keys, r) => {
    const weights = keys.map((k) => (k === "" ? 5.5 : k.length > 2 ? 1.6 : 1));
    const tot = weights.reduce((a, b) => a + b, 0);
    const unit = (w - 24 - gap * (keys.length - 1)) / tot;
    let cx = 12;
    keys.forEach((k, i) => {
      const kw = unit * weights[i], kh = r === 0 ? rh * 0.7 : rh, ky = top + r * (rh + gap) + (r === 0 ? rh * 0.3 : 0);
      rr(x, "#08090b", cx, ky, kw, kh, 6);
      rr(x, "#0d0e11", cx + 1.5, ky + 1.5, kw - 3, kh - 4, 5);
      if (k) tx(x, k, cx + kw / 2, ky + kh / 2 + (k.length > 2 ? 6 : 8), k.length > 2 ? 15 : 22, "#e8e9ec", 600);
      cx += kw + gap;
    });
  });
  x.textAlign = "start";
}
function speakerArt(x: Ctx, w: number, h: number) {
  x.fillStyle = "#16171a"; x.fillRect(0, 0, w, h);
  x.fillStyle = "#050506";
  for (let yy = 10; yy < h - 6; yy += 9) for (let xx = 8 + ((yy / 9) % 2) * 4; xx < w - 6; xx += 9) { x.beginPath(); x.arc(xx, yy, 2.2, 0, 7); x.fill(); }
}
function shadowArt(x: Ctx, w: number, h: number) {
  const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,0,0,.65)"); g.addColorStop(0.6, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
}
function cursorArt(x: Ctx) {
  x.beginPath(); x.moveTo(6, 4); x.lineTo(6, 52); x.lineTo(18, 41); x.lineTo(27, 60); x.lineTo(35, 56); x.lineTo(26, 38); x.lineTo(42, 38); x.closePath();
  x.fillStyle = "#ffffff"; x.fill(); x.lineWidth = 3; x.strokeStyle = "#111"; x.stroke();
}
function toastArt(x: Ctx, w: number, h: number) {
  rr(x, "#1f2937", 0, 0, w, h, 12);
  tx(x, "✓  Restored all AppGate blocks", 22, h / 2 + 7, 20, "#ffffff", 700);
}

export function initAppGateFilm(root: HTMLElement, homeShotUrl: string, gameIconUrl: string): () => void {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scroller = root.querySelector<HTMLElement>(".ag-scroller")!;
  const stage = root.querySelector<HTMLElement>(".ag-stage")!;
  const canvas = root.querySelector<HTMLCanvasElement>(".ag-gl")!;
  const scenes = [...root.querySelectorAll<HTMLElement>("[data-r]")].map((el) => ({ el, r: el.dataset.r!.split(",").map(Number) }));
  let sTarget = 0, sCur = 0, time = 0, raf = 0, last = performance.now();

  const dom = (s: number) => {
    for (const { el, r } of scenes) {
      const o = eOut(seg(s, r[0], r[1])) * (1 - eIn(seg(s, r[2], r[3])));
      el.style.setProperty("--o", o.toFixed(3));
      el.style.setProperty("--ty", ((1 - o) * 24).toFixed(1) + "px");
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    }
  };

  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    if (!renderer.capabilities.isWebGL2) throw new Error("no webgl2");
  } catch { renderer = null; root.classList.add("no-gl"); }

  let frame = () => dom(sCur);
  let onResize = () => {};
  const disposers: (() => void)[] = [];

  if (renderer) {
    const r = renderer;
    r.setPixelRatio(Math.min(Math.max(devicePixelRatio, 1.5), innerWidth < 760 ? 1.75 : 2));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.35, 9.2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a0000, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(3, 7, 6); scene.add(key);
    const rimL = new THREE.DirectionalLight(0xff9fa3, 0.6); rimL.position.set(-6, 2, -4); scene.add(rimL);
    // Soft studio reflections for the aluminium; built after its shaders compile off-thread (see the end).
    const pm = new THREE.PMREMGenerator(r);
    const room = new RoomEnvironment();
    scene.environmentIntensity = 0.75;

    // Laptop: a slim premium ultrabook (silver aluminium lid and base, black palm rest, edge-to-edge screen). No logo.
    const textures: THREE.Texture[] = [];
    const T = (d: (x: Ctx, w: number, h: number) => void, w: number, h: number) => { const t = tex(d, w, h); textures.push(t); return t; };
    const silver = new THREE.MeshStandardMaterial({ color: 0xc3c6cc, metalness: 0.85, roughness: 0.32 });
    const carbon = new THREE.MeshStandardMaterial({ color: 0x16171a, metalness: 0.15, roughness: 0.62 });
    const glassBlack = new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.3, roughness: 0.12 });
    const LW = 4.2, LD = 2.75, BH = 0.12;
    const SW = LW - 0.12, SH = SW / 1.6, CHIN = 0.12, TOPB = 0.05, LH = CHIN + SH + TOPB;
    const rig = new THREE.Group(); scene.add(rig);
    const laptop = new THREE.Group(); laptop.position.y = -1.35; rig.add(laptop);
    // base: silver shell + black deck with keyboard, speakers and a glass trackpad
    laptop.add(new THREE.Mesh(new RoundedBoxGeometry(LW, BH, LD, 5, 0.05), silver));
    const deckY = BH / 2 + 0.002;
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.08, LD - 0.08), carbon);
    deck.rotation.x = -Math.PI / 2; deck.position.y = deckY; laptop.add(deck);
    const kb = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.74, LD * 0.4), new THREE.MeshStandardMaterial({ map: T(keyboardArt, 1100, 400), roughness: 0.55, metalness: 0.1 }));
    kb.rotation.x = -Math.PI / 2; kb.position.set(0, deckY + 0.001, -LD * 0.16); laptop.add(kb);
    const grill = T(speakerArt, 60, 400);
    [-1, 1].forEach((side) => {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.07, LD * 0.4), new THREE.MeshStandardMaterial({ map: grill, roughness: 0.7, metalness: 0.1 }));
      g.rotation.x = -Math.PI / 2; g.position.set(side * LW * 0.43, deckY + 0.001, -LD * 0.16); laptop.add(g);
    });
    const pad = new THREE.Mesh(new RoundedBoxGeometry(LW * 0.34, 0.006, LD * 0.3, 3, 0.003), new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: 0.25, metalness: 0.2 }));
    pad.position.set(0, deckY + 0.003, LD * 0.24); laptop.add(pad);
    // hinge + lid (opened about 105 degrees)
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, LW * 0.86, 20), carbon);
    hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH / 2, -LD / 2 + 0.05); laptop.add(hinge);
    const lid = new THREE.Group(); lid.position.set(0, BH / 2, -LD / 2 + 0.05); lid.rotation.x = -0.26; laptop.add(lid);
    const lidBody = new THREE.Mesh(new RoundedBoxGeometry(LW, LH, 0.05, 5, 0.022), silver); lidBody.position.y = LH / 2; lid.add(lidBody);
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.03, LH - 0.03), glassBlack);
    bezel.position.set(0, LH / 2, 0.0255); lid.add(bezel);
    const SY = CHIN + SH / 2, Z = 0.027;
    // soft contact shadow
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(LW * 1.5, LD * 1.6), new THREE.MeshBasicMaterial({ map: T(shadowArt, 256, 256), transparent: true, depthWrite: false, toneMapped: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -BH / 2 - 0.01; laptop.add(shadow);
    const plane = (t: THREE.Texture | null, w: number, h: number, z: number, transparent = true) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent, opacity: 1, depthWrite: false }));
      m.position.set(0, SY, Z + z); m.renderOrder = Math.round(z * 1000); lid.add(m); return m;
    };
    /** place in screen space: u,v in [-0.5, 0.5] across the screen */
    const put = (m: THREE.Object3D, u: number, v: number) => m.position.set(u * SW, SY + v * SH, m.position.z);

    plane(T(wallpaper, 1024, 640), SW, SH, 0, false);
    const gw = SW * 0.62, gh = gw / 2;
    const gameTex = T(gameWindow, 720, 360);
    const game = plane(gameTex, gw, gh, 0.004);
    const icon = new Image();
    icon.onload = () => {
      // the canvas context is already scaled to the 720x360 design size
      (gameTex.image as HTMLCanvasElement).getContext("2d")!.drawImage(icon, 36, 80, 120, 120);
      gameTex.needsUpdate = true;
    };
    icon.src = gameIconUrl;
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xe50914, toneMapped: false, transparent: true, depthWrite: false }));
    bar.renderOrder = 6; lid.add(bar);
    const noNet = plane(T((x, w) => noInternet(x, w), 560, 300), SW * 0.44, SW * 0.44 * 300 / 560, 0.008);
    const browser = plane(T(browserWindow, 520, 400), SW * 0.36, SW * 0.36 * 400 / 520, 0.006);
    const off = (i: number, extra?: Partial<Row>) => ROWS.map((row, j) => (j === i ? { ...row, on: false, ...extra } : row));
    const agTex = [
      T(appGateApps(ROWS), 900, 420),
      T(appGateApps(off(1)), 900, 420),
      T(appGateApps(off(1), true), 900, 420),
      T(appGateApps(off(1).map((row, j) => (j === 2 ? { ...row, on: false, tag: "Wi-Fi blocked" } : row))), 900, 420),
    ];
    const agW = SW * 0.9, agH = agW * 420 / 900;
    const ag = plane(agTex[0], agW, agH, 0.004);
    const act = plane(T(activity, 760, 430), SW * 0.8, SW * 0.8 * 430 / 760, 0.004);
    const homeTex = new THREE.TextureLoader().load(homeShotUrl); homeTex.colorSpace = THREE.SRGBColorSpace; homeTex.anisotropy = 8; textures.push(homeTex);
    const hw = SW * 0.94, hh = hw * 636 / 1226;
    const home = plane(homeTex, hw, hh, 0.004);
    const toast = plane(T(toastArt, 420, 64), SW * 0.38, SW * 0.38 * 64 / 420, 0.01);
    const cursor = plane(T((x) => cursorArt(x), 48, 64), 0.16, 0.16 * 64 / 48, 0.02);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.085, 32), new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    ring.renderOrder = 30; lid.add(ring);

    const fade = (m: THREE.Mesh, o: number) => { (m.material as THREE.MeshBasicMaterial).opacity = o; m.visible = o > 0.01; };
    /** scene window opacity: fades in over [a, a+.15], out over [b-.15, b] */
    const win = (s: number, a: number, b: number) => eOut(seg(s, a, a + 0.15)) * (1 - eIn(seg(s, b - 0.15, b)));
    const click = (t: number) => (t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0);
    // pixel on a texture (centred at screen origin) -> screen u,v
    const at = (px: number, py: number, tw: number, th: number, w: number, h: number) => [(px / tw - 0.5) * w / SW, (0.5 - py / th) * h / SH] as const;
    const toggleGame = at(900 - 61, 96 + 66 + 29, 900, 420, agW, agH);
    const toggleChat = at(900 - 61, 96 + 2 * 66 + 29, 900, 420, agW, agH);
    const menuWifi = at(900 - 150, 96 + 2 * 66 + 50 + 57, 900, 420, agW, agH);
    const restoreBtn = at(1062, 515, 1226, 636, hw, hh);

    let Wpx = 1, Hpx = 1;
    onResize = () => {
      Wpx = stage.clientWidth; Hpx = stage.clientHeight;
      r.setSize(Wpx, Hpx, false); camera.aspect = Wpx / Hpx; camera.updateProjectionMatrix();
      const ph = Wpx < 760;
      rig.position.set(ph ? 0.08 : 2.0, ph ? 1.6 : 0.5, 0);
      rig.scale.setScalar(ph ? 0.43 : 1.3);
    };
    onResize();

    frame = () => {
      const s = sCur;
      dom(s);
      rig.rotation.y = -0.2 + Math.sin(time * 0.3) * 0.02 + eIO(seg(s, 0, 6)) * 0.06;
      rig.rotation.x = 0.1 + Math.sin(time * 0.4) * 0.008;

      // Scene 0 (problem) and 2 (result): the game window with its progress bar
      const o0 = win(s, -1, 1), o2 = win(s, 2, 3), oG = Math.max(o0, o2);
      fade(game, oG); put(game, o2 > 0.01 ? -0.16 : 0, 0.04);
      const prog = o2 > 0.01 ? 0.58 : 0.12 + ((time * 0.08) % 0.86);
      fade(bar, oG);
      const bw = gw * (648 / 720) * prog;
      bar.scale.set(Math.max(bw, 0.001), gh * (18 / 360), 1);
      bar.position.set(game.position.x - gw * (324 / 720) + bw / 2, game.position.y + gh * (0.5 - 259 / 360), Z + 0.005);
      (bar.material as THREE.MeshBasicMaterial).color.set(o2 > 0.01 ? 0x555555 : 0xe50914);

      // Scenes 1 and 3: AppGate Apps page
      const o1 = win(s, 1, 2), o3 = win(s, 3, 4);
      fade(ag, Math.max(o1, o3)); put(ag, 0, 0);
      const m = ag.material as THREE.MeshBasicMaterial;
      m.map = o3 > 0.01
        ? (s > 3.72 ? agTex[3] : s > 3.42 ? agTex[2] : agTex[1])
        : (s > 1.62 ? agTex[1] : agTex[0]);

      // Scene 2: "No internet" on the game, browser still online
      fade(noNet, o2); put(noNet, -0.16, 0.02);
      fade(browser, o2); put(browser, 0.27, -0.06);

      // Scene 4: activity, every check passed
      fade(act, win(s, 4, 5)); put(act, 0, 0);

      // Scene 5: the real AppGate Home screen, "Restore all" is clicked
      const o5 = win(s, 5, 7); fade(home, o5); put(home, 0, 0.01);
      fade(toast, o5 * eOut(seg(s, 5.55, 5.7))); put(toast, 0, -0.38);

      // Cursor: one path per scene that has a click
      let cu = 0.2, cv = -0.2, co = 0, ck = 0;
      if (o1 > 0.01) {
        const t = eIO(seg(s, 1.05, 1.45)); cu = lerp(0.1, toggleGame[0], t); cv = lerp(-0.25, toggleGame[1], t); co = o1; ck = click(seg(s, 1.5, 1.7));
      } else if (o3 > 0.01) {
        const t1 = eIO(seg(s, 3.05, 3.28)), t2 = eIO(seg(s, 3.45, 3.6));
        cu = lerp(lerp(0.1, toggleChat[0], t1), menuWifi[0], t2); cv = lerp(lerp(-0.25, toggleChat[1], t1), menuWifi[1], t2); co = o3;
        ck = Math.max(click(seg(s, 3.3, 3.45)), click(seg(s, 3.6, 3.75)));
      } else if (o5 > 0.01) {
        const t = eIO(seg(s, 5.05, 5.38)); cu = lerp(0, restoreBtn[0], t); cv = lerp(-0.1, restoreBtn[1], t); co = o5; ck = click(seg(s, 5.4, 5.55));
      }
      fade(cursor, co); cursor.position.set(cu * SW + 0.05, SY + cv * SH - 0.07, Z + 0.02);
      ring.position.set(cu * SW, SY + cv * SH, Z + 0.021);
      const ro = ck * co; (ring.material as THREE.MeshBasicMaterial).opacity = ro; ring.visible = ro > 0.01; ring.scale.setScalar(1 + ck * 0.8);

      if (glReady) r.render(scene, camera);
    };

    let glReady = false;
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity .6s ease";
    const envCam = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(16));
    r.compileAsync(room, envCam.children[0] as THREE.Camera).catch(() => {})
      .then(() => { scene.environment = pm.fromScene(room, 0.04).texture; envCam.renderTarget.dispose(); })
      .then(() => r.compileAsync(scene, camera)).catch(() => {})
      .finally(() => { glReady = true; canvas.style.opacity = "1"; });

    disposers.push(() => {
      scene.traverse((o) => {
        const mm = o as THREE.Mesh;
        mm.geometry?.dispose?.();
        const mat = mm.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      textures.forEach((t) => t.dispose());
      pm.dispose(); r.dispose();
    });
  }

  const readScroll = () => {
    const rect = scroller.getBoundingClientRect();
    sTarget = clamp(-rect.top / Math.max(1, rect.height - innerHeight)) * AG_SPAN;
    return rect.bottom > 0 && rect.top < innerHeight;
  };
  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const vis = readScroll();
    sCur += (sTarget - sCur) * (1 - Math.exp(-dt * 7));
    if (RM) sCur = sTarget; else time += dt;
    if (vis && !document.hidden) frame();
    raf = requestAnimationFrame(tick);
  };
  readScroll(); sCur = sTarget; frame();
  raf = requestAnimationFrame(tick);
  addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", onResize);
    disposers.forEach((d) => d());
  };
}
