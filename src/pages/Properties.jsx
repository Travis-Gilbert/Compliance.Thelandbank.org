import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import { DataTable, StatusPill, FormField, TextInput, SelectInput, AdminPageHeader } from '../components/ui';
import { ENFORCEMENT_LEVELS } from '../data/mockData';
import { useProperties } from '../context/PropertyContext';
import { formatDate } from '../utils/milestones';

export default function Properties() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [enforcementFilter, setEnforcementFilter] = useState('');

  // Get unique program types from properties
  const programOptions = useMemo(() => {
    const programs = [...new Set(properties.map(p => p.programType))];
    return programs.map(program => ({
      value: program,
      label: program
    }));
  }, [properties]);

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch =
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.buyerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgram = !programFilter || property.programType === programFilter;
      const matchesEnforcement = !enforcementFilter || property.enforcementLevel === parseInt(enforcementFilter);

      return matchesSearch && matchesProgram && matchesEnforcement;
    });
  }, [properties, searchTerm, programFilter, enforcementFilter]);

  // Map enforcement level to status
  const getEnforcementStatus = (level) => {
    if (level === 0) return 'compliant';
    if (level === 1 || level === 2) return 'watch';
    return 'danger';
  };

  // Table columns configuration
  const columns = [
    {
      key: 'address',
      header: 'Address',
      render: (value) => (
        <div className="text-sm font-medium text-accent">{value}</div>
      )
    },
    {
      key: 'parcelId',
      header: 'Parcel ID',
      render: (value) => (
        <div className="text-sm font-mono text-muted">{value}</div>
      )
    },
    {
      key: 'buyerName',
      header: 'Buyer',
      render: (value) => (
        <div className="text-sm text-text">{value || '—'}</div>
      )
    },
    {
      key: 'programType',
      header: 'Program',
      render: (value) => (
        <StatusPill variant="default">{value}</StatusPill>
      )
    },
    {
      key: 'enforcementLevel',
      header: 'Enforcement',
      render: (value) => {
        const variant = value === 0 ? 'success' : value <= 2 ? 'warning' : 'danger';
        const label = value === 0 ? 'Compliant' : `Level ${value}`;
        return <StatusPill variant={variant}>{label}</StatusPill>;
      }
    },
    {
      key: 'dateSold',
      header: 'Date Sold',
      render: (value) => (
        <div className="text-sm font-mono text-muted">{formatDate(value)}</div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Properties"
        subtitle={`${filteredProperties.length} ${filteredProperties.length === 1 ? 'property' : 'properties'}`}
        icon={Building2}
      />

      {/* Filter Bar */}
      <div className="bg-warm-100 rounded-lg border border-warm-200 p-5 animate-fade-slide-up admin-stagger-2">
        <h3 className="font-heading text-sm font-semibold text-text mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <TextInput
                placeholder="Address, Parcel ID, Buyer..."
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Program Type">
            <SelectInput
              value={programFilter}
              onChange={(value) => setProgramFilter(value)}
              options={[
                { value: '', label: 'All Programs' },
                ...programOptions
              ]}
            />
          </FormField>

          <FormField label="Enforcement Level">
            <SelectInput
              value={enforcementFilter}
              onChange={(value) => setEnforcementFilter(value)}
              options={[
                { value: '', label: 'All Levels' },
                { value: '0', label: 'Compliant' },
                { value: '1', label: 'Warning' },
                { value: '2', label: 'Watch' },
                { value: '3', label: 'Danger' }
              ]}
            />
          </FormField>
        </div>
      </div>

      {/* Properties Table */}
      <div className="animate-fade-slide-up admin-stagger-3">
        <DataTable
          columns={columns}
          data={filteredProperties}
          onRowClick={(row) => navigate(`/properties/${row.id}`)}
          emptyMessage="No properties found matching your filters"
        />
      </div>
    </div>
  );
}
