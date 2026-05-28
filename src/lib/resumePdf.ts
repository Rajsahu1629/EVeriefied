import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { UserData } from '../contexts/UserContext';
import type { ResumeLabels } from './resumePdfTypes';

export type { ResumeLabels } from './resumePdfTypes';

/** Brand green — solid fill inside SVG so it prints correctly (CSS backgrounds often print gray) */
const EVERIFIED_GREEN = '#10B981';

/** Icon as one SVG: green rounded square + white lightning bolt (prints reliably in PDF) */
function getEverifiedLogoSvg(size = 48): string {
    const r = 11;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="EVerified logo">
  <rect x="0" y="0" width="48" height="48" rx="${r}" ry="${r}" fill="${EVERIFIED_GREEN}"/>
  <g transform="translate(12, 12)">
    <path
      d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`;
}

/** Footer logo block — matches official EVerified resume template */
function getEverifiedBrandFooterHtml(tagline: string): string {
    return `
  <div class="everified-brand">
    ${getEverifiedLogoSvg(36)}
    <div class="everified-text">
      <p class="everified-name">EVerified</p>
      <p class="everified-tagline">${escapeHtml(tagline)}</p>
    </div>
  </div>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatExperienceYears(exp: string | undefined, labels: ResumeLabels): string {
    if (!exp || exp === 'fresher') return labels.fresher;
    const map: Record<string, string> = {
        '0-1': '0–1',
        '1-2': '1–2',
        '2-3': '2–3',
        '3-4': '3–4',
        '4-5': '4–5',
        '5-6': '5–6',
        '6-7': '6–7',
        '7-8': '7–8',
        '8+': '8+',
        '2-5': '2–5',
        '5+': '5+',
    };
    const val = map[exp] || exp;
    if (val === labels.fresher) return val;
    return `${val} ${labels.years}`;
}

function formatLocation(user: UserData): string {
    const city = user.city?.trim();
    const state = user.state?.trim();
    const pin = user.pincode?.trim();
    if (city && state && pin) return `${city}, ${state} – ${pin}`;
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    return '';
}

function parseBrands(user: UserData): string[] {
    let raw: unknown = user.brands;
    if (!raw) return [];
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            return raw ? [String(raw)] : [];
        }
    }
    if (!Array.isArray(raw)) return [];
    return raw.filter((b) => b && String(b).trim() && b !== 'Other').map((b) => String(b));
}

