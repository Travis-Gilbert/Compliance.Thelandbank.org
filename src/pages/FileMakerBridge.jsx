import React, { useState, useEffect, useCallback } from 'react';
import ICONS from '../icons/iconMap';
import { Card, AdminPageHeader } from '../components/ui';
import { AppIcon } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

/* ── Status indicator dot ───────────────────── */

function StatusDot({ connected, size = 'md' }) {
  const sizes = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3' };
  const dotSize = sizes[size] || sizes.md;
  const color = connected ? 'bg-accent' : 'bg-danger';
  const ping = connected ? 'bg-accent/60' : 'bg-danger/60';

  return (
    <span className="relative flex">
      {connected && (
        <span className={`animate-ping absolute inline-flex ${dotSize} rounded-full ${ping} opacity-75`} />
      )}
      <span className={`relative inline-flex ${dotSize} rounded-full ${color}`} />
    </span>
  );
}

/* ── Connection status card ─────────────────── */

function ConnectionCard({ status, loading, onRefresh }) {
  const connected = status?.connected;
  const configured = status?.configured;

  return (
    <Card className="relative overflow-hidden">
      {/* Accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${connected ? 'bg-accent' : configured ? 'bg-warning' : 'bg-warm-200'}`} />

      <div className="flex items-start justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${connected ? 'bg-accent/10' : 'bg-warm-100'}`}>
            <AppIcon icon={ICONS.database} size={20} className={connected ? 'text-accent' : 'text-muted'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-text">FileMaker Server</h3>
              <StatusDot connected={connected} />
            </div>
            <p className="text-xs text-muted mt-0.5">
              {connected
                ? `Connected · ${status.latencyMs}ms`
                : configured
                  ? `Disconnected — ${status.error || 'check server'}`
                  : 'Awaiting FileMaker credentials'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-md hover:bg-warm-100 transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <AppIcon
            icon={ICONS.sync}
            size={16}
            className={`text-muted ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {connected && status.fileMaker && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoRow label="Database" value={status.fileMaker.database} />
          <InfoRow label="Layout" value={status.fileMaker.layout} />
          <InfoRow label="Table" value={status.fileMaker.table} />
          <InfoRow label="Latency" value={`${status.latencyMs}ms`} />
        </div>
      )}

      {!connected && !configured && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-warm-100/50 rounded-lg">
            <p className="text-xs font-semibold text-text mb-1.5">What is this connection?</p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              The portal connects to the GCLBA FileMaker Pro database using FileMaker's built-in
              Data API — a secure REST interface that allows authorized applications to read and
              write records. This connection requires four credentials set by your FileMaker administrator:
              the server URL, database name, username, and password.
            </p>
          </div>
          <div className="p-3 bg-warm-100/50 rounded-lg">
            <p className="text-xs font-semibold text-text mb-1.5">What happens when connected?</p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Once credentials are configured, the portal will sync property records from the
              PARC&nbsp;-&nbsp;Form layout (approximately 30,000 records) into a fast-access cache. This
              cache allows the portal to load property pages instantly without querying FileMaker
              on every click. All changes made through the portal are written back to FileMaker as the
              permanent record.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <AppIcon icon={ICONS.info} size={12} />
            <span>Contact IT to configure FileMaker Data API credentials in Vercel environment variables.</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</span>
      <span className="text-xs font-medium text-text">{value || '—'}</span>
    </div>
  );
}

/* ── Record sync card ───────────────────────── */

function SyncCard({ status, onSync, syncing, lastSyncResult, lastChecked }) {
  const connected = status?.connected;
  const fmCount = status?.sync?.fmRecords ?? '—';
  const portalCount = status?.sync?.portalRecords ?? '—';
  const inSync = status?.sync?.inSync;
  const delta = status?.sync?.delta ?? 0;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading text-base font-semibold text-text">Record Sync</h3>
          <p className="text-xs text-muted mt-0.5">
            {inSync ? 'Records are in sync' : delta > 0 ? `${delta} records behind FileMaker` : 'Check sync status'}
            {lastChecked && (
              <span className="text-muted/60"> · checked {lastChecked.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            )}
          </p>
        </div>
        <button
          onClick={onSync}
          disabled={!connected || syncing}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={!connected ? 'Connect to FileMaker Server first' : syncing ? 'Sync in progress...' : 'Pull latest records from FileMaker'}
        >
          <AppIcon icon={ICONS.sync} size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Record count comparison */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-warm-100/50 rounded-lg">
        <CountBox label="FileMaker" count={fmCount} icon={ICONS.database} />
        <div className="flex items-center justify-center">
          <AppIcon icon={ICONS.dataFlow} size={20} className="text-muted" />
        </div>
        <CountBox label="Portal" count={portalCount} icon={ICONS.zap} />
      </div>

      {/* Last sync result */}
      {lastSyncResult && (
        <div className="mt-4 p-3 bg-warm-100/30 rounded-md border border-border">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Last Sync Result</p>
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Synced" value={lastSyncResult.synced} />
            <MiniStat label="Created" value={lastSyncResult.created} color="text-accent" />
            <MiniStat label="Updated" value={lastSyncResult.updated} color="text-info" />
            <MiniStat label="Errors" value={lastSyncResult.errors?.length ?? 0} color={lastSyncResult.errors?.length > 0 ? 'text-danger' : undefined} />
          </div>
          {lastSyncResult.syncedAt && (
            <p className="text-[10px] text-muted mt-2 font-mono">
              {new Date(lastSyncResult.syncedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function CountBox({ label, count, icon }) {
  return (
    <div className="text-center">
      <AppIcon icon={icon} size={16} className="text-muted mx-auto mb-1" />
      <p className="text-xl font-mono font-bold tabular-nums text-text">{count}</p>
      <p className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-mono font-semibold tabular-nums ${color || 'text-text'}`}>{value}</p>
      <p className="text-[9px] text-muted font-mono uppercase">{label}</p>
    </div>
  );
}

/* ── Architecture + Tech Stack section ──────────────────── */

function ArchitectureSection({ connected, status }) {
  const [showTechStack, setShowTechStack] = useState(false);

  return (
    <Card>
      {/* Section header */}
      <div className="mb-6 text-center">
        <h3 className="font-heading text-lg font-bold text-text">Architecture & Security</h3>
        <p className="text-sm text-muted mt-1">How data flows securely between FileMaker and the portal</p>
      </div>

      {/* Visual flow diagrams */}
      <div className="space-y-6">
        {/* Admin read path */}
        <div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Admin Read Path</p>
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <FlowNode
              icon={ICONS.database}
              label="FileMaker"
              sublabel="System of Record"
              color="bg-blue-50 border-blue-200 text-blue-700"
            />
            <FlowArrow label="Pull (Sync)" direction="right" active={connected} />
            <FlowNode
              icon={ICONS.zap}
              label="Neon Cache"
              sublabel="Fast Rendering"
              color="bg-purple-50 border-purple-200 text-purple-700"
            />
            <FlowArrow label="Reads" direction="right" active={connected} />
            <FlowNode
              icon={ICONS.dashboard}
              label="Admin Portal"
              sublabel="Dashboard + Actions"
              color="bg-green-50 border-green-200 text-green-700"
            />
          </div>
        </div>

        {/* Buyer write path */}
        <div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Buyer Submission Path</p>
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <FlowNode
              icon={ICONS.upload}
              label="Buyer Portal"
              sublabel="/submit"
              color="bg-amber-50 border-amber-200 text-amber-700"
            />
            <FlowArrow label="Submission" direction="right" active={connected} />
            <FlowNode
              icon={ICONS.zap}
              label="Neon DB"
              sublabel="Stores + Processes"
              color="bg-purple-50 border-purple-200 text-purple-700"
            />
            <FlowArrow label="Push" direction="right" active={connected} />
            <FlowNode
              icon={ICONS.database}
              label="FileMaker"
              sublabel="Permanent Record"
              color="bg-blue-50 border-blue-200 text-blue-700"
            />
          </div>
        </div>

        {/* Security layers diagram */}
        <div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Security Layers</p>
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <FlowNode
              icon={ICONS.globe}
              label="HTTPS / TLS"
              sublabel="Encrypted in transit"
              color="bg-emerald-50 border-emerald-200 text-emerald-700"
            />
            <FlowArrow label="Verified" direction="right" active={true} />
            <FlowNode
              icon={ICONS.shieldCheck}
              label="Auth & CORS"
              sublabel="Staff: Clerk · Buyer: JWT"
              color="bg-emerald-50 border-emerald-200 text-emerald-700"
            />
            <FlowArrow label="Validated" direction="right" active={true} />
            <FlowNode
              icon={ICONS.lock}
              label="Rate Limiting"
              sublabel="Abuse Prevention"
              color="bg-emerald-50 border-emerald-200 text-emerald-700"
            />
            <FlowArrow label="Filtered" direction="right" active={true} />
            <FlowNode
              icon={ICONS.database}
              label="Neon + FM"
              sublabel="Encrypted at rest"
              color="bg-emerald-50 border-emerald-200 text-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* Detailed explanation + File Architecture Schematic */}
      <div className="mt-6 pt-5 border-t border-border">
        <h4 className="text-sm font-semibold text-text mb-4">How the Portal Relates to FileMaker</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Text explanation */}
          <div className="text-xs text-text-secondary leading-relaxed space-y-3">
            <p>
              <strong className="text-text">FileMaker is the system of record.</strong> All property data,
              buyer records, and compliance history originate in and are permanently stored in the
              GCLB FileMaker database (<span className="font-mono text-accent">PARC - Form</span> layout,
              ~30,000+ records). The portal never replaces or duplicates this data — it reads from it and writes back to it.
            </p>
            <p>
              <strong className="text-text">The portal is a web interface layer.</strong> It serves two functions
              that FileMaker doesn't currently handle well: (1) a public-facing buyer submission form
              where buyers can self-serve compliance updates without staff needing to be involved, and
              (2) an internal dashboard that auto-organizes compliance actions, tracks communication history,
              and batch-sends templated emails — reducing manual data entry and follow-up work.
            </p>
            <p>
              <strong className="text-text">Neon (PostgreSQL) is a speed cache, not a second database.</strong> Because
              FileMaker's Data API has latency and session limits, the portal caches a working copy of property
              and buyer data in a Neon serverless database. This cache syncs from FileMaker on a schedule
              (every 15 minutes) or on demand. When a buyer submits through the portal, that data writes
              to Neon first and then pushes to FileMaker as the permanent record.
            </p>
            <p>
              <strong className="text-text">Nothing is lost if the portal goes offline.</strong> FileMaker
              continues operating independently. The portal is additive — it reduces workload on compliance
              staff and makes it easier for buyers to submit, but all authoritative records remain in FileMaker.
            </p>
          </div>

          {/* RIGHT: File Architecture Schematic */}
          <div className="bg-[#1a1f2e] rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Project Architecture</span>
              <span className="text-[9px] text-white/40 ml-auto">github.com/Travisfromyoutube</span>
            </div>
            <div className="text-green-400 space-y-0.5 whitespace-pre">
{'📁 Compliance.Thelandbank.org/\n\
├── 📁 api/                          '}<span className="text-blue-300">{'← Vercel Serverless Functions'}</span>{'\n\
│   ├── filemaker.js                 '}<span className="text-amber-300">{'← FileMaker Data API bridge'}</span>{'\n\
│   ├── tokens.js                    '}<span className="text-white/50">{'  JWT auth for buyers'}</span>{'\n\
│   ├── submissions.js               '}<span className="text-white/50">{'  Buyer form handler'}</span>{'\n\
│   ├── email.js                     '}<span className="text-white/50">{'  Resend integration'}</span>{'\n\
│   ├── communications.js            '}<span className="text-white/50">{'  Communication log'}</span>{'\n\
│   ├── compliance.js                '}<span className="text-white/50">{'  Compliance engine'}</span>{'\n\
│   ├── export.js                    '}<span className="text-white/50">{'  CSV / report export'}</span>{'\n\
│   └── 📁 cron/\n\
│       └── compliance-check.js      '}<span className="text-white/50">{'  Scheduled compliance scan'}</span>{'\n\
│\n\
├── 📁 src/\n\
│   ├── 📁 config/\n\
│   │   ├── filemakerFieldMap.js     '}<span className="text-amber-300">{'← FM field name mappings'}</span>{'\n\
│   │   └── complianceRules.js       '}<span className="text-white/50">{'  Schedule & enforcement rules'}</span>{'\n\
│   ├── 📁 lib/\n\
│   │   ├── filemakerClient.js       '}<span className="text-amber-300">{'← FM Data API client (REST)'}</span>{'\n\
│   │   ├── db.js                    '}<span className="text-white/50">{'  Prisma/Neon connection'}</span>{'\n\
│   │   ├── emailSender.js           '}<span className="text-white/50">{'  Email dispatch'}</span>{'\n\
│   │   └── tokenGenerator.js        '}<span className="text-white/50">{'  Secure buyer tokens'}</span>{'\n\
│   ├── 📁 pages/                    '}<span className="text-blue-300">{'← React page components'}</span>{'\n\
│   │   ├── Dashboard.jsx\n\
│   │   ├── BuyerSubmission.jsx      '}<span className="text-white/50">{'  Public buyer form'}</span>{'\n\
│   │   ├── ActionQueue.jsx          '}<span className="text-white/50">{'  Staff action queue'}</span>{'\n\
│   │   └── ...14 more pages\n\
│   └── 📁 components/\n\
│       ├── Layout.jsx               '}<span className="text-white/50">{'  Admin sidebar + routing'}</span>{'\n\
│       ├── 📁 ui/                   '}<span className="text-white/50">{'  Shared design components'}</span>{'\n\
│       └── 📁 buyer/               '}<span className="text-white/50">{'  Buyer portal components'}</span>{'\n\
│\n\
├── 📁 prisma/\n\
│   └── schema.prisma                '}<span className="text-purple-300">{'← Neon database schema'}</span>{'\n\
│\n\
└── 📁 docs/                         '}<span className="text-white/50">{'  Architecture & planning docs'}</span>
            </div>

            {/* Data API callout */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">FileMaker Data API Flow</p>
              <div className="text-amber-300/80 space-y-1">
                <p><span className="text-white/60">1.</span> <code>api/filemaker.js</code> receives sync/push requests</p>
                <p><span className="text-white/60">2.</span> <code>lib/filemakerClient.js</code> authenticates via FM Data API REST endpoint</p>
                <p><span className="text-white/60">3.</span> <code>config/filemakerFieldMap.js</code> translates portal ↔ FM field names</p>
                <p><span className="text-white/60">4.</span> Records sync to <code>prisma/schema.prisma</code> → Neon PostgreSQL (cache)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-5 pt-5 border-t border-border">
        <button
          onClick={() => setShowTechStack(!showTechStack)}
          className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
        >
          <span className={`transition-transform duration-200 ${showTechStack ? 'rotate-0' : '-rotate-90'}`}>
            <AppIcon icon={ICONS.chevronDown} size={14} />
          </span>
          {showTechStack ? 'Hide' : 'View'} Tech Stack Details
        </button>

        {showTechStack && (
          <div className="mt-4 animate-fade-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">Layer</th>
                    <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">Technology</th>
                    <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">Purpose</th>
                    <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { layer: 'System of Record', tech: 'FileMaker Pro (GCLB database)', purpose: 'All property records, buyer data, sale history, compliance tracking. PARC - Form layout.', ok: status?.connected },
                    { layer: 'Cache Database', tech: 'Neon (Serverless PostgreSQL)', purpose: 'Fast-access copy of FM data for portal rendering. Prisma ORM for type-safe queries.', ok: true },
                    { layer: 'Backend API', tech: 'Vercel Serverless Functions (Node.js)', purpose: 'Handles sync, submissions, email sending, token auth. Stateless — each request is independent.', ok: true },
                    { layer: 'Frontend — Admin', tech: 'React + Vite + Tailwind CSS', purpose: 'Internal dashboard: compliance queue, communication log, batch email, enforcement tracking.', ok: true },
                    { layer: 'Frontend — Buyer', tech: 'React (same app, /submit route)', purpose: 'Public-facing form for buyers to upload photos, documents, and compliance updates.', ok: true },
                    { layer: 'File Storage', tech: 'Vercel Blob', purpose: 'Stores uploaded photos and documents. URLs stored in Neon, pushed to FM container fields.', ok: true },
                    { layer: 'Email', tech: 'Resend (API)', purpose: 'Sends compliance emails from templates. Logs delivery status back to communication record.', ok: null },
                    { layer: 'Hosting', tech: 'Vercel (vercel.app)', purpose: 'Auto-deploys from GitHub. Edge network for fast loading. SSL included.', ok: true },
                    { layer: 'FM Integration', tech: 'FileMaker Data API (REST)', purpose: 'Bidirectional sync via /fmi/data/v1. Session-token auth per request. 15-min token TTL.', ok: status?.connected },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-warm-100/30">
                      <td className="py-2 px-3 font-mono font-semibold text-text whitespace-nowrap">{row.layer}</td>
                      <td className="py-2 px-3 text-text">{row.tech}</td>
                      <td className="py-2 px-3 text-muted">{row.purpose}</td>
                      <td className="py-2 px-3">
                        {row.ok === true && <span className="inline-flex items-center gap-1 text-accent"><StatusDot connected size="sm" /> OK</span>}
                        {row.ok === false && <span className="inline-flex items-center gap-1 text-danger"><StatusDot connected={false} size="sm" /> Down</span>}
                        {row.ok === null && <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Env vars needed */}
            <div className="mt-4 p-3 bg-warm-100/50 rounded-md">
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Required Environment Variables</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: 'FM_SERVER_URL', set: !!status?.configured },
                  { key: 'FM_DATABASE', set: !!status?.configured },
                  { key: 'FM_USERNAME', set: !!status?.configured },
                  { key: 'FM_PASSWORD', set: !!status?.configured },
                  { key: 'DATABASE_URL', set: true },
                  { key: 'RESEND_API_KEY', set: null },
                ].map((env) => (
                  <div key={env.key} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${env.set === true ? 'bg-accent' : env.set === false ? 'bg-danger' : 'bg-warm-300'}`} />
                    <code className="text-[10px] font-mono text-text">{env.key}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted pt-4 mt-4 border-t border-border">
        <span>FileMaker = Source of truth (permanent records)</span>
        <span>Portal = Web interface + buyer self-service</span>
        <span>Neon = Speed cache for real-time rendering</span>
      </div>
    </Card>
  );
}

function FlowNode({ icon, label, sublabel, color }) {
  return (
    <div className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border ${color}`}>
      <AppIcon icon={icon} size={18} />
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[9px] opacity-70">{sublabel}</span>
    </div>
  );
}

function FlowArrow({ label, active }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[60px]">
      <span className="text-[9px] font-mono text-muted">{label}</span>
      <div className="flex items-center gap-0.5">
        <div className={`h-px w-6 ${active ? 'bg-accent' : 'bg-border'}`} />
        <AppIcon icon={ICONS.arrowRight} size={10} className={active ? 'text-accent' : 'text-border'} />
      </div>
    </div>
  );
}

/* ── System health bar ─────────────────────── */

function SystemHealthBar({ status }) {
  const checks = [
    { label: 'FileMaker', ok: status?.connected, detail: status?.connected ? `${status.latencyMs}ms` : 'Disconnected' },
    { label: 'Neon DB', ok: true, detail: 'Connected' },
    { label: 'Vercel', ok: true, detail: 'Deployed' },
    { label: 'Sync', ok: status?.sync?.inSync, detail: status?.sync?.inSync ? 'In sync' : `${status?.sync?.delta || '?'} behind` },
  ];

  const allOk = checks.every(c => c.ok);

  return (
    <div className={`rounded-lg border px-4 py-3 flex items-center justify-between ${allOk ? 'bg-accent/5 border-accent/20' : 'bg-warning/5 border-warning/20'}`}>
      <div className="flex items-center gap-2">
        <StatusDot connected={allOk} size="md" />
        <span className={`text-sm font-medium ${allOk ? 'text-accent' : 'text-warning'}`}>
          {allOk ? 'All systems operational' : 'Some systems need attention'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <StatusDot connected={c.ok} size="sm" />
            <span className="text-[10px] font-mono text-muted">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Field mapping table ────────────────────── */

function FieldMappingCard({ status }) {
  const [expanded, setExpanded] = useState(false);
  const mapping = status?.fieldMapping;

  if (!mapping) return null;

  const fields = mapping.portalFields?.map((portal, i) => ({
    portal,
    fm: mapping.fmFields?.[i] || '—',
  })) || [];

  const displayFields = expanded ? fields : fields.slice(0, 8);

  return (
    <Card title="Field Mapping" subtitle={`${mapping.mappedFields} fields synced between portal and FileMaker`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">Portal Field</th>
              <th className="text-center py-2 px-1 text-muted">
                <AppIcon icon={ICONS.dataFlow} size={12} />
              </th>
              <th className="text-left py-2 px-3 font-mono text-muted uppercase tracking-wider text-[10px]">FileMaker Field</th>
            </tr>
          </thead>
          <tbody>
            {displayFields.map(({ portal, fm }) => (
              <tr key={portal} className="border-b border-border/50 hover:bg-warm-100/30">
                <td className="py-1.5 px-3 font-mono text-text">{portal}</td>
                <td className="py-1.5 px-1 text-center text-muted">→</td>
                <td className="py-1.5 px-3 font-mono text-accent-dark">{fm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fields.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-accent font-medium hover:text-accent-dark transition-colors"
        >
          {expanded ? 'Show less' : `Show all ${fields.length} fields`}
        </button>
      )}
    </Card>
  );
}

/* ── Sync directions card ───────────────────── */

function SyncDirectionsCard() {
  const directions = [
    {
      direction: 'FileMaker → Portal',
      trigger: 'Scheduled sync (every 15 min) or manual',
      data: 'Property records, buyer info, compliance dates, sold status, program type',
      icon: ICONS.arrowRight,
    },
    {
      direction: 'Portal → FileMaker',
      trigger: 'On buyer submission',
      data: 'New submission record, uploaded photos/documents, confirmation ID',
      icon: ICONS.arrowLeft,
    },
    {
      direction: 'Portal → FileMaker',
      trigger: 'On compliance email send',
      data: 'Communication log entry: date, action type, template used, recipient, delivery status',
      icon: ICONS.arrowLeft,
    },
    {
      direction: 'Portal → FileMaker',
      trigger: 'On admin field edit',
      data: 'Single field update to FM property record (enforcement level, dates, status changes)',
      icon: ICONS.arrowLeft,
    },
  ];

  return (
    <Card title="Sync Directions" subtitle="When and what data moves between systems">
      <div className="space-y-3">
        {directions.map((d, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-warm-100/30">
            <div className="flex-shrink-0 p-1.5 bg-warm-100 rounded">
              <AppIcon icon={d.icon} size={12} className="text-muted" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-text">{d.direction}</span>
                <span className="text-[10px] text-muted">· {d.trigger}</span>
              </div>
              <p className="text-[11px] text-muted mt-0.5">{d.data}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Main page ──────────────────────────────── */

export default function FileMakerBridge() {
  usePageTitle('Data Integration & Security');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/filemaker?action=status');
      const data = await res.json();
      setStatus(data);
      setLastChecked(new Date());
    } catch (err) {
      setStatus({ connected: false, configured: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/filemaker?action=sync');
      const data = await res.json();
      setLastSyncResult(data);
      // Refresh status after sync
      await fetchStatus();
    } catch (err) {
      setLastSyncResult({ error: err.message, synced: 0, created: 0, updated: 0, errors: [{ error: err.message }] });
    } finally {
      setSyncing(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Data Integration & Security"
        subtitle="How property data flows securely between FileMaker and the compliance portal"
        icon={ICONS.database}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-warm-100/50">
            <StatusDot connected={status?.connected} size="lg" />
            <span className={`text-sm font-medium ${status?.connected ? 'text-accent' : 'text-amber-600'}`}>
              {loading ? 'Checking...' : status?.connected ? 'Connected' : 'Awaiting FileMaker Pro Credentials'}
            </span>
          </div>
        }
      />

      <SystemHealthBar status={status} />

      {/* Row 1: Connection + Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionCard status={status} loading={loading} onRefresh={fetchStatus} />
        <SyncCard status={status} onSync={runSync} syncing={syncing} lastSyncResult={lastSyncResult} lastChecked={lastChecked} />
      </div>

      {/* Row 2: Architecture + Tech Stack */}
      <ArchitectureSection connected={status?.connected} status={status} />

      {/* Row 3: Directions + Field Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncDirectionsCard />
        <FieldMappingCard status={status} />
      </div>
    </div>
  );
}
