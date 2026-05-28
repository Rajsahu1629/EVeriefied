import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Phone,
    User,
    ChevronDown,
    ChevronRight,
    Search,
    Users,
    Download,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { hiringHubTheme } from '../lib/hiringHubTheme';
import { useUser } from '../contexts/UserContext';
import {
    getAdminApplications,
    getAdminHiringOverview,
    getRecruiterApplications,
    getRecruiterHiringOverview,
    updateApplicationStatus,
    updateApplicationNotes,
    updateRecruiterApplicationStatus,
    updateRecruiterApplicationNotes,
} from '../lib/api';
import { downloadAdminEmployeeResume } from '../lib/adminResumeDownload';
import { downloadRecruiterApplicantResume } from '../lib/recruiterResumeDownload';
import type { HiringCompany } from '../types/hiringHub';

type HiringHubRouteProp = RouteProp<RootStackParamList, 'AdminApplications' | 'RecruiterHiringHub'>;

type ViewMode = 'company' | 'all';

interface AdminApplication {
    id: number;
    user_id: number;
    status: string;
    applied_at: string;
    applicant_name: string;
    applicant_phone: string;
    company_name: string;
    recruiter_phone: string;
    brand: string;
    role_required: string;
    city: string;
    rejection_reason?: string;
    admin_notes?: string;
    job_post_id: number;
}

