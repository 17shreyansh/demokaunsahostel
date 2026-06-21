import React, { memo } from 'react';

/* ============================================================================ */
/* ISOMETRIC HELPERS                                                            */
/* ============================================================================ */

const isoRight = (x, y, w, h) =>
  `M ${x},${y} L ${x + w},${y - w * 0.5} L ${x + w},${y - w * 0.5 - h} L ${x},${y - h} Z`;

const isoLeft = (x, y, d, h) =>
  `M ${x},${y} L ${x - d},${y - d * 0.5} L ${x - d},${y - d * 0.5 - h} L ${x},${y - h} Z`;

const isoTop = (x, y, w, d, h) =>
  `M ${x},${y - h} L ${x + w},${y - w * 0.5 - h} L ${x + w - d},${y - w * 0.5 - d * 0.5 - h} L ${x - d},${y - d * 0.5 - h} Z`;

const rightWin = (bx, by, w, h, u, v, sw, sh) => {
  const x1 = bx + u * w, y1 = by - u * w / 2 - v * h;
  const x2 = bx + (u + sw) * w, y2 = by - (u + sw) * w / 2 - v * h;
  const x3 = bx + (u + sw) * w, y3 = by - (u + sw) * w / 2 - (v + sh) * h;
  const x4 = bx + u * w, y4 = by - u * w / 2 - (v + sh) * h;
  return `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`;
};

const leftWin = (bx, by, d, h, u, v, sw, sh) => {
  const x1 = bx - u * d, y1 = by - u * d / 2 - v * h;
  const x2 = bx - (u + sw) * d, y2 = by - (u + sw) * d / 2 - v * h;
  const x3 = bx - (u + sw) * d, y3 = by - (u + sw) * d / 2 - (v + sh) * h;
  const x4 = bx - u * d, y4 = by - u * d / 2 - (v + sh) * h;
  return `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`;
};

/* ============================================================================ */
/* STATIC DATA (Moved outside to prevent re-allocation)                         */
/* ============================================================================ */

const BUILDINGS = {
  hostel: { x: 420, y: 400, w: 52, d: 40, h: 88 },
  college: { x: 215, y: 335, w: 62, d: 46, h: 68 },
  cafe: { x: 548, y: 372, w: 26, d: 20, h: 36 },
  gym: { x: 618, y: 438, w: 38, d: 30, h: 50 },
  metro: { x: 275, y: 470, w: 55, d: 24, h: 22 },
  library: { x: 498, y: 288, w: 30, d: 26, h: 54 },
};

const TREES_BACK = [
  { x: 305, y: 370, scale: 0.9 },
  { x: 350, y: 348, scale: 1 },
  { x: 255, y: 395, scale: 0.8 },
];

const TREES_FRONT = [
  { x: 478, y: 355, scale: 1 },
  { x: 565, y: 408, scale: 0.85 },
  { x: 378, y: 445, scale: 0.75 },
  { x: 555, y: 305, scale: 0.9 },
];

/* ============================================================================ */
/* REUSABLE UI COMPONENTS                                                       */
/* ============================================================================ */

