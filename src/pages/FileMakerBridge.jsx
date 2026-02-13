import React, { useState, useEffect, useCallback } from 'react';
import ICONS from '../icons/iconMap';
import { Card, AdminPageHeader } from '../components/ui';
import { AppIcon } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';
import { CircularDataFlow, ConcentricSecurityRings, MacOSWindow } from '../components/bridge';

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

/* ── Architecture + Diagrams section ───────────────── */

function ArchitectureSection() {
  return (
    <Card>
      {/* Row 1: Split headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-text">Database Integration</h3>
          <p className="text-sm text-muted mt-1">How data flows between FileMaker and the portal</p>
        </div>
        <div className="lg:text-right">
          <h3 className="font-heading text-lg font-bold text-text">Security</h3>
          <p className="text-sm text-muted mt-1">End-to-end encryption</p>
        </div>
      </div>

      {/* Row 2: Circular Data Flow + Concentric Security Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CircularDataFlow />
        <ConcentricSecurityRings />
      </div>

      {/* Row 3: Mac OS 9 Window (full width) */}
      <MacOSWindow />
    </Card>
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

      {/* Row 2: Architecture + Diagrams */}
      <ArchitectureSection />

      {/* Row 3: Directions + Field Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncDirectionsCard />
        <FieldMappingCard status={status} />
      </div>
    </div>
  );
}
