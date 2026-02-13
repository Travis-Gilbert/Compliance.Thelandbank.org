import React from 'react';
import { AppIcon } from '../ui';
import ICONS from '../../icons/iconMap';

/**
 * SecurityLayers — Horizontal security layer cards
 *
 * 4 cards laid out left-to-right in a grid, all in civic green.
 * Each card shows a security layer with icon, title, and bullet list.
 * Hover lift animation on each card.
 */

const LAYERS = [
  {
    id: 'tls',
    label: 'HTTPS / TLS 1.3',
    icon: ICONS.globe,
    items: [
      'All traffic encrypted in transit',
      'Automatic SSL certificates',
      'HSTS headers prevent downgrade attacks',
    ],
  },
  {
    id: 'cors',
    label: 'CORS & Edge Middleware',
    icon: ICONS.shield,
    items: [
      'API routes gated by ADMIN_API_KEY',
      'CORS restricts cross-origin requests',
      'Edge middleware runs before functions',
    ],
  },
  {
    id: 'auth',
    label: 'API Auth + Buyer Tokens',
    icon: ICONS.outreach,
    items: [
      'Unique time-limited access links',
      'Tokens are single-use and expire',
      'No login required — secure by design',
    ],
  },
  {
    id: 'db',
    label: 'Encrypted Database',
    icon: ICONS.database,
    items: [
      'Neon PostgreSQL: AES-256 at rest',
      'FileMaker: built-in encryption',
      'Prisma ORM prevents SQL injection',
    ],
  },
];

function LayerCard({ layer }) {
  return (
    <div className="flex flex-col items-center text-center px-3 py-3 rounded-lg border border-accent/20 bg-accent/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-accent/10">
      <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center mb-2 shadow-sm">
        <AppIcon icon={layer.icon} size={18} />
      </div>
      <h4 className="text-xs font-bold text-text mb-2">{layer.label}</h4>
      <div className="space-y-1 w-full">
        {layer.items.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 text-left">
            <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0 mt-1.5" />
            <span className="text-[10px] text-muted leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecurityLayers() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {LAYERS.map((layer) => (
        <LayerCard key={layer.id} layer={layer} />
      ))}
    </div>
  );
}
