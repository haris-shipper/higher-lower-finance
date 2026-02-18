import { useState, useEffect, useMemo } from "react";

const FONT = {
  H: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  G: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  C: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  N: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  S: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  B: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  X: [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
};

const PS = 4, PG = 1, LG = 5;

function buildPixels(text) {
  const pxs = [], cw = 5 * PS + 4 * PG; let xOff = 0;
  for (let ci = 0; ci < text.length; ci++) {
    const grid = FONT[text[ci]] || FONT[' '];
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 5; c++)
        if (grid[r][c]) pxs.push({ key: `${ci}-${r}-${c}`, x: xOff + c * (PS + PG), y: r * (PS + PG) });
    xOff += cw + LG;
  }
  return { pxs, w: xOff - LG, h: 7 * PS + 6 * PG };
}

// Precomputed default so the H/L game pays no runtime cost
const DEFAULT = buildPixels("HIGHER OR LOWER?");

export default function PixelDisplay({ color, isHovered, style, text, shape = "square" }) {
  const { pxs, w, h } = useMemo(() => text ? buildPixels(text) : DEFAULT, [text]);
  const [dim, setDim] = useState(() => new Set());

  // Reset dim when text changes (different game logo mounted)
  useEffect(() => { setDim(new Set()); }, [text]);

  useEffect(() => {
    if (isHovered) return;
    const iv = setInterval(() => {
      setDim(prev => {
        const next = new Set(prev);
        const n = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < n; i++) {
          const px = pxs[Math.floor(Math.random() * pxs.length)];
          next.has(px.key) ? next.delete(px.key) : next.add(px.key);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(iv);
  }, [isHovered, pxs]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block", ...style }}>
      {pxs.map(({ key, x, y }) => {
        const op = isHovered ? 1 : (dim.has(key) ? 0.07 : 1);
        if (shape === "dot")
          return <circle key={key} cx={x + PS / 2} cy={y + PS / 2} r={PS / 2} fill={color} opacity={op} style={{ transition: "opacity 0.4s ease" }} />;
        if (shape === "triangle")
          return <polygon key={key} points={`${x + PS / 2},${y} ${x},${y + PS} ${x + PS},${y + PS}`} fill={color} opacity={op} style={{ transition: "opacity 0.4s ease" }} />;
        return <rect key={key} x={x} y={y} width={PS} height={PS} fill={color} opacity={op} style={{ transition: "opacity 0.4s ease" }} />;
      })}
    </svg>
  );
}
