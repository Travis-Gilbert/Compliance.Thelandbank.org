# FileMaker ↔ Portal: Compatibility Fix Tasks

**Purpose:** Step-by-step instructions for Claude Code to resolve all gaps between the GCLBA FileMaker Pro database and the Compliance Portal.  
**Source:** Full codebase review + FM PARC-Form screenshots + Compliance SOP screenshots (CP layout, Featured/R4R/Demo/VIP tabs) + FileMaker Color Coding Guide + 2023 Foreclosure CSV + Lucille's email.  
**Date:** 2026-02-12

---

## Context for Claude Code

The portal lives at `https://github.com/Travisfromyoutube/Compliance.Thelandbank.org.git`. Tech stack: React + Vite + Tailwind CSS + Prisma (PostgreSQL/Neon) + Vercel Serverless. The entry point is `src/main.jsx`. State management is in `src/context/PropertyContext.jsx`. The FileMaker field mapping is the single source of truth at `src/config/filemakerFieldMap.js`. The Prisma schema is at `prisma/schema.prisma`.

FileMaker is the system of record. The portal reads from and writes back to it. FM's primary layout is `PARC - Form` (30,061 records). Compliance fields live on the `CP` layout, which has tabs: Featured, R4R, VIP, Demo, Comm/Ind, Vac. Land, Quiet Title. VIP has its own dedicated compliance layout with RC dates and checklists.

**Key principle:** All changes to the field map, schema, and UI must maintain backward compatibility with existing mock data and API responses. New fields should be optional (nullable) in the schema.

---

## TASK 1: Confirm TBD Field Names from CP Layout Screenshots

The SOP screenshots reveal the actual FM field names for fields previously marked `TBD_*`. Update `src/config/filemakerFieldMap.js` to replace TBD placeholders with confirmed names.

### File: `src/config/filemakerFieldMap.js`

Replace these entries in `PROPERTY_FIELD_MAP`:

```javascript
// ── BEFORE (TBD placeholders) ──
dateProofOfInvestProvided: 'TBD_Date_Proof_Investment',
compliance1stAttempt:      'TBD_Compliance_1st_Attempt',
compliance2ndAttempt:      'TBD_Compliance_2nd_Attempt',
demoFinalCertDate:         'TBD_Demo_Final_Cert_Date',
bondRequired:              'TBD_Bond_Required',
bondAmount:                'TBD_Bond_Amount',
complianceType:            'TBD_Compliance_Type',
referredToLISC:            'TBD_Referred_To_LISC',
liscRecommendReceived:     'TBD_LISC_Recommend_Received',
liscRecommendSale:         'TBD_LISC_Recommend_Sale',

// ── AFTER (confirmed from CP layout screenshots) ──
dateProofOfInvestProvided: 'Date Proof of Invest provided',   // ✅ CP layout — Featured/R4R/Demo tabs (yellow highlight)
compliance1stAttempt:      'Compliance 1st Attempt',           // ✅ CP layout — Featured/R4R/Demo tabs (yellow highlight)
compliance2ndAttempt:      'Compliance 2nd Attempt',           // ✅ CP layout — Featured/R4R/Demo tabs (yellow highlight)
demoFinalCertDate:         'Demo Final Cert Date',             // ✅ CP layout — R4R/Demo tab (yellow highlight)
bondRequired:              'Bond Required',                    // ✅ CP layout — R4R/Demo tab (Yes/No radio)
bondAmount:                'If yes, Bond amount',              // ✅ CP layout — R4R/Demo tab
complianceType:            'Compliance',                       // ✅ VIP Compliance layout (New Build / Renovation radio)
referredToLISC:            'Referred to LISC',                 // ✅ CP layout — Featured/R4R/Demo tabs
liscRecommendReceived:     'LISC recommend Received',          // ✅ CP layout — Featured/R4R/Demo tabs
liscRecommendSale:         'LISC recommend Sale',              // ✅ CP layout — Featured/R4R/Demo tabs (Yes/No radio)
```

