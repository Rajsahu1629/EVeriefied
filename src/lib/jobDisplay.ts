/** Format job listing fields using proper i18n (not English words in other scripts). */

export function formatVehicleCategory(
    category: string | undefined,
    t: (key: string) => string
): string {
    if (category === '2W') return t('twoWheeler');
    if (category === '3W') return t('threeWheeler');
    return category;
}

export function formatJobExperience(
    exp: string | undefined,
    t: (key: string, opts?: Record<string, unknown>) => string
): string {
    if (!exp) return t('experienceYears', { count: '0–1' });
    const lower = exp.toLowerCase().trim();
    if (lower === 'fresher') return t('fresher');
    if (lower === '0-1' || lower === '0–1') return t('experienceYears', { count: '0–1' });
    if (lower === '1-2') return t('experienceYears', { count: '1+' });
    if (lower === '2-5') return t('experienceYears', { count: '2+' });
    if (lower === '5+') return t('experienceYears', { count: '5+' });
    // DB values like "2-3", "2-3 years"
    const cleaned = lower.replace(/\s*years?\s*/gi, '').trim();
    return t('experienceYears', { count: cleaned });
}

export function formatJobSalary(
    min: number | null,
    max: number | null,
    t: (key: string, opts?: Record<string, unknown>) => string
): string {
    const formatK = (n: number) => (n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`);
    if (!min && !max) return t('negotiable');
    if (min && max) return `${formatK(min)} - ${formatK(max)}`;
    if (min) return `${formatK(min)}+`;
    return t('salaryUpTo', { amount: formatK(max!) });
}

export function formatVacancyCount(
    count: string | number | undefined,
    t: (key: string, opts?: Record<string, unknown>) => string
): string {
    const n = count ?? '1';
    return t('vacanciesCount', { count: String(n) });
}
