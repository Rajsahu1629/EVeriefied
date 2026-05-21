import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import kn from './locales/kn.json';
import te from './locales/te.json';
import or from './locales/or.json';

export type Language = 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'or';

export const LANGUAGE_KEY = '@app_language';

export const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    kn: { translation: kn },
    te: { translation: te },
    or: { translation: or },
};

function mapDeviceLocaleToAppLocale(): Language {
    const tag = Localization.getLocales()[0]?.languageCode?.toLowerCase() || 'en';
    const map: Record<string, Language> = {
        en: 'en',
        hi: 'hi',
        mr: 'mr',
        kn: 'kn',
        te: 'te',
        or: 'or',
    };
    return map[tag] || 'en';
}

let initPromise: Promise<void> | null = null;

export function initI18n(): Promise<void> {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        let initial: Language = mapDeviceLocaleToAppLocale();
        try {
            const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (saved && saved in resources) {
                initial = saved as Language;
            }
        } catch {
            // use device default
        }

        await i18n.use(initReactI18next).init({
            resources,
            lng: initial,
            fallbackLng: 'en',
            compatibilityJSON: 'v4',
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
        });
    })();

    return initPromise;
}

export async function changeAppLanguage(lang: Language): Promise<void> {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export default i18n;
