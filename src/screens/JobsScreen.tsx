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
import { query } from '../lib/database';
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
}

interface Application {
    job_post_id: number;
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

    // Fetch jobs from database
    const fetchJobs = useCallback(async () => {
        try {
            const result = await query<JobPost>(
                `SELECT id, brand, role_required, number_of_people, experience, 
                        salary_min, salary_max, pincode, city, stay_provided, has_incentive
                 FROM job_posts 
                 WHERE is_active = true AND status = 'approved'
                 ORDER BY created_at DESC`
            );
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
            const result = await query<Application>(
                `SELECT job_post_id FROM job_applications WHERE user_id = $1`,
                [userData.id]
            );
            setAppliedJobs(new Set(result.map(r => r.job_post_id)));
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
            await query(
                `INSERT INTO job_applications (user_id, job_post_id, status) 
                 VALUES ($1, $2, 'applied')
                 ON CONFLICT (user_id, job_post_id) DO NOTHING`,
                [userData.id, jobId]
            );

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

    // Render job card
    const renderJobCard = ({ item }: { item: JobPost }) => {
        const isApplied = appliedJobs.has(item.id);
        const isApplying = applyingTo === item.id;

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

                {/* Company Header */}
                <View style={[styles.cardHeader, isApplied && styles.blurredContent]}>
                    <View style={styles.companyIcon}>
                        <Text style={styles.companyInitial}>
                            {item.brand?.charAt(0)?.toUpperCase() || 'J'}
                        </Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{item.brand || 'Company'}</Text>
                        <Text style={styles.roleText}>{item.role_required || 'Job Role'}</Text>
                    </View>
                </View>

                {/* Job Details */}
                <View style={[styles.detailsGrid, isApplied && styles.blurredContent]}>
                    <View style={styles.detailItem}>
                        <MapPin size={14} color={colors.muted} />
                        <Text style={styles.detailText}>
                            {item.city ? `${item.city} (${item.pincode})` : item.pincode || 'Location TBD'}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Building2 size={14} color={colors.muted} />
                        <Text style={styles.detailText}>{formatExperience(item.experience)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailText}>
                            {formatSalary(item.salary_min, item.salary_max)}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Users size={14} color={colors.muted} />
                        <Text style={styles.detailText}>{item.number_of_people || '1'} people</Text>
                    </View>
                </View>

                {/* Tags */}
                {item.stay_provided && (
                    <View style={[styles.tagRow, isApplied && styles.blurredContent]}>
                        <View style={styles.tag}>
                            <Home size={12} color={colors.primary} />
                            <Text style={styles.tagText}>Stay Provided: Yes</Text>
                        </View>
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
