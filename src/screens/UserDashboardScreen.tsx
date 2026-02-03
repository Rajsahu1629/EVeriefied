import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    Briefcase, BookOpen, CreditCard, LogOut, CheckCircle,
    Clock, AlertCircle, Zap, ChevronRight
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { LanguageSelector } from '../components/LanguageSelector';

type UserDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'UserDashboard'>;

const UserDashboardScreen: React.FC = () => {
    const navigation = useNavigation<UserDashboardNavigationProp>();
    const { t } = useLanguage();
    const { userData, logout } = useUser();
    const [activeTab, setActiveTab] = useState<'jobs'>('jobs');

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
        });
    };

    const getStatusConfig = () => {
        const status = userData?.verificationStatus || 'pending';
        switch (status) {
            case 'verified':
                return {
                    icon: CheckCircle,
                    color: colors.success,
                    bgColor: 'rgba(16, 185, 129, 0.1)',
                    text: t('verified'),
                    message: t('verificationComplete'),
                };
            case 'step1_completed':
                return {
                    icon: Clock,
                    color: colors.warning,
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    text: t('step1Completed'),
                    message: t('completeStep2'),
                    showAction: true,
                };
            case 'failed':
                return {
                    icon: AlertCircle,
                    color: colors.error,
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    text: t('failed'),
                    message: t('retryAfter7Days'),
                };
            default:
                return {
                    icon: Clock,
                    color: colors.warning,
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    text: t('verificationPending'),
                    message: t('startVerification'),
                    showAction: true,
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>{t('welcome')}</Text>
                        <Text style={styles.userName}>{userData?.fullName}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>
                            {userData?.domain === 'BS6' && userData?.role === 'technician' ? 'BS6 Technician' :
                                userData?.role === 'aspirant' ? (userData?.domain === 'BS6' ? 'BS6 Fresher' : t('fresher')) :
                                    userData?.role === 'technician' ? t('evTechnician') :
                                        userData?.role === 'sales' ? t('evShowroomManager') :
                                            userData?.role === 'workshop' ? t('evWorkshopManager') :
                                                userData?.role === 'workshop' ? t('evWorkshopManager') :
                                                    (userData?.role ? (userData.role as string).charAt(0).toUpperCase() + (userData.role as string).slice(1) : '')}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <LanguageSelector color={colors.primaryForeground} />
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <LogOut size={24} color={colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Verification Status Card */}
                <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
                    <View style={styles.statusCardContent}>
                        <StatusIcon size={24} color={statusConfig.color} />
                        <View style={styles.statusTextContainer}>
                            <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
                                {statusConfig.text}
                            </Text>
                            <Text style={styles.statusMessage}>{statusConfig.message}</Text>
                        </View>
                        {statusConfig.showAction && (
                            <TouchableOpacity
                                style={styles.statusAction}
                                onPress={() => navigation.navigate('SkillVerification', { step: 1 })}
                            >
                                <ChevronRight size={20} color={statusConfig.color} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Jobs Content */}
            <ScrollView style={styles.content}>
                <View style={styles.tabContent}>
                    <View style={styles.emptyState}>
                        <Briefcase size={48} color={colors.muted} />
                        <Text style={styles.emptyStateText}>{t('noJobsYetMessage')}</Text>
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
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    userName: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primaryForeground,
    },
    logoutButton: {
        padding: spacing.sm,
    },
    statusCard: {
        borderRadius: borderRadius.xl,
        padding: spacing.md,
    },
    statusCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        fontSize: fontSize.base,
        fontWeight: '600',
    },
    statusMessage: {
        fontSize: fontSize.sm,
        color: colors.foreground,
        marginTop: 2,
    },
    statusAction: {
        padding: spacing.sm,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.primary,
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: spacing.lg,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyStateText: {
        fontSize: fontSize.base,
        color: colors.muted,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    comingSoonBadge: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    comingSoonText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: '#D97706',
    },
    idCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        ...shadows.lg,
        overflow: 'hidden',
    },
    idCardHeader: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
    },
    idCardLogo: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    idCardTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primaryForeground,
    },
    idCardBody: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    idCardName: {
        fontSize: fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.foreground,
        textAlign: 'center',
    },
    idCardRole: {
        fontSize: fontSize.base,
        color: colors.primary,
        fontWeight: '500',
        marginTop: spacing.xs,
    },
    idCardPhone: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: spacing.sm,
    },
    idCardFooter: {
        padding: spacing.lg,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    idCardStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    idCardStatusText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
});

export default UserDashboardScreen;
