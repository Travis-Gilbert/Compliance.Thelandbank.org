# GCLBA Compliance Portal — Feature Enhancement Recommendations

**Prepared for:** Genesee County Land Bank Authority — Compliance & Development Team
**Date:** February 9, 2026
**Reference Document:** GCLB\_Compliance\_Program.md (v1.0, February 2026)
**Current Portal:** compliance-thelandbank-org.vercel.app (Vite + Tailwind, FileMaker JSON integration)

---

## Executive Summary

The current compliance portal provides a solid foundation — it accepts user-entered data and converts it to JSON for FileMaker integration. This document identifies **28 feature enhancements** organized into six strategic pillars that would transform the portal from a data-entry tool into a full compliance management system. Each recommendation maps directly to specific sections of the GCLB Compliance Program spec, ensuring every feature serves a documented operational need.

The recommendations are prioritized by impact and implementation complexity. The highest-priority items address the most labor-intensive parts of the compliance workflow: milestone tracking, automated notifications, and inspection management.

---

## Current State Assessment

**What the portal does today:**
- Accepts compliance-related data entry from staff
- Converts form input to JSON format
- Pushes structured data to FileMaker database
- Hosted on Vercel with serverless API endpoints

**What the compliance program requires (per GCLB\_Compliance\_Program.md):**
- Tracking across 3 distinct programs with different timelines and requirements
- A graduated 4-level enforcement system with specific deadlines
- 6+ inspection types with standardized protocols
- Monthly, quarterly, and annual reporting cycles
- Buyer self-reporting with photo documentation
- Financial penalty calculation and tracking
- Extension and hardship request processing
- Document retention spanning 5–7+ years

**The gap:** The program spec describes a complex, multi-stakeholder system with dozens of moving deadlines per property. The current portal handles data entry but doesn't yet automate the workflow logic, notifications, or reporting described in the spec.

---

## Pillar 1: Program-Specific Compliance Tracking

These features directly implement the core tracking system described in **Sections 3 and 4** of the compliance program.

### 1.1 — Program-Aware Property Dashboard

**Spec Reference:** Section 3.1–3.3 (Compliance Requirements by Program)

Each property sold through GCLBA falls into one of three programs — Featured Homes, R4R, or VIP — and each has fundamentally different compliance requirements. The portal should present a property-level dashboard that dynamically displays the correct requirements, milestones, and timelines based on the property's program type.

**What this looks like:**
- When a staff member pulls up a property, they immediately see which program it belongs to and the applicable compliance path
- Featured Homes shows occupancy deadlines (90-day move-in, 3-year minimum), maintenance standards, and resale restrictions
- R4R shows the full rehabilitation timeline with Mobilization → Construction → Completion phases and percentage-based milestones
- VIP shows use requirements and the 6-month integration or 12–24 month development timeline

**Why it matters:** Right now, staff have to mentally map which requirements apply to which property. This eliminates that cognitive load and reduces the risk of applying the wrong program's rules.

### 1.2 — Automated Milestone Calculator

**Spec Reference:** Section 4.1 (Compliance Calendar)

The compliance program defines a precise calendar of milestones anchored to each property's closing date: insurance due at day 30, occupancy at day 90, progress inspections at specific intervals, annual certifications at 12 months, and so on. The portal should automatically generate the full milestone schedule the moment a closing date is entered.

**What this looks like:**
- Staff enters closing date → system generates every milestone with exact due dates
- R4R properties get the full 12-month rehabilitation schedule broken into Mobilization (months 1–3), Construction (months 4–8), and Completion (months 9–12)
- Each milestone gets a status: upcoming, due soon, completed, overdue
- A timeline visualization shows where the property stands in its compliance lifecycle

### 1.3 — Enforcement Level Tracker

**Spec Reference:** Section 6.1 (Graduated Enforcement Approach)

