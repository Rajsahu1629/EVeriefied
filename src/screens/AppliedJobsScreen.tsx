import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, layout } from '../lib/theme';
import { TabScreenHeader } from '../components/TabScreenHeader';
import {
    Briefcase, MapPin, CheckCircle, Clock, Building2,
    Calendar, Users, Award, Home, Zap, Send, XCircle
} from 'lucide-react-native';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserApplications } from '../lib/api';

// Type for applied job with job details
interface AppliedJob {
    id: number;
    job_post_id: number;
    status: string;
    applied_at: string;
    // Job post details
    brand: string;
    role_required: string;
    city: string;
    pincode: string;
    salary_min: number;
    salary_max: number;
    experience: string;
    has_incentive: boolean;
    stay_provided: boolean;
    number_of_people: string;
    job_description: string;
    rejection_reason?: string;
}

export default function AppliedJobsScreen() {
    const { t } = useLanguage();
    const { userData } = useUser();
    const [applications, setApplications] = useState<AppliedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch user's applications with job details via API
    const fetchApplications = useCallback(async () => {
        if (!userData?.id) return;

        try {
            const result = await getUserApplications(userData.id);
            setApplications(result);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }, [userData?.id]);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchApplications();
            setLoading(false);
        };
        loadData();
    }, [fetchApplications]);

    // Pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    };

    // Format date
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return t('today');
            if (diffDays === 1) return t('yesterday');
            if (diffDays < 7) return t('daysAgo', { count: diffDays });
            if (diffDays < 30) return t('weeksAgo', { count: Math.floor(diffDays / 7) });
            return t('monthsAgo', { count: Math.floor(diffDays / 30) });
        } catch {
            return t('recently');
        }
    };

    // Get status config
    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'shortlisted':
                return { text: t('shortlistedStatus'), color: '#8b5cf6', bgColor: '#ede9fe', icon: CheckCircle };
            case 'interview':
                return { text: t('interview'), color: '#0ea5e9', bgColor: '#e0f2fe', icon: Calendar };
            case 'rejected':
                return { text: t('notSelected'), color: '#ef4444', bgColor: '#fee2e2', icon: Clock };
            case 'hired':
                return { text: t('hiredCelebration'), color: '#059669', bgColor: '#d1fae5', icon: Award };
            default:
                return { text: t('applied'), color: '#1a9d6e', bgColor: '#d1fae5', icon: Send };
        }
    };

    // Format salary
    const formatSalary = (min: number, max: number) => {
        const formatK = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();
        if (!min && !max) return t('negotiable');
        if (min && max) return `₹ ${formatK(min)} - ₹ ${formatK(max)}`;
        if (min) return `₹ ${formatK(min)}+`;
        return `Up to ₹ ${formatK(max)}`;
    };

    // Get role label
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return t('evTechnician');
            case 'sales': return t('evShowroomManager');
            case 'workshop': return t('evWorkshopManager');
            default: return role || t('jobRole');
        }
    };

    // Render application card
    const renderItem = ({ item }: { item: AppliedJob }) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;
        const isRecent = new Date(item.applied_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    setSelectedJob(item);
                    setModalVisible(true);
                }}
                style={styles.jobCard}
            >
                {/* Applied Badge */}
                <View style={styles.appliedBadge}>
                    <CheckCircle size={12} color="#fff" />
                    <Text style={styles.appliedBadgeText}>{t('applied')}</Text>
                </View>

                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Briefcase size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.roleText}>{getRoleLabel(item.role_required)}</Text>
                        <Text style={styles.companyText}>{item.brand || t('company')}</Text>
                    </View>
                </View>

                {/* Salary Row */}
                <View style={styles.salaryRow}>
                    <Text style={styles.salaryText}>{formatSalary(item.salary_min, item.salary_max)} {t('perMonth')}</Text>
                </View>

                {/* Location */}
                <View style={styles.locationRow}>
                    <MapPin size={14} color="#ef4444" />
                    <Text style={styles.locationText}>
                        {item.city || t('locationTbd')}{item.pincode ? ` (${item.pincode})` : null}
                    </Text>
                </View>

                {/* Tags Row */}
                <View style={styles.tagsRow}>
                    {isRecent ? (
                        <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                            <Zap size={12} color="#2563eb" />
                            <Text style={[styles.tagText, { color: '#2563eb' }]}>{t('recent')}</Text>
                        </View>
                    ) : null}
                    {item.has_incentive ? (
                        <View style={[styles.tag, { backgroundColor: '#d1fae5' }]}>
                            <Award size={12} color="#059669" />
                            <Text style={[styles.tagText, { color: '#059669' }]}>{t('incentive')}</Text>
                        </View>
                    ) : null}
                    {item.stay_provided ? (
                        <View style={[styles.tag, { backgroundColor: '#ede9fe' }]}>
                            <Home size={12} color="#7c3aed" />
                            <Text style={[styles.tagText, { color: '#7c3aed' }]}>{t('stay')}</Text>
                        </View>
                    ) : null}
                    {item.number_of_people != null && String(item.number_of_people) !== '' ? (
                        <View style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                            <Users size={12} color="#d97706" />
                            <Text style={[styles.tagText, { color: '#d97706' }]}>{item.number_of_people} {t('vacancies')}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Footer - Status and Time */}
                <View style={styles.cardFooter}>
                    <View style={styles.timeInfo}>
                        <Calendar size={14} color={colors.muted} />
                        <Text style={styles.timeText}>{t('appliedOn', { date: formatDate(item.applied_at) })}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <StatusIcon size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.text}
                        </Text>
                    </View>
                </View>

                {item.status === 'rejected' && item.rejection_reason ? (
                    <Text style={styles.rejectionReason}>
                        {t('rejectionReason')}: {item.rejection_reason}
                    </Text>
                ) : null}

                {/* Workflow Tracker (Candidates) */}
                <View style={styles.workflowSection}>
                    <Text style={styles.workflowTitle}>{t('applicationStatus')}</Text>
                    <View style={styles.workflowContainer}>
                        {/* Step 1: Applied */}
                        <View style={styles.workflowStep}>
                            <View style={[styles.stepCircle, { backgroundColor: '#10b981' }]}>
                                <CheckCircle size={10} color="#fff" />
                            </View>
                            <Text style={styles.stepLabel}>{t('applied')}</Text>
                        </View>

                        <View style={[styles.stepLine, { backgroundColor: item.status !== 'applied' ? '#10b981' : '#e2e8f0' }]} />

                        {/* Step 2: In Review (Viewed) */}
                        <View style={styles.workflowStep}>
                            <View style={[styles.stepCircle, {
                                backgroundColor: (item.status === 'viewed' || item.status === 'shortlisted' || item.status === 'interview' || item.status === 'hired' || item.status === 'rejected') ? '#10b981' : '#e2e8f0'
                            }]}>
                                {(item.status === 'viewed' || item.status === 'shortlisted' || item.status === 'interview' || item.status === 'hired' || item.status === 'rejected') ? <CheckCircle size={10} color="#fff" /> : <Clock size={10} color="#94a3b8" />}
                            </View>
                            <Text style={styles.stepLabel}>{t('inReview')}</Text>
                        </View>

                        <View style={[styles.stepLine, { backgroundColor: (item.status === 'shortlisted' || item.status === 'interview' || item.status === 'hired' || item.status === 'rejected') ? '#10b981' : '#e2e8f0' }]} />

                        {/* Step 3: Shortlisted / Interview */}
                        <View style={styles.workflowStep}>
                            <View style={[styles.stepCircle, {
                                backgroundColor: (item.status === 'shortlisted' || item.status === 'interview' || item.status === 'hired') ? '#10b981' : (item.status === 'rejected' ? '#ef4444' : '#e2e8f0')
                            }]}>
                                {item.status === 'rejected' ? <XCircle size={10} color="#fff" /> : ((item.status === 'shortlisted' || item.status === 'interview' || item.status === 'hired') ? <Users size={10} color="#fff" /> : <Zap size={10} color="#94a3b8" />)}
                            </View>
                            <Text style={styles.stepLabel}>{item.status === 'rejected' ? t('rejectedStatus') : t('shortlist')}</Text>
                        </View>

                        <View style={[styles.stepLine, { backgroundColor: item.status === 'hired' ? '#10b981' : '#e2e8f0' }]} />

                        {/* Step 4: Hired */}
                        <View style={styles.workflowStep}>
                            <View style={[styles.stepCircle, {
                                backgroundColor: item.status === 'hired' ? '#10b981' : '#e2e8f0'
                            }]}>
                                {item.status === 'hired' ? <Award size={10} color="#fff" /> : <Award size={10} color="#94a3b8" />}
                            </View>
                            <Text style={styles.stepLabel}>{t('hired')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Empty state
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
                <Briefcase size={40} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>{t('noApplicationsYet')}</Text>
            <Text style={styles.emptyText}>{t('noApplicationsDesc')}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TabScreenHeader
                title={t('myApplications')}
                icon={<Briefcase size={20} color={colors.primaryForeground} />}
                badge={
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{applications.length}</Text>
                    </View>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('loadingApplications')}</Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                    ListEmptyComponent={EmptyState}
                />
            )}


            {/* Job Description Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('jobDetails')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <XCircle size={24} color={colors.muted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: spacing.xl }}>
                            {selectedJob && (
                                <>
                                    <View style={styles.modalJobHeader}>
                                        <View style={[styles.iconContainer, { width: 60, height: 60 }]}>
                                            <Briefcase size={30} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={[styles.roleText, { fontSize: 18 }]}>{getRoleLabel(selectedJob.role_required)}</Text>
                                            <Text style={[styles.companyText, { fontSize: 14 }]}>{selectedJob.brand}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalDivider} />

                                    <Text style={styles.modalSectionTitle}>{t('jobDescription')}</Text>
                                    <Text style={styles.modalDescription}>
                                        {selectedJob.job_description || t('noDescription')}
                                    </Text>

                                    <View style={styles.modalDivider} />

                                    <View style={styles.modalDetailRow}>
                                        <View style={styles.modalDetailItem}>
                                            <Text style={styles.modalDetailLabel}>{t('salary')}</Text>
                                            <Text style={styles.modalDetailValue}>{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</Text>
                                        </View>
                                        <View style={styles.modalDetailItem}>
                                            <Text style={styles.modalDetailLabel}>{t('location')}</Text>
                                            <Text style={styles.modalDetailValue}>{selectedJob.city}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.modalDetailRow, { marginTop: spacing.md }]}>
                                        <View style={styles.modalDetailItem}>
                                            <Text style={styles.modalDetailLabel}>{t('totalExperience')}</Text>
                                            <Text style={styles.modalDetailValue}>{selectedJob.experience}</Text>
                                        </View>
                                        <View style={styles.modalDetailItem}>
                                            <Text style={styles.modalDetailLabel}>{t('vacancies')}</Text>
                                            <Text style={styles.modalDetailValue}>{selectedJob.number_of_people}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: spacing.lg, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: getStatusConfig(selectedJob.status).bgColor }]}>
                                        {(() => {
                                            const config = getStatusConfig(selectedJob.status);
                                            const Icon = config.icon;
                                            return (
                                                <>
                                                    <Icon size={16} color={config.color} />
                                                    <Text style={[styles.statusText, { color: config.color, fontSize: 12 }]}>
                                                        {t('currentStatus')} {config.text}
                                                    </Text>
                                                </>
                                            )
                                        })()}
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        marginLeft: spacing.xs,
    },
    countText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: fontSize.xs,
    },
    listContent: {
        paddingHorizontal: layout.screenPaddingX,
        paddingTop: layout.screenPaddingY,
        paddingBottom: 88,
        gap: layout.cardGap,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: 14,
        color: colors.muted,
    },

    // Job Card
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        padding: layout.cardPaddingLg,
        borderWidth: 1,
        borderColor: '#10b981',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        position: 'relative',
    },
    appliedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    appliedBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingRight: 80, // Space for applied badge
    },
    iconContainer: {
        width: layout.avatarMd,
        height: layout.avatarMd,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(26, 157, 110, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    roleText: {
        fontSize: fontSize.base,
        fontWeight: '700',
        color: '#1e40af',
    },
    companyText: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 2,
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
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: colors.muted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.foreground,
    },
    emptyText: {
        fontSize: 14,
        color: colors.muted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },

    rejectionReason: {
        fontSize: fontSize.sm,
        color: '#ef4444',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    // Workflow Tracker Styles (Copied & adapted)
    workflowSection: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    workflowTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.muted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    workflowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    workflowStep: {
        alignItems: 'center',
        zIndex: 1,
        width: 50,
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
        marginHorizontal: -10,
    },
    stepLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 2,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: spacing.lg,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        flex: 1,
    },
    modalJobHeader: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    modalDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: spacing.sm,
    },
    modalDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    modalDetailRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    modalDetailItem: {
        flex: 1,
    },
    modalDetailLabel: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 4,
    },
    modalDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
});
