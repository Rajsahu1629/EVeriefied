import type { Language } from '../i18n';

type LocalizedFields = {
    en?: string;
    hi?: string;
    mr?: string;
    kn?: string;
    te?: string;
    or?: string;
};

export function pickLocalizedText(
    fields: LocalizedFields | null | undefined,
    language: Language,
    fallback = ''
): string {
    if (!fields) return fallback;
    const order: Language[] = [language, 'en', 'hi'];
    for (const lang of order) {
        const value = fields[lang as keyof LocalizedFields];
        if (value && String(value).trim()) return String(value);
    }
    return fallback;
}

export function pickLocalizedOption(
    option: LocalizedFields & { isCorrect?: boolean },
    language: Language
): string {
    return pickLocalizedText(option, language, option.en || '');
}

export interface VerificationQuestionRow {
    question_text_en: string;
    question_text_hi?: string;
    question_text_mr?: string;
    question_text_kn?: string;
    question_text_te?: string;
    question_text_or?: string;
    options?: Array<LocalizedFields & { isCorrect?: boolean }> | string;
}

export function getQuestionText(q: VerificationQuestionRow, language: Language): string {
    return pickLocalizedText(
        {
            en: q.question_text_en,
            hi: q.question_text_hi,
            mr: q.question_text_mr,
            kn: q.question_text_kn,
            te: q.question_text_te,
            or: q.question_text_or,
        },
        language,
        q.question_text_en
    );
}

export function parseQuestionOptions(
    options: VerificationQuestionRow['options']
): Array<LocalizedFields & { isCorrect?: boolean }> {
    if (!options) return [];
    if (typeof options === 'string') {
        try {
            return JSON.parse(options);
        } catch {
            return [];
        }
    }
    return options;
}
