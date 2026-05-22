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
    let raw = user.brands;
    if (!raw) return [];
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            return raw ? [raw] : [];
        }
    }
    if (!Array.isArray(raw)) return [];
    return raw.filter((b) => b && String(b).trim() && b !== 'Other');
}

function getCareerObjective(user: UserData, roleTitle: string): string {
    const isBs6 =
        user.domain === 'BS6' ||
        (user.role === 'technician' && roleTitle.toLowerCase().includes('bs6'));

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
      margin: 10mm 12mm;
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
      font-size: 9.5pt;
      line-height: 1.28;
    }
    .resume-page {
      max-height: 277mm;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
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
      font-size: 17pt;
      font-weight: 700;
      margin: 0 0 4px;
      color: #111;
      letter-spacing: 0.2px;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 2px 0;
      font-size: 9pt;
      color: #333;
    }
    .contact-icon { font-size: 9pt; }
    .divider {
      border: none;
      border-top: 1px solid #c5c5c5;
      margin: 5px 0;
    }

    section { margin: 0; }
    h2.section-title {
      font-size: 10pt;
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
      font-size: 9.5pt;
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
      font-size: 9pt;
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
    ${trainingRole ? `<p class="labeled-line"><strong>Role/Position:</strong> ${escapeHtml(trainingRole)}</p>` : ''}
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

/** Role title on resume; optional job role from vacancy takes precedence when sensible */
export function resolveResumeRoleTitle(user: UserData, jobRoleRequired?: string): string {
    if (jobRoleRequired?.trim()) {
        return jobRoleRequired.trim();
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
