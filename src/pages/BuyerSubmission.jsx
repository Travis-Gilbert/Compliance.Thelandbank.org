import React, { useState } from 'react';
import { Upload, FileText, Camera } from 'lucide-react';
import { FormField, TextInput, SelectInput } from '../components/ui';
import {
  BuyerHero,
  BuyerSection,
  BuyerProgressSpine,
  BuyerConfirmation,
  PhotoSlot,
  DropZone,
  FileListItem,
} from '../components/buyer';

export default function BuyerSubmission() {
  /* ── State ─────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    propertyAddress: '',
    programType: '',
    closingDate: '',
    reportingMonth: '',
    permitStatus: '',
    inspectionStatus: '',
  });

  const [photoSlots, setPhotoSlots] = useState({
    'Front Exterior': null,
    'Rear Exterior': null,
    'Kitchen': null,
    'Bathroom': null,
    'Living Area': null,
    'Bedroom': null,
    'Basement / Mechanical': null,
    'Active Work Area': null,
  });

  const [financialDocs, setFinancialDocs] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeField, setShakeField] = useState(null);

  /* ── Handlers (all logic preserved from original) ──── */

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
    if (!formData.programType) newErrors.programType = 'Program type is required';

    setErrors(newErrors);

    // Trigger shake on first error field
    const firstError = Object.keys(newErrors)[0];
    if (firstError) {
      setShakeField(firstError);
      setTimeout(() => setShakeField(null), 400);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (slot, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoSlots((prev) => ({
          ...prev,
          [slot]: { name: file.name, data: e.target.result, size: file.size },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (slot) => {
    setPhotoSlots((prev) => ({ ...prev, [slot]: null }));
  };

  const addFinancialDoc = (doc) => {
    setFinancialDocs((prev) => [...prev, doc]);
  };

  const addReceipt = (doc) => {
    setReceipts((prev) => [...prev, doc]);
  };

  const removeFinancialDoc = (index) => {
    setFinancialDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const removeReceipt = (index) => {
    setReceipts((prev) => prev.filter((_, i) => i !== index));
  };

  const generateConfirmationId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    const documents = [];
    Object.entries(photoSlots).forEach(([slot, file]) => {
      if (file) {
        documents.push({ filename: file.name, mimeType: 'image/jpeg', sizeBytes: file.size, category: 'photo', slot });
      }
    });
    financialDocs.forEach((doc) => {
      documents.push({ filename: doc.name, mimeType: 'application/octet-stream', sizeBytes: doc.size, category: 'document' });
    });
    receipts.forEach((doc) => {
      documents.push({ filename: doc.name, mimeType: 'application/octet-stream', sizeBytes: doc.size, category: 'receipt' });
    });

    let confirmationId;
    let timestamp;

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: formData.propertyAddress,
          type: 'progress',
          formData,
          documents,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        confirmationId = result.confirmationId;
        timestamp = new Date(result.timestamp).toLocaleString();
      } else {
        confirmationId = generateConfirmationId();
        timestamp = new Date().toLocaleString();
      }
    } catch {
      confirmationId = generateConfirmationId();
      timestamp = new Date().toLocaleString();
    }

    setSubmissionData({
      confirmationId,
      timestamp,
      formData,
      photoCount: Object.values(photoSlots).filter((p) => p !== null).length,
      docCount: financialDocs.length,
      receiptCount: receipts.length,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleDownloadJSON = () => {
    const data = {
      confirmationId: submissionData.confirmationId,
      timestamp: submissionData.timestamp,
      ...submissionData.formData,
      photos: Object.entries(photoSlots).reduce((acc, [key, value]) => {
        if (value) acc[key] = { name: value.name, size: value.size };
        return acc;
      }, {}),
      documents: financialDocs.map((doc) => ({ name: doc.name, size: doc.size })),
      receipts: receipts.map((r) => ({ name: r.name, size: r.size })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submission-${submissionData.confirmationId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFormData({
      firstName: '', lastName: '', email: '', propertyAddress: '',
      programType: '', closingDate: '', reportingMonth: '',
      permitStatus: '', inspectionStatus: '',
    });
    setPhotoSlots({
      'Front Exterior': null, 'Rear Exterior': null, 'Kitchen': null,
      'Bathroom': null, 'Living Area': null, 'Bedroom': null,
      'Basement / Mechanical': null, 'Active Work Area': null,
    });
    setFinancialDocs([]);
    setReceipts([]);
    setSubmitted(false);
    setSubmissionData(null);
    setErrors({});
  };

  /* ── Success screen ────────────────────────────────── */

  if (submitted && submissionData) {
    return (
      <BuyerConfirmation
        submissionData={submissionData}
        onDownload={handleDownloadJSON}
        onReset={handleReset}
      />
    );
  }

  /* ── Derived values ────────────────────────────────── */

  const photoSlotLabels = [
    'Front Exterior', 'Rear Exterior', 'Kitchen', 'Bathroom',
    'Living Area', 'Bedroom', 'Basement / Mechanical', 'Active Work Area',
  ];

  const uploadedPhotoCount = Object.values(photoSlots).filter((p) => p !== null).length;

  const fieldClass = (field) =>
    shakeField === field ? 'animate-error-shake' : '';

  /* ── Main form ─────────────────────────────────────── */

  return (
    <div className="min-h-screen app-bg">
      <BuyerHero />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex gap-10">
          {/* Progress spine (desktop) */}
          <BuyerProgressSpine />

          {/* Form content */}
          <div className="flex-grow max-w-3xl space-y-12">

            {/* ═══ Section 1: Your Information ═══ */}
            <BuyerSection
              number={1}
              title="Your Information"
              subtitle="Enter your name and contact details"
              id="buyer-info"
              stagger={0}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={fieldClass('firstName')}>
                    <FormField label="First Name" required error={errors.firstName}>
                      <TextInput
                        value={formData.firstName}
                        onChange={(v) => handleInputChange('firstName', v)}
                        placeholder="First name"
                        hasError={!!errors.firstName}
                      />
                    </FormField>
                  </div>
                  <div className={fieldClass('lastName')}>
                    <FormField label="Last Name" required error={errors.lastName}>
                      <TextInput
                        value={formData.lastName}
                        onChange={(v) => handleInputChange('lastName', v)}
                        placeholder="Last name"
                        hasError={!!errors.lastName}
                      />
                    </FormField>
                  </div>
                  <div className={fieldClass('email')}>
                    <FormField label="Email" required error={errors.email}>
                      <TextInput
                        value={formData.email}
                        onChange={(v) => handleInputChange('email', v)}
                        placeholder="email@example.com"
                        type="email"
                        hasError={!!errors.email}
                      />
                    </FormField>
                  </div>
                </div>
                <div className={fieldClass('propertyAddress')}>
                  <FormField label="Property Address" required error={errors.propertyAddress}>
                    <TextInput
                      value={formData.propertyAddress}
                      onChange={(v) => handleInputChange('propertyAddress', v)}
                      placeholder="Street address, city, state, zip"
                      hasError={!!errors.propertyAddress}
                    />
                  </FormField>
                </div>
              </div>
            </BuyerSection>

            {/* ═══ Section 2: Property Details ═══ */}
            <BuyerSection
              number={2}
              title="Property Details"
              subtitle="Program type, timeline, and project status"
              id="property-details"
              stagger={100}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={fieldClass('programType')}>
                    <FormField label="Program Type" required error={errors.programType}>
                      <SelectInput
                        value={formData.programType}
                        onChange={(v) => handleInputChange('programType', v)}
                        options={[
                          { value: '', label: 'Select program type', disabled: true, hidden: true },
                          { value: 'ready4rehab', label: 'Ready4Rehab' },
                          { value: 'featured-homes', label: 'Featured Homes' },
                          { value: 'demolition', label: 'Demolition' },
                          { value: 'vip', label: 'V.I.P.' },
                        ]}
                        hasError={!!errors.programType}
                      />
                    </FormField>
                  </div>
                  <FormField label="Reporting Month">
                    <TextInput
                      value={formData.reportingMonth}
                      onChange={(v) => handleInputChange('reportingMonth', v)}
                      placeholder="MM/YYYY"
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Closing Date">
                    <TextInput
                      value={formData.closingDate}
                      onChange={(v) => handleInputChange('closingDate', v)}
                      placeholder="MM/DD/YYYY"
                      type="date"
                    />
                  </FormField>
                  <FormField label="Permit Status">
                    <SelectInput
                      value={formData.permitStatus}
                      onChange={(v) => handleInputChange('permitStatus', v)}
                      options={[
                        { value: '', label: 'Select status' },
                        { value: 'obtained', label: 'Obtained' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'not-required', label: 'Not Required' },
                      ]}
                    />
                  </FormField>
                </div>
                <FormField label="Inspection Status">
                  <SelectInput
                    value={formData.inspectionStatus}
                    onChange={(v) => handleInputChange('inspectionStatus', v)}
                    options={[
                      { value: '', label: 'Select status' },
                      { value: 'passed', label: 'Passed' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'not-applicable', label: 'Not Applicable' },
                    ]}
                  />
                </FormField>
              </div>
            </BuyerSection>

            {/* ═══ Section 3: Progress Photos ═══ */}
            <BuyerSection
              number={3}
              title="Progress Photos"
              subtitle="Upload photos of the property — 8 required areas"
              id="progress-photos"
              stagger={200}
            >
              {/* Upload count indicator */}
              <div className="flex items-center gap-2 mb-5">
                <Camera className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">
                  <span className="font-medium text-text">{uploadedPhotoCount}</span> of 8 uploaded
                </span>
                {uploadedPhotoCount === 8 && (
                  <span className="text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-full ml-1">
                    Complete
                  </span>
                )}
              </div>

              {/* Photo grid */}
              <div className="bg-warm-100/40 rounded-xl border border-warm-200/40 p-4 sm:p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoSlotLabels.map((label) => (
                    <PhotoSlot
                      key={label}
                      label={label}
                      photo={photoSlots[label]}
                      onUpload={(file) => handlePhotoUpload(label, file)}
                      onRemove={() => removePhoto(label)}
                    />
                  ))}
                </div>
              </div>
            </BuyerSection>

            {/* ═══ Section 4: Documentation ═══ */}
            <BuyerSection
              number={4}
              title="Documentation"
              subtitle="Upload contracts, permits, receipts, and other documents"
              id="documentation"
              stagger={300}
            >
              <div className="space-y-8">
                {/* Financial docs */}
                <div>
                  <h3 className="font-heading text-sm font-semibold text-text mb-3">
                    Contracts & Permits
                  </h3>
                  <DropZone
                    icon={FileText}
                    title="Drag and drop documents here"
                    subtitle="or click to browse — PDF, JPG, PNG accepted"
                    accept="image/*,.pdf"
                    onFilesAdded={addFinancialDoc}
                  />
                  {financialDocs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {financialDocs.map((doc, index) => (
                        <FileListItem
                          key={`${doc.name}-${index}`}
                          name={doc.name}
                          size={doc.size}
                          onRemove={() => removeFinancialDoc(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Receipts */}
                <div>
                  <h3 className="font-heading text-sm font-semibold text-text mb-1">
                    Receipts & Invoices
                  </h3>
                  <p className="text-xs text-muted mb-3">Optional — upload proof of investment if available</p>
                  <DropZone
                    icon={Upload}
                    title="Drag and drop receipts here"
                    subtitle="or click to browse"
                    accept="image/*,.pdf,.csv"
                    onFilesAdded={addReceipt}
                  />
                  {receipts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {receipts.map((receipt, index) => (
                        <FileListItem
                          key={`${receipt.name}-${index}`}
                          name={receipt.name}
                          size={receipt.size}
                          onRemove={() => removeReceipt(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </BuyerSection>

            {/* ═══ Section 5: Submit ═══ */}
            <section
              id="submit"
              className="animate-fade-slide-up flex flex-col items-center pt-2 pb-4"
              style={{ animationDelay: '400ms' }}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={[
                  'inline-flex items-center justify-center gap-2',
                  'font-heading text-base font-medium text-white',
                  'bg-accent hover:bg-accent-dark',
                  'px-8 py-3 rounded-lg transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-[0.98]',
                ].join(' ')}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit Compliance Update
                  </>
                )}
              </button>
              <p className="text-xs text-muted mt-3">
                You will receive a confirmation email
              </p>
            </section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-warm-200/60 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-muted">
            Genesee County Land Bank Authority
          </p>
          <p className="text-xs text-muted">
            Flint, Michigan
          </p>
        </div>
      </footer>
    </div>
  );
}
