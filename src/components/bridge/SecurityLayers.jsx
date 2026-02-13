import React from 'react';
import { AppIcon } from '../ui';
import ICONS from '../../icons/iconMap';

/**
 * SecurityLayers — Linear security layer cards
 *
 * 4 horizontal cards, all in the civic green palette.
 * Each shows a security layer with its protections listed inline.
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
      'Unique time-limited access links per buyer',
      'Tokens are single-use and expire after submission',
      'No login required — secure by design',
    ],
  },
  {
    id: 'db',
    label: 'Encrypted Database',
    icon: ICONS.database,
    items: [
      'Neon PostgreSQL: AES-256 encryption at rest',
      'FileMaker Server: built-in encryption at rest',
      'Prisma ORM prevents SQL injection',
    ],
  },
];

function LayerCard({ layer }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border border-accent/20 bg-accent/5 transition-all duration-150 hover:bg-accent/10">
      <div className="flex-shrink-0 w-7 h-7 rounded bg-accent text-white flex items-center justify-center shadow-sm mt-0.5">
        <AppIcon icon={layer.icon} size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-bold text-text mb-1">{layer.label}</h4>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {layer.items.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
              <span className="text-[9px] text-muted">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SecurityLayers() {
  return (
    <div className="w-full space-y-1.5">
      {LAYERS.map((layer) => (
        <LayerCard key={layer.id} layer={layer} />
      ))}
    </div>
  );
}
