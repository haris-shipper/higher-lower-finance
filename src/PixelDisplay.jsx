import { useState, useEffect } from "react";

const FONT = {
  H: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  G: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
};

const PX_TEXT = "HIGHER OR LOWER?";
const PS = 4, PG = 1, LG = 5;

const buildPx = () => {
  const pxs = [], cw = 5 * PS + 4 * PG; let xOff = 0;
  for (let ci = 0; ci < PX_TEXT.length; ci++) {
    const grid = FONT[PX_TEXT[ci]] || FONT[' '];
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 5; c++)
        if (grid[r][c]) pxs.push({ key: `${ci}-${r}-${c}`, x: xOff + c * (PS + PG), y: r * (PS + PG) });
    xOff += cw + LG;
  }
  return { pxs, w: xOff - LG, h: 7 * PS + 6 * PG };
};

const { pxs: PX_PIXELS, w: PX_W, h: PX_H } = buildPx();

export default function PixelDisplay({ color, isHovered, style }) {
  const [dim, setDim] = useState(() => new Set());

  useEffect(() => {
    if (isHovered) return;
    const iv = setInterval(() => {
      setDim(prev => {
        const next = new Set(prev);
        const n = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < n; i++) {
          const px = PX_PIXELS[Math.floor(Math.random() * PX_PIXELS.length)];
          next.has(px.key) ? next.delete(px.key) : next.add(px.key);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(iv);
  }, [isHovered]);

  return (
    <svg viewBox={`0 0 ${PX_W} ${PX_H}`} style={{ width: "100%", display: "block", ...style }}>
      {PX_PIXELS.map(({ key, x, y }) => (
        <rect key={key} x={x} y={y} width={PS} height={PS} fill={color}
          opacity={isHovered ? 1 : (dim.has(key) ? 0.07 : 1)}
          style={{ transition: "opacity 0.4s ease" }} />
      ))}
    </svg>
  );
}
