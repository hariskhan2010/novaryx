"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Tone = { name: string; tint: string; valley: string; altitude: number; kind?: string };
type Plane = { n: THREE.Vector3; d: number };
const V3 = THREE.Vector3;

// ── Cut geometry: a convex stone = the intersection of its facet planes (deep-ui-reel-pro stone renderer) ──
function buildCut(planes: Plane[]) {
  const E = 1e-6, S = 4;
  const cv = [[-S, -S, -S], [S, -S, -S], [S, S, -S], [-S, S, -S], [-S, -S, S], [S, -S, S], [S, S, S], [-S, S, S]].map((a) => new V3(a[0], a[1], a[2]));
  let F = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]].map((f) => ({ p: f.map((i) => cv[i].clone()), k: -1 }));
  const U = (p: THREE.Vector3[]) => { const o: THREE.Vector3[] = []; for (const a of p) if (!o.some((q) => q.distanceToSquared(a) < 1e-12)) o.push(a); return o; };
  planes.forEach(({ n, d }, pi) => {
    const nx: { p: THREE.Vector3[]; k: number }[] = [], cap: THREE.Vector3[] = [];
    for (const f of F) {
      const out: THREE.Vector3[] = [], P = f.p;
      for (let i = 0; i < P.length; i++) {
        const a = P[i], b = P[(i + 1) % P.length], da = n.dot(a) - d, db = n.dot(b) - d;
        if (da <= E) { out.push(a); if (da >= -E) cap.push(a); }
        if ((da < -E && db > E) || (da > E && db < -E)) { const q = a.clone().lerp(b, da / (da - db)); out.push(q); cap.push(q); }
      }
      const o = U(out); if (o.length >= 3) nx.push({ p: o, k: f.k });
    }
    const c = U(cap);
    if (c.length >= 3) {
      const ct = c.reduce((s, p) => s.add(p), new V3()).divideScalar(c.length);
      const u = new V3().crossVectors(n, Math.abs(n.y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0)).normalize(), v = new V3().crossVectors(n, u);
      const ang = (p: THREE.Vector3) => Math.atan2(v.dot(p.clone().sub(ct)), u.dot(p.clone().sub(ct)));
      c.sort((a, b) => ang(a) - ang(b)); nx.push({ p: c, k: pi });
    }
    F = nx;
  });
  const pos: number[] = [], nor: number[] = [], kept: Plane[] = [], m = new Map<number, number>();
  for (const f of F) {
    if (f.k < 0) continue;
    const P = f.p, n = planes[f.k].n;
    let ar = 0;
    for (let i = 1; i < P.length - 1; i++) ar += new V3().subVectors(P[i], P[0]).cross(new V3().subVectors(P[i + 1], P[0])).length() / 2;
    if (ar < 1e-7) continue;
    if (!m.has(f.k)) { m.set(f.k, 1); kept.push(planes[f.k]); }
    for (let i = 1; i < P.length - 1; i++) {
      const a = P[0]; let b = P[i], c = P[i + 1];
      if (new V3().subVectors(b, a).cross(new V3().subVectors(c, a)).dot(n) < 0) [b, c] = [c, b];
      for (const q of [a, b, c]) { pos.push(q.x, q.y, q.z); nor.push(n.x, n.y, n.z); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return { geo: g, planes: Array.from({ length: 80 }, (_, i) => (kept[i] ? new THREE.Vector4(kept[i].n.x, kept[i].n.y, kept[i].n.z, kept[i].d) : new THREE.Vector4())), count: kept.length };
}

const D2R = Math.PI / 180, GT = 0.035, GB = -0.035;
const polar = (a: number, f: number, up: number) => new V3(Math.sin(a) * Math.cos(f), up * Math.cos(a), Math.sin(a) * Math.sin(f));
const through = (n: THREE.Vector3, p: THREE.Vector3): Plane => ({ n: n.normalize(), d: n.dot(p) });
function brilliantPlanes(): Plane[] {
  const P: Plane[] = [], tA = 0.53, cA = 34.5 * D2R, pA = 40.8 * D2R, top = GT + (1 - tA / Math.cos(Math.PI / 8)) * Math.tan(cA);
  P.push(through(new V3(0, 1, 0), new V3(0, top, 0)));
  for (let k = 0; k < 8; k++) {
    const f = (k * Math.PI) / 4, s = f + Math.PI / 8;
    P.push(through(polar(cA, f, 1), new V3(Math.cos(f), GT, Math.sin(f))), through(polar(21.5 * D2R, s, 1), new V3(tA * Math.cos(s), top, tA * Math.sin(s))), through(polar(pA, f, -1), new V3(Math.cos(f), GB, Math.sin(f))));
  }
  for (let j = 0; j < 16; j++) { const f = ((j + 0.5) * Math.PI) / 8; P.push(through(polar(42 * D2R, f, 1), new V3(Math.cos(f), GT, Math.sin(f))), through(polar(43 * D2R, f, -1), new V3(Math.cos(f), GB, Math.sin(f)))); }
  for (let j = 0; j < 16; j++) { const f = (j * Math.PI) / 8, n = new V3(Math.cos(f), 0, Math.sin(f)); P.push(through(n, n.clone())); }
  return P;
}
const stretch = (P: Plane[], sx: number, sy: number, sz: number) =>
  P.map(({ n, d }) => { const m = new V3(n.x / sx, n.y / sy, n.z / sz), l = m.length(); return { n: m.divideScalar(l), d: d / l }; });

// ── Optics: absorption (sigma) from the stone's colour, refractive index and dispersion per species ──
const IOR: Record<string, [number, number]> = {
  Emerald: [1.58, 0.009], Ruby: [1.766, 0.012], Spinel: [1.718, 0.011], Topaz: [1.62, 0.009],
  Peridot: [1.67, 0.012], Aquamarine: [1.577, 0.008], Tourmaline: [1.63, 0.01],
};
// Measured-looking absorption per species (r,g,b per unit length); lower = lighter stone.
const SIGMA: Record<string, [number, number, number]> = {
  Emerald: [4.4, 0.32, 2], Ruby: [0.38, 6.5, 4.6], Spinel: [0.3, 4.2, 1.6], Topaz: [0.12, 0.85, 0.55],
  Peridot: [1.5, 0.22, 3.2], Aquamarine: [1.1, 0.28, 0.2], Tourmaline: [3.2, 0.45, 2.4],
};
const sigmaOf = (hex: string) => {
  const c = new THREE.Color(hex); // stored as linear values
  const s = [c.r, c.g, c.b].map((x) => Math.min(7, -Math.log(Math.max(0.02, x)) * 1.1));
  return new V3(s[0], s[1], s[2]);
};

const vert = /* glsl */ `
varying vec3 vObj, vCam, vN; varying mat3 vRot;
void main(){ vec4 w = modelMatrix * vec4(position,1.); vObj = position; vN = normal;
  vCam = (inverse(modelMatrix) * vec4(cameraPosition,1.)).xyz; vRot = mat3(modelMatrix);
  gl_Position = projectionMatrix * viewMatrix * w; }`;
const frag = /* glsl */ `
#define MAXP 80
uniform vec4 uPlanes[MAXP]; uniform int uCount, uBounces; uniform samplerCube envMap;
uniform float uIor, uDisp, uExposure; uniform vec3 uSigma;
varying vec3 vObj, vCam, vN; varying mat3 vRot;
vec3 envW(vec3 d){ return textureCube(envMap, normalize(vRot*d)).rgb; }
float sch(float c,float f){ return f+(1.-f)*pow(1.-c,5.); }
void main(){
  vec3 rd = normalize(vObj - vCam), N = normalize(vN);
  float f0 = pow((uIor-1.)/(uIor+1.),2.), Fr = sch(clamp(-dot(rd,N),0.,1.), f0);
  vec3 col = Fr*envW(reflect(rd,N)), T = refract(rd,N,1./uIor), p = vObj, thr = vec3(1.-Fr);
  for(int b=0;b<6;b++){ if(b>=uBounces) break; float tm = 1e9; vec3 ne = vec3(0,1,0);
    for(int i=0;i<MAXP;i++){ if(i>=uCount) break; vec4 pl = uPlanes[i]; float den = dot(pl.xyz,T);
      if(den>1e-5){ float t = (pl.w - dot(pl.xyz,p))/den; if(t>1e-4 && t<tm){ tm = t; ne = pl.xyz; } } }
    if(tm>1e8) break; p += T*tm; thr *= exp(-uSigma*tm);
    vec3 tg = refract(T,-ne,uIor); if(dot(tg,tg)<1e-6){ T = reflect(T,ne); continue; }
    vec3 tr = refract(T,-ne,uIor-uDisp); if(dot(tr,tr)<1e-6) tr = tg;
    vec3 tb = refract(T,-ne,uIor+uDisp); if(dot(tb,tb)<1e-6) tb = tg;
    float Fe = sch(clamp(dot(tg,ne),0.,1.), f0);
    col += thr*(1.-Fe)*vec3(envW(tr).r, envW(tg).g, envW(tb).b); thr *= Fe; T = reflect(T,ne); }
  col += thr*envW(T)*.6;
  gl_FragColor = vec4(col*uExposure, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Jeweller's light box for the stone to refract: dark gradient room, emissive softboxes, pin lights for sparkle. */
function studioScene() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(vec3(.02,.024,.032), vec3(.16,.17,.2), smoothstep(-.4,.9,h)),1.); }",
  })));
  const box = (w: number, h: number, pos: [number, number, number], k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  box(10, 4, [0, 9, 3], 6);
  box(3, 10, [-10, 2, 2], 4.5);
  box(3, 10, [10, 1, -3], 3);
  box(8, 2, [0, -8, 6], 2);
  for (const [x, y, z] of [[4, 6, 8], [-6, 4, 7], [7, -2, 6], [-3, 8, -6], [2, 3, -9]]) {
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(14) }));
    pin.position.set(x, y, z); s.add(pin);
  }
  return s;
}

/** Home hero: a ray-traced cut gem refracting a light box, drifting through the colour of each stone. */
export function GemHero({ tones, onTone }: { tones: Tone[]; onTone?: (i: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const toneCb = useRef(onTone);
  useEffect(() => { toneCb.current = onTone; }, [onTone]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = innerWidth < 760;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      if (!renderer.capabilities.isWebGL2) throw new Error("webgl2");
    } catch {
      el.dataset.fallback = "1";
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const cubeRT = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType, generateMipmaps: false });
    new THREE.CubeCamera(0.1, 100, cubeRT).update(renderer, studioScene());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.1, 7.2);
    camera.lookAt(0, -0.05, 0);

    const cut = buildCut(stretch(brilliantPlanes(), 1.32, 1, 1)); // oval brilliant
    const optics = tones.map((t) => ({ sigma: SIGMA[t.kind ?? ""] ? new V3(...SIGMA[t.kind!]) : sigmaOf(t.tint), ior: IOR[t.kind ?? "Emerald"] ?? IOR.Emerald }));
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, precision: "highp",
      uniforms: {
        uPlanes: { value: cut.planes }, uCount: { value: cut.count }, uBounces: { value: phone ? 4 : 5 },
        envMap: { value: cubeRT.texture }, uIor: { value: optics[0].ior[0] }, uDisp: { value: optics[0].ior[1] },
        uExposure: { value: 1.6 }, uSigma: { value: optics[0].sigma.clone() },
      },
    });
    const gem = new THREE.Mesh(cut.geo, mat);
    gem.scale.setScalar(1.18);
    scene.add(gem);

    const size = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const target = { mx: 0, my: 0 }, cur = { mx: 0, my: 0, spin: 0.6 };
    const onMove = (e: PointerEvent) => { target.mx = (e.clientX / innerWidth - 0.5) * 2; target.my = (e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("pointermove", onMove, { passive: true });

    let idx = 0, since = 0, raf = 0, visible = true;
    const HOLD = 4.5;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const clock = new THREE.Clock();
    const u = mat.uniforms;

    const draw = () => {
      gem.rotation.set(-0.55 + cur.my * 0.12, cur.spin + cur.mx * 0.4, 0.08);
      renderer.render(scene, camera);
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      const k = (e: number) => 1 - Math.pow(1 - e, dt * 60);
      since += dt;
      if (since > HOLD) { since = 0; idx = (idx + 1) % optics.length; toneCb.current?.(idx); }
      const o = optics[idx];
      (u.uSigma.value as THREE.Vector3).lerp(o.sigma, k(0.035));
      u.uIor.value += (o.ior[0] - u.uIor.value) * k(0.035);
      u.uDisp.value += (o.ior[1] - u.uDisp.value) * k(0.035);
      cur.mx += (target.mx - cur.mx) * k(0.06);
      cur.my += (target.my - cur.my) * k(0.06);
      cur.spin += dt * 0.28;
      gem.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.04 - Math.min(scrollY / innerHeight, 1) * 0.5;
      draw();
    };
    if (reduced) draw(); else frame();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      ro.disconnect(); io.disconnect();
      cut.geo.dispose(); mat.dispose(); cubeRT.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [tones]);

  return <div ref={host} className="vl-gem" aria-hidden="true" />;
}
