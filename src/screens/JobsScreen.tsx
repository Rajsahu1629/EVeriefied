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
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Briefcase,
    MapPin,
    IndianRupee,
    Users,
    Building2,
    ChevronRight,
    CheckCircle,
    Search,
    X,
} from 'lucide-react-native';
import { TabScreenHeader } from '../components/TabScreenHeader';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, borderRadius, fontSize, layout } from '../lib/theme';
import { getApprovedJobs, getUserAppliedJobIds, applyToJob } from '../lib/api';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import {
    formatJobExperience,
    formatJobSalary,
    formatVacancyCount,
    formatVehicleCategory,
} from '../lib/jobDisplay';

// Types
interface JobPost {
    id: number;
    brand: string;
    role_required: string;
    number_of_people: string;
    experience: string;
    salary_min: number | null;
    salary_max: number | null;
    pincode: string;
    city: string;
    stay_provided: boolean;
    has_incentive: boolean;
    training_role?: string;
    vehicle_category?: string;
    urgency?: string;
    created_at?: string;
    job_description?: string;
}

export default function JobsScreen() {
    const { userData } = useUser();
    const { t } = useLanguage();
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [applyingTo, setApplyingTo] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
    const [salaryFilter, setSalaryFilter] = useState<number | null>(null); // Min salary filter

    // Fetch jobs from API
    const fetchJobs = useCallback(async () => {
        try {
            const result = await getApprovedJobs();
            setJobs(result);
            setFilteredJobs(result);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert(t('error'), t('failedToLoadJobs'));
        }
    }, [t]);

    // Fetch user's applied jobs
    const fetchAppliedJobs = useCallback(async () => {
        if (!userData?.id) return;

        try {
            const appliedIds = await getUserAppliedJobIds(userData.id);
            setAppliedJobs(new Set(appliedIds));
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        }
    }, [userData?.id]);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchJobs(), fetchAppliedJobs()]);
            setLoading(false);
        };
        loadData();
    }, [fetchJobs, fetchAppliedJobs]);

    // Pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchJobs(), fetchAppliedJobs()]);
        setRefreshing(false);
    };

    // Apply to job
    const handleApply = async (jobId: number) => {
        if (!userData?.id) {
            Alert.alert(t('error'), t('loginToApply'));
            return;
        }

        setApplyingTo(jobId);

        try {
            await applyToJob(userData.id, jobId);
            setAppliedJobs(prev => new Set([...prev, jobId]));
        } catch (error) {
            console.error('Error applying to job:', error);
            Alert.alert(t('error'), t('failedToApply'));
        } finally {
            setApplyingTo(null);
        }
    };

    // Filter jobs when search query or salary filter changes
    useEffect(() => {
        let filtered = [...jobs];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(job =>
                (job.city && job.city.toLowerCase().includes(query)) ||
                (job.pincode && job.pincode.includes(query)) ||
                (job.brand && job.brand.toLowerCase().includes(query))
            );
        }

        // Apply salary filter
        if (salaryFilter) {
            filtered = filtered.filter(job =>
                (job.salary_min && job.salary_min >= salaryFilter) ||
                (job.salary_max && job.salary_max >= salaryFilter)
            );
        }

        setFilteredJobs(filtered);
    }, [searchQuery, salaryFilter, jobs]);


    // Get role label
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return t('evTechnician');
            case 'bs6_technician': return t('bs6Technician');
            case 'sales': return t('evShowroomManager');
            case 'workshop': return t('evWorkshopManager');
            case 'fresher': return t('fresher');
            default: return role || t('professional');
        }
    };

    // Check if job is new (within 7 days)
    const isNewJob = (dateStr?: string) => {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    };

    // Render job card (redesigned to match recruiter style)
    const renderJobCard = ({ item }: { item: JobPost }) => {
        const isApplied = appliedJobs.has(item.id);
        const isApplying = applyingTo === item.id;
        const isNew = isNewJob(item.created_at);

        return (
            <View style={[
                styles.jobCard,
                isApplied && styles.appliedJobCard
            ]}>
                {/* Applied Badge */}
                {isApplied ? (
                    <View style={styles.appliedBadgeTop}>
                        <CheckCircle size={14} color="#fff" />
                        <Text style={styles.appliedBadgeText}>{t('applied')}</Text>
                    </View>
                ) : null}

                {/* Card Header - Similar to PreviousJobsScreen */}
                <View style={[styles.cardHeader, isApplied && styles.blurredContent]}>
                    <View style={styles.iconContainer}>
                        <Briefcase size={20} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.roleTitle}>
                            {getRoleLabel(item.role_required)}
                            {item.vehicle_category
                                ? ` (${formatVehicleCategory(item.vehicle_category, t)})`
                                : null}
                        </Text>
                        {item.training_role ? (
                            <Text style={styles.trainingRoleText}>
                                {item.training_role}
                            </Text>
                        ) : null}
                        <Text style={styles.brandText}>{item.brand || t('company')}</Text>
                    </View>
                </View>

                {/* Salary */}
                <Text style={[styles.salaryText, isApplied && styles.blurredContent]}>
                    {formatJobSalary(item.salary_min, item.salary_max, t)} {t('perMonth')}
                </Text>

                {/* Location */}
                <View style={[styles.locationRow, isApplied && styles.blurredContent]}>
                    <MapPin size={16} color="#ef4444" />
                    <Text style={styles.locationText}>
                        {item.city ? `${item.city} (${item.pincode})` : item.pincode || t('locationTbd')}
                    </Text>
                </View>

                {/* Tags Row */}
                <View style={[styles.tagsContainer, isApplied && styles.blurredContent]}>
                    {isNew ? (
                        <View style={[styles.tagChip, styles.tagNew]}>
                            <Text style={styles.tagChipIcon}>⚡</Text>
                            <Text style={[styles.tagChipText, { color: '#059669' }]}>{t('recentTag')}</Text>
                        </View>
                    ) : null}
                    <View style={[styles.tagChip, styles.tagRegular]}>
                        <Text style={styles.tagChipIcon}>⏱</Text>
                        <Text style={styles.tagChipText}>
                            {item.urgency === 'immediate' ? t('urgent') : t('regular')}
                        </Text>
                    </View>
                    <View style={[styles.tagChip, styles.tagVacancies]}>
                        <Users size={12} color="#ea580c" />
                        <Text style={[styles.tagChipText, { color: '#ea580c' }]}>
                            {formatVacancyCount(item.number_of_people, t)}
                        </Text>
                    </View>
                </View>

                {/* Experience Tag + Vehicle Category Tag */}
                <View style={[styles.tagsRow2, isApplied && styles.blurredContent]}>
                    <View style={styles.experienceTag}>
                        <Building2 size={14} color="#ca8a04" />
                        <Text style={styles.experienceTagText}>
                            {formatJobExperience(item.experience, t)}
                        </Text>
                    </View>
                    {item.vehicle_category ? (
                        <View style={styles.vehicleCategoryTag}>
                            <Text style={styles.vehicleCategoryText}>
                                🏍️ {formatVehicleCategory(item.vehicle_category, t)}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Job Description */}
                {item.job_description?.trim() ? (
                    <View style={[styles.jobDescriptionContainer, isApplied && styles.blurredContent]}>
                        <Text style={styles.jobDescriptionLabel}>{t('aboutTheRole')}</Text>
                        <Text style={styles.jobDescriptionText} numberOfLines={3}>
                            {item.job_description}
                        </Text>
                    </View>
                ) : null}

                {/* Apply Button */}
                <TouchableOpacity
                    style={[
                        styles.applyButton,
                        isApplied && styles.appliedButton
                    ]}
                    onPress={() => handleApply(item.id)}
                    disabled={isApplied || isApplying}
                >
                    {isApplying ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : isApplied ? (
                        <>
                            <CheckCircle size={18} color="#fff" />
                            <Text style={styles.applyButtonText}>{t('applied')}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.applyButtonText}>{t('applyNow')}</Text>
                            <ChevronRight size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // Empty state
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Briefcase size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>{t('noJobsAvailable')}</Text>
            <Text style={styles.emptySubtitle}>
                {t('noJobsAvailableDesc')}
            </Text>
        </View>
    );

    const salaryFilters = [
        { label: t('filterAll'), value: null },
        { label: '₹10K+', value: 10000 },
        { label: '₹15K+', value: 15000 },
        { label: '₹20K+', value: 20000 },
    ] as const;

    const ListHeader = () => (
        <View style={styles.listHeader}>
            <View style={styles.searchContainer}>
                <Search size={18} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchJobsPlaceholder')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.muted}
                />
                {searchQuery.length > 0 ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                        <X size={18} color={colors.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>
            <View style={styles.filterRow}>
                {salaryFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.label}
                        style={[
                            styles.filterChip,
                            salaryFilter === filter.value && styles.filterChipActive,
                        ]}
                        onPress={() => setSalaryFilter(filter.value)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                salaryFilter === filter.value && styles.filterChipTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            <TabScreenHeader
                title={t('jobs')}
                icon={<Briefcase size={20} color={colors.primaryForeground} />}
                right={<LanguageSelector color="#fff" />}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('loadingJobs')}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
                    renderItem={renderJobCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={ListHeader}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listHeader: {
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: layout.inputHeight,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.foreground,
        padding: 0,
        height: layout.inputHeight,
    },
    listContent: {
        paddingHorizontal: layout.screenPaddingX,
        paddingTop: layout.screenPaddingY,
        paddingBottom: 88,
        gap: layout.cardGap,
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

    // Job Card Styles
    jobCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: layout.cardPaddingLg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    companyIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
    },
    roleText: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 2,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minWidth: '45%',
    },
    detailText: {
        fontSize: 12,
        color: colors.muted,
    },
    tagRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primary + '10',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        color: colors.foreground,
        fontWeight: '500',
    },
    // New styles for redesigned card
    iconContainer: {
        width: layout.avatarMd,
        height: layout.avatarMd,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: fontSize.base,
        fontWeight: '700',
        color: colors.foreground,
    },
    trainingRoleText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '500',
        marginTop: 1,
    },
    brandText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 1,
    },
    salaryText: {
        fontSize: fontSize.base,
        fontWeight: '700',
        color: colors.primary,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.sm,
    },
    locationText: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        gap: 3,
    },
    tagNew: {
        backgroundColor: '#d1fae5',
        borderColor: '#86efac',
    },
    tagRegular: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
    },
    tagVacancies: {
        backgroundColor: '#ffedd5',
        borderColor: '#fdba74',
    },
    tagChipText: {
        fontSize: fontSize.xs,
        fontWeight: '500',
        color: colors.foreground,
    },
    tagChipIcon: {
        fontSize: 12,
    },
    experienceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef9c3',
        borderColor: '#fde047',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        gap: 3,
    },
    experienceTagText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: '#ca8a04',
    },
    tagsRow2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    vehicleCategoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        borderColor: '#93c5fd',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        gap: 3,
    },
    vehicleCategoryText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: '#1d4ed8',
    },
    jobDescriptionContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    jobDescriptionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.foreground,
        marginBottom: 4,
    },
    jobDescriptionText: {
        fontSize: 13,
        color: colors.muted,
        lineHeight: 18,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        minHeight: layout.buttonHeight,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    appliedButton: {
        backgroundColor: '#10b981', // Green as requested
    },
    applyButtonText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: '#fff',
    },
    appliedJobCard: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4', // Light green background
        borderWidth: 1.5,
    },
    blurredContent: {
        opacity: 0.5, // Simple blur effect
    },
    appliedBadgeTop: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    appliedBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    filterChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        fontSize: 12,
        color: colors.foreground,
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});
