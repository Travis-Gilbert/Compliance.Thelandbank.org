import React, { useState } from 'react';

/**
 * MacOSWindow — Skeuomorphic Mac OS 9 / System 7 tabbed infographic
 *
 * 4 tabs: Files, Technology, APIs, Security
 * Pure CSS chrome via .macos9-* classes from index.css
 */

const TABS = ['Files', 'Technology', 'APIs', 'Security'];

/* ── File tree data ────────────────────────────────── */

const FILE_TREE = [
  { type: 'folder', name: 'api/', annotation: 'Vercel Serverless Functions', children: [
    { type: 'file', name: 'filemaker.js', annotation: 'The bridge to your FileMaker database' },
    { type: 'file', name: 'tokens.js', annotation: 'Creates unique buyer links for secure access' },
    { type: 'file', name: 'submissions.js', annotation: 'Handles buyer compliance form submissions' },
    { type: 'file', name: 'email.js', annotation: 'Sends compliance emails via Resend' },
    { type: 'file', name: 'communications.js', annotation: 'Logs every outreach to a property' },
    { type: 'folder', name: 'cron/', annotation: '', children: [
      { type: 'file', name: 'compliance-check.js', annotation: 'Runs hourly to flag overdue properties' },
    ]},
  ]},
  { type: 'folder', name: 'src/', annotation: 'Frontend Application', children: [
    { type: 'folder', name: 'config/', annotation: '', children: [
      { type: 'file', name: 'filemakerFieldMap.js', annotation: 'Translates field names between portal and FM' },
      { type: 'file', name: 'complianceRules.js', annotation: 'Defines when milestones are due per program' },
    ]},
    { type: 'folder', name: 'lib/', annotation: '', children: [
      { type: 'file', name: 'filemakerClient.js', annotation: 'REST client for FM Data API sessions' },
      { type: 'file', name: 'db.js', annotation: 'Prisma connection to Neon (serverless-safe)' },
    ]},
    { type: 'folder', name: 'pages/', annotation: '14 React page components', children: [] },
    { type: 'folder', name: 'components/', annotation: 'Shared UI + buyer portal components', children: [] },
  ]},
  { type: 'folder', name: 'prisma/', annotation: '', children: [
    { type: 'file', name: 'schema.prisma', annotation: 'Blueprint for 9 data tables' },
  ]},
  { type: 'folder', name: 'docs/', annotation: 'Feature specs, FM tasks, architecture docs, and plans', children: [] },
];

/* ── Technology stack data ─────────────────────────── */

const TECH_STACK = [
  { name: 'React 18',        layer: 'Frontend',    aha: 'Component-based UI — every card, table, and form is a reusable piece' },
  { name: 'Vite 5',          layer: 'Build',       aha: 'Sub-second hot reload — changes appear instantly during development' },
  { name: 'Tailwind CSS',    layer: 'Styling',     aha: 'Consistent design tokens — every color and spacing follows the civic theme' },
  { name: 'Prisma ORM',      layer: 'Data',        aha: 'Type-safe database queries — prevents data mismatch bugs before they happen' },
  { name: 'Neon PostgreSQL', layer: 'Database',    aha: 'Serverless database — scales automatically, connects from any edge location' },
  { name: 'Vercel',          layer: 'Hosting',     aha: 'Auto-deploy on every push — new features go live in under 60 seconds' },
  { name: 'FM Data API',     layer: 'Integration', aha: 'RESTful bridge to FileMaker — reads and writes records securely over HTTPS' },
  { name: 'Resend',          layer: 'Email',       aha: 'Transactional email from compliance@thelandbank.org → direct to Outlook' },
  { name: 'Leaflet',         layer: 'Maps',        aha: 'Interactive map with color-coded pins — visualize compliance across Genesee County' },
];

/* ── API flow data ─────────────────────────────────── */

const API_FLOWS = [
  {
    title: 'FileMaker Data API',
    steps: [
      { step: '1', label: 'Authenticate', detail: 'Session token from FM Server (15-min TTL)' },
      { step: '2', label: 'getRecords', detail: 'Pull property data from PARC - Form layout' },
      { step: '3', label: 'Field Mapping', detail: 'filemakerFieldMap.js translates 50+ field names' },
      { step: '4', label: 'Prisma Upsert', detail: 'Create or update records in Neon cache' },
    ],
  },
  {
    title: 'Resend Email API',
    steps: [
      { step: '1', label: 'Template Render', detail: 'Merge buyer data into compliance email template' },
      { step: '2', label: 'Send via Resend', detail: 'From: compliance@thelandbank.org' },
      { step: '3', label: 'Delivery', detail: 'Arrives in buyer\'s Outlook inbox' },
    ],
  },
  {
    title: 'Buyer Token System',
    steps: [
      { step: '1', label: 'Generate', detail: 'Unique token tied to buyer + property + expiry' },
      { step: '2', label: 'Email Link', detail: 'Token embedded in submission URL' },
      { step: '3', label: 'Verify', detail: 'Portal checks token validity on page load' },
      { step: '4', label: 'Submit', detail: 'Buyer uploads photos/docs through verified form' },
      { step: '5', label: 'Expire', detail: 'Token becomes invalid after use or timeout' },
    ],
  },
];

/* ── Security measures data ────────────────────────── */