const STATUS_FILTERS = ['all', 'applied', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected'] as const;
const PIPELINE_STAGES = ['applied', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected'] as const;

const NEXT_STATUS: Record<string, string[]> = {
    applied: ['viewed', 'shortlisted', 'rejected'],
    viewed: ['shortlisted', 'interview', 'rejected'],
    shortlisted: ['interview', 'hired', 'rejected'],
    interview: ['hired', 'rejected'],
    hired: [],
    rejected: ['viewed'],
};

function formatStatusLabel(status: string) {
    if (!status) return 'Unknown';
    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function statusColor(s: string) {
    switch (s) {
        case 'hired': return '#059669';
        case 'rejected': return '#ef4444';
        case 'shortlisted':
        case 'interview': return '#7c3aed';
        case 'viewed': return '#0284c7';
        default: return '#6b7280';
    }
}

export default function AdminApplicationsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<HiringHubRouteProp>();
    const { recruiterData } = useUser();
    const isRecruiterHub = route.name === 'RecruiterHiringHub';
    const recruiterId = recruiterData?.id;

    const [viewMode, setViewMode] = useState<ViewMode>('company');
    const [companies, setCompanies] = useState<HiringCompany[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [pdfLoadingUserId, setPdfLoadingUserId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            if (isRecruiterHub && !recruiterId) {
                setCompanies([]);
                setApplications([]);
                return;
            }
            if (viewMode === 'company') {
                const overview = isRecruiterHub
                    ? await getRecruiterHiringOverview(recruiterId!)
                    : await getAdminHiringOverview();
                const list = overview.companies || [];
                setCompanies(list);
            } else {
                const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
                const result = isRecruiterHub
                    ? await getRecruiterApplications(recruiterId!, filters)
                    : await getAdminApplications(filters);
                setApplications(result);
            }
        } catch (error) {
            console.error('Error loading hiring data:', error);
            const message = error instanceof Error ? error.message : '';
            const missingRecruiterRoutes =
                isRecruiterHub &&
                (message.includes('/jobs/recruiter/') || message.includes('Expected JSON'));
            Alert.alert(
                'Error',
                missingRecruiterRoutes
                    ? 'Recruiter pipeline API is not available on the current backend deployment. Please restart/deploy latest backend, then reload.'
                    : isRecruiterHub
                        ? 'Failed to load your hiring data.'
                        : 'Failed to load hiring data. Ensure you are logged in as admin.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [viewMode, statusFilter, isRecruiterHub, recruiterId]);

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [loadData]);

    const filteredCompanies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return companies;

        return companies
            .map((company) => {
                const companyMatch = company.company_name?.toLowerCase().includes(q);
                const matchingJobs = company.jobs.filter(
                    (j) =>
                        companyMatch ||
                        j.brand?.toLowerCase().includes(q) ||
                        j.role_required?.toLowerCase().includes(q) ||
                        j.city?.toLowerCase().includes(q)
                );
                if (companyMatch) return company;
                if (matchingJobs.length === 0) return null;
                return { ...company, jobs: matchingJobs };
            })
            .filter(Boolean) as HiringCompany[];
    }, [companies, searchQuery]);

    const openCompany = (company: HiringCompany) => {
        navigation.navigate('HiringHubCompany', {
            company,
            scope: isRecruiterHub ? 'recruiter' : 'admin',
            recruiterId: isRecruiterHub && recruiterId ? Number(recruiterId) : undefined,
        });
    };

    const openStatusModal = (app: AdminApplication) => {
        setSelectedApp(app);
        setRejectionReason(app.rejection_reason || '');
        setAdminNotes(app.admin_notes || '');
        setModalVisible(true);
    };

    const applyStatus = async (newStatus: string) => {
        if (!selectedApp) return;
        if (newStatus === 'rejected' && !rejectionReason.trim()) {
            Alert.alert('Reason required', 'Please enter a rejection reason for the candidate.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                status: newStatus,
                rejectionReason: newStatus === 'rejected' ? rejectionReason.trim() : undefined,
                adminNotes: adminNotes.trim() || undefined,
            };
            if (isRecruiterHub && recruiterId) {
                await updateRecruiterApplicationStatus(recruiterId, selectedApp.id, payload);
            } else {
                await updateApplicationStatus(selectedApp.id, payload);
            }
            setModalVisible(false);
            loadData();
            Alert.alert('Updated', `Status set to ${newStatus}.`);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const saveNotesOnly = async () => {
        if (!selectedApp) return;
        setSaving(true);
        try {
            if (isRecruiterHub && recruiterId) {
                await updateRecruiterApplicationNotes(recruiterId, selectedApp.id, adminNotes.trim());
            } else {
                await updateApplicationNotes(selectedApp.id, adminNotes.trim());
            }
            setModalVisible(false);
            loadData();
        } catch {
            Alert.alert('Error', 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const callPhone = (phone: string) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer'));
    };

    const handleDownloadResume = async (app: AdminApplication) => {
        if (!app.user_id) {
            Alert.alert('Error', 'Candidate profile not found.');
            return;
        }
        setPdfLoadingUserId(app.user_id);
        try {
            if (isRecruiterHub && recruiterId) {
                await downloadRecruiterApplicantResume(recruiterId, app.user_id, {
                    jobRoleRequired: app.role_required,
                    applicantName: app.applicant_name,
                });
            } else {
                await downloadAdminEmployeeResume(app.user_id, {
                    jobRoleRequired: app.role_required,
                    applicantName: app.applicant_name,
                });
            }
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not generate resume PDF.');
        } finally {
            setPdfLoadingUserId(null);
        }
    };

    const totalVacancies = companies.reduce((s, c) => s + c.job_count, 0);
    const totalApplicants = companies.reduce((s, c) => s + c.total_applications, 0);

    const renderCompany = ({ item: company }: { item: HiringCompany }) => (
        <TouchableOpacity
            style={styles.companyCard}
            onPress={() => openCompany(company)}
            activeOpacity={0.85}
        >
            <View style={styles.companyIcon}>
                <Building2 size={22} color="#7c3aed" />
            </View>
            <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.company_name}</Text>
                <Text style={styles.companyStats}>
                    {company.job_count} {company.job_count === 1 ? 'vacancy' : 'vacancies'}
                    {' · '}
                    {company.total_applications} applicant{company.total_applications !== 1 ? 's' : ''}
                </Text>
            </View>
            <View style={styles.companyBadges}>
                {company.needs_review > 0 && (
                    <View style={styles.reviewBadge}>
                        <Text style={styles.reviewBadgeText}>{company.needs_review}</Text>
                    </View>
                )}
                <ChevronRight size={22} color={colors.muted} />
            </View>
        </TouchableOpacity>
    );

    const renderApplication = ({ item }: { item: AdminApplication }) => {
        const pdfLoading = pdfLoadingUserId === item.user_id;
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => openStatusModal(item)} activeOpacity={0.85}>
                    <View style={styles.cardTop}>
                        <Text style={styles.applicantName}>{item.applicant_name || 'Unknown'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor(item.status) }]}>
                                {formatStatusLabel(item.status)}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.jobLine}>
                        {item.brand} · {item.role_required} · {item.city || '—'}
                    </Text>
                    <Text style={styles.companyLine}>{item.company_name}</Text>
                    {item.admin_notes ? (
                        <Text style={styles.notesPreview} numberOfLines={2}>Note: {item.admin_notes}</Text>
                    ) : null}
                    <View style={styles.insightsRow}>
                        <TouchableOpacity style={styles.insightCell} onPress={() => callPhone(item.applicant_phone)}>
                            <User size={12} color="#7c3aed" />
                            <Text style={styles.insightValue} numberOfLines={1}>{item.applicant_phone || '—'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.insightCell} onPress={() => callPhone(item.recruiter_phone)}>
                            <Phone size={12} color="#7c3aed" />
                            <Text style={styles.insightValue} numberOfLines={1}>{item.recruiter_phone || '—'}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                <View style={styles.allAppsActions}>
                    <TouchableOpacity
                        style={[styles.pdfBtnSmall, pdfLoading && { opacity: 0.65 }]}
                        onPress={() => handleDownloadResume(item)}
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Download size={14} color="#fff" />
                                <Text style={styles.pdfBtnSmallText}>Resume PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tapStatusBtn} onPress={() => openStatusModal(item)}>
                        <Text style={styles.tapStatusBtnText}>Update stage →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const listHeader = (
        <>
            <View style={styles.searchWrap}>
                <Search size={18} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={viewMode === 'company' ? 'Search company or role...' : 'Search in list...'}
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.modeRow}>
                <TouchableOpacity
                    style={[styles.modeBtn, viewMode === 'company' && styles.modeBtnActive]}
                    onPress={() => { setViewMode('company'); setSearchQuery(''); }}
                >
                    <Building2 size={16} color={viewMode === 'company' ? '#fff' : colors.muted} />
                    <Text style={[styles.modeBtnText, viewMode === 'company' && styles.modeBtnTextActive]}>
                        By company
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeBtn, viewMode === 'all' && styles.modeBtnActive]}
                    onPress={() => { setViewMode('all'); setSearchQuery(''); }}
                >
                    <Users size={16} color={viewMode === 'all' ? '#fff' : colors.muted} />
                    <Text style={[styles.modeBtnText, viewMode === 'all' && styles.modeBtnTextActive]}>
                        All applicants
                    </Text>
                </TouchableOpacity>
            </View>

            {viewMode === 'company' && !loading && (
                <View style={styles.summaryBar}>
                    <Briefcase size={16} color="#7c3aed" />
                    <Text style={styles.summaryText}>
                        {filteredCompanies.length} companies · {totalVacancies} vacancies · {totalApplicants} applicants
                    </Text>
                </View>
            )}

            {viewMode === 'company' && (
                <Text style={styles.hintText}>
                    Tap a company to see its vacancies. Tap a vacancy to view applicants and update hiring status.
                </Text>
            )}

            {viewMode === 'all' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
                    {STATUS_FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                            onPress={() => setStatusFilter(f)}
                        >
                            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
                                {f === 'all' ? 'All' : f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                </View>
            </SafeAreaView>
        );
    }

    const allListData = viewMode === 'all'
        ? applications.filter((a) => {
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            return (
                a.applicant_name?.toLowerCase().includes(q) ||
                a.company_name?.toLowerCase().includes(q) ||
                a.brand?.toLowerCase().includes(q) ||
                a.role_required?.toLowerCase().includes(q)
            );
        })
        : [];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else if (isRecruiterHub) {
                            navigation.navigate('RecruiterDashboard');
                        } else {
                            navigation.navigate('AdminDashboard');
                        }
                    }}
                    style={styles.backBtn}
                >
                    <ArrowLeft size={24} color={hiringHubTheme.headerTitle} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{isRecruiterHub ? 'Candidate Pipeline' : 'Hiring Hub'}</Text>
                    <Text style={styles.headerSub}>
                        {isRecruiterHub ? 'Your jobs → applicants → stage updates' : 'Company → vacancy → applicants'}
                    </Text>
                </View>
            </View>

            {viewMode === 'company' ? (
                <FlatList
                    data={filteredCompanies}
                    keyExtractor={(item) => String(item.recruiter_id)}
                    renderItem={renderCompany}
                    ListHeaderComponent={listHeader}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadData(); }}
                            colors={['#7c3aed']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Building2 size={48} color={colors.muted} />
                            <Text style={styles.emptyTitle}>No companies found</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={allListData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderApplication}
                    ListHeaderComponent={listHeader}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadData(); }}
                            colors={['#7c3aed']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Briefcase size={48} color={colors.muted} />
                            <Text style={styles.emptyTitle}>No applications</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{selectedApp?.applicant_name}</Text>
                        <Text style={styles.modalSub}>{selectedApp?.brand} · Current: {formatStatusLabel(selectedApp?.status || '')}</Text>

                        {selectedApp?.user_id ? (
                            <TouchableOpacity
                                style={[styles.modalPdfBtn, pdfLoadingUserId === selectedApp.user_id && { opacity: 0.65 }]}
                                onPress={() => handleDownloadResume(selectedApp)}
                                disabled={pdfLoadingUserId === selectedApp.user_id}
                            >
                                {pdfLoadingUserId === selectedApp.user_id ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Download size={18} color="#fff" />
                                        <Text style={styles.modalPdfBtnText}>Download resume (PDF)</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : null}

                        <Text style={styles.inputLabel}>
                            {isRecruiterHub ? 'Recruiter notes (internal)' : 'Admin notes (internal)'}
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            value={adminNotes}
                            onChangeText={setAdminNotes}
                            placeholder="Notes for your team..."
                        />
                        <TouchableOpacity style={styles.notesSaveBtn} onPress={saveNotesOnly} disabled={saving}>
                            <Text style={styles.notesSaveText}>Save notes only</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Move candidate to stage</Text>
                        {selectedApp &&
                            (NEXT_STATUS[selectedApp.status] || ['viewed', 'shortlisted', 'interview', 'hired', 'rejected']).map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.statusOption, st === 'rejected' && styles.statusOptionDanger]}
                                    onPress={() => {
                                        if (st === 'rejected') {
                                            Alert.alert('Reject application', 'Enter reason below, then tap Confirm reject.');
                                        } else {
                                            applyStatus(st);
                                        }
                                    }}
                                    disabled={saving}
                                >
                                    <Text style={styles.statusOptionText}>{formatStatusLabel(st)}</Text>
                                    <ChevronDown size={16} color={colors.muted} style={{ transform: [{ rotate: '-90deg' }] }} />
                                </TouchableOpacity>
                            ))}

                        <Text style={styles.inputLabel}>Rejection reason (required if rejecting)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder="e.g. Position filled / experience mismatch"
                        />
                        <TouchableOpacity
                            style={[styles.rejectConfirmBtn, saving && { opacity: 0.6 }]}
                            onPress={() => applyStatus('rejected')}
                            disabled={saving}
                        >
                            <Text style={styles.rejectConfirmText}>Confirm reject</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#e9d5ff',
        backgroundColor: hiringHubTheme.headerBg,
    },
    backBtn: { padding: spacing.xs },
    headerCenter: { flex: 1, marginLeft: spacing.sm },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: hiringHubTheme.headerTitle },
    headerSub: { fontSize: fontSize.xs, color: hiringHubTheme.headerSub, marginTop: 2 },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: fontSize.base, color: colors.foreground },
    modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    modeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modeBtnActive: { backgroundColor: hiringHubTheme.activeBtn, borderColor: hiringHubTheme.activeBtn },
    modeBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.muted },
    modeBtnTextActive: { color: '#fff' },
    summaryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: hiringHubTheme.summaryBg,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    summaryText: { fontSize: fontSize.sm, color: hiringHubTheme.summaryText, fontWeight: '600', flex: 1 },
    hintText: {
        fontSize: fontSize.xs,
        color: colors.muted,
        marginBottom: spacing.md,
        lineHeight: 18,
    },
    filterBar: { maxHeight: 48, marginBottom: spacing.sm },
    filterContent: { paddingVertical: spacing.xs, gap: spacing.sm },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.secondary,
        marginRight: spacing.xs,
    },
    filterChipActive: { backgroundColor: hiringHubTheme.activeBtn },
    filterText: { fontSize: fontSize.sm, color: colors.muted, textTransform: 'capitalize' },
    filterTextActive: { color: '#fff', fontWeight: '600' },
    listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
    companyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
    },
    companyIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: hiringHubTheme.companyIconBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyInfo: { flex: 1 },
    companyName: { fontSize: fontSize.base, fontWeight: '700', color: colors.foreground },
    companyStats: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
    companyBadges: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    reviewBadge: {
        backgroundColor: '#ef4444',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    reviewBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
    applicantName: { flex: 1, fontSize: fontSize.base, fontWeight: '700', color: colors.foreground },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    statusBadgeText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    jobLine: { fontSize: fontSize.sm, color: colors.muted, marginBottom: 2 },
    companyLine: { fontSize: fontSize.xs, color: '#7c3aed', fontWeight: '600', marginBottom: spacing.xs },
    notesPreview: { fontSize: fontSize.xs, color: '#7c3aed', fontStyle: 'italic', marginBottom: spacing.xs },
    insightsRow: { flexDirection: 'row', backgroundColor: '#f3e8ff', borderRadius: borderRadius.md, padding: spacing.sm },
    insightCell: { flex: 1, alignItems: 'center', gap: 4 },
    insightValue: { fontSize: 10, fontWeight: '600' },
    allAppsActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
    pdfBtnSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#059669',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        minWidth: 110,
        justifyContent: 'center',
        minHeight: 32,
    },
    pdfBtnSmallText: { color: '#fff', fontWeight: '700', fontSize: fontSize.xs },
    tapStatusBtn: { flex: 1, alignItems: 'flex-end' },
    tapStatusBtnText: { fontSize: fontSize.xs, color: '#7c3aed', fontWeight: '600' },
    modalPdfBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#059669',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    modalPdfBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.base },
    emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '85%' },
    modalTitle: { fontSize: fontSize.xl, fontWeight: '700' },
    modalSub: { fontSize: fontSize.sm, color: colors.muted, marginBottom: spacing.md },
    inputLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xs },
    textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, minHeight: 44, textAlignVertical: 'top' },
    notesSaveBtn: { alignSelf: 'flex-start', marginTop: spacing.xs, marginBottom: spacing.sm },
    notesSaveText: { color: '#7c3aed', fontWeight: '600' },
    statusOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: '#f3e8ff',
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xs,
    },
    statusOptionDanger: { backgroundColor: '#fee2e2' },
    statusOptionText: { fontWeight: '600', textTransform: 'capitalize' },
    rejectConfirmBtn: { backgroundColor: '#ef4444', padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.sm },
    rejectConfirmText: { color: '#fff', fontWeight: '700' },
    cancelBtn: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    cancelText: { color: colors.muted },
});