The program defines four enforcement levels based on how far past a deadline a buyer is: Level 1 (0–30 days, notice + technical assistance), Level 2 (31–60 days, formal warning), Level 3 (61–90 days, default notice), Level 4 (91+ days, legal remedies). The portal should automatically track which level each non-compliant property is at and what actions are required.

**What this looks like:**
- When a milestone goes overdue, the system starts counting days
- At each threshold (30, 60, 90 days), the enforcement level automatically escalates
- Staff see a clear indicator: green (compliant), yellow (Level 1–2), red (Level 3–4)
- Each level displays the required actions from the spec (e.g., Level 2 requires a formal warning letter + mandatory meeting + corrective action plan)
- Properties approaching the next escalation threshold get flagged proactively

### 1.4 — Financial Penalty Calculator

**Spec Reference:** Section 6.2 (Financial Penalties)

The program has a specific penalty schedule: $50/day for days 31–60 past deadline, $100/day for days 61–90, $200/day for 91+, with a $10,000 cap before legal remedies. Occupancy violations escalate from warning → $500 → default proceedings. Maintenance violations range from $250 to $1,000. The portal should calculate these automatically.

**What this looks like:**
- Running penalty total displayed on each non-compliant property
- Daily accrual tracked with clear breakdowns by penalty tier
- Automatic cap enforcement at $10,000
- Separate tracking for occupancy violations (1st, 2nd, 3rd) and maintenance violations (minor, moderate, severe)
- Exportable penalty summaries for legal action preparation

---

## Pillar 2: Buyer-Facing Self-Service

These features implement the buyer communication and self-reporting systems described in **Sections 4.2, 5.3, and 7.2**.

### 2.1 — Buyer Portal with Authenticated Access

**Spec Reference:** Section 5.3 (Self-Reporting Requirements), Section 7.2 (Buyer Documentation Requirements)

The compliance program requires buyers to submit monthly progress reports (R4R), annual certifications, insurance proof, and photo documentation. Right now, this likely happens via email or paper. A buyer-facing portal would give each buyer a secure login to view their obligations and submit required materials.

**What this looks like:**
- Each buyer gets a unique login tied to their property/properties
- Their dashboard shows upcoming deadlines, completed milestones, and any outstanding items
- Clear status indicators for each requirement (submitted, under review, approved, overdue)
- Mobile-responsive design — buyers working on rehab projects are on-site, not at a desk

**DLBA Precedent:** The Detroit Land Bank's compliance portal (referenced in your PDF materials) already implements a version of this with "update reporting links" for progress photo uploads every 45 days. GCLBA can build on this model.

### 2.2 — Photo Upload and Progress Reporting

**Spec Reference:** Section 5.3 (Monthly Progress Reports for R4R)

The spec requires R4R buyers to submit monthly reports including: work completed to date, upcoming work planned, budget expenditures, photos of progress, and anticipated challenges. The portal should provide a structured form for this.

**What this looks like:**
- Monthly report form with fields matching the spec exactly (work completed, upcoming, budget, challenges)
- Photo upload with tagging by room/area and milestone phase
- Side-by-side comparison: initial inspection photos vs. current progress photos
- Draft/save capability so buyers can work on reports incrementally
- Submission confirmation with receipt number

### 2.3 — Document Upload Center

**Spec Reference:** Section 7.2 (Required Documents by Milestone)

The program requires specific documents at each stage: insurance binder at closing, building permits during mobilization, contractor agreements, change orders, Certificate of Occupancy at completion, contractor lien waivers, and annual insurance renewals. The portal should provide organized upload slots for each required document.

**What this looks like:**
- Document checklist organized by milestone phase (At Closing → During Rehab → At Completion → Ongoing)
- Each document type has a dedicated upload slot with status tracking
- Auto-reminders when a document deadline approaches
- Version history so updated documents don't overwrite originals
- Retention tagging aligned with Section 7.3 (purchase agreements permanent, inspections 7 years, correspondence 5 years, etc.)

### 2.4 — Extension Request Submission

