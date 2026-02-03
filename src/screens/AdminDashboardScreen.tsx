import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    CheckCircle, Users, Search, LogOut, ChevronRight,
    Briefcase, Clock, Award, Shield, Menu, X, Home
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { getAdminStats } from '../lib/api';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function AdminDashboardScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [stats, setStats] = useState({
        pendingJobs: 0,
        totalCandidates: 0,
        verifiedCandidates: 0,
        totalRecruiters: 0,
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    // Background opacity animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        if (isMenuOpen) {
            // Close
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => setIsMenuOpen(false));
        } else {
            // Open
            setIsMenuOpen(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await getAdminStats();
            setStats({
                pendingJobs: statsData.pendingJobs,
                totalCandidates: statsData.totalCandidates,
                verifiedCandidates: statsData.verifiedCandidates,
                totalRecruiters: statsData.totalRecruiters,
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

    const handleNavigation = (screen: any) => {
        toggleMenu();
        // Small delay to allow drawer to close smoothy
        setTimeout(() => {
            if (screen === 'logout') {
                handleLogout();
            } else {
                navigation.navigate(screen);
            }
        }, 200);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <Menu size={28} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.welcomeText}>Admin Panel</Text>
                        <Text style={styles.companyName}>EVerified</Text>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {/* Stats Section */}
                <Text style={styles.sectionHeader}>Overview</Text>
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

                <Text style={styles.sectionHeader}>Quick Actions</Text>

                {/* Grid of Actions (Instead of List) */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation('AdminJobApproval')}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: '#fef3c7' }]}>
                            <CheckCircle size={28} color="#d97706" />
                        </View>
                        <Text style={styles.gridTitle}>Job Approvals</Text>
                        <Text style={styles.gridDesc}>{stats.pendingJobs} Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation('AdminVerificationRecheck' as any)}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: '#ffe4e6' }]}>
                            <Shield size={28} color="#e11d48" />
                        </View>
                        <Text style={styles.gridTitle}>Verifications</Text>
                        <Text style={styles.gridDesc}>Recheck Users</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation('CandidateSearch')}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: '#e0f2fe' }]}>
                            <Search size={28} color="#0284c7" />
                        </View>
                        <Text style={styles.gridTitle}>Candidates</Text>
                        <Text style={styles.gridDesc}>Search All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation('RecruiterDashboard')}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: '#d1fae5' }]}>
                            <Briefcase size={28} color="#059669" />
                        </View>
                        <Text style={styles.gridTitle}>Recruiter</Text>
                        <Text style={styles.gridDesc}>View Mode</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Drawer / Sidebar Overlay */}
            {isMenuOpen && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>
            )}

            {/* Drawer Content */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.drawerHeader}>
                        <View style={styles.drawerLogoBg}>
                            <Shield size={32} color="#fff" />
                        </View>
                        <Text style={styles.drawerTitle}>Admin Panel</Text>
                        <Text style={styles.drawerSubtitle}>Super Admin</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={toggleMenu}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.drawerContent}>
                        <Text style={styles.menuLabel}>DASHBOARD</Text>
                        <TouchableOpacity style={[styles.menuItem, { backgroundColor: '#f3e8ff' }]} onPress={toggleMenu}>
                            <Home size={22} color="#7c3aed" />
                            <Text style={[styles.menuText, { color: '#7c3aed', fontWeight: 'bold' }]}>Overview</Text>
                        </TouchableOpacity>

                        <Text style={styles.menuLabel}>MANAGEMENT</Text>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('AdminJobApproval')}>
                            <CheckCircle size={22} color={colors.muted} />
                            <Text style={styles.menuText}>Job Approvals</Text>
                            {stats.pendingJobs > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{stats.pendingJobs}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('AdminVerificationRecheck' as any)}>
                            <Shield size={22} color={colors.muted} />
                            <Text style={styles.menuText}>Verification Rechecks</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CandidateSearch')}>
                            <Users size={22} color={colors.muted} />
                            <Text style={styles.menuText}>All Candidates</Text>
                        </TouchableOpacity>

                        <Text style={styles.menuLabel}>TOOLS</Text>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('RecruiterDashboard')}>
                            <Briefcase size={22} color={colors.muted} />
                            <Text style={styles.menuText}>Recruiter Mode</Text>
                        </TouchableOpacity>

                    </ScrollView>

                    <TouchableOpacity style={styles.logoutItem} onPress={() => handleNavigation('logout')}>
                        <LogOut size={22} color="#ef4444" />
                        <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Animated.View>

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
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuButton: {
        padding: spacing.xs,
    },
    welcomeText: {
        fontSize: fontSize.xs,
        color: 'rgba(255,255,255,0.8)',
    },
    companyName: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    sectionHeader: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        // shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        marginTop: 2,
    },
    // Grid Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    gridCard: {
        width: '47%', // 2 per row with gap
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    gridIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    gridTitle: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.foreground,
        textAlign: 'center',
    },
    gridDesc: {
        fontSize: fontSize.xs,
        color: colors.muted,
        marginTop: 4,
        textAlign: 'center',
    },

    // Drawer Styles
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        zIndex: 50,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: DRAWER_WIDTH,
        backgroundColor: '#fff',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    drawerHeader: {
        backgroundColor: '#7c3aed',
        padding: spacing.xl,
        paddingTop: spacing.xxl,
        position: 'relative',
    },
    drawerLogoBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    drawerTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    drawerSubtitle: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    closeBtn: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.md,
        padding: spacing.xs,
    },
    drawerContent: {
        flex: 1,
        paddingVertical: spacing.lg,
    },
    menuLabel: {
        fontSize: fontSize.xs,
        fontWeight: 'bold',
        color: '#9ca3af',
        marginLeft: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    menuText: {
        fontSize: fontSize.base,
        color: colors.foreground,
        fontWeight: '500',
        flex: 1,
    },
    badge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
        backgroundColor: '#fef2f2',
    },
});