const SECURITY_MEASURES = [
  { layer: 'HTTPS / TLS',               color: '#2d7a4a', items: ['All traffic encrypted in transit via TLS 1.3', 'Vercel provides automatic SSL certificates', 'HSTS headers prevent downgrade attacks'] },
  { layer: 'CORS & Edge Middleware',     color: '#2563eb', items: ['API routes gated by ADMIN_API_KEY header', 'CORS restricts cross-origin requests to allowed domains', 'Edge middleware runs before serverless functions'] },
  { layer: 'API Auth + Buyer Tokens',    color: '#d97706', items: ['Each buyer receives a unique time-limited access link', 'Tokens are single-use and expire after submission', 'No login required — secure by design'] },
  { layer: 'Encrypted Database',         color: '#7c3aed', items: ['Neon PostgreSQL: encrypted at rest (AES-256)', 'FileMaker Server: built-in encryption at rest', 'Prisma queries prevent SQL injection'] },
];

/* ── Tab content renderers ─────────────────────────── */

function FileTreeItem({ item, depth = 0 }) {
  const indent = depth * 16;
  const isFolder = item.type === 'folder';

  return (
    <>
      <div className="flex items-start gap-2 py-0.5" style={{ paddingLeft: `${indent}px` }}>
        {isFolder ? <span className="macos9-folder mt-0.5" /> : <span className="macos9-document mt-0.5" />}
        <span className="text-[11px] font-mono font-semibold text-gray-800">{item.name}</span>
        {item.annotation && (
          <span className="text-[10px] text-gray-500 italic ml-1">{item.annotation}</span>
        )}
      </div>
      {isFolder && item.children?.map((child, i) => (
        <FileTreeItem key={`${child.name}-${i}`} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

function FilesTab() {
  return (
    <div className="space-y-0.5 max-h-[340px] overflow-y-auto scrollbar-thin">
      {FILE_TREE.map((item, i) => (
        <FileTreeItem key={i} item={item} depth={0} />
      ))}
    </div>
  );
}

function TechnologyTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {TECH_STACK.map((tech, i) => (
        <div
          key={tech.name}
          className={`macos9-float macos9-float-delay-${i + 1} p-3 rounded border border-gray-200 bg-gray-50/50`}
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[11px] font-bold text-gray-800">{tech.name}</span>
            <span className="text-[9px] font-mono text-gray-400 uppercase">{tech.layer}</span>
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed">{tech.aha}</p>
        </div>
      ))}
    </div>
  );
}

function APIsTab() {
  return (
    <div className="space-y-5">
      {API_FLOWS.map((flow) => (
        <div key={flow.title}>
          <h4 className="text-[11px] font-bold text-gray-800 mb-2 uppercase tracking-wider">{flow.title}</h4>
          <div className="flex flex-wrap items-start gap-1.5">
            {flow.steps.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex items-start gap-2 px-2.5 py-1.5 bg-gray-50 rounded border border-gray-200">
                  <span className="text-[10px] font-mono font-bold text-gray-400">{s.step}.</span>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-800 block">{s.label}</span>
                    <span className="text-[9px] text-gray-500">{s.detail}</span>
                  </div>
                </div>
                {i < flow.steps.length - 1 && (
                  <span className="text-gray-300 self-center text-xs mt-1">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-4">
      {SECURITY_MEASURES.map((measure) => (
        <div key={measure.layer} className="flex gap-3">
          <div className="flex-shrink-0 w-1 rounded-full" style={{ background: measure.color }} />
          <div>
            <h4 className="text-[11px] font-bold mb-1" style={{ color: measure.color }}>{measure.layer}</h4>
            <ul className="space-y-0.5">
              {measure.items.map((item, i) => (
                <li key={i} className="text-[10px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-gray-400 mt-px">&#x2022;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Token lifecycle mini-diagram */}
      <div className="mt-4 p-3 bg-amber-50/50 rounded border border-amber-200/50">
        <p className="text-[10px] font-bold text-amber-800 mb-2 uppercase tracking-wider">Buyer Token Lifecycle</p>
        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
          {['Generate Token', 'Email to Buyer', 'Buyer Clicks Link', 'Token Verified', 'Form Submitted', 'Token Expired'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className="px-2 py-1 bg-white rounded border border-amber-200 text-amber-800 font-medium">{step}</span>
              {i < arr.length - 1 && <span className="text-amber-300">&rarr;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  Files: FilesTab,
  Technology: TechnologyTab,
  APIs: APIsTab,
  Security: SecurityTab,
};

/* ── Main component ────────────────────────────────── */

export default function MacOSWindow() {
  const [activeTab, setActiveTab] = useState('Files');
  const TabContent = TAB_CONTENT[activeTab];

  return (
    <div className="macos9-desktop">
      <div className="macos9-window">
        {/* Title bar */}
        <div className="macos9-titlebar">
          <span className="macos9-btn macos9-btn-close" />
          <span className="macos9-btn macos9-btn-minimize" />
          <span className="macos9-btn macos9-btn-zoom" />
          <span className="macos9-titlebar-text">Portal File Structure and Technology</span>
        </div>

        {/* Tab bar */}
        <div className="macos9-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`macos9-tab ${activeTab === tab ? 'macos9-tab-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="macos9-content">
          <TabContent />
        </div>
      </div>
    </div>
  );
}
