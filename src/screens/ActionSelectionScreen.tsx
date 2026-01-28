import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FileText, LogIn, ChevronRight, ArrowLeft, Zap } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

type ActionSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'ActionSelection'>;

const ActionSelectionScreen: React.FC = () => {
    const navigation = useNavigation<ActionSelectionNavigationProp>();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('RoleSelection');
                        }
                    }}
                >
                    <ArrowLeft size={24} color={colors.primaryForeground} />
                </TouchableOpacity>
                <LanguageToggle />

                <View style={styles.logoContainer}>
                    <View style={styles.logoIconWrapper}>
                        <Zap size={28} color={colors.primaryForeground} />
                    </View>
                </View>
                <Text style={styles.appTitle}>{t('appName')}</Text>
                <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('whatToDo')}</Text>

                    <View style={styles.actionsList}>
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => navigation.navigate('VerificationForm')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.actionIconWrapper}>
                                <FileText size={24} color={colors.primaryForeground} />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>{t('applyForVerification')}</Text>
                                <Text style={styles.actionDesc}>{t('applyDesc')}</Text>
                            </View>
                            <ChevronRight size={20} color={colors.muted} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconWrapper, styles.actionIconSecondary]}>
                                <LogIn size={24} color={colors.primary} />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>{t('login')}</Text>
                                <Text style={styles.actionDesc}>{t('loginDesc')}</Text>
                            </View>
                            <ChevronRight size={20} color={colors.muted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xxl + spacing.lg,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: spacing.xl,
        left: spacing.md,
        padding: spacing.sm,
        zIndex: 100,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.primaryForeground,
        textAlign: 'center',
    },
    tagline: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        marginTop: -spacing.xl,
        paddingHorizontal: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        ...shadows.lg,
    },
    cardTitle: {
        fontSize: fontSize.xl,
        fontWeight: '600',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    actionsList: {
        gap: spacing.sm,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: spacing.md,
    },
    actionIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconSecondary: {
        backgroundColor: colors.secondary,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontSize.base,
        fontWeight: '500',
        color: colors.foreground,
    },
    actionDesc: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
});

export default ActionSelectionScreen;
