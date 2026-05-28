import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import {
    initI18n,
    changeAppLanguage,
    languages,
    type Language,
} from '../i18n';
import { colors } from '../lib/theme';

export type { Language };
export { languages } from '../i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string, options?: Record<string, unknown>) => string;
    toggleLanguage: () => void;
    availableLanguages: typeof languages;
    isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t: i18nT, i18n } = useTranslation();
    const language = (i18n.language || 'en') as Language;

    const setLanguage = useCallback(async (lang: Language) => {
        await changeAppLanguage(lang);
    }, []);

    const t = useCallback(
        (key: string, options?: Record<string, unknown>) => String(i18nT(key, options)),
        [i18nT]
    );

    const toggleLanguage = useCallback(() => {
        const next: Language = language === 'hi' ? 'en' : 'hi';
        void setLanguage(next);
    }, [language, setLanguage]);

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t,
                toggleLanguage,
                availableLanguages: languages,
                isReady: true,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initI18n().then(() => setIsReady(true));
    }, []);

    if (!isReady) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return <LanguageProviderInner>{children}</LanguageProviderInner>;
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
