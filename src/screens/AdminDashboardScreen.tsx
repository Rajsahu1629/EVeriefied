import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    CheckCircle, Users, Search, LogOut, ChevronRight,
    Briefcase, Clock, Award, Shield
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { query } from '../lib/database';

export default function AdminDashboardScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [stats, setStats] = useState({
        pendingJobs: 0,
        totalCandidates: 0,
        verifiedCandidates: 0,
        totalRecruiters: 0,
    });

    const fetchStats = async () => {
        try {
            const [pending, total, verified, recruiters] = await Promise.all([
                query<{ count: string }>(`SELECT COUNT(*) as count FROM job_posts WHERE status = 'pending'`),
                query<{ count: string }>(`SELECT COUNT(*) as count FROM users`),
                query<{ count: string }>(`SELECT COUNT(*) as count FROM users WHERE verification_status IN ('verified', 'approved')`),
                query<{ count: string }>(`SELECT COUNT(*) as count FROM recruiters`),
            ]);

            setStats({
                pendingJobs: parseInt(pending[0]?.count || '0'),
                totalCandidates: parseInt(total[0]?.count || '0'),
                verifiedCandidates: parseInt(verified[0]?.count || '0'),
                totalRecruiters: parseInt(recruiters[0]?.count || '0'),
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const navigationFocusEffect = React.useCallback(() => {
        fetchStats();
    }, []);

    const { useFocusEffect } = require('@react-navigation/native');
    useFocusEffect(navigationFocusEffect);

    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>Admin Panel</Text>
                        <Text style={styles.companyName}>EVeerified</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <LogOut size={24} color={colors.primaryForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                    <Clock size={24} color="#d97706" />
                    <Text style={styles.statNumber}>{stats.pendingJobs}</Text>
                    <Text style={styles.statLabel}>Pending Jobs</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
                    <Award size={24} color="#059669" />
                    <Text style={styles.statNumber}>{stats.verifiedCandidates}</Text>
                    <Text style={styles.statLabel}>Verified</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                    <Users size={24} color="#0284c7" />
                    <Text style={styles.statNumber}>{stats.totalCandidates}</Text>
                    <Text style={styles.statLabel}>Candidates</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
                    <Briefcase size={24} color="#9333ea" />
                    <Text style={styles.statNumber}>{stats.totalRecruiters}</Text>
                    <Text style={styles.statLabel}>Recruiters</Text>
                </View>
            </View>

            {/* Actions */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Job Approvals */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('AdminJobApproval')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconWrapper, { backgroundColor: '#fef3c7' }]}>
                        <CheckCircle size={32} color="#d97706" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Job Approvals</Text>
                        <Text style={styles.actionDesc}>
                            {stats.pendingJobs > 0
                                ? `${stats.pendingJobs} pending job(s) to review`
                                : 'No pending jobs'
                            }
                        </Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>

                {/* Find Candidates */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('CandidateSearch')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                        <Search size={32} color="#0284c7" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>All Candidates</Text>
                        <Text style={styles.actionDesc}>View and manage all registered users</Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>

                {/* View as Recruiter */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('RecruiterDashboard')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconWrapper, { backgroundColor: '#d1fae5' }]}>
                        <Briefcase size={32} color="#059669" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Recruiter Mode</Text>
                        <Text style={styles.actionDesc}>Post jobs, view previous posts</Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: '#7c3aed', // Purple for admin
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
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    companyName: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    logoutButton: {
        padding: spacing.sm,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.foreground,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.muted,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
        gap: spacing.md,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.card,
        gap: spacing.md,
        ...shadows.md,
    },
    actionIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
    },
    actionDesc: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
});
