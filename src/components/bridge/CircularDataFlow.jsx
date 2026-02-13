import React, { useState } from 'react';

/**
 * CircularDataFlow — 6-node SVG circle diagram
 *
 * Shows the data lifecycle: Buyer Portal → Neon → FileMaker → Neon → Compliance → Admin → back
 * Each node has a hover glow matching its color.
 *
 * Sized for readability in a 2-column layout (500×500 viewBox with larger fonts).
 */

const NODES = [
  { id: 'buyer',      label: 'Buyer Portal',       color: '#d97706', glow: '#d97706', annotation: 'Buyers submit compliance updates here' },
  { id: 'neon1',      label: 'Neon DB',             color: '#7c3aed', glow: '#7c3aed', annotation: 'Caches data for instant page loads' },
  { id: 'filemaker',  label: 'FileMaker',           color: '#2563eb', glow: '#2563eb', annotation: '30,000+ property records live here' },
  { id: 'neon2',      label: 'Neon DB',             color: '#7c3aed', glow: '#7c3aed', annotation: 'Synced copy for fast rendering' },
  { id: 'compliance', label: 'Compliance Engine',   color: '#2d7a4a', glow: '#2d7a4a', annotation: 'Checks schedules hourly' },
  { id: 'admin',      label: 'Admin Portal',        color: '#2d7a4a', glow: '#2d7a4a', annotation: 'Staff reviews and takes action' },
];

const ARROWS = [
  { from: 0, to: 1, label: 'Submission' },
  { from: 1, to: 2, label: 'API Call (Sync)' },
  { from: 2, to: 3, label: 'API Call (Sync)' },
  { from: 3, to: 4, label: 'Schedule Check', callout: 'Organizes & packages\nproperty data for FileMaker' },
  { from: 4, to: 5, label: 'Organizes Information' },
  { from: 5, to: 0, label: 'Email / Token Link' },
];

const CX = 250;
const CY = 250;
const R = 165;

function getNodePos(index) {
  const angle = (Math.PI * 2 * index) / NODES.length - Math.PI / 2;
  return {
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  };
}

function getAnnotationPos(index) {
  const angle = (Math.PI * 2 * index) / NODES.length - Math.PI / 2;
  const aR = R + 65;
  return {
    x: CX + aR * Math.cos(angle),
    y: CY + aR * Math.sin(angle),
  };
}

function getMidArc(fromIdx, toIdx) {
  const a1 = (Math.PI * 2 * fromIdx) / NODES.length - Math.PI / 2;
  const a2 = (Math.PI * 2 * toIdx) / NODES.length - Math.PI / 2;
  let mid = (a1 + a2) / 2;
  if (toIdx < fromIdx) mid += Math.PI;
  const mR = R - 26;
  return {
    x: CX + mR * Math.cos(mid),
    y: CY + mR * Math.sin(mid),
  };
}

function arcPath(fromIdx, toIdx) {
  const p1 = getNodePos(fromIdx);
  const p2 = getNodePos(toIdx);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;
  const pad = 38;
  const x1 = p1.x + nx * pad;
  const y1 = p1.y + ny * pad;
  const x2 = p2.x - nx * pad;
  const y2 = p2.y - ny * pad;
  const sweep = 1;
  const arcR = len * 0.65;
  return `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 ${sweep} ${x2} ${y2}`;
}

export default function CircularDataFlow() {
  const [glowIndex, setGlowIndex] = useState(null);

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <svg viewBox="0 0 500 500" className="w-full h-auto" role="img" aria-label="Circular data flow diagram showing how data moves between 6 system components">
        <defs>
          <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,3 L0,6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Arrows (clockwise) */}
        {ARROWS.map((arrow, i) => {
          const mid = getMidArc(arrow.from, arrow.to);
          return (
            <g key={`arrow-${i}`}>
              <path
                d={arcPath(arrow.from, arrow.to)}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd="url(#arrowHead)"
              />
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500"
                fontSize="9"
                fontWeight="500"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {arrow.label}
              </text>
              {arrow.callout && (
                <text
                  x={mid.x}
                  y={mid.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400"
                  fontSize="7"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {arrow.callout.split('\n').map((line, li) => (
                    <tspan key={li} x={mid.x} dy={li === 0 ? 0 : 9}>{line}</tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const pos = getNodePos(i);
          const aPos = getAnnotationPos(i);
          const isHovered = glowIndex === i;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setGlowIndex(i)}
              onMouseLeave={() => setGlowIndex(null)}
              style={{
                cursor: 'default',
                filter: isHovered ? `drop-shadow(0 0 8px ${node.glow})` : 'none',
                transition: 'filter 0.3s ease',
              }}
            >
              {/* Node box */}
              <rect
                x={pos.x - 36}
                y={pos.y - 22}
                width={72}
                height={44}
                rx={8}
                fill="white"
                stroke={node.color}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.color}
                fontSize="10"
                fontWeight="700"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {node.label.length > 10
                  ? node.label.split(' ').map((word, wi) => (
                      <tspan key={wi} x={pos.x} dy={wi === 0 ? -5 : 12}>{word}</tspan>
                    ))
                  : node.label
                }
              </text>

              {/* Annotation */}
              <text
                x={aPos.x}
                y={aPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-400"
                fontSize="8"
                fontFamily="Inter, system-ui, sans-serif"
                fontStyle="italic"
              >
                {node.annotation.length > 28
                  ? node.annotation.split(' ').reduce((acc, word) => {
                      const lastLine = acc[acc.length - 1] || '';
                      if ((lastLine + ' ' + word).trim().length > 24) {
                        acc.push(word);
                      } else {
                        acc[acc.length - 1] = (lastLine + ' ' + word).trim();
                      }
                      return acc;
                    }, [''])
                    .map((line, li) => (
                      <tspan key={li} x={aPos.x} dy={li === 0 ? 0 : 11}>{line}</tspan>
                    ))
                  : node.annotation
                }
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