**Spec Reference:** Section 6.3 (Extension and Hardship Provisions)

The program allows extensions under qualifying circumstances (financial hardship, unforeseen conditions, contractor failure, natural disaster, illness). Requests must include documentation, a revised timeline, and be submitted 30 days before the deadline. The portal should digitize this workflow.

**What this looks like:**
- Online extension request form with dropdown for qualifying circumstance type
- Required documentation upload
- Revised timeline proposal builder
- Automatic routing to GCLBA for review
- 15-day review clock starts on submission (per spec)
- Extension limits enforced by system (R4R: max one 6-month extension; Featured Homes: max one 60-day extension)

---

## Pillar 3: Inspection Management

These features implement the inspection system described in **Section 5**.

### 3.1 — Digital Inspection Checklists

**Spec Reference:** Section 5.2 (Inspection Protocol), plus the Property Walkthrough Guide PDF

The compliance program defines a detailed inspection protocol — 7-day advance notice, standardized checklists, photo documentation, immediate feedback, and written reports within 10 business days. Your Property Walkthrough Guide PDF provides granular checklists covering exterior elements (chimneys, roofs, walls, porches, gutters), interior elements (floors, walls, ceilings, fixtures), kitchen/bathroom, and basement systems. The portal should digitize all of this.

**What this looks like:**
- Tablet/mobile-friendly inspection interface for field use
- Checklists organized by area matching the walkthrough guide (Exterior → Interior → Kitchen/Bath → Basement)
- Each item has pass/fail/NA options with notes field
- Photo capture integrated directly into each checklist item
- Cost estimate fields for deficiencies (using the $3–$13/sq ft repair ranges from the walkthrough guide)
- Permit-required and complexity indicators from the walkthrough guide's icon system
- Auto-generated inspection report once checklist is complete

### 3.2 — Inspection Scheduling and Routing

**Spec Reference:** Section 5.1 (Inspection Schedule)

The program defines 6 inspection types for R4R (initial, 25%, 50%, 75%, final, 1-year post) and 3+ for Featured Homes/VIP (6-month, annual years 1–3, complaint-triggered). The portal should automatically schedule these and manage inspector assignments.

**What this looks like:**
- Auto-generated inspection schedule based on program type and closing date
- Calendar view showing upcoming inspections across all properties
- Inspector assignment with workload balancing
- 7-day notice auto-generated and sent to property owner (per spec)
- Rescheduling workflow if owner is unavailable
- Complaint-triggered inspection creation for ad hoc needs

### 3.3 — Inspection Report Generation

**Spec Reference:** Section 5.2 (Post-Inspection)

The spec requires written inspection reports within 10 business days, including compliance status determination and corrective action plans. The portal should auto-generate these from the digital checklist data.

**What this looks like:**
- One-click report generation from completed inspection checklist
- Auto-populated with property details, inspector name, date, photos, findings
- Compliance status recommendation (compliant, minor issues, major issues, non-compliant)
- Corrective action plan template auto-filled with deficiencies found
- Follow-up inspection auto-scheduled if corrective actions required
- PDF export for formal records and buyer communication

---

## Pillar 4: Automated Communications

These features implement the notification and communication systems described in **Sections 4.2 and 6.1**.

### 4.1 — Proactive Milestone Reminders

**Spec Reference:** Section 4.2 (Buyer Notification System)

The spec explicitly calls for: 30-day advance notice before major milestones, email and mail notifications 30 days before due dates, follow-up contact if milestones not met, and technical assistance offers for challenged buyers. The portal should automate all of this.

**What this looks like:**
- Automated email reminders at 30 days, 14 days, and 7 days before each milestone
- SMS option for critical deadlines (occupancy, completion, insurance renewal)
- Reminders include specific instructions on what's needed and links to the buyer portal
- If a milestone passes without completion, automatic follow-up sequence begins
- Technical assistance resources included in reminder communications
- Communication log maintained per property for compliance documentation

