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
import { LinearGradient } from 'expo-linear-gradient';
import {
    Briefcase,
    MapPin,
    IndianRupee,
    Users,
    Building2,
    ChevronRight,
    Home,
    LogOut,
    CheckCircle,
    Search,
    X
} from 'lucide-react-native';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getApprovedJobs, getUserAppliedJobIds, applyToJob } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { LanguageSelector } from '../components/LanguageSelector';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

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
    const { userData, logout } = useUser();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
            Alert.alert('Error', 'Failed to load jobs. Please try again.');
        }
    }, []);

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
            Alert.alert('Error', 'Please login to apply for jobs');
            return;
        }

        setApplyingTo(jobId);

        try {
            await applyToJob(userData.id, jobId);
            setAppliedJobs(prev => new Set([...prev, jobId]));
        } catch (error) {
            console.error('Error applying to job:', error);
            Alert.alert('Error', 'Failed to apply. Please try again.');
        } finally {
            setApplyingTo(null);
        }
    };

    // Logout handler
    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
        });
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

    // Format experience
    const formatExperience = (exp: string): string => {
        if (!exp) return '0-1 Years';
        const lower = exp.toLowerCase();
        if (lower === 'fresher' || lower === '0-1') return 'Fresher';
        if (lower === '1-2') return '1+ Years';
        if (lower === '2-5') return '2+ Years';
        if (lower === '5+') return '5+ Years';
        return exp + ' Years';
    };

    // Format salary
    const formatSalary = (min: number | null, max: number | null): string => {
        if (!min && !max) return 'Negotiable';
        const formatK = (n: number) => n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`;
        if (min && max) return `${formatK(min)} - ${formatK(max)}`;
        if (min) return `${formatK(min)}+`;
        return `Up to ${formatK(max!)}`;
    };

    // Get role label
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return 'EV Technician';
            case 'bs6_technician': return 'BS6 Technician';
            case 'sales': return 'Showroom Manager';
            case 'workshop': return 'Workshop Manager';
            case 'fresher': return 'Fresher';
            default: return role || 'Professional';
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
                {isApplied && (
                    <View style={styles.appliedBadgeTop}>
                        <CheckCircle size={14} color="#fff" />
                        <Text style={styles.appliedBadgeText}>Applied</Text>
                    </View>
                )}

                {/* Card Header - Similar to PreviousJobsScreen */}
                <View style={[styles.cardHeader, isApplied && styles.blurredContent]}>
                    <View style={styles.iconContainer}>
                        <Briefcase size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.roleTitle}>
                            {getRoleLabel(item.role_required)}
                            {item.vehicle_category ? ` (${item.vehicle_category})` : ''}
                        </Text>
                        {item.training_role && (
                            <Text style={styles.trainingRoleText}>
                                {item.training_role}
                            </Text>
                        )}
                        <Text style={styles.brandText}>{item.brand || 'Company'}</Text>
                    </View>
                </View>

                {/* Salary */}
                <Text style={[styles.salaryText, isApplied && styles.blurredContent]}>
                    {formatSalary(item.salary_min, item.salary_max)} per month
                </Text>

                {/* Location */}
                <View style={[styles.locationRow, isApplied && styles.blurredContent]}>
                    <MapPin size={16} color="#ef4444" />
                    <Text style={styles.locationText}>
                        {item.city ? `${item.city} (${item.pincode})` : item.pincode || 'Location TBD'}
                    </Text>
                </View>

                {/* Tags Row */}
                <View style={[styles.tagsContainer, isApplied && styles.blurredContent]}>
                    {isNew && (
                        <View style={[styles.tagChip, styles.tagNew]}>
                            <Text style={styles.tagChipIcon}>⚡</Text>
                            <Text style={[styles.tagChipText, { color: '#059669' }]}>New</Text>
                        </View>
                    )}
                    <View style={[styles.tagChip, styles.tagRegular]}>
                        <Text style={styles.tagChipIcon}>⏱</Text>
                        <Text style={styles.tagChipText}>
                            {item.urgency === 'immediate' ? 'Urgent' : 'Regular'}
                        </Text>
                    </View>
                    <View style={[styles.tagChip, styles.tagVacancies]}>
                        <Users size={12} color="#ea580c" />
                        <Text style={[styles.tagChipText, { color: '#ea580c' }]}>
                            {item.number_of_people || '1'} Vacancies
                        </Text>
                    </View>
                </View>

                {/* Experience Tag + Vehicle Category Tag */}
                <View style={[styles.tagsRow2, isApplied && styles.blurredContent]}>
                    <View style={styles.experienceTag}>
                        <Building2 size={14} color="#ca8a04" />
                        <Text style={styles.experienceTagText}>
                            {formatExperience(item.experience)}
                        </Text>
                    </View>
                    {item.vehicle_category && (
                        <View style={styles.vehicleCategoryTag}>
                            <Text style={styles.vehicleCategoryText}>
                                🏍️ {item.vehicle_category === '2W' ? '2 Wheeler' : '3 Wheeler'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Job Description */}
                {item.job_description && (
                    <View style={[styles.jobDescriptionContainer, isApplied && styles.blurredContent]}>
                        <Text style={styles.jobDescriptionLabel}>About the Role:</Text>
                        <Text style={styles.jobDescriptionText} numberOfLines={3}>
                            {item.job_description}
                        </Text>
                    </View>
                )}

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
                            <Text style={styles.applyButtonText}>Applied</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.applyButtonText}>Apply Now</Text>
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
            <Briefcase size={64} color={colors.muted} />
            <Text style={styles.emptyTitle}>No Jobs Available</Text>
            <Text style={styles.emptySubtitle}>
                Check back later for new opportunities
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#1a9d6e', '#137a55']}
                style={styles.headerBackground}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>
                            Welcome, {userData?.fullName?.split(' ')[0] || 'User'}!
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {userData?.role === 'technician' ? 'EV Technician' :
                                userData?.role === 'sales' ? 'EV Showroom Manager' :
                                    userData?.role === 'workshop' ? 'EV Workshop Manager' : 'EV Professional'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <LanguageSelector color="#fff" />
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <LogOut size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Briefcase size={20} color={colors.foreground} />
                    <Text style={styles.sectionTitle}>Apply for Jobs</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={colors.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by city (e.g. Delhi) or pincode..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.muted}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={20} color={colors.muted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Salary Filter Chips */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Salary:</Text>
                    {[
                        { label: 'All', value: null },
                        { label: '₹10K+', value: 10000 },
                        { label: '₹15K+', value: 15000 },
                        { label: '₹20K+', value: 20000 },
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.label}
                            style={[
                                styles.filterChip,
                                salaryFilter === filter.value && styles.filterChipActive,
                            ]}
                            onPress={() => setSalaryFilter(filter.value)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                salaryFilter === filter.value && styles.filterChipTextActive,
                            ]}>{filter.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading jobs...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredJobs}
                        renderItem={renderJobCard}
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerBackground: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    logoutButton: {
        padding: spacing.sm,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.base,
        color: colors.foreground,
        padding: 0, // Remove default padding on Android
        height: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.foreground,
    },
    listContent: {
        paddingBottom: 100,
        gap: spacing.md,
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
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
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
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.primary,
    },
    trainingRoleText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
        marginTop: 2,
    },
    brandText: {
        fontSize: 13,
        color: colors.muted,
        marginTop: 2,
    },
    salaryText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.md,
    },
    locationText: {
        fontSize: 14,
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        gap: 4,
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
        fontSize: 12,
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    experienceTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ca8a04',
    },
    tagsRow2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    vehicleCategoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        borderColor: '#93c5fd',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    vehicleCategoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1d4ed8',
    },
    jobDescriptionContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: spacing.sm,
        marginBottom: spacing.md,
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
        paddingVertical: 12,
        borderRadius: borderRadius.lg,
        gap: spacing.xs,
    },
    appliedButton: {
        backgroundColor: '#10b981', // Green as requested
    },
    applyButtonText: {
        fontSize: 15,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    // Filter styles
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    filterLabel: {
        fontSize: 12,
        color: colors.muted,
        marginRight: spacing.xs,
    },
    filterChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 16,
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
