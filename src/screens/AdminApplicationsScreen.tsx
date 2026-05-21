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
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Briefcase, Building2, Phone, User, ChevronDown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import {
    getAdminApplications,
    updateApplicationStatus,
    updateApplicationNotes,
} from '../lib/api';

interface AdminApplication {
    id: number;
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
const NEXT_STATUS: Record<string, string[]> = {
    applied: ['viewed', 'shortlisted', 'rejected'],
    viewed: ['shortlisted', 'interview', 'rejected'],
    shortlisted: ['interview', 'hired', 'rejected'],
    interview: ['hired', 'rejected'],
    hired: [],
    rejected: ['viewed'],
};

export default function AdminApplicationsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchApplications = useCallback(async () => {
        try {
            const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
            const result = await getAdminApplications(filters);
            setApplications(result);
        } catch (error) {
            console.error('Error fetching admin applications:', error);
            Alert.alert('Error', 'Failed to load job applications. Ensure you are logged in as admin.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter]);

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
            await updateApplicationStatus(selectedApp.id, {
                status: newStatus,
                rejectionReason: newStatus === 'rejected' ? rejectionReason.trim() : undefined,
                adminNotes: adminNotes.trim() || undefined,
            });
            setModalVisible(false);
            fetchApplications();
            Alert.alert('Updated', `Status set to ${newStatus}. Candidate will see progress on My Applications.`);
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
            await updateApplicationNotes(selectedApp.id, adminNotes.trim());
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

    const statusColor = (s: string) => {
        switch (s) {
            case 'hired': return '#059669';
            case 'rejected': return '#ef4444';
            case 'shortlisted':
            case 'interview': return '#7c3aed';
            case 'viewed': return '#0284c7';
            default: return '#6b7280';
        }
    };

    const renderApplication = ({ item }: { item: AdminApplication }) => (
        <TouchableOpacity style={styles.card} onPress={() => openStatusModal(item)} activeOpacity={0.85}>
            <View style={styles.cardTop}>
                <Text style={styles.applicantName}>{item.applicant_name || 'Unknown'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '22' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <Text style={styles.jobLine}>
                {item.brand} · {item.role_required} · {item.city || '—'}
            </Text>
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
                <View style={styles.insightCell}>
                    <Building2 size={12} color="#7c3aed" />
                    <Text style={styles.insightValue} numberOfLines={1}>{item.company_name || '—'}</Text>
                </View>
            </View>
            <Text style={styles.tapHint}>Tap to update status →</Text>
        </TouchableOpacity>
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() =>
                        navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AdminDashboard')
                    }
                    style={styles.backBtn}
                >
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Applications</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{applications.length}</Text>
                </View>
            </View>

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

            <FlatList
                data={applications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderApplication}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} colors={['#7c3aed']} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Briefcase size={48} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No applications</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{selectedApp?.applicant_name}</Text>
                        <Text style={styles.modalSub}>{selectedApp?.brand} · Current: {selectedApp?.status}</Text>

                        <Text style={styles.inputLabel}>Admin notes (internal)</Text>
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

                        <Text style={styles.inputLabel}>Move to stage</Text>
                        {selectedApp &&
                            (NEXT_STATUS[selectedApp.status] || ['viewed', 'shortlisted', 'interview', 'hired', 'rejected']).map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.statusOption, st === 'rejected' && styles.statusOptionDanger]}
                                    onPress={() => {
                                        if (st === 'rejected') {
                                            Alert.alert('Reject application', 'Enter reason below, then tap Reject again.', [{ text: 'OK' }]);
                                        } else {
                                            applyStatus(st);
                                        }
                                    }}
                                    disabled={saving}
                                >
                                    <Text style={styles.statusOptionText}>{st.replace('_', ' ')}</Text>
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.xs },
    headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground, marginLeft: spacing.sm },
    countBadge: { backgroundColor: '#f3e8ff', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    countText: { color: '#7c3aed', fontWeight: '700', fontSize: fontSize.sm },
    filterBar: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
    filterContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
    filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.secondary, marginRight: spacing.xs },
    filterChipActive: { backgroundColor: '#7c3aed' },
    filterText: { fontSize: fontSize.sm, color: colors.muted, textTransform: 'capitalize' },
    filterTextActive: { color: '#fff', fontWeight: '600' },
    listContent: { padding: spacing.md, flexGrow: 1 },
    card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
    applicantName: { flex: 1, fontSize: fontSize.base, fontWeight: '700', color: colors.foreground },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    statusBadgeText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    jobLine: { fontSize: fontSize.sm, color: colors.muted, marginBottom: spacing.xs },
    notesPreview: { fontSize: fontSize.xs, color: '#7c3aed', fontStyle: 'italic', marginBottom: spacing.xs },
    insightsRow: { flexDirection: 'row', backgroundColor: '#f3e8ff', borderRadius: borderRadius.md, padding: spacing.sm },
    insightCell: { flex: 1, alignItems: 'center', gap: 4 },
    insightValue: { fontSize: 10, fontWeight: '600' },
    tapHint: { fontSize: fontSize.xs, color: '#7c3aed', marginTop: spacing.sm, textAlign: 'right' },
    emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '85%' },
    modalTitle: { fontSize: fontSize.xl, fontWeight: '700' },
    modalSub: { fontSize: fontSize.sm, color: colors.muted, marginBottom: spacing.md },
    inputLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xs },
    textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, minHeight: 44, textAlignVertical: 'top' },
    notesSaveBtn: { alignSelf: 'flex-start', marginTop: spacing.xs, marginBottom: spacing.sm },
    notesSaveText: { color: '#7c3aed', fontWeight: '600' },
    statusOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: '#f3e8ff', borderRadius: borderRadius.lg, marginBottom: spacing.xs },
    statusOptionDanger: { backgroundColor: '#fee2e2' },
    statusOptionText: { fontWeight: '600', textTransform: 'capitalize' },
    rejectConfirmBtn: { backgroundColor: '#ef4444', padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.sm },
    rejectConfirmText: { color: '#fff', fontWeight: '700' },
    cancelBtn: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    cancelText: { color: colors.muted },
});
