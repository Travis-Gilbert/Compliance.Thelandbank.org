import React from 'react';
import { Shield } from 'lucide-react';

/**
 * ConcentricSecurityRings — layered security visualization
 *
 * 4 concentric rings + center shield showing defense-in-depth:
 * HTTPS/TLS → CORS & Edge → API Auth + Tokens → Encrypted DB → Your Data
 */

const RINGS = [
  { r: 145, label: 'HTTPS / TLS',               detail: 'Encrypted in transit',                        color: 'rgba(45,122,74,0.12)', stroke: '#2d7a4a', dash: '6 4' },
  { r: 115, label: 'CORS & Edge Middleware',     detail: 'Request filtering',                           color: 'rgba(37,99,235,0.10)', stroke: '#2563eb', dash: '5 3' },
  { r: 85,  label: 'API Auth + Buyer Tokens',    detail: 'Unique time-limited links',                   color: 'rgba(217,119,6,0.10)', stroke: '#d97706', dash: '4 3' },
  { r: 55,  label: 'Encrypted Database',         detail: 'Neon + FileMaker, encrypted at rest',         color: 'rgba(124,58,237,0.10)', stroke: '#7c3aed', dash: '3 2' },
];

const LABEL_ANGLES = [
  -Math.PI / 2,      // top
  0,                  // right
  Math.PI / 2,        // bottom
  Math.PI,            // left
];

const CX = 180;
const CY = 180;

export default function ConcentricSecurityRings() {
  return (
    <div className="w-full max-w-[360px] mx-auto">
      <svg viewBox="0 0 360 360" className="w-full h-auto" role="img" aria-label="Concentric security rings showing 4 layers of defense around your data">
        {/* Rings (outside → in) */}
        {RINGS.map((ring, i) => {
          const angle = LABEL_ANGLES[i];
          const labelR = ring.r + 4;
          const lx = CX + labelR * Math.cos(angle);
          const ly = CY + labelR * Math.sin(angle);

          // Determine text anchor based on position
          const isTop = i === 0;
          const isRight = i === 1;
          const isBottom = i === 2;
          const isLeft = i === 3;
          const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle';

          return (
            <g key={i}>
              {/* Ring fill */}
              <circle
                cx={CX}
                cy={CY}
                r={ring.r}
                fill={ring.color}
                stroke={ring.stroke}
                strokeWidth={1.5}
                strokeDasharray={ring.dash}
                opacity={0.9}
              />
              {/* Label */}
              <text
                x={lx}
                y={ly + (isTop ? -8 : isBottom ? 12 : 0)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
                fill={ring.stroke}
              >
                {ring.label}
              </text>
              {/* Detail */}
              <text
                x={lx}
                y={ly + (isTop ? 2 : isBottom ? 22 : 10)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="6.5"
                fontFamily="Inter, system-ui, sans-serif"
                fill="#94a3b8"
                fontStyle="italic"
              >
                {ring.detail}
              </text>
            </g>
          );
        })}

        {/* Center — shield + "Your Data" */}
        <circle cx={CX} cy={CY} r={28} fill="white" stroke="#2d7a4a" strokeWidth={2} />
        {/* Shield icon via SVG path (matches Lucide Shield) */}
        <g transform={`translate(${CX - 8}, ${CY - 12})`}>
          <path
            d="M8 1.5l6.5 3v5.5c0 4.5-3 8.5-6.5 10-3.5-1.5-6.5-5.5-6.5-10V4.5L8 1.5z"
            fill="none"
            stroke="#2d7a4a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
          fill="#2d7a4a"
        >
          Your Data
        </text>
      </svg>
    </div>
  );
}
