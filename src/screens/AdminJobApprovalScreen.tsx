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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2, MapPin, Users, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { query } from '../lib/database';

interface PendingJob {
    id: number;
    brand: string;
    role_required: string;
    number_of_people: string;
    experience: string;
    salary_min: number | null;
    salary_max: number | null;
    city: string;
    pincode: string;
    status: string;
    company_name: string;
    recruiter_phone: string;
    created_at: string;
}

export default function AdminJobApprovalScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [jobs, setJobs] = useState<PendingJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPendingJobs = useCallback(async () => {
        try {
            const result = await query<PendingJob>(
                `SELECT jp.id, jp.brand, jp.role_required, jp.number_of_people, jp.experience,
                        jp.salary_min, jp.salary_max, jp.city, jp.pincode, jp.status, jp.created_at,
                        r.company_name, r.phone_number as recruiter_phone
                 FROM job_posts jp
                 LEFT JOIN recruiters r ON jp.recruiter_id = r.id
                 WHERE jp.status = 'pending'
                 ORDER BY jp.created_at DESC`
            );
            setJobs(result);
        } catch (error) {
            console.error('Error fetching pending jobs:', error);
            Alert.alert('Error', 'Failed to load pending jobs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingJobs();
    }, [fetchPendingJobs]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPendingJobs();
    };

    const handleApprove = async (jobId: number) => {
        setProcessingId(jobId);
        try {
            await query(`UPDATE job_posts SET status = 'approved' WHERE id = $1`, [jobId]);
            const updatedJobs = jobs.filter(j => j.id !== jobId);
            setJobs(updatedJobs);

            Alert.alert(
                'Approved!',
                'Job is now visible to candidates',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (updatedJobs.length === 0) {
                                if (navigation.canGoBack()) {
                                    navigation.goBack();
                                } else {
                                    navigation.navigate('AdminDashboard' as any);
                                }
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error approving job:', error);
            Alert.alert('Error', 'Failed to approve job');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (jobId: number) => {
        Alert.alert(
            'Reject Job?',
            'This job will be rejected and not shown to candidates.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingId(jobId);
                        try {
                            await query(`UPDATE job_posts SET status = 'rejected' WHERE id = $1`, [jobId]);
                            setJobs(prev => prev.filter(j => j.id !== jobId));
                            Alert.alert('Rejected', 'Job has been rejected');
                        } catch (error) {
                            console.error('Error rejecting job:', error);
                            Alert.alert('Error', 'Failed to reject job');
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return 'Not specified';
        const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();
        if (min && max) return `₹${formatK(min)} - ₹${formatK(max)}`;
        if (min) return `₹${formatK(min)}+`;
        return `Up to ₹${formatK(max!)}`;
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return 'EV Technician';
            case 'sales': return 'EV Showroom Manager';
            case 'workshop': return 'EV Workshop Manager';
            default: return role;
        }
    };

    const renderJobCard = ({ item }: { item: PendingJob }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.brandBadge}>
                    <Text style={styles.brandText}>{item.brand}</Text>
                </View>
                <View style={styles.timeBadge}>
                    <Clock size={12} color={colors.muted} />
                    <Text style={styles.timeText}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text style={styles.roleTitle}>{getRoleLabel(item.role_required)}</Text>

            <View style={styles.infoRow}>
                <Building2 size={14} color={colors.muted} />
                <Text style={styles.infoText}>{item.company_name || 'Unknown Company'}</Text>
            </View>

            <View style={styles.infoRow}>
                <MapPin size={14} color={colors.muted} />
                <Text style={styles.infoText}>{item.city} ({item.pincode})</Text>
            </View>

            <View style={styles.infoRow}>
                <Users size={14} color={colors.muted} />
                <Text style={styles.infoText}>{item.number_of_people} position(s)</Text>
            </View>

            <View style={styles.infoRow}>
                <Briefcase size={14} color={colors.muted} />
                <Text style={styles.infoText}>{item.experience} experience • {formatSalary(item.salary_min, item.salary_max)}</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                    disabled={processingId === item.id}
                >
                    <XCircle size={18} color="#dc2626" />
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(item.id)}
                    disabled={processingId === item.id}
                >
                    {processingId === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <CheckCircle size={18} color="#fff" />
                            <Text style={styles.approveText}>Approve</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

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
                <TouchableOpacity
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminDashboard' as any)}
                    style={styles.backBtn}
                >
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Approvals</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{jobs.length}</Text>
                </View>
            </View>

            {jobs.length === 0 ? (
                <View style={styles.centered}>
                    <CheckCircle size={60} color="#4CAF50" />
                    <Text style={styles.emptyTitle}>All Caught Up!</Text>
                    <Text style={styles.emptyText}>No pending jobs to review</Text>

                    <TouchableOpacity
                        style={[styles.actionBtn, { marginTop: spacing.xl, backgroundColor: '#7c3aed', paddingHorizontal: 30 }]}
                        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminDashboard' as any)}
                    >
                        <ArrowLeft size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 8 }}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderJobCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                />
            )}
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
        backgroundColor: '#fef3c7',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    countText: {
        color: '#d97706',
        fontWeight: '600',
        fontSize: fontSize.sm,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    brandBadge: {
        backgroundColor: 'rgba(26, 157, 110, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    brandText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: colors.muted,
        fontSize: fontSize.xs,
    },
    roleTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    infoText: {
        color: colors.muted,
        fontSize: fontSize.sm,
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
    rejectBtn: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    approveBtn: {
        backgroundColor: colors.primary,
    },
    rejectText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    approveText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.foreground,
        marginTop: spacing.md,
    },
    emptyText: {
        color: colors.muted,
        marginTop: spacing.xs,
    },
});
