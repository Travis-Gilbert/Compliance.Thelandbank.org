import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { mockProperties } from '../data/mockData';
import { getDashboardStats } from '../utils/milestones';

export default function Dashboard() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = useMemo(() => getDashboardStats(), []);

  // Filter properties that need attention (enforcement level > 0)
  const propertiesNeedingAttention = useMemo(() => {
    return mockProperties.filter((prop) => prop.enforcementLevel > 0);
  }, []);

  // Calculate days overdue
  const getPropertiesList = () => {
    return propertiesNeedingAttention.map((prop) => {
      const daysOverdue = prop.daysOverdue || 0;
      return {
        ...prop,
        daysOverdue,
      };
    });
  };

  const properties = getPropertiesList();

  // Summary card component
  const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: bgColor }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor} bg-opacity-10`}>
          <Icon size={28} style={{ color: bgColor }} />
        </div>
      </div>
    </div>
  );

  // Enforcement level badge
  const EnforcementBadge = ({ level }) => {
    const badgeConfig = {
      0: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Compliant' },
      1: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Warning L1' },
      2: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Warning L2' },
      3: { bg: 'bg-red-100', text: 'text-red-800', label: 'Default L3' },
      4: { bg: 'bg-red-100', text: 'text-red-800', label: 'Default L4' },
    };

    const config = badgeConfig[level] || badgeConfig[0];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Compliance Dashboard</h1>
          <p className="text-slate-600 mt-1">{dateString}</p>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Active Cases"
            value={stats.totalActiveCases}
            icon={CheckCircle}
            bgColor="#0ea5e9"
            textColor="text-blue-600"
          />
          <SummaryCard
            title="Compliant"
            value={stats.compliantCount}
            icon={CheckCircle}
            bgColor="#10b981"
            textColor="text-emerald-600"
          />
          <SummaryCard
            title="Level 1-2 (Warning)"
            value={stats.warningCount}
            icon={AlertTriangle}
            bgColor="#f59e0b"
            textColor="text-amber-600"
          />
          <SummaryCard
            title="Level 3-4 (Default)"
            value={stats.defaultCount}
            icon={AlertCircle}
            bgColor="#ef4444"
            textColor="text-red-600"
          />
        </div>

        {/* Program Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 font-medium">Featured Homes</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.programBreakdown.featuredHomes}</p>
            <p className="text-xs text-slate-500 mt-2">Active cases</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 font-medium">R4R</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.programBreakdown.r4r}</p>
            <p className="text-xs text-slate-500 mt-2">Active cases</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 font-medium">Demo</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.programBreakdown.demo}</p>
            <p className="text-xs text-slate-500 mt-2">Active cases</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-slate-600 font-medium">VIP</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.programBreakdown.vip}</p>
            <p className="text-xs text-slate-500 mt-2">Active cases</p>
          </div>
        </div>

        {/* Action Needed Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Needs 1st Attempt</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.actionNeeded.needs1stAttempt}</p>
              </div>
              <Clock className="text-blue-500" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Needs 2nd Attempt</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.actionNeeded.needs2ndAttempt}</p>
              </div>
              <AlertTriangle className="text-amber-500" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">No Email on File</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.actionNeeded.noEmailOnFile}</p>
              </div>
              <AlertCircle className="text-red-500" size={28} />
            </div>
          </div>
        </div>

        {/* Properties Needing Attention Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Properties Needing Attention</h2>
            <p className="text-sm text-slate-600 mt-1">
              {properties.length} properties with enforcement level {'>'}0
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Enforcement Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <Link
                          to={`/properties/${property.id}`}
                          className="text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          {property.address}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{property.buyerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{property.program}</td>
                      <td className="px-6 py-4">
                        <EnforcementBadge level={property.enforcementLevel} />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {property.daysOverdue > 0 ? (
                          <span className="text-red-600">{property.daysOverdue} days</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-600">
                      <p className="text-sm">No properties requiring attention at this time</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