Update the comment blocks above each group to change `🔍` to `✅` and note `Confirmed from CP layout SOP screenshots 2026-02-12`.

**Fields that remain TBD** (not visible in any screenshot — still need `?action=status&meta=true` or Lucille confirmation):
- `occupancyDeadline`, `insuranceDueDate`, `insuranceReceived`, `occupancyEstablished`, `minimumHoldExpiry`
- `lastContactDate`, `scopeOfWorkApproved`, `buildingPermitObtained`, `rehabDeadline`, `percentComplete`
- `enforcementLevel`

---

## TASK 2: Add Missing CP Layout Sale Fields

The CP layout (Featured Homes tab) shows sale/closing fields that the portal doesn't track. These provide context needed for compliance (e.g., land contract terms affect payment monitoring).

### File: `prisma/schema.prisma` — Add to Property model:

```prisma
// CP layout sale fields (Featured Homes / R4R / Demo tabs)
buyerOfferDate         DateTime?
downPaymentAmount      Float?
monthlyPaymentAmount   Float?
termOfContractMonths   Int?
applicantHomeConditions String?
partnerOrg             String?    // "Metro Community Development", "Habitat for Humanity", "Fannie Mae"

// CP layout closing fields (partially truncated in screenshots)
dateForScope           DateTime?
dateClosed             DateTime?
waive550               Boolean    @default(false)
```

### File: `src/config/filemakerFieldMap.js` — Add to PROPERTY_FIELD_MAP:

```javascript
// ✅ CP layout — Featured Homes tab (sale/closing fields)
buyerOfferDate:          'Buyer Offer Date',                // ✅ CP layout — date picker
downPaymentAmount:       'Down payment amount',             // ✅ CP layout — Featured tab
monthlyPaymentAmount:    'Monthly Payment Amount',          // ✅ CP layout — Featured tab
termOfContractMonths:    'Term of Contract in Months',      // ✅ CP layout — Featured tab
applicantHomeConditions: 'Applicant Home_Property Conditions', // ✅ CP layout — Featured tab
```

Add `buyerOfferDate` to the `DATE_FIELDS` Set.  
Add `downPaymentAmount`, `monthlyPaymentAmount` to the `CURRENCY_FIELDS` Set.  
Add `termOfContractMonths` to the `NUMERIC_FIELDS` Set.

---

## TASK 3: Fix Occupied Field 3-State Mismatch

FM has 3 states: Yes / No / Unsure. The portal stores `occupancyEstablished` as Boolean, losing "Unsure".

### File: `prisma/schema.prisma`

```prisma
// CHANGE:
// occupancyEstablished Boolean  @default(false)
// TO:
occupancyEstablished   String?   @default("No")  // "Yes", "No", "Unsure" — FM has 3 radio buttons
```

### File: `src/config/filemakerFieldMap.js`

Remove `occupancyEstablished` from `BOOLEAN_FIELDS` Set. It's now a string field that maps directly (no conversion needed).

### File: `src/pages/PropertyDetail.jsx`

In the Featured Homes section (~line 138), update the occupancy check:

```javascript
// BEFORE:
{property.occupancyEstablished ? (
  <CheckCircle className="w-5 h-5 text-success" />
) : (
  <AlertCircle className="w-5 h-5 text-warning" />
)}
<span className="text-sm font-semibold text-text">
  {property.occupancyEstablished ? 'Occupied' : 'Not Yet Occupied'}
</span>

// AFTER:
{property.occupancyEstablished === 'Yes' ? (
  <CheckCircle className="w-5 h-5 text-success" />
) : property.occupancyEstablished === 'Unsure' ? (
  <AlertCircle className="w-5 h-5 text-yellow-500" />
) : (
  <AlertCircle className="w-5 h-5 text-warning" />
)}
<span className="text-sm font-semibold text-text">
  {property.occupancyEstablished === 'Yes' ? 'Occupied'
    : property.occupancyEstablished === 'Unsure' ? 'Unsure'
    : 'Not Yet Occupied'}
</span>
```

