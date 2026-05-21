import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getAdminAnalytics } from '../lib/api';

export default function AdminAnalyticsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const result = await getAdminAnalytics();
            setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const totals = data?.totals;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hiring Analytics</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
            >
                <View style={styles.heroCard}>
                    <TrendingUp size={28} color="#7c3aed" />
                    <Text style={styles.heroNumber}>{totals?.conversionRate ?? 0}%</Text>
                    <Text style={styles.heroLabel}>Applied → Hired conversion</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{totals?.total_applications ?? 0}</Text>
                        <Text style={styles.statLbl}>Total applications</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{totals?.total_hired ?? 0}</Text>
                        <Text style={styles.statLbl}>Hired</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{totals?.awaiting_review ?? 0}</Text>
                        <Text style={styles.statLbl}>Awaiting review</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>By status</Text>
                {(data?.byStatus || []).map((row: { status: string; count: number }) => (
                    <View key={row.status} style={styles.row}>
                        <Text style={styles.rowLabel}>{row.status}</Text>
                        <Text style={styles.rowCount}>{row.count}</Text>
                    </View>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>By job (top)</Text>
                {(data?.byJob || []).slice(0, 15).map((job: any) => (
                    <View key={job.id} style={styles.jobCard}>
                        <Text style={styles.jobTitle}>{job.brand} · {job.role_required}</Text>
                        <Text style={styles.jobMeta}>{job.city} · {job.total_applications} apps · {job.hired} hired</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '600', marginLeft: spacing.sm },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    heroCard: { backgroundColor: '#f3e8ff', borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
    heroNumber: { fontSize: 36, fontWeight: '800', color: '#7c3aed', marginTop: spacing.sm },
    heroLabel: { fontSize: fontSize.sm, color: colors.muted },
    statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    statBox: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    statNum: { fontSize: fontSize.xl, fontWeight: '700' },
    statLbl: { fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 4 },
    sectionTitle: { fontSize: fontSize.base, fontWeight: '700', marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    rowLabel: { textTransform: 'capitalize', color: colors.foreground },
    rowCount: { fontWeight: '700', color: '#7c3aed' },
    jobCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    jobTitle: { fontWeight: '600' },
    jobMeta: { fontSize: fontSize.sm, color: colors.muted, marginTop: 4 },
});
