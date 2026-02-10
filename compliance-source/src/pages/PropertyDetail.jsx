import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { mockProperties } from '../data/mockData';
import {
  generateMilestones,
  calculateEnforcementLevel,
  calculatePenalty,
  formatDate,
  daysOverdue,
  getMilestoneStatus,
  daysBetween,
} from '../utils/milestones';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const property = useMemo(() => {
    return mockProperties.find((p) => p.id === id);
  }, [id]);

  const milestones = useMemo(() => {
    return property ? generateMilestones(property) : [];
  }, [property]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Property Not Found</h2>
          <p className="text-slate-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  // Enforcement badge color helper
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

  // Program badge color helper
  const getProgramBadgeColor = (program) => {
    const colors = {
      'Featured Homes': 'bg-blue-100 text-blue-800 border-blue-300',
      'Ready4Rehab': 'bg-purple-100 text-purple-800 border-purple-300',
      'Demolition': 'bg-amber-100 text-amber-800 border-amber-300',
      'VIP': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return colors[program] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  // Get enforcement label
  const getEnforcementLabel = (level) => {
    if (level === 0) return 'Compliant';
    return `Level ${level}`;
  };

  // Get milestone status icon
  const getMilestoneIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-emerald-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-slate-400" />;
    }
  };

  // Program-specific content renderer
  const renderProgramContent = () => {
    switch (property.program) {
      case 'Featured Homes':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Featured Homes Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Occupancy Status</p>
                <p className="text-lg font-semibold text-slate-900">
                  {property.occupancyStatus || 'Owner-Occupied'}
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Insurance Status</p>
                <div className="flex items-center gap-2">
                  {property.insuranceStatus === 'Current' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    {property.insuranceStatus || 'Pending'}
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Hold Period Timeline</p>
                <p className="text-slate-900">
                  <span className="font-semibold">
                    {property.holdPeriodMonths || 12} months
                  </span>
                  <span className="text-slate-600 ml-2">from purchase date</span>
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Annual Certification Date
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {property.annualCertificationDate
                    ? new Date(property.annualCertificationDate).toLocaleDateString()
                    : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'Ready4Rehab':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Rehabilitation Progress
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Completion Progress</p>
                  <span className="text-lg font-semibold text-emerald-600">
                    {property.completionPercent || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${property.completionPercent || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-4">
                  Rehabilitation Milestones
                </p>
                <div className="space-y-3">
                  {['Mobilization', 'Construction', 'Completion'].map((milestone, idx) => {
                    const isCompleted = property.completionPercent >= (idx + 1) * 33;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          {milestone}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Permit Status</p>
                <div className="flex items-center gap-2">
                  {property.permitStatus === 'Approved' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm text-slate-900">
                    {property.permitStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Demolition':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Demolition Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Demolition Status</p>
                <div className="flex items-center gap-2">
                  {property.demolitionStatus === 'Completed' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-600" />
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    {property.demolitionStatus || 'Pending'}
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Certification Status
                </p>
                <div className="flex items-center gap-2">
                  {property.certificationStatus === 'Certified' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    {property.certificationStatus || 'Pending'}
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 md:col-span-2">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Local Government Sign-Off
                </p>
                <div className="flex items-center gap-2">
                  {property.localGovSignoff ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    {property.localGovSignoff ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'VIP':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              RC Timeline & Checklists
            </h3>

            {/* RC Timeline */}
            <div className="mb-8">
              <p className="text-sm font-medium text-slate-700 mb-4">
                Release Certificate Timeline
              </p>
              <div className="space-y-2 bg-slate-50 rounded-lg p-4">
                {[15, 45, 90, 180, 360].map((days, idx) => {
                  const dueDate = new Date(property.dateSold);
                  dueDate.setDate(dueDate.getDate() + days);
                  const isCompleted = property.completedRCs && property.completedRCs.includes(days);

                  return (
                    <div key={idx} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-sm font-medium text-slate-900">RC{days}</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checklists */}
            <div className="space-y-4">
              {['15 Day', '45 Day', 'Completion'].map((checklistName, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    {checklistName} Checklist
                  </p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            property.checklistItems &&
                            property.checklistItems[`${checklistName}-${item}`]
                          }
                          readOnly
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                        />
                        <span className="text-sm text-slate-700">
                          Required item {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate enforcement data
  const enforcementData = useMemo(() => {
    const overdue = property.enforcementLevel > 0 ? daysOverdue(property) : 0;
    const penalty =
      property.enforcementLevel > 0
        ? calculatePenalty(property.enforcementLevel, overdue)
        : 0;

    return { overdue, penalty };
  }, [property]);

  // Enforcement required actions
  const getEnforcementActions = (level) => {
    const actions = {
      1: [
        'Owner must respond to notice within 10 days',
        'Submit written compliance plan',
      ],
      2: [
        'Mandatory compliance conference required',
        'Post visible notice of violation',
        'Submit detailed remediation plan',
      ],
      3: [
        'Increased penalties per day of non-compliance',
        'Property may be listed as scofflaw',
        'Lien may be filed against property',
      ],
      4: [
        'Immediate demolition proceedings may begin',
        'Maximum penalties assessed',
        'Code enforcement legal action',
      ],
    };
    return actions[level] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Properties
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {property.address}
              </h1>
              <p className="text-slate-600">
                Parcel ID: <span className="font-mono">{property.parcelId}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${getProgramBadgeColor(
                  property.program
                )}`}
              >
                {property.program}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${getEnforcementBadgeColor(
                  property.enforcementLevel
                )}`}
              >
                {getEnforcementLabel(property.enforcementLevel)}
              </span>
            </div>
          </div>
          {property.completed && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">This property has been completed</span>
            </div>
          )}
        </div>

        {/* Buyer Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Buyer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Buyer Name</p>
              <p className="text-lg font-semibold text-slate-900">{property.buyer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
              <p className="text-lg font-semibold text-slate-900">
                {property.email || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Date Sold</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(property.dateSold).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Offer Type</p>
              <p className="text-lg font-semibold text-slate-900">
                {property.offerType || 'Standard'}
              </p>
            </div>
          </div>
        </div>

        {/* Program-Specific Content */}
        {renderProgramContent()}

        {/* Milestone Timeline - Feature 1.2 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Milestone Timeline
          </h2>

          {milestones.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              {/* Timeline items */}
              <div className="space-y-4">
                {milestones.map((milestone, idx) => {
                  const status = getMilestoneStatus(milestone, property);
                  return (
                    <div key={idx} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 bg-white border-4 border-slate-200 rounded-full p-1.5">
                        {getMilestoneIcon(status)}
                      </div>

                      {/* Content */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {milestone.name}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {milestone.description}
                        </p>
                        <div className="flex gap-4 text-xs text-slate-600">
                          {milestone.dueDate && (
                            <div>
                              <span className="font-medium">Due:</span>{' '}
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {milestone.completedDate && (
                            <div>
                              <span className="font-medium">Completed:</span>{' '}
                              {new Date(milestone.completedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">
              No milestones defined for this property
            </p>
          )}
        </div>

        {/* Enforcement Section - Feature 1.3 */}
        {property.enforcementLevel > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Enforcement Action
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-1">Enforcement Level</p>
                <p className="text-3xl font-bold text-red-700">
                  Level {property.enforcementLevel}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <p className="text-sm font-medium text-orange-900 mb-1">Days Overdue</p>
                <p className="text-3xl font-bold text-orange-700">
                  {enforcementData.overdue}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <p className="text-sm font-medium text-red-900 mb-1">Penalty Amount</p>
                <p className="text-3xl font-bold text-red-700">
                  ${enforcementData.penalty.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm font-semibold text-slate-900 mb-3">Required Actions:</p>
              <ul className="space-y-2">
                {getEnforcementActions(property.enforcementLevel).map(
                  (action, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Communication History */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Communication History
          </h2>

          {property.communications && property.communications.length > 0 ? (
            <div className="space-y-4">
              {property.communications
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((comm, idx) => (
                  <div key={idx} className="border-l-4 border-slate-300 pl-4 py-2">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-slate-900">{comm.subject}</p>
                      <span className="text-xs text-slate-600">
                        {new Date(comm.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{comm.type}</p>
                    <p className="text-sm text-slate-700">{comm.message}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">
              No communications recorded for this property
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
