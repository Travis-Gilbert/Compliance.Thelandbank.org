/**
 * Formal icon system for the GCLBA Compliance Portal.
 *
 * Three semantic groups: navigation, status, and actions.
 * Import from this file for typed access; the existing iconMap.js
 * remains the runtime default used by <AppIcon />.
 */

import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Settings,
  Mail,
  FileText,
  Home,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Send,
  Copy,
  Download,
  Eye,
} from 'lucide-react';

/* ── Navigation icons ──────────────────────────────────── */
export const NAV_ICONS = {
  dashboard:     LayoutDashboard,
  properties:    Building2,
  milestones:    CalendarClock,
  compliance:    ClipboardCheck,
  communication: MessageSquare,
  reports:       BarChart3,
  settings:      Settings,
  batchEmail:    Mail,
  templates:     FileText,
  buyerPortal:   ExternalLink,
};

/* ── Status icons ──────────────────────────────────────── */
export const STATUS_ICONS = {
  compliant:      CheckCircle2,
  needsAttention: AlertTriangle,
  atRisk:         XCircle,
};

/* ── Action icons ──────────────────────────────────────── */
export const ACTION_ICONS = {
  upload:    Upload,
  document:  FileText,
  checklist: ClipboardCheck,
  search:    Search,
  send:      Send,
  copy:      Copy,
  download:  Download,
  preview:   Eye,
};
