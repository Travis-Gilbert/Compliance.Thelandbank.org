import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import AnimatedCheck from './AnimatedCheck';
import BuyerHero from './BuyerHero';

export default function BuyerConfirmation({ submissionData, onDownload, onReset }) {
  const { confirmationId, timestamp, formData, photoCount, docCount, receiptCount } = submissionData;

  const summaryRows = [
    { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
    { label: 'Email', value: formData.email },
    { label: 'Property', value: formData.propertyAddress },
    { label: 'Program', value: formData.programType },
    { label: 'Photos uploaded', value: photoCount },
    { label: 'Documents', value: docCount },
    { label: 'Receipts', value: receiptCount },
  ];

  return (
    <div className="min-h-screen app-bg">
      <BuyerHero />

      <main className="max-w-2xl mx-auto px-6 py-12 animate-fade-slide-up">
        {/* Success icon + headline */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center text-accent mb-4">
            <AnimatedCheck size={72} />
          </div>
          <h2 className="font-heading text-[28px] font-bold text-text mb-2">
            Submission Received
          </h2>
          <p className="text-muted">
            Your compliance update has been recorded.
          </p>
        </div>

        {/* Confirmation ID panel */}
        <div className="bg-warm-100 rounded-xl px-6 py-5 text-center mb-8 border border-warm-200/60">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Confirmation ID</p>
          <p className="font-mono text-xl font-bold text-text tracking-wide">{confirmationId}</p>
          <p className="text-xs text-muted mt-2">{timestamp}</p>
        </div>

        {/* Summary table */}
        <div className="mb-10">
          <h3 className="font-heading text-base font-semibold text-text mb-4">Submission Summary</h3>
          <div className="divide-y divide-warm-200/60">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between py-3">
                <span className="text-sm text-muted">{row.label}</span>
                <span className="text-sm font-medium text-text text-right ml-4">{row.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-accent-blue border-2 border-accent-blue rounded-lg hover:bg-accent-blue-light transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download JSON
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-lg transition-colors"
          >
            Submit Another
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
