import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Check, Languages, Zap } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

const { width } = Dimensions.get('window');

type LanguageSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelectionScreen: React.FC = () => {
    const navigation = useNavigation<LanguageSelectionNavigationProp>();
    const { language, setLanguage, t, availableLanguages } = useLanguage();
    const [selectedCode, setSelectedCode] = useState(language);

    const handleContinue = async () => {
        await setLanguage(selectedCode);
        navigation.navigate('RoleSelection');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoIconWrapper}>
                        <Zap size={32} color={colors.primaryForeground} />
                    </View>
                    <Text style={styles.title}>{t('appName')}</Text>
                    <Text style={styles.subtitle}>{t('selectLanguage')}</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.languageList}
                >
                    {availableLanguages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageItem,
                                selectedCode === lang.code && styles.languageItemActive
                            ]}
                            onPress={() => setSelectedCode(lang.code)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={[
                                    styles.languageNative,
                                    selectedCode === lang.code && styles.textActive
                                ]}>
                                    {lang.native}
                                </Text>
                                <Text style={styles.languageLabel}>{lang.label}</Text>
                            </View>
                            {selectedCode === lang.code && (
                                <View style={styles.checkWrapper}>
                                    <Check size={20} color={colors.primaryForeground} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>{t('continue')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.xxl,
        marginBottom: spacing.xl,
    },
    logoIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    title: {
        fontSize: fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.lg,
        color: colors.muted,
        fontWeight: '500',
    },
    languageList: {
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    languageItemActive: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
    },
    languageInfo: {
        flex: 1,
    },
    languageNative: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    languageLabel: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
    textActive: {
        color: colors.primary,
    },
    checkWrapper: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    continueButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    continueButtonText: {
        color: colors.primaryForeground,
        fontSize: fontSize.base,
        fontWeight: 'bold',
    },
});

export default LanguageSelectionScreen;
