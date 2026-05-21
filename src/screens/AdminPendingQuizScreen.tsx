import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getPendingUserVerifications, verifyUser } from '../lib/api';
import { Linking } from 'react-native';

interface PendingUser {
    id: string;
    full_name: string;
    phone_number: string;
    role: string;
    domain?: string;
    quiz_score?: number;
    verification_status: string;
}

export default function AdminPendingQuizScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const result = await getPendingUserVerifications();
            setUsers(result);
        } catch {
            Alert.alert('Error', 'Failed to load pending verifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleVerify = (userId: string, name: string, approved: boolean) => {
        Alert.alert(
            approved ? 'Approve verification' : 'Reject verification',
            `${approved ? 'Approve' : 'Reject'} ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: approved ? 'Approve' : 'Reject',
                    style: approved ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            await verifyUser(Number(userId), approved ? 'verified' : 'rejected');
                            fetchUsers();
                        } catch {
                            Alert.alert('Error', 'Failed to update user');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: PendingUser }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    <Text style={styles.meta}>{item.role} {item.domain ? `· ${item.domain}` : ''}</Text>
                    <Text style={styles.meta}>Quiz: {item.quiz_score ?? '—'}% · {item.verification_status}</Text>
                </View>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone_number}`)}>
                    <Phone size={20} color="#7c3aed" />
                </TouchableOpacity>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleVerify(item.id, item.full_name, true)}>
                    <CheckCircle size={18} color="#fff" />
                    <Text style={styles.btnText}>Verify</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleVerify(item.id, item.full_name, false)}>
                    <XCircle size={18} color="#fff" />
                    <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz Pending Review</Text>
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
                ListEmptyComponent={<Text style={styles.empty}>No users awaiting quiz review</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '600', marginLeft: spacing.sm },
    list: { padding: spacing.md, flexGrow: 1 },
    card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row', gap: spacing.sm },
    name: { fontSize: fontSize.base, fontWeight: '700' },
    meta: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#059669', padding: spacing.sm, borderRadius: borderRadius.lg },
    rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ef4444', padding: spacing.sm, borderRadius: borderRadius.lg },
    btnText: { color: '#fff', fontWeight: '600' },
    empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xl },
});