### File: `src/data/mockData.js`

Update all `occupancyEstablished` values: `true` → `'Yes'`, `false` → `'No'`.

---

## TASK 4: Add Top Note to Buyer Model

`Top Note` is a primary operational field in FM's buyer portal section. Staff check it first.

### File: `prisma/schema.prisma` — Add to Buyer model:

```prisma
topNote      String?   // FM "Top Note" column — operational shorthand (e.g., "APP ON FILE 3618", "Cash")
```

### File: `src/config/filemakerFieldMap.js` — Add to BUYER_FIELD_MAP:

```javascript
topNote:       'Top Note',              // ✅ Buyer portal section — primary operational field
```

### File: `src/pages/PropertyDetail.jsx`

In the buyer info display section, add Top Note as a visible field. Find where buyer name/email/organization are displayed and add:

```jsx
{property.topNote && (
  <div className="space-y-1">
    <p className="text-xs font-heading font-medium text-muted uppercase">Top Note</p>
    <p className="text-sm font-semibold text-text font-mono">{property.topNote}</p>
  </div>
)}
```

### File: `src/data/mockData.js`

Add `topNote` to existing mock properties where relevant. For example:
- P001: `topNote: 'Cash'`
- P003: `topNote: 'Development Agreement - Renovation'`

---

## TASK 5: Add Availability Field and FM Color Coding

FM uses a color system driven by the `Availability` field: Red=Sold, Orange=Under LC, Yellow=Inactive, Light Blue=Treasurer, Purple=Issue. This is separate from the portal's enforcement-level colors.

### File: `prisma/schema.prisma` — Add to Property model:

```prisma
availability   String?   // FM status: "Available", "Sold", "Under LC", "Inactive", "Treasurer"
```

### File: `src/config/filemakerFieldMap.js` — Add to PROPERTY_FIELD_MAP:

```javascript
availability:  'Availability',           // ✅ PARC-Form — next to GCLB Owned, drives FM color coding
```

### File: `src/components/ui/StatusPill.jsx`

Add a new variant mapping for FM colors. Add this constant and update the component:

```javascript
const FM_COLOR_MAP = {
  'Sold':       'bg-red-100 text-red-800 border-red-200',
  'Under LC':   'bg-orange-100 text-orange-800 border-orange-200',
  'Inactive':   'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Treasurer':  'bg-sky-100 text-sky-800 border-sky-200',
  'Available':  'bg-green-100 text-green-800 border-green-200',
};
```

Add a new `fmStatus` prop to StatusPill that applies FM colors:

```jsx
// Usage:
<StatusPill fmStatus={property.availability}>{property.availability}</StatusPill>
```

### File: `src/pages/Properties.jsx`

In the property list table, add an FM status badge column showing the color-coded availability. Place it before the enforcement status column.

### File: `src/pages/PropertyDetail.jsx`

In the header actions area (~line 481), add the FM color badge next to existing StatusPills:

```jsx
{property.availability && (
  <StatusPill fmStatus={property.availability}>{property.availability}</StatusPill>
)}
```

---

## TASK 6: Store Dashed Parcel ID

FM stores both `4635457003` and `46-35-457-003`. The portal strips dashes but never preserves the formatted version.

### File: `prisma/schema.prisma` — Add to Property model:

```prisma
parcelIdDashed String?   // FM "PID w/Dashes" format: "46-35-457-003"
```

### File: `src/config/filemakerFieldMap.js`

The second Parc ID field on the FM form is the dashed version. Add:

```javascript
parcelIdDashed: 'PID w/Dashes',   // ✅ PARC-Form — second field next to Parc ID (e.g., "46-35-457-003")
```

Note: The exact FM field name may not be "PID w/Dashes" — this was the label visible in the File.pdf examples document. It could also be accessed as a calculated field. Keep as a string field that gets populated during sync. If it's not a separate FM field but a calculated display, generate it from parcelId using this pattern:

