import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Linking,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Building2,
    Phone,
    MapPin,
    ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { hiringHubTheme } from '../lib/hiringHubTheme';
import type { HiringCompany, HiringJob } from '../types/hiringHub';

type RouteProps = RouteProp<RootStackParamList, 'HiringHubCompany'>;

function StatusPills({ counts }: { counts: Record<string, number> }) {
    const stages = ['applied', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected'] as const;
    const entries = stages.map((s) => ({ status: s, count: counts[s] || 0 })).filter((e) => e.count > 0);

    if (entries.length === 0) {
        return <Text style={styles.noAppsText}>No applicants</Text>;
    }

    const color = (s: string) => {
        switch (s) {
            case 'hired': return '#059669';
            case 'rejected': return '#ef4444';
            case 'shortlisted':
            case 'interview': return '#7c3aed';
            case 'viewed': return '#0284c7';
            default: return '#6b7280';
        }
    };

    return (
        <View style={styles.pillsRow}>
            {entries.map(({ status, count }) => (
                <View key={status} style={[styles.miniPill, { backgroundColor: color(status) + '18' }]}>
                    <Text style={[styles.miniPillText, { color: color(status) }]}>
                        {count} {status}
                    </Text>
                </View>
            ))}
        </View>
    );
}

export default function HiringHubCompanyScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProps>();
    const { company, scope = 'admin', recruiterId } = route.params;

    const openVacancy = (job: HiringJob) => {
        navigation.navigate('AdminVacancyApplicants', {
            jobId: job.id,
            brand: job.brand,
            roleRequired: job.role_required,
            city: job.city || '',
            companyName: company.company_name,
            scope,
            recruiterId,
        });
    };

    const callPhone = (phone: string) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer'));
    };

    const renderVacancy = ({ item: job }: { item: HiringJob }) => (
        <TouchableOpacity style={styles.vacancyRow} onPress={() => openVacancy(job)} activeOpacity={0.8}>
            <View style={styles.vacancyLeft}>
                <Text style={styles.vacancyTitle} numberOfLines={1}>
                    {job.brand} · {job.role_required}
                </Text>
                <View style={styles.vacancyMetaRow}>
                    <MapPin size={12} color={colors.muted} />
                    <Text style={styles.vacancyMeta}>{job.city || '—'}</Text>
                    {!job.is_active || job.vacancies_filled ? (
                        <View style={styles.filledTag}>
                            <Text style={styles.filledTagText}>Filled / hidden</Text>
                        </View>
                    ) : (
                        <Text style={styles.vacancyMeta}>
                            · {job.hired_count}/{job.number_of_people || '—'} hired
                        </Text>
                    )}
                </View>
                <StatusPills counts={job.status_counts} />
            </View>
            <View style={styles.vacancyRight}>
                <View style={[styles.appCountCircle, job.application_count === 0 && styles.appCountMuted]}>
                    <Text style={styles.appCountNum}>{job.application_count}</Text>
                </View>
                {job.needs_review > 0 && (
                    <View style={styles.newDot}>
                        <Text style={styles.newDotText}>{job.needs_review} new</Text>
                    </View>
                )}
                <ChevronRight size={20} color={hiringHubTheme.iconColor} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={hiringHubTheme.headerTitle} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{company.company_name}</Text>
                    <Text style={styles.headerSub}>
                        {company.job_count} vacancies · {company.total_applications} applicants
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.phoneRow} onPress={() => callPhone(company.recruiter_phone)}>
                <Phone size={14} color={hiringHubTheme.iconColor} />
                <Text style={styles.phoneText}>{company.recruiter_phone || '—'}</Text>
            </TouchableOpacity>

            <Text style={styles.hintText}>Tap a vacancy to view applicants and update each candidate stage.</Text>

            <FlatList
                data={company.jobs}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderVacancy}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Building2 size={40} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No approved vacancies</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: hiringHubTheme.summaryBg,
    },
    phoneText: { fontSize: fontSize.sm, color: hiringHubTheme.iconColor, fontWeight: '600' },
    hintText: {
        fontSize: fontSize.xs,
        color: colors.muted,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
    listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
    vacancyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    vacancyLeft: { flex: 1, paddingRight: spacing.sm },
    vacancyTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.foreground },
    vacancyMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
    vacancyMeta: { fontSize: fontSize.xs, color: colors.muted },
    filledTag: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        marginLeft: 4,
    },
    filledTagText: { fontSize: 10, color: '#b45309', fontWeight: '600' },
    pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
    miniPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.full },
    miniPillText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
    noAppsText: { fontSize: fontSize.xs, color: colors.muted, marginTop: spacing.xs, fontStyle: 'italic' },
    vacancyRight: { alignItems: 'center', gap: 4 },
    appCountCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: hiringHubTheme.countCircle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appCountMuted: { backgroundColor: colors.border },
    appCountNum: { color: '#fff', fontWeight: '800', fontSize: fontSize.base },
    newDot: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    newDotText: { fontSize: 9, color: '#ef4444', fontWeight: '700' },
    empty: { alignItems: 'center', padding: spacing.xxl },
    emptyTitle: { fontSize: fontSize.base, fontWeight: '600', marginTop: spacing.md, color: colors.muted },
});
