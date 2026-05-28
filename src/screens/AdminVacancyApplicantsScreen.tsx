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
    Linking,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Building2, Phone, User, ChevronDown, Download, FileText } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import {
    getAdminApplications,
    getRecruiterApplications,
    updateApplicationStatus,
    updateApplicationNotes,
    updateRecruiterApplicationStatus,
    updateRecruiterApplicationNotes,
} from '../lib/api';
import { downloadAdminEmployeeResume } from '../lib/adminResumeDownload';
import { downloadRecruiterApplicantResume } from '../lib/recruiterResumeDownload';
import { hiringHubTheme } from '../lib/hiringHubTheme';

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

function formatAppliedAt(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminVacancyApplicantsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const params = route.params as RootStackParamList['AdminVacancyApplicants'];

    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [pdfLoadingUserId, setPdfLoadingUserId] = useState<number | null>(null);

    const isRecruiterScope = params.scope === 'recruiter' && params.recruiterId;

    const fetchApplications = useCallback(async () => {
        try {
            const result = isRecruiterScope
                ? await getRecruiterApplications(params.recruiterId!, { jobId: params.jobId })
                : await getAdminApplications({ jobId: params.jobId });
            setApplications(result);
        } catch {
            Alert.alert('Error', 'Failed to load applicants for this vacancy.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [params.jobId, isRecruiterScope, params.recruiterId]);

    useEffect(() => {
        setLoading(true);
        fetchApplications();
    }, [fetchApplications]);

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
            if (isRecruiterScope) {
                await updateRecruiterApplicationStatus(params.recruiterId!, selectedApp.id, payload);
            } else {
                await updateApplicationStatus(selectedApp.id, payload);
            }
            setModalVisible(false);
            fetchApplications();
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
            if (isRecruiterScope) {
                await updateRecruiterApplicationNotes(params.recruiterId!, selectedApp.id, adminNotes.trim());
            } else {
                await updateApplicationNotes(selectedApp.id, adminNotes.trim());
            }
            setModalVisible(false);
            fetchApplications();
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
            if (isRecruiterScope) {
                await downloadRecruiterApplicantResume(params.recruiterId!, app.user_id, {
                    jobRoleRequired: params.roleRequired,
                    applicantName: app.applicant_name,
                });
            } else {
                await downloadAdminEmployeeResume(app.user_id, {
                    jobRoleRequired: params.roleRequired,
                    applicantName: app.applicant_name,
                });
            }
        } catch (e: any) {
            console.error('Resume PDF error:', e);
            Alert.alert('Error', e?.message || 'Could not generate resume PDF.');
        } finally {
            setPdfLoadingUserId(null);
        }
    };

    const renderApplicant = ({ item }: { item: AdminApplication }) => {
        const pdfLoading = pdfLoadingUserId === item.user_id;
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => openStatusModal(item)} activeOpacity={0.85}>
                    <View style={styles.cardTop}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(item.applicant_name || '?').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.cardMain}>
                            <Text style={styles.applicantName}>{item.applicant_name || 'Unknown'}</Text>
                            {item.applied_at ? (
                                <Text style={styles.appliedDate}>Applied {formatAppliedAt(item.applied_at)}</Text>
                            ) : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor(item.status) }]}>
                                {formatStatusLabel(item.status)}
                            </Text>
                        </View>
                    </View>
                    {item.admin_notes ? (
                        <Text style={styles.notesPreview} numberOfLines={2}>Note: {item.admin_notes}</Text>
                    ) : null}
                    <TouchableOpacity style={styles.phoneRow} onPress={() => callPhone(item.applicant_phone)}>
                        <Phone size={14} color="#7c3aed" />
                        <Text style={styles.phoneText}>{item.applicant_phone || 'No phone'}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.pdfBtn, pdfLoading && styles.btnDisabled]}
                        onPress={() => handleDownloadResume(item)}
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Download size={16} color="#fff" />
                                <Text style={styles.pdfBtnText}>Resume PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pipelineBtn} onPress={() => openStatusModal(item)}>
                        <FileText size={16} color="#7c3aed" />
                        <Text style={styles.pipelineBtnText}>Update stage</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Applicants</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{applications.length}</Text>
                </View>
            </View>

            <View style={styles.jobBanner}>
                <Text style={styles.jobBrand}>{params.brand}</Text>
                <Text style={styles.jobRole}>{params.roleRequired} · {params.city || '—'}</Text>
                <View style={styles.companyRow}>
                    <Building2 size={14} color={colors.muted} />
                    <Text style={styles.companyName}>{params.companyName}</Text>
                </View>
            </View>

            <FlatList
                data={applications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderApplicant}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchApplications(); }}
                        colors={['#7c3aed']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <User size={48} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No applicants yet</Text>
                        <Text style={styles.emptySub}>Candidates who apply will show up here.</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{selectedApp?.applicant_name}</Text>
                        <Text style={styles.modalSub}>Current: {formatStatusLabel(selectedApp?.status || '')}</Text>

                        {selectedApp?.user_id ? (
                            <TouchableOpacity
                                style={[styles.modalPdfBtn, pdfLoadingUserId === selectedApp.user_id && styles.btnDisabled]}
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
                            {isRecruiterScope ? 'Recruiter notes (internal)' : 'Admin notes (internal)'}
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
                                            Alert.alert('Reject', 'Enter reason below, then tap Confirm reject.');
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

                        <Text style={styles.inputLabel}>Rejection reason</Text>
                        <TextInput
                            style={styles.textInput}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder="Required if rejecting"
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', marginLeft: spacing.sm },
    countBadge: { backgroundColor: '#f3e8ff', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    countText: { color: '#7c3aed', fontWeight: '700', fontSize: fontSize.sm },
    jobBanner: {
        backgroundColor: hiringHubTheme.summaryBg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#e9d5ff',
    },
    jobBrand: { fontSize: fontSize.base, fontWeight: '700', color: hiringHubTheme.headerTitle },
    jobRole: { fontSize: fontSize.sm, color: hiringHubTheme.headerSub, marginTop: 2 },
    companyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
    companyName: { fontSize: fontSize.sm, color: colors.muted },
    listContent: { padding: spacing.md, flexGrow: 1 },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: fontSize.base },
    cardMain: { flex: 1, marginLeft: spacing.sm },
    applicantName: { fontSize: fontSize.base, fontWeight: '700' },
    appliedDate: { fontSize: fontSize.xs, color: colors.muted, marginTop: 2 },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    statusBadgeText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    notesPreview: { fontSize: fontSize.xs, color: '#7c3aed', fontStyle: 'italic', marginBottom: spacing.xs },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xs },
    phoneText: { fontSize: fontSize.sm, color: '#7c3aed', fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    pdfBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#059669',
        paddingVertical: 8,
        borderRadius: borderRadius.md,
        minHeight: 36,
    },
    pdfBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.sm },
    pipelineBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#f3e8ff',
        paddingVertical: 8,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#e9d5ff',
        minHeight: 36,
    },
    pipelineBtnText: { color: '#7c3aed', fontWeight: '600', fontSize: fontSize.sm },
    btnDisabled: { opacity: 0.65 },
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
    emptySub: { fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.md, maxHeight: '85%' },
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
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: '#f3e8ff',
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
        minHeight: 40,
    },
    statusOptionDanger: { backgroundColor: '#fee2e2' },
    statusOptionText: { fontWeight: '600', textTransform: 'capitalize' },
    rejectConfirmBtn: { backgroundColor: '#ef4444', padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.sm },
    rejectConfirmText: { color: '#fff', fontWeight: '700' },
    cancelBtn: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    cancelText: { color: colors.muted },
});