```javascript
// Add to filemakerFieldMap.js:
export function formatParcelIdDashed(parcelId) {
  if (!parcelId) return '';
  const clean = String(parcelId).replace(/\D/g, '');
  if (clean.length !== 10) return clean; // non-standard format, return as-is
  return `${clean.slice(0,2)}-${clean.slice(2,4)}-${clean.slice(4,7)}-${clean.slice(7,10)}`;
}
```

### File: `src/pages/PropertyDetail.jsx`

In the subtitle area (~line 477), show both formats:

```jsx
subtitle={<>
  Parcel: <span className="font-mono">{property.parcelId}</span>
  {' / '}
  <span className="font-mono text-muted">{property.parcelIdDashed || formatParcelIdDashed(property.parcelId)}</span>
</>}
```

---

## TASK 7: Add Property Physical Details

FM's main form displays bedrooms, baths, stories, sqft, year built, lot size, garage, basement. These provide context when viewing properties.

### File: `prisma/schema.prisma` — Add to Property model:

```prisma
// Physical property details (from PARC-Form main section)
bedrooms       Int?
baths          Int?
stories        String?
sqFt           Int?
yearBuilt      Int?
lotSize        Float?
garageSize     Int?
basementSize   Int?
school         String?
```

### File: `src/config/filemakerFieldMap.js` — Add to PROPERTY_FIELD_MAP:

```javascript
// ✅ PARC-Form — Physical property details
bedrooms:       'Bedrooms',
baths:          'Baths',
stories:        'Stories',
sqFt:           'Sq Ft',
yearBuilt:      'Year Built',
lotSize:        'Lot Size (Acreage)',
garageSize:     'Garage',
basementSize:   'Basement',
school:         'School',
```

Add `bedrooms`, `baths`, `sqFt`, `yearBuilt`, `garageSize`, `basementSize` to `NUMERIC_FIELDS` Set.

### File: `src/pages/PropertyDetail.jsx`

Add a "Property Details" card after the header stats section (~line 505). Only render if any physical details exist:

```jsx
{(property.bedrooms || property.baths || property.sqFt || property.yearBuilt) && (
  <Card title="Property Details" className="mb-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {property.bedrooms != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Bedrooms</p>
          <p className="text-lg font-semibold text-text font-mono">{property.bedrooms}</p>
        </div>
      )}
      {property.baths != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Baths</p>
          <p className="text-lg font-semibold text-text font-mono">{property.baths}</p>
        </div>
      )}
      {property.sqFt != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Sq Ft</p>
          <p className="text-lg font-semibold text-text font-mono">{property.sqFt.toLocaleString()}</p>
        </div>
      )}
      {property.yearBuilt != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Year Built</p>
          <p className="text-lg font-semibold text-text font-mono">{property.yearBuilt}</p>
        </div>
      )}
      {property.stories != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Stories</p>
          <p className="text-lg font-semibold text-text font-mono">{property.stories}</p>
        </div>
      )}
      {property.garageSize != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Garage</p>
          <p className="text-lg font-semibold text-text font-mono">{property.garageSize} sq ft</p>
        </div>
      )}
      {property.basementSize != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Basement</p>
          <p className="text-lg font-semibold text-text font-mono">{property.basementSize} sq ft</p>
        </div>
      )}
      {property.lotSize != null && (
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-muted uppercase">Lot Size</p>
          <p className="text-lg font-semibold text-text font-mono">{property.lotSize} acres</p>
        </div>
      )}
    </div>
  </Card>
)}
```

### File: `src/data/mockData.js`

Add physical details to mock properties using realistic Flint MI data. Example for P001:
```javascript
bedrooms: 3, baths: 1, stories: '1', sqFt: 1100, yearBuilt: 1952, garageSize: 0, basementSize: 400,
```

---

## TASK 8: Add FM Metadata Fields to Property

These PARC-Form fields provide operational context.

### File: `prisma/schema.prisma` — Add to Property model:

