import React, { useState, useRef } from 'react';
import {
  DEFAULT_TEMPLATES,
  ACTION_LABELS,
  TEMPLATE_VARIABLES,
  generateTemplateId,
} from '../data/emailTemplates';
import { ALL_PROGRAM_KEYS, toDisplayName } from '../lib/programTypeMapper';
import { Card, StatusPill, TextInput, SelectInput, FormField, AppIcon, AdminPageHeader } from '../components/ui';
import ICONS from '../icons/iconMap';
import { FileText } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function TemplateManager() {
  usePageTitle('Templates');
  // State management
  const [templates, setTemplates] = useState(() =>
    DEFAULT_TEMPLATES.map((t) => ({ ...t, variants: { ...t.variants } }))
  );
  const [selectedId, setSelectedId] = useState(templates[0]?.id || null);
  const [activeVariant, setActiveVariant] = useState('ATTEMPT_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('');

  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'editor'
  const textareaRef = useRef(null);

  // Get currently selected template
  const selectedTemplate = templates.find((t) => t.id === selectedId);

  // Filter templates by search and program
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.programTypes.some((p) =>
        toDisplayName(p).toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesProgram =
      !filterProgram || template.programTypes.includes(filterProgram);

    return matchesSearch && matchesProgram;
  });

  // Update template name
  const updateTemplateName = (newName) => {
    setTemplates(
      templates.map((t) =>
        t.id === selectedId ? { ...t, name: newName } : t
      )
    );
  };

  // Toggle program type
  const toggleProgramType = (program) => {
    setTemplates(
      templates.map((t) => {
        if (t.id === selectedId) {
          const programTypes = t.programTypes.includes(program)
            ? t.programTypes.filter((p) => p !== program)
            : [...t.programTypes, program];
          return { ...t, programTypes };
        }
        return t;
      })
    );
  };

  // Update variant subject or body
  const updateVariant = (field, value) => {
    setTemplates(
      templates.map((t) => {
        if (t.id === selectedId) {
          return {
            ...t,
            variants: {
              ...t.variants,
              [activeVariant]: {
                ...t.variants[activeVariant],
                [field]: value,
              },
            },
          };
        }
        return t;
      })
    );
  };

  // Insert variable at cursor position in textarea
  const insertVariable = (variable) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + variable + text.substring(end);

    updateVariant('body', newText);

    // Reset cursor position after update
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  // Create new template
  const addTemplate = () => {
    const newTemplate = {
      id: generateTemplateId(),
      name: 'New Template',
      programTypes: [],
      variants: {
        ATTEMPT_1: { subject: '', body: '' },
        ATTEMPT_2: { subject: '', body: '' },
        WARNING: { subject: '', body: '' },
        DEFAULT_NOTICE: { subject: '', body: '' },
      },
    };

    setTemplates([...templates, newTemplate]);
    setSelectedId(newTemplate.id);
    setActiveVariant('ATTEMPT_1');
  };

  // Delete template
  const deleteTemplate = () => {
    if (templates.length === 1) {
      alert('Cannot delete the last template');
      return;
    }

    if (window.confirm('Are you sure you want to delete this template?')) {
      const filtered = templates.filter((t) => t.id !== selectedId);
      setTemplates(filtered);
      setSelectedId(filtered[0]?.id || null);
    }
  };

  // Render template preview with sample data
  const renderPreview = (variant) => {
    if (!variant) return null;

    const sampleData = {
      BuyerName: 'John Smith',
      PropertyAddress: '123 Main St, Springfield, IL',
      DueDate: 'March 15, 2024',
      DaysOverdue: '5',
      ProgramType: 'Featured Homes',
      BuyerEmail: 'john@example.com',
    };

    let renderedBody = variant.body;
    TEMPLATE_VARIABLES.forEach((variable) => {
      const key = variable.slice(1, -1); // Remove { }
      const value = sampleData[key] || variable;
      renderedBody = renderedBody.replace(new RegExp(variable, 'g'), value);
    });

    let renderedSubject = variant.subject;
    TEMPLATE_VARIABLES.forEach((variable) => {
      const key = variable.slice(1, -1);
      const value = sampleData[key] || variable;
      renderedSubject = renderedSubject.replace(new RegExp(variable, 'g'), value);
    });

    return { subject: renderedSubject, body: renderedBody };
  };

  const preview = renderPreview(selectedTemplate?.variants[activeVariant]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        icon={FileText}
        title="Email Templates"
        subtitle="Manage compliance email templates and variants"
      />

      {/* Mobile Tab Switcher */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-lg w-fit lg:hidden animate-fade-slide-up admin-stagger-2">
        <button
          onClick={() => setMobileTab('list')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mobileTab === 'list' ? 'bg-white text-text shadow-sm font-heading' : 'text-muted hover:text-text'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mobileTab === 'editor' ? 'bg-white text-text shadow-sm font-heading' : 'text-muted hover:text-text'
          }`}
        >
          Editor
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-150px)] animate-fade-slide-up admin-stagger-2">
        {/* Left Panel: Template List */}
        <Card className={`w-full lg:w-80 flex flex-col overflow-hidden ${mobileTab !== 'list' ? 'hidden lg:flex' : ''}`}>
          <div className="p-4 border-b border-border">
            <TextInput
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={ICONS.search}
            />
          </div>

          <div className="p-4 border-b border-border">
            <SelectInput
              label="Filter by Program"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              options={[
                { value: '', label: 'All Programs' },
                ...ALL_PROGRAM_KEYS.map((key) => ({
                  value: key,
                  label: toDisplayName(key),
                })),
              ]}
            />
          </div>

          {/* Template List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedId(template.id);
                    setActiveVariant('ATTEMPT_1');
                    setMobileTab('editor');
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedId === template.id
                      ? 'bg-warm-100 border-l-3 border-accent'
                      : 'hover:bg-warm-100/50'
                  }`}
                >
                  <h3 className="font-heading font-medium text-text mb-2">{template.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.programTypes.map((prog) => (
                      <StatusPill
                        key={prog}
                        label={toDisplayName(prog)}
                        variant="default"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Template Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={addTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors font-medium"
            >
              <AppIcon icon={ICONS.plus} size={18} />
              Add Template
            </button>
          </div>
        </Card>

        {/* Right Panel: Template Editor */}
        {selectedTemplate ? (
          <Card className={`flex-1 flex flex-col overflow-hidden p-4 sm:p-6 ${mobileTab !== 'editor' ? 'hidden lg:flex' : ''}`}>
            {/* Template Name */}
            <div className="mb-6">
              <FormField label="Template Name" required>
                <TextInput
                  value={selectedTemplate.name}
                  onChange={(e) => updateTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </FormField>
            </div>

            {/* Program Types */}
            <div className="mb-6">
              <FormField label="Program Types" required>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ALL_PROGRAM_KEYS.map((program) => (
                    <label
                      key={program}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-surface-alt transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTemplate.programTypes.includes(
                          program
                        )}
                        onChange={() => toggleProgramType(program)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-text">{toDisplayName(program)}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Variant Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 border-b border-border overflow-x-auto scrollbar-thin">
                {Object.keys(ACTION_LABELS).map((action) => (
                  <button
                    key={action}
                    onClick={() => setActiveVariant(action)}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                      activeVariant === action
                        ? 'font-heading text-accent border-accent'
                        : 'text-muted border-transparent hover:text-text'
                    }`}
                  >
                    {ACTION_LABELS[action]}
                  </button>
                ))}
              </div>
            </div>

            {/* Variant Editor */}
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="mb-6">
                <FormField label="Subject Line" required>
                  <TextInput
                    value={selectedTemplate.variants[activeVariant]?.subject || ''}
                    onChange={(e) => updateVariant('subject', e.target.value)}
                    placeholder="Email subject line"
                  />
                </FormField>
              </div>

              {/* Variable Insertion Toolbar */}
              <div className="mb-4">
                <p className="text-sm font-heading font-medium text-text mb-2">
                  Insert Variables
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      onClick={() => insertVariable(variable)}
                      className="px-3 py-1.5 min-h-[36px] text-xs bg-warm-100 border border-warm-200 rounded-md text-text hover:bg-accent hover:text-white hover:border-accent transition-colors font-mono"
                      title={`Insert ${variable}`}
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Editor */}
              <div className="mb-6">
                <FormField label="Email Body" required>
                  <textarea
                    ref={textareaRef}
                    value={selectedTemplate.variants[activeVariant]?.body || ''}
                    onChange={(e) => updateVariant('body', e.target.value)}
                    placeholder="Email body content"
                    rows={8}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </FormField>
              </div>

              {/* Preview Section */}
              <div className="mb-6">
                <h3 className="text-sm font-heading font-medium text-text mb-3">Preview</h3>
                <div className="bg-warm-100 border border-warm-200 rounded-lg p-4">
                  <div className="mb-4">
                    <p className="text-xs text-muted mb-1">Subject:</p>
                    <p className="text-sm text-text font-medium">
                      {preview?.subject || '(No subject)'}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted mb-2">Body:</p>
                    <div className="text-sm text-text whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                      {preview?.body || '(No body)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end">
                <button
                  onClick={deleteTemplate}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium text-sm"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className={`flex-1 flex items-center justify-center ${mobileTab !== 'editor' ? 'hidden lg:flex' : ''}`}>
            <div className="text-center">
              <AppIcon
                icon={ICONS.file}
                size={48}
                className="text-muted mx-auto mb-4 opacity-50"
              />
              <p className="font-heading text-muted text-lg">No templates found</p>
              <p className="text-muted text-sm mt-1">
                Create a new template to get started
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