### 4.2 — Enforcement Letter Generation

**Spec Reference:** Section 6.1 (Graduated Enforcement Levels 1–4)

Each enforcement level requires specific written communications: Level 1 notice of non-compliance, Level 2 formal warning letter, Level 3 default notice, Level 4 legal remedies notification. The portal should auto-generate these from templates.

**What this looks like:**
- Letter templates for each enforcement level, pre-populated with property details, deadline specifics, days overdue, and required buyer response
- Customizable sections for case-specific notes
- Approval workflow (staff drafts → manager reviews → letter sent)
- Delivery tracking (sent date, delivery confirmation)
- Buyer response deadline calculation and tracking
- Automatic escalation to next level if cure period expires without resolution

### 4.3 — Quarterly Newsletter and Resource Distribution

**Spec Reference:** Section 4.2 (Quarterly newsletters with compliance tips and resources)

The spec mentions quarterly newsletters with compliance tips and a resource directory for contractors, financing, and technical assistance. The portal could automate distribution of these.

**What this looks like:**
- Newsletter template system with compliance tips, seasonal reminders, and resource updates
- Targeted distribution based on program type and compliance phase
- Resource directory maintained in the portal (approved contractors, lending partners, technical assistance providers — per Appendix D)
- Engagement tracking (opens, clicks) to identify disengaged buyers who may need proactive outreach

---

## Pillar 5: Reporting and Analytics

These features implement the internal reporting requirements from **Section 7.1**.

### 5.1 — Monthly Compliance Dashboard

**Spec Reference:** Section 7.1 (Monthly Compliance Dashboard)

The spec explicitly defines what this dashboard should show: active compliance cases by program, properties meeting milestones, properties in cure periods, properties in default, and extension requests pending. The portal should deliver this as a real-time dashboard.

**What this looks like:**
- Real-time counts for each metric the spec requires
- Filterable by program type (Featured Homes, R4R, VIP), time period, and geographic area
- Trend indicators (improving/declining compliance rates)
- Drill-down capability from dashboard metric to individual properties
- Alert flags for properties approaching enforcement escalation thresholds
- Exportable for board presentations

### 5.2 — Quarterly and Annual Report Auto-Generation

**Spec Reference:** Section 7.1 (Quarterly Compliance Report, Annual Compliance Review)

The spec defines quarterly reports (program-level compliance rates, enforcement actions summary, success stories, challenges, resource needs) and annual reviews (overall effectiveness, policy recommendations, resource allocation, stakeholder feedback). The portal should auto-generate these from tracked data.

**What this looks like:**
- One-click quarterly report generation pulling live data
- Pre-formatted sections matching the spec's requirements
- Charts and visualizations for compliance rates and trends
- Narrative sections with auto-suggested content based on data (e.g., "R4R compliance rate improved 12% this quarter, driven by increased technical assistance referrals")
- Year-over-year comparisons for annual reviews
- Board-ready formatting

### 5.3 — Predictive Risk Scoring

**Spec Reference:** Inferred from Sections 6 and 8 (Enforcement and Resources)

This goes beyond what's in the spec, but it's a natural extension. By analyzing patterns in the data — which buyers fall behind, at what stage, and why — the portal could identify at-risk properties early and trigger proactive intervention.

**What this looks like:**
- Risk score (1–10) for each active compliance case based on factors like: days since last progress report, inspection results, communication responsiveness, program type, buyer type
- High-risk properties flagged for proactive outreach before they become enforcement cases
- Pattern analysis: "R4R buyers without contractor agreements by day 60 are 3x more likely to miss the 12-month deadline"
- Resource allocation optimization: where should technical assistance be focused for maximum impact?

### 5.4 — Geographic Compliance Map

**Spec Reference:** Supports Section 7.1 (Challenges and trends analysis)

A map-based view of all properties in the compliance pipeline, color-coded by status. This would give leadership an instant visual of where compliance is strong, where it's struggling, and whether there are neighborhood-level patterns.