```prisma
// Additional PARC-Form metadata
taxCapture          String?    // e.g. "5/50 Parcel"
askingPrice         Float?
rehabStatusFunding  String?
propMiscCost        Float?
delinquentTaxes     Boolean    @default(false)
delinquentTaxAmount Float?
linkedParcels       String?
violationsLUG       Json?      // checkbox array: ["Condemned", "Demo Letter", etc.]
foreclosureStatus   String?    // from CSV: "SEPTEMBER SOLD", "NOT SOLD OR TRANSFERRED", etc.
lienReleaseDate     DateTime?
deedRecorded        Boolean    @default(false)
```

### File: `src/config/filemakerFieldMap.js` — Add to PROPERTY_FIELD_MAP:

```javascript
// ✅ PARC-Form — additional metadata
taxCapture:          'Tax Capture',
askingPrice:         'Asking Price',
rehabStatusFunding:  'Rehab Status / Funding',
delinquentTaxes:     'Del. taxes on property?',
```

Add `askingPrice`, `propMiscCost`, `delinquentTaxAmount` to `CURRENCY_FIELDS` Set.  
Add `delinquentTaxes`, `deedRecorded` to `BOOLEAN_FIELDS` Set.  
Add `lienReleaseDate` to `DATE_FIELDS` Set.

---

## TASK 9: Add Notes/Activity Log

FM has a freeform notes section (Date, Time, Creator, Note, Internal/External) that is separate from compliance communications. The portal needs a general notes system.

### File: `prisma/schema.prisma` — Add new model:

```prisma
model Note {
  id         String   @id @default(cuid())
  body       String   @db.Text
  creator    String?  // staff name
  visibility String   @default("internal") // "internal" or "external"
  
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  
  createdAt  DateTime @default(now())
  
  @@index([propertyId])
}
```

Add `notes Note[]` to the Property model's relations.

### File: `api/` — Create `api/notes.js`:

Standard CRUD endpoint: GET (list by propertyId), POST (create). Follow the pattern in `api/communications.js`.

### File: `src/pages/PropertyDetail.jsx`

Add a "Notes" section below the communications section. Show existing notes with date/creator/body. Include a simple add-note form (textarea + internal/external toggle + save button).

---

## TASK 10: Update VIP Completion Checklist to Match FM

The FM VIP Compliance layout (Screenshot 4) shows the completion checklist has an **Exterior Photos** subsection and **Interior Photos** subsection. The portal's mock data already models this correctly (`completionChecklist.exteriorPhotos` and `completionChecklist.interiorPhotos`), but the PropertyDetail renderer doesn't display the sub-sections properly.

### File: `src/pages/PropertyDetail.jsx`

The completion checklist section (~line 329-337) currently has a flat labels object. Update to match FM's visual grouping:

```javascript
{
  name: 'Completion Checklist',
  data: property.completionChecklist,
  labels: {
    exteriorPhotos: 'Exterior Photos',  // This IS handled as nested object already
    interiorPhotos: 'Interior Photos',  // This IS handled as nested object already
    allPermitsCompleted: 'All permits completed',
    cocOrCoo: 'COC or COO',             // FM shows "COC or COO" not "Certificate of Completion/Occupancy"
    lbaStaffInspectionSatisfied: 'LBA Staff Inspection satisfied',  // Match FM capitalization
  },
},
```

Current label `'Certificate of Completion/Occupancy'` should be `'COC or COO'` to match FM exactly.

---

## TASK 11: Action Queue — Snail Mail Workflow

The SOP (lines 21, 48) describes a separate workflow for records without email: print and mail physical letters. The Action Queue should separate email vs. mail recipients.

### File: `src/pages/ActionQueue.jsx`

In the grouped actions display, add a filter or sub-group that separates properties where `buyerEmail` is empty or invalid. Show these with a mail/print icon instead of email icon.

Add a "No Email — Print Required" toggle or filter pill at the top of the page. When active, show only records that need physical mail. Add a "Print Letters" button that opens a print-friendly view.

---

