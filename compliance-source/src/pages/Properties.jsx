import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { mockProperties, PROGRAM_TYPES, ENFORCEMENT_LEVELS, COMPLIANCE_STATUSES } from '../data/mockData';

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedEnforcement, setSelectedEnforcement] = useState('All');

  // Filter properties based on search and dropdowns
  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      const matchesSearch =
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.buyer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgram =
        selectedProgram === 'All' || property.program === selectedProgram;

      const matchesEnforcement =
        selectedEnforcement === 'All' ||
        property.enforcementLevel === parseInt(selectedEnforcement);

      return matchesSearch && matchesProgram && matchesEnforcement;
    });
  }, [searchTerm, selectedProgram, selectedEnforcement]);

  // Program badge colors
  const getProgramBadgeColor = (program) => {
    const colors = {
      'Featured Homes': 'bg-blue-100 text-blue-800 border-blue-300',
      'Ready4Rehab': 'bg-purple-100 text-purple-800 border-purple-300',
      'Demolition': 'bg-amber-100 text-amber-800 border-amber-300',
      'VIP': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return colors[program] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  // Enforcement level badge colors
  const getEnforcementBadgeColor = (level) => {
    switch (level) {
      case 0:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 3:
        return 'bg-red-100 text-red-800 border-red-300';
      case 4:
        return 'bg-red-900 text-red-50 border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getEnforcementLabel = (level) => {
    if (level === 0) return 'Compliant';
    return `Level ${level}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Properties</h1>
          <p className="text-slate-600">
            Manage {filteredProperties.length} of {mockProperties.length} properties
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Address / Buyer
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by address, parcel ID, or buyer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Program Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Program Type
              </label>
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option>All</option>
                  <option>Featured Homes</option>
                  <option>Ready4Rehab</option>
                  <option>Demolition</option>
                  <option>VIP</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Enforcement Level Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enforcement Level
              </label>
              <div className="relative">
                <select
                  value={selectedEnforcement}
                  onChange={(e) => setSelectedEnforcement(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="0">Compliant</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Parcel ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Date Sold
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Enforcement Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.id}`}
                      className="block hover:bg-slate-50 transition-colors"
                    >
                      <tr className={property.completed ? 'opacity-60' : ''}>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="flex items-center gap-2">
                            {property.completed && (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
                            <span>{property.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {property.parcelId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {property.buyer}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getProgramBadgeColor(
                              property.program
                            )}`}
                          >
                            {property.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(property.dateSold).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getEnforcementBadgeColor(
                              property.enforcementLevel
                            )}`}
                          >
                            {getEnforcementLabel(property.enforcementLevel)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              property.completed
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            {property.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    </Link>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-600">
                      No properties found matching your filters.
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
};

export default Properties;
