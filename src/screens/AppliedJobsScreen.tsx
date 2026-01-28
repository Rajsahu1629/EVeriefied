import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import {
    Briefcase, MapPin, CheckCircle, Clock, Building2,
    Calendar, Users, Award, Home, Zap, Send
} from 'lucide-react-native';
import { useUser } from '../contexts/UserContext';
import { query } from '../lib/database';

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
}

export default function AppliedJobsScreen() {
    const { userData } = useUser();
    const [applications, setApplications] = useState<AppliedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch user's applications with job details
    const fetchApplications = useCallback(async () => {
        if (!userData?.id) return;

        try {
            const result = await query<AppliedJob>(
                `SELECT 
                    ja.id, 
                    ja.job_post_id, 
                    ja.status, 
                    ja.applied_at,
                    jp.brand,
                    jp.role_required,
                    jp.city,
                    jp.pincode,
                    jp.salary_min,
                    jp.salary_max,
                    jp.experience,
                    jp.has_incentive,
                    jp.stay_provided,
                    jp.number_of_people
                 FROM job_applications ja
                 JOIN job_posts jp ON ja.job_post_id = jp.id
                 WHERE ja.user_id = $1
                 ORDER BY ja.applied_at DESC`,
                [userData.id]
            );
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

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
            return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
        } catch {
            return 'Recently';
        }
    };

    // Get status config
    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'shortlisted':
                return { text: 'Shortlisted', color: '#8b5cf6', bgColor: '#ede9fe', icon: CheckCircle };
            case 'interview':
                return { text: 'Interview', color: '#0ea5e9', bgColor: '#e0f2fe', icon: Calendar };
            case 'rejected':
                return { text: 'Not Selected', color: '#ef4444', bgColor: '#fee2e2', icon: Clock };
            case 'hired':
                return { text: 'Hired! 🎉', color: '#059669', bgColor: '#d1fae5', icon: Award };
            default:
                return { text: 'Applied', color: '#1a9d6e', bgColor: '#d1fae5', icon: Send };
        }
    };

    // Format salary
    const formatSalary = (min: number, max: number) => {
        const formatK = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();
        if (!min && !max) return 'Negotiable';
        if (min && max) return `₹ ${formatK(min)} - ₹ ${formatK(max)}`;
        if (min) return `₹ ${formatK(min)}+`;
        return `Up to ₹ ${formatK(max)}`;
    };

    // Get role label
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return 'EV Technician';
            case 'sales': return 'EV Showroom Manager';
            case 'workshop': return 'EV Workshop Manager';
            default: return role || 'Job Role';
        }
    };

    // Render application card
    const renderItem = ({ item }: { item: AppliedJob }) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;
        const isRecent = new Date(item.applied_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        return (
            <View style={styles.jobCard}>
                {/* Applied Badge */}
                <View style={styles.appliedBadge}>
                    <CheckCircle size={12} color="#fff" />
                    <Text style={styles.appliedBadgeText}>Applied</Text>
                </View>

                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Briefcase size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.roleText}>{getRoleLabel(item.role_required)}</Text>
                        <Text style={styles.companyText}>{item.brand || 'Company'}</Text>
                    </View>
                </View>

                {/* Salary Row */}
                <View style={styles.salaryRow}>
                    <Text style={styles.salaryText}>{formatSalary(item.salary_min, item.salary_max)} per month</Text>
                </View>

                {/* Location */}
                <View style={styles.locationRow}>
                    <MapPin size={14} color="#ef4444" />
                    <Text style={styles.locationText}>
                        {item.city || 'Location TBD'} {item.pincode ? `(${item.pincode})` : ''}
                    </Text>
                </View>

                {/* Tags Row */}
                <View style={styles.tagsRow}>
                    {isRecent && (
                        <View style={[styles.tag, { backgroundColor: '#dbeafe' }]}>
                            <Zap size={12} color="#2563eb" />
                            <Text style={[styles.tagText, { color: '#2563eb' }]}>Recent</Text>
                        </View>
                    )}
                    {item.has_incentive && (
                        <View style={[styles.tag, { backgroundColor: '#d1fae5' }]}>
                            <Award size={12} color="#059669" />
                            <Text style={[styles.tagText, { color: '#059669' }]}>Incentive</Text>
                        </View>
                    )}
                    {item.stay_provided && (
                        <View style={[styles.tag, { backgroundColor: '#ede9fe' }]}>
                            <Home size={12} color="#7c3aed" />
                            <Text style={[styles.tagText, { color: '#7c3aed' }]}>Stay</Text>
                        </View>
                    )}
                    {item.number_of_people && (
                        <View style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                            <Users size={12} color="#d97706" />
                            <Text style={[styles.tagText, { color: '#d97706' }]}>{item.number_of_people} Vacancies</Text>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Footer - Status and Time */}
                <View style={styles.cardFooter}>
                    <View style={styles.timeInfo}>
                        <Calendar size={14} color={colors.muted} />
                        <Text style={styles.timeText}>Applied {formatDate(item.applied_at)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <StatusIcon size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.text}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Empty state
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
                <Briefcase size={40} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>Start applying to jobs and track your progress here!</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Briefcase size={22} color="#fff" />
                <Text style={styles.headerTitle}>My Applications</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{applications.length}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading applications...</Text>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: '#1a9d6e',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: {
        padding: spacing.md,
        gap: spacing.md,
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
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: '#10b981',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
});
