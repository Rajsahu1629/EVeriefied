import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    ArrowLeft, MapPin, Users, Clock, CheckCircle, Briefcase,
    Calendar, Zap, Building2, Home, Award, Timer, XCircle, Edit2
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { getRecruiterJobs } from '../lib/api';

type PreviousJobsNavigationProp = StackNavigationProp<RootStackParamList, 'PreviousJobs'>;

interface JobPost {
    id: string;
    brand: string;
    role_required: string;
    number_of_people: string;
    experience: string;
    salary_min: number;
    salary_max: number;
    city: string;
    pincode: string;
    status: string;
    has_incentive: boolean;
    stay_provided: boolean;
    urgency: string;
    created_at: string;
    application_count?: number;
    training_role?: string;
    vehicle_category?: string;
}

const PreviousJobsScreen: React.FC = () => {
    const navigation = useNavigation<PreviousJobsNavigationProp>();
    const { t } = useLanguage();
    const { recruiterData } = useUser();

    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadJobs();
        }, [])
    );

    const loadJobs = async () => {
        try {
            if (recruiterData?.id) {
                const result = await getRecruiterJobs(recruiterData.id);
                setJobs(result);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return { text: 'Live', color: '#10b981', bgColor: '#d1fae5' };
            case 'pending':
                return { text: 'Pending Approval', color: '#f59e0b', bgColor: '#fef3c7' };
            case 'rejected':
                return { text: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' };
            case 'profiles_sent':
                return { text: 'Profiles Sent', color: '#8b5cf6', bgColor: '#ede9fe' };
            case 'trial_booked':
                return { text: 'Trial Booked', color: '#10b981', bgColor: '#d1fae5' };
            default:
                return { text: 'Draft', color: '#6b7280', bgColor: '#f3f4f6' };
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return t('evTechnician');
            case 'bs6_technician': return t('bs6Technician');
            case 'sales': return t('showroomManager');
            case 'workshop': return t('workshopManager');
            case 'fresher': return t('fresher');
            default: return role;
        }
    };

    const formatSalary = (min: number, max: number) => {
        const formatK = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();
        if (!min && !max) return 'Negotiable';
        if (min && max) return `₹ ${formatK(min)} - ₹ ${formatK(max)} per month`;
        if (min) return `₹ ${formatK(min)}+ per month`;
        return `Up to ₹ ${formatK(max)} per month`;
    };

    const formatExperience = (exp: string) => {
        if (!exp || exp === 'fresher') return t('fresher'); // "Fresher"
        // Check if exp already has "Years" or similar (though likely stored as just number or "1-2")
        // User wants "1+ Experienced" or "1+ Years Experienced"
        // Let's go with "X Years Experienced" as requested
        return `${exp} Years Experienced`;
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('previousJobPosts')}</Text>
                <View style={styles.jobCount}>
                    <Text style={styles.jobCountText}>{jobs.length}</Text>
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : jobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Briefcase size={60} color={colors.muted} />
                    <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
                    <Text style={styles.emptyText}>Post your first job to start hiring!</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {jobs.map((job) => {
                        const statusConfig = getStatusConfig(job.status);
                        const isNew = new Date(job.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                        return (
                            <View key={job.id} style={styles.jobCard}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconContainer}>
                                        <Briefcase size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.headerInfo}>
                                        <Text style={styles.roleText}>
                                            {getRoleLabel(job.role_required)}
                                            {job.vehicle_category ? ` (${job.vehicle_category})` : ''}
                                        </Text>
                                        {job.training_role && (
                                            <Text style={{ fontSize: 13, color: colors.primary, marginTop: 2, fontWeight: '500' }}>
                                                {job.training_role}
                                            </Text>
                                        )}
                                        <Text style={styles.companyText}>{job.brand}</Text>
                                    </View>

                                    {/* Edit Button */}
                                    <TouchableOpacity
                                        style={styles.editBtn}
                                        onPress={() => navigation.navigate('PostJob', { isEditMode: true, jobData: job } as any)}
                                    >
                                        <Edit2 size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Salary Row */}
                                <View style={styles.salaryRow}>
                                    <Text style={styles.salaryText}>{formatSalary(job.salary_min, job.salary_max)}</Text>
                                </View>

                                {/* Location */}
                                <View style={styles.locationRow}>
                                    <MapPin size={14} color="#ef4444" />
                                    <Text style={styles.locationText}>
                                        {job.city || 'Location TBD'} {job.pincode ? `(${job.pincode})` : ''}
                                    </Text>
                                </View>

                                {/* Tags Row */}
                                <View style={styles.tagsRow}>
                                    {isNew && (
                                        <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                                            <Zap size={12} color="#2563eb" />
                                            <Text style={[styles.tagText, { color: '#2563eb' }]}>New</Text>
                                        </View>
                                    )}
                                    <View style={[styles.tag, { backgroundColor: '#f3f4f6' }]}>
                                        <Timer size={12} color="#6b7280" />
                                        <Text style={[styles.tagText, { color: '#6b7280' }]}>
                                            {job.urgency === 'immediate' ? 'Urgent' : 'Regular'}
                                        </Text>
                                    </View>
                                    <View style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                                        <Users size={12} color="#d97706" />
                                        <Text style={[styles.tagText, { color: '#d97706' }]}>
                                            {job.number_of_people} Vacancies
                                        </Text>
                                    </View>
                                    {job.has_incentive && (
                                        <View style={[styles.tag, { backgroundColor: '#d1fae5' }]}>
                                            <Award size={12} color="#059669" />
                                            <Text style={[styles.tagText, { color: '#059669' }]}>Incentive</Text>
                                        </View>
                                    )}
                                    {job.stay_provided && (
                                        <View style={[styles.tag, { backgroundColor: '#ede9fe' }]}>
                                            <Home size={12} color="#7c3aed" />
                                            <Text style={[styles.tagText, { color: '#7c3aed' }]}>Stay</Text>
                                        </View>
                                    )}
                                    <View style={[styles.tag, { backgroundColor: '#e0f2fe' }]}>
                                        <Briefcase size={12} color="#0284c7" />
                                        <Text style={[styles.tagText, { color: '#0284c7' }]}>
                                            {formatExperience(job.experience)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Divider */}
                                <View style={styles.divider} />

                                {/* Footer */}
                                <View style={styles.cardFooter}>
                                    <TouchableOpacity
                                        style={styles.applicantInfo}
                                        onPress={() => navigation.navigate('JobApplicants', {
                                            jobId: job.id,
                                            jobTitle: `${getRoleLabel(job.role_required)}${job.vehicle_category ? ` (${job.vehicle_category})` : ''}`
                                        } as any)}
                                    >
                                        <Users size={14} color={colors.primary} />
                                        <Text style={[styles.applicantText, { color: colors.primary, textDecorationLine: 'underline' }]}>
                                            {job.application_count || 0} applicant{(job.application_count || 0) !== 1 ? 's' : ''}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={styles.footerMeta}>
                                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                                {statusConfig.text}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Work Flow Tracker */}
                                <View style={styles.workflowSection}>
                                    <Text style={styles.workflowTitle}>Job Work Flow</Text>
                                    <View style={styles.workflowContainer}>
                                        {/* Step 1: Posted */}
                                        <View style={styles.workflowStep}>
                                            <View style={[styles.stepCircle, { backgroundColor: '#10b981' }]}>
                                                <CheckCircle size={10} color="#fff" />
                                            </View>
                                            <Text style={styles.stepLabel}>Posted</Text>
                                        </View>

                                        <View style={[styles.stepLine, { backgroundColor: job.status !== 'pending' ? '#10b981' : '#e2e8f0' }]} />

                                        {/* Step 2: Approved */}
                                        <View style={styles.workflowStep}>
                                            <View style={[styles.stepCircle, {
                                                backgroundColor: job.status === 'pending' ? '#fde68a' : (job.status === 'rejected' ? '#fecaca' : '#10b981')
                                            }]}>
                                                {job.status === 'pending' ? <Clock size={10} color="#d97706" /> : (job.status === 'rejected' ? <XCircle size={10} color="#ef4444" /> : <CheckCircle size={10} color="#fff" />)}
                                            </View>
                                            <Text style={styles.stepLabel}>{job.status === 'rejected' ? 'Rejected' : 'Approved'}</Text>
                                        </View>

                                        <View style={[styles.stepLine, { backgroundColor: (job.status !== 'pending' && job.status !== 'rejected') ? '#10b981' : '#e2e8f0' }]} />

                                        {/* Step 3: Live */}
                                        <View style={styles.workflowStep}>
                                            <View style={[styles.stepCircle, {
                                                backgroundColor: (job.status === 'approved' || job.status === 'profiles_sent' || job.status === 'trial_booked') ? '#10b981' : '#e2e8f0'
                                            }]}>
                                                {(job.status === 'approved' || job.status === 'profiles_sent' || job.status === 'trial_booked') ? <Users size={10} color="#fff" /> : <Zap size={10} color="#94a3b8" />}
                                            </View>
                                            <Text style={styles.stepLabel}>Live</Text>
                                        </View>

                                        <View style={[styles.stepLine, { backgroundColor: (job.status === 'profiles_sent' || job.status === 'trial_booked') ? '#10b981' : '#e2e8f0' }]} />

                                        {/* Step 4: Profiles */}
                                        <View style={styles.workflowStep}>
                                            <View style={[styles.stepCircle, {
                                                backgroundColor: (job.status === 'profiles_sent' || job.status === 'trial_booked') ? '#10b981' : '#e2e8f0'
                                            }]}>
                                                {(job.status === 'profiles_sent' || job.status === 'trial_booked') ? <CheckCircle size={10} color="#fff" /> : <Clock size={10} color="#94a3b8" />}
                                            </View>
                                            <Text style={styles.stepLabel}>Profiles</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Time Posted */}
                                <View style={styles.timeRow}>
                                    <Calendar size={12} color={colors.muted} />
                                    <Text style={styles.timeText}>Posted {getTimeAgo(job.created_at)}</Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.foreground,
    },
    jobCount: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    jobCountText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.lg,
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
        gap: spacing.md,
    },

    // Job Card
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(26, 157, 110, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e40af',
    },
    companyText: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 2,
    },
    editBtn: {
        padding: spacing.xs,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },

    // Salary
    salaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 4,
    },
    salaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },

    // Location
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#64748b',
    },

    // Tags
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: spacing.sm,
    },

    // Footer
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    applicantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    applicantText: {
        fontSize: 12,
        color: colors.muted,
    },
    footerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Time Row
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: spacing.xs,
    },
    timeText: {
        fontSize: 11,
        color: colors.muted,
    },
    // Workflow Tracker Styles
    workflowSection: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    workflowTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.muted,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    workflowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    workflowStep: {
        alignItems: 'center',
        zIndex: 1,
    },
    stepCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#e2e8f0',
        marginTop: -18, // Align with circles
        marginHorizontal: -2,
    },
    stepLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 2,
    },
});

export default PreviousJobsScreen;