function getCareerObjective(user: UserData, roleTitle: string): string {
  const isBs6 =
      user.domain === 'BS6' ||
      (user.role === 'technician' && roleTitle.toLowerCase().includes('bs6'));
  const title = roleTitle.toLowerCase();

  const hasAny = (keywords: string[]) => keywords.some((k) => title.includes(k));

  // ── SHOWROOM TRACK ──────────────────────────────────────────────────────────

  // CRE – Customer Relationship Executive (calling / follow-up focused)
  if (hasAny(['cre', 'customer relationship'])) {
      return (
          `Proactive ${roleTitle} with hands-on experience in outbound/inbound calling, ` +
          `lead follow-up, appointment scheduling, and customer query resolution. ` +
          `Skilled at maintaining CRM records, nurturing prospects through the sales funnel, ` +
          `and coordinating with the showroom team to ensure timely test rides and bookings. ` +
          `Seeking to maximize lead conversion and deliver exceptional pre- and post-sales communication.`
      );
  }

  // Sales Executive – walk-in, test ride, deal closure
  if (hasAny(['sales executive'])) {
      return (
          `Target-driven ${roleTitle} experienced in handling walk-in customers, explaining ` +
          `vehicle features and variants, conducting test rides, processing loan/finance documentation, ` +
          `and closing deals. Adept at building customer trust, achieving monthly sales targets, ` +
          `and contributing to showroom revenue growth in a competitive automobile market.`
      );
  }

  // ── WORKSHOP TRACK ──────────────────────────────────────────────────────────

  // Service Advisor – front desk, job card, customer interface
  if (hasAny(['service advisor'])) {
      return (
          `Customer-focused ${roleTitle} with expertise in vehicle check-in, job card creation, ` +
          `service estimation, and delivery coordination. Skilled at explaining repair requirements ` +
          `to customers, managing technician task allocation, tracking job progress, and ensuring ` +
          `vehicles are delivered on time with zero pending complaints. ` +
          `Seeking to enhance customer satisfaction scores and first-visit resolution rates.`
      );
  }

  // Service Manager – team leadership, KPI, escalation handling
  if (hasAny(['service manager'])) {
      return (
          `Results-oriented ${roleTitle} with proven ability to manage workshop teams, monitor ` +
          `daily job card throughput, control parts inventory, and resolve escalated customer issues. ` +
          `Experienced in driving service revenue, maintaining OEM audit compliance, and coaching ` +
          `advisors and technicians to improve efficiency, quality, and customer retention metrics.`
      );
  }

  // Floor Supervisor – bay management, technician supervision
  if (hasAny(['floor supervisor'])) {
      return (
          `Detail-oriented ${roleTitle} with strong experience in bay-level supervision, ` +
          `technician productivity monitoring, quality checks, and on-floor issue resolution. ` +
          `Skilled at ensuring workshop discipline, tool/equipment upkeep, and adherence to ` +
          `standard repair times. Seeking to maintain high first-time-fix rates and smooth ` +
          `daily workshop operations.`
      );
  }

  // Spare Parts – inventory, billing, vendor coordination
  if (hasAny(['spare part', 'parts'])) {
      return (
          `Organized ${roleTitle} with expertise in spare parts inventory management, bin allocation, ` +
          `parts indent and billing, vendor follow-up, and stock reconciliation. ` +
          `Skilled at ensuring zero stockout for fast-moving parts, managing warranty returns, ` +
          `and supporting workshop operations with timely parts availability to minimize vehicle downtime.`
      );
  }

// Fleet Manager – B2B, AMC, bulk servicing
if (hasAny(['fleet manager', 'fleet'])) {
  return (
      `Seasoned ${roleTitle} with proven expertise in managing large-scale vehicle fleets, ` +
      `scheduling preventive maintenance, and handling AMC/service contracts for corporate and ` +
      `institutional clients. Adept at minimizing vehicle downtime, maintaining service records, ` +
      `coordinating with workshop teams, and delivering cost-effective fleet solutions. ` +
      `Seeking to drive operational excellence and long-term client retention in the automobile sector.`
  );
}

  // Workshop (generic fallback)
  if (hasAny(['workshop'])) {
      return (
          `Dedicated ${roleTitle} with hands-on knowledge of service workflow, job card handling, ` +
          `team coordination, and customer issue resolution. Seeking to strengthen workshop efficiency, ` +
          `service quality, and turnaround time in daily operations.`
      );
  }

  // ── AREA / REGIONAL OPERATIONS ──────────────────────────────────────────────

  if (hasAny(['area service manager', 'asm'])) {
      return (
          `Experienced ${roleTitle} focused on multi-location service coordination, workshop performance monitoring, ` +
          `and field-level process improvement. Seeking to drive consistent service quality, faster issue closure, ` +
          `and stronger customer retention across assigned regions.`
      );
  }

  // ── ROLE-BASED FALLBACKS ─────────────────────────────────────────────────────

  if (user.role === 'sales') {
      return (
          `Experienced ${roleTitle} with strong knowledge in customer engagement, vehicle sales, ` +
          `test rides, and showroom operations. Seeking an opportunity to utilize sales expertise ` +
          `and contribute to the growth of the automobile industry.`
      );
  }
  if (user.role === 'workshop') {
      return (
          `Experienced ${roleTitle} with expertise in workshop management, team coordination, ` +
          `service operations, and customer satisfaction. Seeking an opportunity to lead service ` +
          `teams and improve workshop efficiency in the automobile sector.`
      );
  }
  if (user.role === 'aspirant') {
      return (
          `Motivated EV/BS6 sector aspirant eager to build a career in the automobile industry. ` +
          `Committed to learning technical skills, workshop discipline, and professional service standards.`
      );
  }
  if (isBs6) {
      return (
          'Experienced BS6 Automobile Technician with strong knowledge in vehicle servicing, engine diagnosis, ' +
          'electrical systems, maintenance, and workshop operations. Seeking an opportunity to utilize ' +
          'technical expertise and contribute to the growth of the automobile industry.'
      );
  }
  return (
      'Experienced EV Automobile Technician with strong knowledge in electric vehicle servicing, battery systems, ' +
      'diagnostics, preventive maintenance, and workshop operations. Seeking an opportunity to utilize technical ' +
      'expertise and contribute to the growth of the electric mobility industry.'
  );
}

