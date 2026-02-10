import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  ClipboardCheck,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { Card, StatCard, StatusPill, DataTable, AdminPageHeader } from '../components/ui';
import { useProperties } from '../context/PropertyContext';
import {
  getDashboardStats,
  getFirstOverdueMilestoneDate,
  daysOverdue,
} from '../utils/milestones';

const Dashboard = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();

  // Calculate dashboard stats
  const stats = useMemo(() => getDashboardStats(properties), [properties]);

  // Get properties needing attention — sorted by most overdue first
  const propertiesNeedingAttention = useMemo(() => {
    return properties
      .map((prop) => {
        const firstOverdueDate = getFirstOverdueMilestoneDate(prop);
        const overdueDays = firstOverdueDate ? daysOverdue(firstOverdueDate) : 0;
        return { ...prop, overdueDays };
      })
      .filter((prop) => prop.overdueDays > 0)
      .sort((a, b) => b.overdueDays - a.overdueDays)
      .slice(0, 10);
  }, [properties]);

  // Action-needed stats
  const actionStats = useMemo(() => {
    const needs1st = properties.filter(
      (p) => !p.compliance1stAttempt && p.enforcementLevel > 0
    ).length;
    const needs2nd = properties.filter(
      (p) => p.compliance1stAttempt && !p.compliance2ndAttempt && p.enforcementLevel > 0
    ).length;
    const noEmail = properties.filter(
      (p) => (!p.buyerEmail || p.buyerEmail.trim() === '') && p.enforcementLevel > 0
    ).length;
    return { needs1st, needs2nd, noEmail };
  }, [properties]);

  // DataTable columns
  const columns = [
    {
      key: 'address',
      header: 'Address',
      render: (value) => (
        <span className="text-sm font-medium text-accent">{value}</span>
      ),
    },
    {
      key: 'buyerName',
      header: 'Buyer',
      render: (value) => (
        <span className="text-sm text-text">{value || '—'}</span>
      ),
    },
    {
      key: 'programType',
      header: 'Program',
      render: (value) => (
        <StatusPill variant="default">{value}</StatusPill>
      ),
    },
    {
      key: 'enforcementLevel',
      header: 'Level',
      render: (value) => {
        const variant =
          value === 0 ? 'success' : value <= 2 ? 'warning' : 'danger';
        return <StatusPill variant={variant}>{value}</StatusPill>;
      },
    },
    {
      key: 'overdueDays',
      header: 'Days Overdue',
      render: (value) => (
        <span
          className={`text-sm font-mono font-semibold tabular-nums ${
            value > 30
              ? 'text-danger'
              : value > 14
                ? 'text-warning'
                : 'text-text'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Build table data with correct field names
  const tableData = propertiesNeedingAttention.map((prop) => ({
    id: prop.id,
    address: prop.address,
    buyerName: prop.buyerName,
    programType: prop.programType,
    enforcementLevel: prop.enforcementLevel,
    overdueDays: prop.overdueDays,
  }));

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle={todayFormatted}
        icon={LayoutDashboard}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-slide-up admin-stagger-2">
        <StatCard
          label="Total Properties"
          value={stats.totalActiveCases}
          icon={ClipboardCheck}
          variant="default"
        />
        <StatCard
          label="Compliant"
          value={stats.compliantCount}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          label="Needs Attention"
          value={stats.warningCount}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="At Risk"
          value={stats.defaultCount}
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Program Breakdown */}
      <div className="animate-fade-slide-up admin-stagger-3">
        <Card>
          <h2 className="font-heading text-sm font-semibold text-text mb-5">
            Program Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Featured Homes', value: stats.programBreakdown.featuredHomes },
              { label: 'Ready4Rehab', value: stats.programBreakdown.r4r },
              { label: 'Demolition', value: stats.programBreakdown.demo },
              { label: 'VIP', value: stats.programBreakdown.vip },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-mono font-semibold text-text tabular-nums">
                  {value}
                </p>
                <p className="text-xs text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-slide-up admin-stagger-4">
        <Link
          to="/milestones"
          className="group flex items-center justify-between p-5 rounded-lg border-2 border-warm-200 hover:border-accent transition-colors"
        >
          <div>
            <h3 className="font-heading text-sm font-semibold text-text group-hover:text-accent transition-colors">
              View Milestones
            </h3>
            <p className="text-xs text-muted mt-1">
              Track project milestones and deadlines
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors flex-shrink-0" />
        </Link>
        <Link
          to="/compliance"
          className="group flex items-center justify-between p-5 rounded-lg border-2 border-warm-200 hover:border-accent transition-colors"
        >
          <div>
            <h3 className="font-heading text-sm font-semibold text-text group-hover:text-accent transition-colors">
              Check Compliance
            </h3>
            <p className="text-xs text-muted mt-1">
              Review compliance status and requirements
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors flex-shrink-0" />
        </Link>
      </div>

      {/* Action Needed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-slide-up admin-stagger-5">
        <StatCard
          label="Needs 1st Attempt"
          value={actionStats.needs1st}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Needs 2nd Attempt"
          value={actionStats.needs2nd}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          label="No Email on File"
          value={actionStats.noEmail}
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Properties Needing Attention */}
      <div className="animate-fade-slide-up admin-stagger-6">
        <h2 className="font-heading text-base font-semibold text-text mb-3">
          Properties Needing Attention
        </h2>
        <div className="h-px bg-warm-200 mb-4" />
        {tableData.length > 0 ? (
          <DataTable
            columns={columns}
            data={tableData}
            onRowClick={(row) => navigate(`/properties/${row.id}`)}
          />
        ) : (
          <div className="text-center py-8 bg-surface rounded-lg border border-border">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted">All properties are on track</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
