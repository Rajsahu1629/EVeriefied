import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    StatusBar,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft, MapPin, Phone, Briefcase,
    CheckCircle, Award, MessageCircle, Clock
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getJobApplicants } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Applicant {
    id: number;
    full_name: string;
    phone_number: string;
    role: string;
    city: string;
    pincode: string;
    experience: string;
    verification_status: string;
    vehicle_category?: string;
    current_salary?: string;
    applied_at: string;
    is_admin_verified?: boolean;
}

export default function JobApplicantsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const params = route.params as { jobId: number; jobTitle: string } | undefined;
    const jobId = params?.jobId;
    const jobTitle = params?.jobTitle || 'Job';
    const { t } = useLanguage();

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplicants = useCallback(async () => {
        if (!jobId) return;

        try {
            const result = await getJobApplicants(jobId);
            setApplicants(result);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            Alert.alert('Error', 'Failed to load applicants');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplicants();
    };

    // Mask phone number - show only first 4 digits
    const maskPhone = (phone: string) => {
        if (!phone || phone.length < 4) return '**********';
        return phone.substring(0, 4) + 'XXXXXX';
    };

    const formatExperience = (exp: string) => {
        if (!exp || exp === 'fresher') return t('fresher');
        return `${exp} ${t('years')} Experienced`;
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return 'EV Technician';
            case 'sales': return 'EV Showroom Manager';
            case 'workshop': return 'EV Workshop Manager';
            case 'aspirant': return 'EV Aspirant';
            default: return role || 'Professional';
        }
    };

    // Connect with Admin via WhatsApp
    const handleConnectWithAdmin = (candidateName: string, role: string, city: string) => {
        const adminPhone = '919473928468';
        const message = `Hi EVerified Team!\n\nI would like to schedule an interview with this candidate from my job post "${jobTitle}":\n\n👤 Name: ${candidateName}\n💼 Role: ${role}\n📍 Location: ${city}\n\nPlease share their contact details and help schedule an interview.`;
        Linking.openURL(`whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`).catch(() => {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to connect.');
        });
    };

    const renderApplicant = ({ item }: { item: Applicant }) => {
        // Two-tier verification logic
        const isTestPassed = item.verification_status === 'verified' || item.verification_status === 'approved';
        const isFullyVerified = isTestPassed && item.is_admin_verified === true;
        const isPending = !isTestPassed;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.full_name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.nameSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.name}>{item.full_name || 'Unknown'}</Text>
                            {isFullyVerified && <CheckCircle size={16} color="#4CAF50" />}
                            {isTestPassed && !isFullyVerified && <CheckCircle size={16} color="#FFC107" />}
                            {isPending && <Clock size={16} color="#f59e0b" />}
                        </View>

                        <Text style={styles.role}>
                            {getRoleLabel(item.role)}
                            {item.vehicle_category ? ` (${item.vehicle_category})` : ''}
                        </Text>
                    </View>
                    {/* Status Badge - Green for admin verified, Yellow for test passed */}
                    <View style={[
                        styles.statusBadge,
                        isFullyVerified ? styles.verifiedBadge :
                            isTestPassed ? styles.testPassedBadge : styles.pendingBadge
                    ]}>
                        <Award size={12} color="#fff" />
                        <Text style={styles.statusText}>
                            {isFullyVerified ? 'Verified' : isTestPassed ? 'Test Passed' : 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <MapPin size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{item.city || 'N/A'} ({item.pincode || 'N/A'})</Text>
                </View>

                <View style={styles.infoRow}>
                    <Briefcase size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{formatExperience(item.experience)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Phone size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{maskPhone(item.phone_number)}</Text>
                </View>

                {item.current_salary && item.current_salary !== '0' && (
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoText, { color: colors.primaryDark, fontWeight: '600' }]}>
                            ₹ {item.current_salary} {t('currentSalary')}
                        </Text>
                    </View>
                )}

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.connectBtn]}
                        onPress={() => handleConnectWithAdmin(item.full_name, getRoleLabel(item.role), item.city)}
                    >
                        <MessageCircle size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Connect with Admin</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Applicants</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{applicants.length}</Text>
                </View>
            </View>

            {/* Job Title */}
            <View style={styles.jobTitleContainer}>
                <Text style={styles.jobTitleLabel}>For:</Text>
                <Text style={styles.jobTitleText}>{jobTitle}</Text>
            </View>

            {/* Applicants List */}
            <FlatList
                data={applicants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderApplicant}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Briefcase size={50} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No Applicants Yet</Text>
                        <Text style={styles.emptyText}>Once candidates apply, they will appear here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: spacing.xs,
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginLeft: spacing.sm,
    },
    countBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    countText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    jobTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.secondary,
        gap: spacing.xs,
    },
    jobTitleLabel: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    jobTitleText: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.primary,
    },
    listContent: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '700',
    },
    nameSection: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    name: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.foreground,
    },
    role: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    verifiedBadge: {
        backgroundColor: '#4CAF50',
    },
    testPassedBadge: {
        backgroundColor: '#FFC107',
    },
    pendingBadge: {
        backgroundColor: '#f59e0b',
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    connectBtn: {
        backgroundColor: colors.primary,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: spacing.xs,
    },
});