**What this looks like:**
- Interactive map with property pins colored by compliance status (green/yellow/red)
- Filter by program type, enforcement level, or date range
- Cluster analysis showing neighborhood-level compliance patterns
- Integration with Flint Property Portal data if available
- Useful for board presentations and community stakeholder meetings

---

## Pillar 6: System Integration and Operations

These features strengthen the portal's technical foundation and integration with existing systems.

### 6.1 — Bidirectional FileMaker Sync

**Current State:** The portal converts data to JSON for FileMaker. But if FileMaker data changes (e.g., a closing date is updated), the portal doesn't know.

**Enhancement:** True two-way sync so the portal always reflects current FileMaker data and vice versa. This prevents the two systems from drifting apart and eliminates double data entry.

### 6.2 — Document Retention Engine

**Spec Reference:** Section 7.3 (Record Retention)

The spec defines specific retention periods: purchase agreements permanent, compliance inspections 7 years, correspondence 5 years, photos 5 years, financial records 7 years, legal actions permanent. The portal should enforce these automatically.

**What this looks like:**
- Every document tagged with retention category and expiration date
- Automated retention holds for legal action properties (permanent)
- Alerts when retention periods are approaching expiration
- Audit trail for any document access or deletion
- Compliance with Michigan public records requirements

### 6.3 — Role-Based Access Control

**Why this matters:** Different users need different access levels. Compliance officers need full access, inspectors need field tools, buyers need their own properties only, board members need reporting views, and legal counsel needs enforcement case files. **Note:** This feature is a prerequisite for the buyer portal (Feature 2.1) — it must be in place before any external-facing access goes live.

**What this looks like:**
- Staff roles: Admin, Compliance Officer, Inspector, Legal
- Buyer role: Can only see own properties, submit reports, upload documents
- Board role: Read-only access to dashboards and reports
- Full audit trail: every login, view, edit, and document access logged with timestamp and user ID
- Audit logs retained per Section 7.3 retention schedule and available for federal funding audits

### 6.4 — Federal Compliance Layer

**Spec Reference:** Derived from web research on GCLBA's federal funding obligations

GCLBA receives ARPA funding ($16M from City of Flint, $8M from Genesee County), operates under HUD requirements (Section 3, Fair Housing, CDBG), and must comply with Davis-Bacon Act on construction projects. The portal could include compliance tracking for these obligations alongside property-level compliance.

**What this looks like:**
- Section 3 labor hour tracking for applicable projects (25% benchmark)
- Fair Housing compliance documentation per property sale
- Davis-Bacon prevailing wage verification for contractor work
- ARPA reporting data collection for federal audit readiness
- MBE/WBE/DBE participation tracking for procurement compliance

### 6.5 — Buyer Education Tracking

**Spec Reference:** Section 8.3 (Educational Resources)

The program requires buyer orientation for all buyers, homeownership education for owner-occupants, and landlord training for investors. Optional workshops cover maintenance, project management, contractor management, and energy efficiency. The portal should track participation.

**What this looks like:**
- Required education checklist per buyer type
- Workshop registration and attendance tracking
- Completion certificates tracked in buyer profile
- Integration with the DLBA model: the Buy Back program requires four specific workshops during the compliance period (money management, home improvement, foreclosure prevention, debt reduction)

---

## Implementation Priority Matrix

### Tier 1 — High Impact, Foundation (Build First)

| \\# | Feature                          | Spec Section | Why First                             |
| --- | -------------------------------- | ------------ | ------------------------------------- |
| 1.1 | Program-Aware Property Dashboard | §3.1–3.3     | Everything else depends on this       |
| 1.2 | Automated Milestone Calculator   | §4.1         | Eliminates the most manual work       |
| 1.3 | Enforcement Level Tracker        | §6.1         | Prevents enforcement errors           |
| 4.1 | Proactive Milestone Reminders    | §4.2         | Reduces non-compliance proactively    |
| 5.1 | Monthly Compliance Dashboard     | §7.1         | Gives leadership immediate visibility |

