import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Ban, Users, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getAdminActiveJobs, markJobVacanciesFilled } from '../lib/api';

export default function AdminActiveJobsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [jobs, setJobs] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const result = await getAdminActiveJobs();
            setJobs(result);
        } catch {
            Alert.alert('Error', 'Failed to load active jobs');
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleMarkFilled = (jobId: number, brand: string) => {
        Alert.alert(
            'Vacancies filled?',
            `"${brand}" will be hidden from candidates. They will no longer see or apply to this job.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Hide from candidates',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await markJobVacanciesFilled(jobId);
                            load();
                        } catch {
                            Alert.alert('Error', 'Could not update job');
                        }
                    },
                },
            ]
        );
    };

    const openApplicants = (item: any) => {
        navigation.navigate('AdminVacancyApplicants', {
            jobId: item.id,
            brand: item.brand,
            roleRequired: item.role_required,
            city: item.city || '',
            companyName: item.company_name || '',
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <TouchableOpacity style={styles.applicantsRow} onPress={() => openApplicants(item)} activeOpacity={0.85}>
                <View style={styles.applicantsLeft}>
                    <Text style={styles.title}>{item.brand} · {item.role_required}</Text>
                    <Text style={styles.meta}>{item.company_name} · {item.city}</Text>
                    <Text style={styles.meta}>
                        Vacancies: {item.number_of_people || '—'} · Hired: {item.hired_count ?? 0}
                    </Text>
                </View>
                <View style={styles.applicantsRight}>
                    <View style={styles.countCircle}>
                        <Text style={styles.countNum}>{item.application_count ?? 0}</Text>
                    </View>
                    <Text style={styles.viewApps}>View</Text>
                    <ChevronRight size={18} color="#7c3aed" />
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filledBtn} onPress={() => handleMarkFilled(item.id, item.brand)}>
                <Ban size={18} color="#fff" />
                <Text style={styles.filledBtnText}>Mark vacancies filled (hide from users)</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live jobs</Text>
                <Users size={20} color="#7c3aed" />
            </View>
            <Text style={styles.hint}>Tap a job to see applicants. Use Hiring Hub for the full company view.</Text>
            <FlatList
                data={jobs}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
                ListEmptyComponent={<Text style={styles.empty}>No live jobs</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
    backBtn: { padding: spacing.xs },
    headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600' },
    hint: { fontSize: fontSize.sm, color: colors.muted, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    list: { padding: spacing.md, flexGrow: 1 },
    card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    applicantsRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    applicantsLeft: { flex: 1 },
    applicantsRight: { alignItems: 'center', gap: 2 },
    title: { fontWeight: '700', fontSize: fontSize.base },
    meta: { fontSize: fontSize.sm, color: colors.muted, marginTop: 4 },
    countCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countNum: { color: '#fff', fontWeight: '800', fontSize: fontSize.sm },
    viewApps: { fontSize: 10, color: '#7c3aed', fontWeight: '600' },
    filledBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#b45309', padding: spacing.sm },
    filledBtnText: { color: '#fff', fontWeight: '600', fontSize: fontSize.sm },
    empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xl },
});