## TASK 12: Add Date Sold Filter for Compliance Reports

SOP line 12: "Sort by 'Date Sold' and remove the most recent sales." Staff need to exclude recently-sold properties that are too new for compliance action.

### File: `src/pages/Compliance.jsx`

Add a filter control that lets staff exclude properties sold within the last N days (default 30). This prevents newly closed sales from cluttering the compliance queue.

```jsx
const [excludeRecentDays, setExcludeRecentDays] = useState(30);
// Filter: exclude properties where dateSold is within the last N days
const filtered = properties.filter(p => {
  if (!excludeRecentDays) return true;
  const soldDate = new Date(p.dateSold);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - excludeRecentDays);
  return soldDate <= cutoff;
});
```

Add a small dropdown or input in the page header: "Exclude sales within last [30] days".

---

## TASK 13: Featured Homes CP Tab — Additional Fields for Sales Tab

The Featured Homes CP tab (Screenshot 1) shows the Sales tab has sub-tabs: Featured, R4R, VIP, Demo, Comm/Ind, Vac. Land, Quiet Title. Within the Featured sub-tab, there are status buttons and feature checkboxes.

### FM Sales Tab Feature Checkboxes (for Featured Homes):
- Original Wood Working
- Bay Window
- New Kitchen
- New Bathroom
- New Construction
- Hardwood Floors
- First Floor Bedroom
- Fireplace
- Sunroom
- Air Conditioning
- Enclosed Porch
- Deck
- Wheelchair Ramp
- Fenced Yard
- Brick Exterior
- Sidekot Included (?)
- 2 Sidelets Included (?)
- Duplex

### FM Sales Tab Status Buttons:
- Featured / Currently Featured / Need Cleanout / Applicant Followup / Sales Dir Approval / Ex Dir Approval
- Cleared to Close / Sold / Pending / Dropped / Compliance Report

These are workflow states for the sales pipeline, not compliance tracking. They could be stored in the `extras` JSON field.

### File: `prisma/schema.prisma`

The `extras Json?` field on Property already exists for this purpose. No schema change needed — store sales features and pipeline status in `extras`.

### File: `src/config/filemakerFieldMap.js`

These FM fields don't need individual portal field mappings since they're not compliance-critical. They can be captured during FM sync by reading all fields from the Sales tab and storing unrecognized ones in `extras`. The `fromFM()` function already skips unmapped fields.

If specific feature checkboxes become important later, they can be added to the field map at that time.

---

## TASK 14: Update CLAUDE.md

After completing tasks, update `CLAUDE.md` to reflect:

1. **FileMaker Integration status**: Change from "In progress" to note that 10 TBD fields are now confirmed from CP layout screenshots
2. **Add new models**: Note model
3. **Update field counts**: "20 confirmed, 15 TBD" → "30 confirmed, 5 TBD"
4. **Add this document** to the file map table:
   ```
   | docs/FM-PORTAL-TASKS.md | FM ↔ Portal compatibility fix tasks (from SOP screenshots) |
   ```

---

## Execution Order

Run tasks in this order to minimize conflicts:

1. **TASK 1** — Confirm TBD field names (no schema change, just field map strings)
2. **TASK 3** — Fix Occupied 3-state (schema change + converter + UI)
3. **TASK 4** — Add Top Note (schema + field map + UI)
4. **TASK 5** — Add Availability + FM colors (schema + field map + StatusPill + UI)
5. **TASK 6** — Dashed parcel ID (schema + field map + utility)
6. **TASK 2** — Add CP layout sale fields (schema + field map)
7. **TASK 7** — Physical property details (schema + field map + UI)
8. **TASK 8** — FM metadata fields (schema + field map)
9. **TASK 9** — Notes model (schema + API + UI)
10. **TASK 10** — VIP checklist label fix (UI only)
11. **TASK 11** — Action Queue snail mail (UI only)
12. **TASK 12** — Date sold filter (UI only)
13. **TASK 13** — Sales tab extras (documentation only)
14. **TASK 14** — Update CLAUDE.md