function getTechnicalSkills(user: UserData, roleTitle: string): string[] {
  const isBs6 =
      user.domain === 'BS6' ||
      (user.role === 'technician' && roleTitle.toLowerCase().includes('bs6'));
  const title = roleTitle.toLowerCase();

  const hasAny = (keywords: string[]) => keywords.some((k) => title.includes(k));

  // ── SHOWROOM TRACK ──────────────────────────────────────────────────────────

  // CRE – calling, follow-up, CRM
  if (hasAny(['cre', 'customer relationship'])) {
      return [
          'Outbound & Inbound Calling',
          'Lead Follow-up & Prospect Nurturing',
          'Appointment Scheduling & Test Ride Booking',
          'CRM Data Entry & Pipeline Management',
          'Customer Query Resolution',
          'Coordination with Sales & Showroom Team',
      ];
  }

  // Sales Executive – walk-in, demo, closure
  if (hasAny(['sales executive'])) {
      return [
          'Walk-in Customer Handling & Product Presentation',
          'Vehicle Feature & Variant Explanation',
          'Test Ride Coordination & Demonstration',
          'Finance / Loan Documentation Assistance',
          'Deal Negotiation & Closing',
          'Target Achievement & Monthly Reporting',
      ];
  }

  // ── WORKSHOP TRACK ──────────────────────────────────────────────────────────

  // Service Advisor – front desk, job card, delivery
  if (hasAny(['service advisor'])) {
      return [
          'Vehicle Check-in & Condition Assessment',
          'Job Card Creation & Service Estimation',
          'Technician Task Allocation & Follow-up',
          'Customer Communication & Update Calls',
          'Vehicle Delivery & Invoice Explanation',
          'First Visit Resolution & Complaint Handling',
      ];
  }

  // Service Manager – team, KPI, compliance
  if (hasAny(['service manager'])) {
      return [
          'Workshop Team Leadership & Supervision',
          'Daily Job Card Throughput Monitoring',
          'Service Revenue Tracking & Target Management',
          'Customer Escalation Handling & Retention',
          'OEM Audit Compliance & Process Adherence',
          'Advisor & Technician Coaching',
      ];
  }

  // Floor Supervisor – bay, technicians, quality
  if (hasAny(['floor supervisor'])) {
      return [
          'Bay-level Supervision & Workflow Management',
          'Technician Productivity & Time Monitoring',
          'Quality Check & Pre-delivery Inspection',
          'Tool & Equipment Upkeep',
          'Standard Repair Time (SRT) Adherence',
          'On-floor Issue Resolution & Escalation',
      ];
  }

  // Spare Parts – inventory, billing, indent
  if (hasAny(['spare part', 'parts'])) {
      return [
          'Parts Inventory Management & Bin Allocation',
          'Indent Raising & Vendor Coordination',
          'Parts Billing & Invoice Processing',
          'Fast-moving Stock Monitoring & Replenishment',
          'Warranty Parts Return & Documentation',
          'Workshop Parts Supply & Downtime Reduction',
      ];
  }

  // Fleet Manager – B2B, AMC, bulk service
// Fleet Manager – B2B, AMC, bulk service
if (hasAny(['fleet manager', 'fleet'])) {
  return [
      'Preventive Maintenance Planning & Scheduling',
      'AMC / Service Contract Management',
      'Corporate & Institutional Client Handling',
      'Vehicle Downtime Tracking & Reduction',
      'Multi-vehicle Service History & Records',
      'Workshop Coordination & Bulk Job Prioritization',
  ];
}

  // Workshop generic fallback
  if (hasAny(['workshop'])) {
      return [
          'Workshop Operations & Bay Management',
          'Team Supervision & Job Allocation',
          'Service Quality & Customer Satisfaction',
          'Inventory & Spare Parts Coordination',
          'Job Card Discipline & Billing Cycle',
          'EV/BS6 Service Process Knowledge',
      ];
  }

  // ── AREA / REGIONAL OPERATIONS ──────────────────────────────────────────────

  if (hasAny(['area service manager', 'asm'])) {
      return [
          'Multi-location Workshop Performance Monitoring',
          'Field-level Process Auditing & Improvement',
          'Dealer Service Team Coaching',
          'Regional Customer Complaint Resolution',
          'Spare Parts & Inventory Oversight',
          'Service Revenue & KPI Reporting',
      ];
  }

  // ── ROLE-BASED FALLBACKS ─────────────────────────────────────────────────────

  if (user.role === 'sales') {
      return [
          'Customer Handling & Product Presentation',
          'Test Ride & Vehicle Demonstration',
          'Lead Follow-up & CRM Basics',
          'EV/BS6 Product Knowledge',
          'Showroom Operations & Documentation',
          'Negotiation & Closing Skills',
      ];
  }

  if (user.role === 'workshop') {
      return [
          'Workshop Operations & Bay Management',
          'Team Supervision & Job Allocation',
          'Service Quality & Customer Satisfaction',
          'Inventory & Spare Parts Coordination',
          'Job Card Discipline & Billing Cycle',
          'EV/BS6 Service Process Knowledge',
      ];
  }

  if (user.role === 'aspirant') {
      return [
          'Basic Automobile & EV Awareness',
          'Workshop Safety & Discipline',
          'Tool Handling Fundamentals',
          'Willingness to Learn & Adapt',
          'Teamwork & Communication',
          'Customer Service Mindset',
      ];
  }

  if (isBs6) {
      return [
          'BS6 Vehicle Service & Maintenance',
          'Engine Diagnosis & Repair',
          'ECU Scanning & Fault Diagnosis',
          'Periodic Service & Inspection',
          'Brake & Suspension Repair',
          'Customer Complaint Handling',
      ];
  }

  return [
      'EV Vehicle Service & Maintenance',
      'High Voltage Safety & Battery Systems',
      'Motor & Controller Diagnostics',
      'Charging System Inspection',
      'Periodic Service & Inspection',
      'Customer Complaint Handling',
  ];
}

