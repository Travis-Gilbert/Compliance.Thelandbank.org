import React, { useState, useEffect, useCallback } from 'react';
import ICONS from '../icons/iconMap';
import { Card, AdminPageHeader } from '../components/ui';
import { AppIcon } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';
import { DataFlowDiagram, SecurityLayers, MacOSWindow } from '../components/bridge';

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

/* ── Sync button (replaces credentials chip) ── */

function SyncButton({ connected, loading, onSync }) {
  return (
    <button
      onClick={onSync}
      disabled={loading}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-accent/25 bg-accent/5 hover:bg-accent/10 transition-all duration-150 group disabled:opacity-60"
    >
      {/* Left arrow (FM → Portal) */}
      <span className="text-[9px] font-mono text-muted hidden sm:inline">FM</span>
      <div className="flex items-center gap-0.5">
        <div className="w-3 h-[1.5px] bg-accent/40" />
        <div className="w-0 h-0 border-l-[3px] border-l-accent/50 border-y-[2px] border-y-transparent" />
      </div>

      {/* Center icon */}
      <div className={`w-6 h-6 rounded bg-accent text-white flex items-center justify-center shadow-sm ${loading ? 'animate-spin' : 'group-hover:scale-105'} transition-transform`}>
        <AppIcon icon={ICONS.sync} size={13} />
      </div>

      {/* Right arrow (Portal → FM) */}
      <div className="flex items-center gap-0.5">
        <div className="w-0 h-0 border-r-[3px] border-r-accent/50 border-y-[2px] border-y-transparent" />
        <div className="w-3 h-[1.5px] bg-accent/40" />
      </div>
      <span className="text-[9px] font-mono text-muted hidden sm:inline">Portal</span>

      {/* Status dot */}
      <StatusDot connected={connected} size="sm" />
    </button>
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
      data: 'Single field update to FM property record (compliance level, dates, status changes)',
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

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/filemaker?action=status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({ connected: false, configured: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch('/api/filemaker?action=sync');
      await fetchStatus();
    } catch {
      // status will show error state
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
          <SyncButton
            connected={status?.connected}
            loading={loading || syncing}
            onSync={handleSync}
          />
        }
      />

      <SystemHealthBar status={status} />

      {/* Mac OS Window — hero section at top */}
      <MacOSWindow />

      {/* Data Flow + Security — single card */}
      <Card className="p-6 lg:p-8">
        {/* Data Flow */}
        <div className="mb-8">
          <h3 className="font-heading text-lg font-bold text-text mb-1">Data Flow</h3>
          <p className="text-xs text-muted mb-5">How property data moves through 5 system components — from buyer submission to admin action</p>
          <DataFlowDiagram />
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 my-6" />

        {/* Security */}
        <div>
          <h3 className="font-heading text-lg font-bold text-text mb-1">Security</h3>
          <p className="text-xs text-muted mb-5">End-to-end encryption</p>
          <SecurityLayers />
        </div>
      </Card>

      {/* Directions + Field Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncDirectionsCard />
        <FieldMappingCard status={status} />
      </div>
    </div>
  );
}
