import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle, XCircle, Phone, Award } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { getPendingVerificationUsers, verifyUserByAdmin } from '../lib/api';

interface PendingVerificationUser {
    id: string;
    full_name: string;
    phone_number: string;
    role: string;
    domain: string;
    vehicle_category?: string;
    verification_status: string;
    quiz_score: number;
    training_role?: string;
}

export default function AdminVerificationRecheckScreen() {
    const navigation = useNavigation();
    const [users, setUsers] = useState<PendingVerificationUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = async () => {
        try {
            const result = await getPendingVerificationUsers();
            setUsers(result);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleVerify = async (userId: string, userName: string) => {
        Alert.alert(
            'Confirm Verification',
            `Are you sure you want to verify ${userName}? This will give them the GREEN verified tick.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Verify',
                    style: 'default',
                    onPress: async () => {
                        try {
                            await verifyUserByAdmin(userId);
                            Alert.alert('Success', `${userName} is now fully verified!`);
                            fetchUsers();
                        } catch (error) {
                            console.error('Error verifying user:', error);
                            Alert.alert('Error', 'Failed to verify user');
                        }
                    }
                }
            ]
        );
    };

    const handleCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const renderItem = ({ item }: { item: PendingVerificationUser }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.full_name}</Text>
                    <Text style={styles.role}>
                        {item.role} {item.domain ? `(${item.domain})` : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleCall(item.phone_number)} style={styles.callBtn}>
                    <Phone size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Score</Text>
                    <Text style={styles.detailValue}>{item.quiz_score}%</Text>
                </View>
                {item.vehicle_category && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{item.vehicle_category}</Text>
                    </View>
                )}
                {item.training_role && (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Level</Text>
                        <Text style={styles.detailValue}>{item.training_role}</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => handleVerify(item.id, item.full_name)}
                >
                    <CheckCircle size={20} color="#fff" />
                    <Text style={styles.verifyBtnText}>Approve & Verify (Green Tick)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verification Recheck</Text>
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <Award size={48} color={colors.muted} />
                            <Text style={styles.emptyText}>No pending verifications</Text>
                            <Text style={styles.emptySubText}>Everyone who passed the test is verified!</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    listContent: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    name: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    role: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
    callBtn: {
        padding: spacing.sm,
        backgroundColor: '#e0f2fe',
        borderRadius: borderRadius.full,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.lg,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: fontSize.xs,
        color: colors.muted,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.foreground,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    verifyBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    verifyBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
        marginTop: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.md,
    },
    emptySubText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});