### Tier 2 — High Impact, Buyer Experience (Build Next)

| \\# | Feature                           | Spec Section | Why Next                            |
| --- | --------------------------------- | ------------ | ----------------------------------- |
| 2.1 | Buyer Portal                      | §5.3, §7.2   | Reduces staff workload dramatically |
| 2.2 | Photo Upload / Progress Reporting | §5.3         | Most common buyer interaction       |
| 2.3 | Document Upload Center            | §7.2         | Eliminates paper/email chasing      |
| 4.2 | Enforcement Letter Generation     | §6.1         | Standardizes enforcement actions    |
| 1.4 | Financial Penalty Calculator      | §6.2         | Automates complex calculations      |

### Tier 3 — Operational Efficiency (Build After)

| \\# | Feature                       | Spec Section   | Why After                            |
| --- | ----------------------------- | -------------- | ------------------------------------ |
| 3.1 | Digital Inspection Checklists | §5.2           | High value but needs field testing   |
| 3.2 | Inspection Scheduling         | §5.1           | Depends on property dashboard        |
| 3.3 | Inspection Report Generation  | §5.2           | Depends on digital checklists        |
| 2.4 | Extension Request Submission  | §6.3           | Lower volume, but important workflow |
| 6.1 | Bidirectional FileMaker Sync  | Infrastructure | Prevents data drift                  |

### Tier 4 — Strategic Advantage (Build When Ready)

| \\# | Feature                            | Spec Section | Why Later                                     |
| --- | ---------------------------------- | ------------ | --------------------------------------------- |
| 5.2 | Quarterly/Annual Report Generation | §7.1         | Needs data history first                      |
| 5.3 | Predictive Risk Scoring            | Inferred     | Needs data volume for accuracy                |
| 5.4 | Geographic Compliance Map          | §7.1         | High presentation value                       |
| 6.2 | Document Retention Engine          | §7.3         | Important but not urgent                      |
| 6.3 | Role-Based Access Control          | Operations   | Must ship before buyer portal (2.1) goes live |
| 6.4 | Federal Compliance Layer           | Federal reqs | Separate from property compliance             |
| 6.5 | Buyer Education Tracking           | §8.3         | Supplements core compliance                   |
| 4.3 | Quarterly Newsletter System        | §4.2         | Nice-to-have communication tool               |

---

## Competitive Benchmark: Detroit Land Bank Authority

Your reference PDFs from the DLBA provide a useful comparison point. Here's what DLBA does that GCLBA's portal could adopt or improve upon:

**DLBA has:**
- A compliance team that contacts buyers after closing and assigns a dedicated representative
- 45-day photo reporting cycles via web links
- A "release of interest" system where deed restrictions are lifted upon compliance completion
- Structured workshops during the compliance period
- Clear "what happens after closing" buyer communication

**Where GCLBA can go further:**
- DLBA's system appears to be relatively basic (web links for photo uploads). GCLBA's portal can be a full workflow management system.
- GCLBA's spec is more sophisticated — graduated enforcement with specific penalty schedules, extension provisions, and multiple program types. The portal should reflect that sophistication.
- The walkthrough guide from DLBA is excellent. Digitizing it into the inspection system would be a major upgrade over paper-based processes.

---

## Closing Note

Every feature in this document maps to either a specific requirement in the GCLB\_Compliance\_Program.md, a pattern from the DLBA reference materials, or a federal/state compliance obligation that GCLBA operates under. The goal is to turn the compliance program spec from a policy document into a living, operational system.

The current portal's architecture (Vite + Tailwind + Vercel + serverless functions) is well-suited for all of these enhancements. The FileMaker JSON integration provides the data backbone. What's needed is building out the workflow logic, the buyer-facing layer, and the reporting that the compliance program already calls for.

---

*Prepared by Travis Gilbert — February 2026*