const Tree = memo(({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x={-1.5} y={-11} width={3} height={11} rx={1} fill="#a89070" />
    <ellipse cx={0} cy={-18} rx={9} ry={13} fill="#8aaa72" />
    <ellipse cx={-2} cy={-21} rx={5} ry={7} fill="#a2c28a" opacity={0.5} />
  </g>
));
Tree.displayName = 'Tree';

const BuildingPin = memo(({ cx, cy, icon, delayClass, r = 9, dotR = 3, fontSize = 3.5, yOffset = 2.5 }) => (
  <g className={`hero-building-pin ${delayClass}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
    <circle cx={cx} cy={cy} r={r} fill="url(#hm-pin-radial)" />
    <circle cx={cx} cy={cy} r={dotR} fill="#e8b84a" />
    <text x={cx} y={cy + yOffset} textAnchor="middle" fill="#fff" fontSize={fontSize} fontWeight={700}>
      {icon}
    </text>
  </g>
));
BuildingPin.displayName = 'BuildingPin';

const BuildingLabel = memo(({ x, y, text, fill = "#8a8070", fontSize = 7 }) => (
  <text x={x} y={y} textAnchor="middle" fill={fill} fontSize={fontSize} fontWeight={600} fontFamily="Inter, sans-serif" letterSpacing="0.06em">
    {text}
  </text>
));
BuildingLabel.displayName = 'BuildingLabel';

/* ============================================================================ */
/* INDIVIDUAL BUILDINGS                                                         */
/* ============================================================================ */

const College = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.college;
  return (
    <g>
      <ellipse cx={x + 5} cy={y + 6} rx={45} ry={10} fill="#00000006" />
      <path d={isoLeft(x, y, d, h)} fill="#d4c4a5" />
      <path d={isoRight(x, y, w, h)} fill="#e6dac8" />
      <path d={isoTop(x, y, w, d, h)} fill="#f0e8d8" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#c8b898" strokeWidth={0.5} />
      <path d={isoLeft(x, y, d, h)} fill="none" stroke="#c0b090" strokeWidth={0.5} />

      {[0.15, 0.40, 0.65].map(u => [0.25, 0.55].map(v => (
        <path key={`cw-${u}-${v}`} d={rightWin(x, y, w, h, u, v, 0.18, 0.15)} fill="#fff8e8" stroke="#ddd0b8" strokeWidth={0.3} />
      )))}

      {[0.2, 0.55].map(u => [0.25, 0.55].map(v => (
        <path key={`clw-${u}-${v}`} d={leftWin(x, y, d, h, u, v, 0.25, 0.15)} fill="#fff8e8" stroke="#d8c8a8" strokeWidth={0.3} />
      )))}

      {[0.25, 0.5, 0.75].map(u => (
        <line key={`col-${u}`} x1={x + u * w} y1={y - u * w / 2} x2={x + u * w} y2={y - u * w / 2 - h * 0.18} stroke="#ccc0a8" strokeWidth={1.5} />
      ))}

      <path d={rightWin(x, y, w, h, 0.35, 0.02, 0.30, 0.18)} fill="#c8b898" stroke="#b8a880" strokeWidth={0.3} />
      <line x1={x - d * 0.3} y1={y - d * 0.3 * 0.5 - h} x2={x - d * 0.3} y2={y - d * 0.3 * 0.5 - h - 14} stroke="#b0a088" strokeWidth={0.8} />
      <rect x={x - d * 0.3} y={y - d * 0.3 * 0.5 - h - 14} width={8} height={5} rx={0.5} fill="#e8b84a" opacity={0.8} />

      <BuildingLabel x={x + 5} y={y + 22} text="COLLEGE" fontSize={8} letterSpacing="0.08em" />
      <BuildingPin cx={x} cy={y - h - 18} icon="🏫" delayClass="hero-building-pin-2" r={10} dotR={3.5} fontSize={4} yOffset={1.5} />
    </g>
  );
});
College.displayName = 'College';

const HostelHero = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.hostel;
  return (
    <g>
      <circle cx={x} cy={y - h * 0.5} r={65} className="hero-hostel-glow" fill="url(#hm-hostel-glow)" />
      <ellipse cx={x + 3} cy={y + 6} rx={40} ry={10} fill="#0000000a" />
      <path d={isoLeft(x, y, d, h)} fill="#dcc8a0" />
      <path d={isoRight(x, y, w, h)} fill="#f0dfbf" />
      <path d={isoTop(x, y, w, d, h)} fill="#f8f0e0" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#d4b888" strokeWidth={0.5} />
      <path d={isoLeft(x, y, d, h)} fill="none" stroke="#c8b080" strokeWidth={0.5} />
      <path d={rightWin(x, y, w, h, 0, 0, 1, 0.04)} fill="#e8b84a" opacity={0.7} />
      <path d={leftWin(x, y, d, h, 0, 0, 1, 0.04)} fill="#d4a838" opacity={0.6} />

      {[0.12, 0.42, 0.72].map(u => [0.18, 0.45, 0.72].map(v => (
        <path key={`hw-${u}-${v}`} d={rightWin(x, y, w, h, u, v, 0.16, 0.12)} fill="#fff4d8" stroke="#e8d8b4" strokeWidth={0.3} />
      )))}

      {[0.15, 0.55].map(u => [0.18, 0.45, 0.72].map(v => (
        <path key={`hlw-${u}-${v}`} d={leftWin(x, y, d, h, u, v, 0.28, 0.12)} fill="#fff4d8" stroke="#dcc8a0" strokeWidth={0.3} />
      )))}

      <path d={rightWin(x, y, w, h, 0.35, 0.06, 0.28, 0.12)} fill="#d4a838" stroke="#c89828" strokeWidth={0.3} />
      <path d={isoTop(x, y, w * 0.5, d * 0.5, h + 6)} fill="#e8d0a8" opacity={0.5} />

      <BuildingLabel x={x + 5} y={y + 22} text="HOSTEL" fill="#a08050" fontSize={9} letterSpacing="0.1em" />
      <BuildingPin cx={x} cy={y - h - 20} icon="🏠" delayClass="" r={12} dotR={4.5} fontSize={5} yOffset={1.5} />
    </g>
  );
});
HostelHero.displayName = 'HostelHero';

const Cafe = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.cafe;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + 4} rx={22} ry={6} fill="#00000005" />
      <path d={isoLeft(x, y, d, h)} fill="#c89878" />
      <path d={isoRight(x, y, w, h)} fill="#dbb098" />
      <path d={isoTop(x, y, w, d, h)} fill="#ecc8b0" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#c09070" strokeWidth={0.4} />
      <path d={`M ${x},${y - h * 0.55} L ${x + w + 4},${y - w * 0.5 - h * 0.55 - 2} L ${x + w + 4},${y - w * 0.5 - h * 0.4} L ${x},${y - h * 0.4} Z`} fill="#e8a878" opacity={0.7} />
      <path d={rightWin(x, y, w, h, 0.2, 0.6, 0.55, 0.2)} fill="#fff8e8" stroke="#d8b898" strokeWidth={0.3} />
      <path d={rightWin(x, y, w, h, 0.3, 0.05, 0.4, 0.28)} fill="#b88868" stroke="#a07858" strokeWidth={0.3} />

      <BuildingLabel x={x + 3} y={y + 18} text="CAFÉ" fill="#a08870" />
      <BuildingPin cx={x} cy={y - h - 14} icon="☕" delayClass="hero-building-pin-3" />
    </g>
  );
});
Cafe.displayName = 'Cafe';

const Gym = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.gym;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + 5} rx={30} ry={8} fill="#00000005" />
      <path d={isoLeft(x, y, d, h)} fill="#bfb8ac" />
      <path d={isoRight(x, y, w, h)} fill="#d0c8bc" />
      <path d={isoTop(x, y, w, d, h)} fill="#ddd6cc" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#b0a898" strokeWidth={0.4} />

      {[0.15, 0.5].map(u => [0.35, 0.65].map(v => (
        <path key={`gw-${u}-${v}`} d={rightWin(x, y, w, h, u, v, 0.22, 0.15)} fill="#f0ece4" stroke="#c8c0b4" strokeWidth={0.3} />
      )))}

      <path d={rightWin(x, y, w, h, 0, 0.88, 1, 0.06)} fill="#b8a888" opacity={0.5} />

      <BuildingLabel x={x + 2} y={y + 20} text="GYM" />
      <BuildingPin cx={x} cy={y - h - 14} icon="🏋" delayClass="hero-building-pin-4" />
    </g>
  );
});
Gym.displayName = 'Gym';

const Metro = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.metro;
  return (
    <g>
      <ellipse cx={x + 5} cy={y + 5} rx={35} ry={8} fill="#00000005" />
      <path d={isoLeft(x, y, d, h)} fill="#b5b0a5" />
      <path d={isoRight(x, y, w, h)} fill="#c8c4b8" />
      <path d={isoTop(x, y, w, d, h)} fill="#d4d0c4" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#a8a498" strokeWidth={0.4} />
      <path d={`M ${x},${y - h} L ${x + w + 8},${y - w * 0.5 - h - 4} L ${x + w + 8 - d},${y - w * 0.5 - d * 0.5 - h - 4} L ${x - d},${y - d * 0.5 - h} Z`} fill="#c0bab0" opacity={0.6} />
      <line x1={x + w * 0.3} y1={y - w * 0.3 * 0.5} x2={x + w * 0.3} y2={y - w * 0.3 * 0.5 - h - 2} stroke="#a8a498" strokeWidth={1} />
      <line x1={x + w * 0.7} y1={y - w * 0.7 * 0.5} x2={x + w * 0.7} y2={y - w * 0.7 * 0.5 - h - 3} stroke="#a8a498" strokeWidth={1} />

      <BuildingLabel x={x + 8} y={y + 20} text="METRO" />
      <BuildingPin cx={x} cy={y - h - 18} icon="🚇" delayClass="hero-building-pin-5" />
    </g>
  );
});
Metro.displayName = 'Metro';

const Library = memo(() => {
  const { x, y, w, d, h } = BUILDINGS.library;
  return (
    <g>
      <ellipse cx={x + 1} cy={y + 4} rx={24} ry={7} fill="#00000005" />
      <path d={isoLeft(x, y, d, h)} fill="#c0a478" />
      <path d={isoRight(x, y, w, h)} fill="#d4b898" />
      <path d={isoTop(x, y, w, d, h)} fill="#e0cca8" />
      <path d={isoRight(x, y, w, h)} fill="none" stroke="#b89868" strokeWidth={0.4} />

      {[0.2, 0.4, 0.6, 0.8].map(u => (
        <line key={`bl-${u}`} x1={x + u * w} y1={y - u * w / 2 - h * 0.2} x2={x + u * w} y2={y - u * w / 2 - h * 0.85} stroke="#c8a880" strokeWidth={0.6} opacity={0.5} />
      ))}

      <path d={rightWin(x, y, w, h, 0.15, 0.55, 0.3, 0.2)} fill="#fff8e4" stroke="#d0b890" strokeWidth={0.3} />
      <path d={rightWin(x, y, w, h, 0.55, 0.55, 0.3, 0.2)} fill="#fff8e4" stroke="#d0b890" strokeWidth={0.3} />

      <BuildingLabel x={x + 1} y={y + 18} text="LIBRARY" />
      <BuildingPin cx={x} cy={y - h - 14} icon="📚" delayClass="hero-building-pin-6" />
    </g>
  );
});
Library.displayName = 'Library';

/* ============================================================================ */
/* MAIN SCENE EXPORT                                                            */
/* ============================================================================ */

const MapLayer = memo(() => {
  return (
    <g className="hero-parallax-3" aria-hidden="true">
      {/* ── SVG Definitions ─────────────────────────────────────────── */}
      <defs>
        <radialGradient id="hm-hostel-glow">
          <stop offset="0%" stopColor="#e8c868" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#e8c868" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e8c868" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hm-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d8d0c4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#d8d0c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hm-pin-radial">
          <stop offset="0%" stopColor="#e8b84a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8b84a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Environment & Grounds ───────────────────────────────────── */}
      <ellipse cx={410} cy={490} rx={280} ry={35} fill="url(#hm-shadow)" />
      <ellipse cx={410} cy={420} rx={300} ry={100} fill="#f8f2ea" opacity={0.4} />

      {/* Pathways Base */}
      <g fill="none" stroke="#d0c8b8" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
        <path d="M 175,338 C 255,365 335,385 420,400 C 465,395 510,385 548,375 C 578,388 602,418 625,440" />
        <path d="M 420,400 C 380,420 330,448 275,470" />
        <path d="M 548,375 C 540,348 525,318 498,288" />
      </g>
      {/* Pathway center dashed lines */}
      <g fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="6 6" opacity={0.5}>
        <path d="M 175,338 C 255,365 335,385 420,400 C 465,395 510,385 548,375 C 578,388 602,418 625,440" />
        <path d="M 420,400 C 380,420 330,448 275,470" />
        <path d="M 548,375 C 540,348 525,318 498,288" />
      </g>

      {/* Rail tracks */}
      {/* Sleepers */}
      <path d="M 130,488 C 190,480 250,474 300,470 C 380,462 480,452 640,435" fill="none" stroke="#a39b8e" strokeWidth={6} strokeDasharray="2 4" opacity={0.6} />
      {/* Rails */}
      <g fill="none" stroke="#7a7368" strokeWidth={1} opacity={0.7}>
        <path d="M 130,488 C 190,480 250,474 300,470 C 380,462 480,452 640,435" transform="translate(0, -1.5)" />
        <path d="M 130,488 C 190,480 250,474 300,470 C 380,462 480,452 640,435" transform="translate(0, 1.5)" />
      </g>

      {/* Background Trees */}
      {TREES_BACK.map((tree, i) => <Tree key={`tb-${i}`} {...tree} />)}

      {/* ── Buildings ───────────────────────────────────────────────── */}
      <College />
      <HostelHero />

      {/* Foreground Trees */}
      {TREES_FRONT.map((tree, i) => <Tree key={`tf-${i}`} {...tree} />)}

      <Cafe />
      <Gym />
      <Metro />
      <Library />
    </g>
  );
});

MapLayer.displayName = 'MapLayer';

export default MapLayer;