After all schema changes (Tasks 2-9), run:
```bash
npm run db:push
```

After all mock data changes, verify:
```bash
npm run dev
# Check Dashboard, Properties list, PropertyDetail for each program type
```

---

## Fields Still TBD (Need FM Credentials or Lucille)

These fields were NOT visible in any screenshot. They remain `TBD_*` in the field map until `?action=status&meta=true` is run with real FM credentials:

| Portal Field | Current TBD Name | Where to Look |
|---|---|---|
| `occupancyDeadline` | `TBD_Occupancy_Deadline` | Sales tab or CP Featured tab (right side, truncated in screenshot) |
| `insuranceDueDate` | `TBD_Insurance_Due_Date` | Sales tab |
| `insuranceReceived` | `TBD_Insurance_Received` | Sales tab |
| `minimumHoldExpiry` | `TBD_Minimum_Hold_Expiry` | Sales tab |
| `lastContactDate` | `TBD_Last_Contact_Date` | Sales tab |
| `scopeOfWorkApproved` | `TBD_Scope_Work_Approved` | Planning tab |
| `buildingPermitObtained` | `TBD_Building_Permit_Obtained` | Planning tab |
| `rehabDeadline` | `TBD_Rehab_Deadline` | Planning tab |
| `percentComplete` | `TBD_Percent_Complete` | Maint. tab |
| `enforcementLevel` | `TBD_Enforcement_Level` | Inspections or Reports tab |

**Note on truncated fields:** The Featured Homes CP tab (Screenshot 1) shows several fields on the right side that are cut off: "Date for Sc...", "Date Clo...", "Land Co...", "Waive 5-50", "Deed i...", "Fulfillment D...", "Trea...". Some of these may correspond to TBD fields above (e.g., "Date Clo..." could be the closing date, "Deed i..." could relate to deed recording). Full CP layout screenshots showing the right side would resolve these.

---

## VIP Compliance Layout Reference (from Screenshot 4)

The VIP compliance layout is a DEDICATED FM layout (not a tab on PARC-Form). It shows:

### RC Date Pairs
| Field | Left Column (Due) | Right Column (Completed) |
|---|---|---|
| RC15 | Auto-calculated: dateSold + 15 days | Staff enters when done |
| RC45 | dateSold + 45 days | Staff enters when done |
| RC90 | dateSold + 90 days | Staff enters when done |
| RC135 | dateSold + 135 days | Staff enters when done |
| RC180 | dateSold + 180 days | Staff enters when done |
| RC225 | dateSold + 225 days | Staff enters when done |
| RC270 | dateSold + 270 days | Staff enters when done |
| RC315 | dateSold + 315 days | Staff enters when done |
| RC360 | dateSold + 360 days | Staff enters when done |

### Checklists (exact labels from FM)
**15 Day Check in:**
- Property is Secure
- Cleaned Up
- Lawn Mowed

**45 Day Check in:**
- Before Pictures Provided
- Permits Pulled
- Estimates or Contracts Provided
- Estimated Date of Completion Given
- Water Utility Activated (bill provided)
- Electric Utility Activated (bill provided)
- Gas Utility Activated (bill provided)
- Lawn Mowed
- After Pictures Provided

**Completion Checklist — Exterior Photos:**
- Foundation to roof repaired
- No Boards or Blight
- Landscape is maintained

**Completion Checklist — Interior Photos:**
- Bathroom(s)
- Kitchen
- Water Heater
- Furnace

**Completion Checklist — Other:**
- All permits completed
- COC or COO
- LBA Staff Inspection satisfied

### Other VIP Layout Fields
- Compliance type: New Build / Renovation (radio)
- Parcel ID
- Address
- Date Sold

**The portal's existing VIP model (mockData P003, PropertyDetail VIP section) matches this structure correctly.** The RC intervals (15,45,90,135,180,225,270,315,360), checklists, and data shapes are aligned. The only fix needed is the label correction in TASK 10.
