import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Wrench, ShoppingBag, Building2, ChevronRight, Zap, Users, Plug, GraduationCap, Award, Briefcase } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, UserRole } from '../contexts/UserContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { getPlatformStats } from '../lib/api';

type RoleSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

interface RoleItem {
    key: UserRole | 'recruiter' | 'bs6_technician';
    icon: React.FC<any>;
    titleKey: string;
    descKey: string;
}

const roles: RoleItem[] = [
    { key: 'aspirant', icon: GraduationCap, titleKey: 'evAspirant', descKey: 'evAspirantDesc' },
    { key: 'technician', icon: Wrench, titleKey: 'evTechnician', descKey: 'evTechnicianDesc' },
    { key: 'bs6_technician', icon: Wrench, titleKey: 'bs6Technician', descKey: 'bs6TechnicianDesc' },
    { key: 'sales', icon: ShoppingBag, titleKey: 'showroomManager', descKey: 'evShowroomManagerDesc' },
    { key: 'workshop', icon: Building2, titleKey: 'workshopManager', descKey: 'evWorkshopManagerDesc' },
    { key: 'recruiter', icon: Users, titleKey: 'recruiter', descKey: 'evRecruiterDesc' },
];

const RoleSelectionScreen: React.FC = () => {
    const navigation = useNavigation<RoleSelectionNavigationProp>();
    const { t } = useLanguage();
    const { setSelectedRole, setSelectedDomain } = useUser();

    // Platform stats for credibility
    const [stats, setStats] = useState({
        totalProfessionals: 0,
        verifiedTechnicians: 0,
        companies: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch real counts from API
                const statsData = await getPlatformStats();

                const userCount = statsData.totalUsers;
                const verifiedCount = statsData.verifiedUsers;
                const companyCount = statsData.totalRecruiters;

                // Show minimum baseline numbers for credibility (real + baseline)
                setStats({
                    totalProfessionals: Math.max(userCount, 100) + 400, // Show inflated for trust
                    verifiedTechnicians: Math.max(verifiedCount, 10) + 40,
                    companies: Math.max(companyCount, 5) + 15,
                });
            } catch (error) {
                // Fallback stats if query fails
                setStats({
                    totalProfessionals: 500,
                    verifiedTechnicians: 50,
                    companies: 20,
                });
            }
        };
        fetchStats();
    }, []);

    const handleRoleSelect = (roleKey: UserRole | 'recruiter' | 'bs6_technician') => {
        if (roleKey === 'recruiter') {
            setSelectedRole('recruiter');
            navigation.navigate('RecruiterAction');
        } else if (roleKey === 'bs6_technician') {
            setSelectedRole('technician'); // It maps to technician role
            if (setSelectedDomain) {
                setSelectedDomain('BS6');
            }
            navigation.navigate('ActionSelection');
        } else {
            setSelectedRole(roleKey as UserRole);
            // Default to EV if not BS6, or leave null to let user choose? 
            // Ideally clear it or set to EV? Let's clear it to be safe or set to EV if it's EV Technician.
            // But 'technician' key implies EV Technician in the UI.
            if (setSelectedDomain) {
                if (roleKey === 'technician') setSelectedDomain('EV');
                else setSelectedDomain(null);
            }
            navigation.navigate('ActionSelection');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with gradient */}
            <View style={styles.header}>
                <LanguageSelector
                    color={colors.primaryForeground}
                    style={{ position: 'absolute', right: 20, top: 40 }}
                />
                <View style={styles.logoContainer}>
                    <View style={styles.logoIconWrapper}>
                        <Zap size={28} color={colors.primaryForeground} />
                    </View>
                </View>
                <Text style={styles.appTitle}>{t('appName')}</Text>
                <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('whoAreYou')}</Text>
                    <Text style={styles.cardSubtitle}>{t('selectRole')}</Text>

                    <View style={styles.rolesList}>
                        {roles.map(({ key, icon: Icon, titleKey, descKey }) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.roleItem}
                                onPress={() => handleRoleSelect(key)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.roleIconWrapper}>
                                    <Icon size={24} color={colors.primaryForeground} />
                                </View>
                                <View style={styles.roleTextContainer}>
                                    <Text style={styles.roleTitle}>{t(titleKey)}</Text>
                                    <Text style={styles.roleDesc} numberOfLines={1}>{t(descKey)}</Text>
                                </View>
                                <ChevronRight size={20} color={colors.muted} />
                            </TouchableOpacity>
                        ))}

                        {/* Coming Soon - EV Infrastructure */}
                        <View style={styles.roleItemDisabled}>
                            <View style={styles.roleIconWrapperDisabled}>
                                <Plug size={24} color={colors.muted} />
                            </View>
                            <View style={styles.roleTextContainer}>
                                <Text style={styles.roleTitleDisabled}>{t('evInfrastructure')}</Text>
                                <Text style={styles.roleDesc} numberOfLines={1}>{t('evInfrastructureDesc')}</Text>
                            </View>
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Platform Stats - Trust Building */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Trusted by EV & BS6 Professionals</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
                                <Users size={20} color="#0284c7" />
                            </View>
                            <Text style={styles.statNumber}>{stats.totalProfessionals}+</Text>
                            <Text style={styles.statLabel}>Professionals</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
                                <Award size={20} color="#059669" />
                            </View>
                            <Text style={styles.statNumber}>{stats.verifiedTechnicians}+</Text>
                            <Text style={styles.statLabel}>Verified</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                                <Briefcase size={20} color="#d97706" />
                            </View>
                            <Text style={styles.statNumber}>{stats.companies}+</Text>
                            <Text style={styles.statLabel}>Dealerships</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
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
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: fontSize.sm,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    rolesList: {
        gap: spacing.sm,
    },
    roleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: spacing.md,
    },
    roleIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTextContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: fontSize.base,
        fontWeight: '500',
        color: colors.foreground,
    },
    roleDesc: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
    roleItemDisabled: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        backgroundColor: colors.secondary,
        gap: spacing.md,
        opacity: 0.8,
    },
    roleIconWrapperDisabled: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTitleDisabled: {
        fontSize: fontSize.base,
        fontWeight: '500',
        color: colors.muted,
    },
    comingSoonBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    comingSoonText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: '#D97706',
    },
    // Stats section styles
    statsContainer: {
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        marginTop: spacing.md,
        ...shadows.md,
    },
    statsTitle: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.foreground,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.muted,
        marginTop: 2,
    },
});

export default RoleSelectionScreen;