function formatQualification(qual: string | undefined, labels: ResumeLabels): string {
    if (!qual) return labels.notApplicable;
    const map: Record<string, string> = {
        '10th': '10th Pass',
        '12th': '12th Pass',
        iti: 'ITI',
        diploma: 'Diploma',
        btech: 'B.Tech / Engineering',
        other: 'Other Qualification',
    };
    return map[qual] || qual;
}

export function buildResumeHtml(params: {
    user: UserData;
    roleTitle: string;
    labels: ResumeLabels;
}): string {
    const { user, roleTitle, labels } = params;

    const workshop = (user.currentWorkshop || user.current_workshop || '').trim() || labels.notApplicable;
    const brandWorkshop = (user.brandWorkshop || user.brand_workshop || '').trim();
    const trainingRole = (user.training_role || '').trim();
    const showTrainingRoleLine =
        Boolean(trainingRole) && trainingRole.toLowerCase() !== roleTitle.toLowerCase();
    const experience = formatExperienceYears(user.experience, labels);
    const brands = parseBrands(user);
    const qualification = formatQualification(user.qualification, labels);
    const objective = getCareerObjective(user, roleTitle);
    const skills = getTechnicalSkills(user, roleTitle);
    const location = formatLocation(user) || labels.notApplicable;
    const phone = user.phoneNumber?.trim() || labels.notApplicable;
    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const brandsHtml =
        brands.length > 0
            ? `<ul class="bullet-list">${brands.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
            : `<ul class="bullet-list"><li>${escapeHtml(labels.notApplicable)}</li></ul>`;

    const skillsHtml = `<ul class="bullet-list">${skills
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}</ul>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4 portrait;
      /* Shift the whole PDF content down and slightly right */
      margin: 24mm 12mm 10mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    body {
      font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      font-size: 10.5pt;
      line-height: 1.34;
    }
    .resume-page {
      max-height: 272mm;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
      padding-top: 4mm;
      padding-left: 3mm;
    }
    .resume-page section,
    .resume-page header,
    .resume-page footer,
    .resume-page hr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .header { margin-bottom: 2px; }
    h1.name {
      font-size: 18pt;
      font-weight: 700;
      margin: 0 0 2px;
      color: #111;
      letter-spacing: 0.2px;
    }
    p.role-title {
      font-size: 11.5pt;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 2px 0;
      font-size: 10pt;
      color: #333;
    }
    .contact-icon { font-size: 10pt; }
    .divider {
      border: none;
      border-top: 1px solid #c5c5c5;
      margin: 5px 0;
    }

    section { margin: 0; }
    h2.section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #111;
      margin: 0 0 3px;
    }
    p.body-text {
      margin: 0;
      text-align: justify;
      color: #222;
    }
    .labeled-line {
      margin: 0 0 2px;
      color: #222;
    }
    .labeled-line strong {
      font-weight: 700;
      color: #111;
    }
    h3.sub-title {
      font-size: 10.5pt;
      font-weight: 700;
      margin: 4px 0 2px;
      color: #111;
    }
    ul.bullet-list {
      margin: 2px 0 0;
      padding-left: 18px;
      color: #222;
    }
    ul.bullet-list li { margin-bottom: 1px; }

    .declaration-sign {
      margin-top: 6px;
      font-size: 10pt;
      color: #222;
    }
    .sign-line { margin: 3px 0; }

    .everified-brand {
      margin-top: 10px;
      padding-top: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
    .everified-brand > svg {
      display: block;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
    }
    .everified-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
    .everified-name {
      font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
      font-size: 14pt;
      font-weight: 700;
      color: #000000;
      margin: 0;
      padding: 0;
      line-height: 1.1;
    }
    .everified-tagline {
      font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
      font-size: 8.5pt;
      font-weight: 400;
      color: #000000;
      margin: 2px 0 0;
      padding: 0;
      line-height: 1.2;
    }
    @media print {
      body { overflow: hidden; }
      .resume-page { max-height: 277mm; }
    }
  </style>
</head>
<body>
  <div class="resume-page">
  <header class="header">
    <h1 class="name">${escapeHtml(user.fullName || '')}</h1>
    <p class="role-title">${escapeHtml(roleTitle)}</p>
    <div class="contact-row">
      <span class="contact-icon">📞</span>
      <span><strong>${escapeHtml(labels.mobile)}:</strong> ${escapeHtml(phone)}</span>
    </div>
    <div class="contact-row">
      <span class="contact-icon">📍</span>
      <span>${escapeHtml(location)}</span>
    </div>
  </header>
  <hr class="divider" />

  <section>
    <h2 class="section-title">${escapeHtml(labels.careerObjective)}</h2>
    <p class="body-text">${escapeHtml(objective)}</p>
  </section>
  <hr class="divider" />

  <section>
    <h2 class="section-title">${escapeHtml(labels.workExperience)}</h2>
    <p class="labeled-line"><strong>${escapeHtml(labels.currentWorkshopLabel)}:</strong> ${escapeHtml(workshop)}</p>
    ${brandWorkshop ? `<p class="labeled-line"><strong>Brand Workshop:</strong> ${escapeHtml(brandWorkshop)}</p>` : ''}
    ${showTrainingRoleLine ? `<p class="labeled-line"><strong>Role/Position:</strong> ${escapeHtml(trainingRole)}</p>` : ''}
    <p class="labeled-line"><strong>${escapeHtml(labels.totalExperience)}:</strong> ${escapeHtml(experience)}</p>
    <h3 class="sub-title">${escapeHtml(labels.brandsWorkedWith)}</h3>
    ${brandsHtml}
  </section>
  <hr class="divider" />

  <section>
    <h2 class="section-title">${escapeHtml(labels.qualification)}</h2>
    <p class="body-text">${escapeHtml(qualification)}</p>
  </section>
  <hr class="divider" />

  <section>
    <h2 class="section-title">${escapeHtml(labels.technicalSkills)}</h2>
    ${skillsHtml}
  </section>
  <hr class="divider" />

  <section>
    <h2 class="section-title">${escapeHtml(labels.declaration)}</h2>
    <p class="body-text">${escapeHtml(labels.declarationText)}</p>
    <div class="declaration-sign">
      <p class="sign-line"><strong>${escapeHtml(labels.signature)}:</strong> ____________________</p>
      <p class="sign-line"><strong>${escapeHtml(labels.date)}:</strong> ${escapeHtml(today)}</p>
    </div>
  </section>

  <footer>
    ${getEverifiedBrandFooterHtml(labels.resumeTagline)}
  </footer>
  </div>
</body>
</html>`;
}

/** Web: expo-print ignores custom HTML and prints the app screen — use iframe instead. */
function printResumeOnWeb(html: string): void {
    if (typeof document === 'undefined') {
        throw new Error('Print is not available in this environment');
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'EVerified Resume');
    iframe.style.cssText =
        'position:fixed;left:0;top:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument || win?.document;
    if (!win || !doc) {
        document.body.removeChild(iframe);
        throw new Error('Could not prepare resume for printing');
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
        setTimeout(() => {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }, 1500);
    };

    let printed = false;
    const doPrint = () => {
        if (printed) return;
        printed = true;
        try {
            win.focus();
            win.print();
        } finally {
            cleanup();
        }
    };

    iframe.onload = () => setTimeout(doPrint, 300);
    setTimeout(doPrint, 600);
}

export async function generateAndShareResumePdf(params: {
    user: UserData;
    roleTitle: string;
    labels: ResumeLabels;
}): Promise<void> {
    const html = buildResumeHtml({
        user: params.user,
        roleTitle: params.roleTitle,
        labels: params.labels,
    });

    if (Platform.OS === 'web') {
        printResumeOnWeb(html);
        return;
    }

    // A4 at 72 PPI — one page; matches @page size in buildResumeHtml
    const { uri } = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
    });

    const safeName = (params.user.fullName || 'resume')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 40);
    const directory = uri.substring(0, uri.lastIndexOf('/') + 1);
    const dest = `${directory}EVerified_${safeName}_Resume.pdf`;

    try {
        await FileSystem.moveAsync({ from: uri, to: dest });
    } catch {
        // keep default uri
    }

    const shareUri = (await FileSystem.getInfoAsync(dest)).exists ? dest : uri;

    if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(shareUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Download EVerified Resume',
        UTI: 'com.adobe.pdf',
    });
}

/** English labels for admin resume downloads (no i18n context) */
export const ADMIN_RESUME_LABELS: ResumeLabels = {
    careerObjective: 'Career Objective',
    workExperience: 'Work Experience',
    qualification: 'Qualification',
    technicalSkills: 'Technical Skills',
    declaration: 'Declaration',
    declarationText:
        'I hereby declare that the above information is true to the best of my knowledge and belief.',
    signature: 'Signature',
    date: 'Date',
    mobile: 'Mobile',
    currentWorkshopLabel: 'Current Workshop/Company',
    totalExperience: 'Total Experience',
    brandsWorkedWith: 'Brands Worked With',
    years: 'Years',
    resumeTagline: 'Trusted Platform for EV & BS6 Workforce',
    notApplicable: 'N/A',
    fresher: 'Fresher',
};

export function mapApiProfileToUserData(profile: {
    id: string | number;
    fullName: string;
    phoneNumber: string;
    state?: string;
    city?: string;
    pincode?: string;
    qualification?: string;
    experience?: string;
    currentWorkshop?: string;
    brandWorkshop?: string;
    brands?: string[] | string;
    role: string;
    verificationStatus?: string;
    domain?: 'EV' | 'BS6';
    vehicle_category?: string;
    training_role?: string;
    is_admin_verified?: boolean;
    current_workshop?: string;
    brand_workshop?: string;
    prior_knowledge?: string;
    current_salary?: string;
}): UserData {
    return {
        id: String(profile.id),
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        state: profile.state || '',
        city: profile.city || '',
        pincode: profile.pincode,
        qualification: profile.qualification || '',
        experience: profile.experience || '',
        currentWorkshop: profile.currentWorkshop || profile.current_workshop || '',
        brandWorkshop: profile.brandWorkshop || profile.brand_workshop,
        brands: (profile.brands as string[] | undefined) || [],
        role: profile.role as UserData['role'],
        verificationStatus: (profile.verificationStatus || 'pending') as UserData['verificationStatus'],
        domain: profile.domain,
        vehicle_category: profile.vehicle_category as UserData['vehicle_category'],
        training_role: profile.training_role,
        is_admin_verified: profile.is_admin_verified,
        current_workshop: profile.current_workshop,
        brand_workshop: profile.brand_workshop,
        prior_knowledge: profile.prior_knowledge,
        current_salary: profile.current_salary,
    };
}

/** Role title on resume; onboarding selection (training_role) overrides generic role labels */
export function resolveResumeRoleTitle(user: UserData, jobRoleRequired?: string): string {
    if (jobRoleRequired?.trim()) {
        return jobRoleRequired.trim();
    }
    const onboardingTitle = (user.training_role || '').trim();
    if (onboardingTitle) {
        return onboardingTitle;
    }
    const role = (user.role || '').replace(/^Verified\s+/i, '');
    if (role === 'technician' && user.domain === 'BS6') {
        const category = user.vehicle_category ? ` (${user.vehicle_category})` : '';
        return `BS6 Technician${category}`;
    }
    switch (role.toLowerCase()) {
        case 'technician':
            return 'EV Technician';
        case 'sales':
            return 'EV Showroom Manager';
        case 'workshop':
            return 'EV Workshop Manager';
        case 'aspirant':
            return 'EV Aspirant';
        default:
            return role || 'Professional';
    }
}

export function buildResumeLabelsFromT(t: (key: string) => string): ResumeLabels {
    return {
        careerObjective: t('resumeCareerObjective'),
        workExperience: t('resumeWorkExperience'),
        qualification: t('resumeQualification'),
        technicalSkills: t('resumeTechnicalSkills'),
        declaration: t('resumeDeclaration'),
        declarationText: t('resumeDeclarationText'),
        signature: t('resumeSignature'),
        date: t('resumeDate'),
        mobile: t('resumeMobile'),
        currentWorkshopLabel: t('resumeCurrentWorkshop'),
        totalExperience: t('resumeTotalExperience'),
        brandsWorkedWith: t('resumeBrandsWorkedWith'),
        years: t('resumeYears'),
        resumeTagline: t('resumeTagline'),
        notApplicable: t('notApplicable'),
        fresher: t('fresher'),
    };
}
