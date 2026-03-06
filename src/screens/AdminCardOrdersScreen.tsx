import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Phone, MapPin, CreditCard } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { getAllCardOrders } from '../lib/api';

export default function AdminCardOrdersScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const data = await getAllCardOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching card orders:', error);
            Alert.alert('Error', 'Failed to fetch card orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.userName}>{item.full_name}</Text>
                    <Text style={styles.userRole}>{item.role}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <CreditCard size={14} color="#059669" />
                    <Text style={styles.statusText}>Ordered</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Phone size={14} color={colors.muted} />
                    <Text style={styles.detailText}>{item.phone_number}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MapPin size={14} color={colors.muted} />
                    <Text style={styles.detailText}>{item.city}, {item.state}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.orderDate}>
                    Ordered on: {new Date(item.updated_at).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Card Orders</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Fetching orders...</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <CreditCard size={48} color={colors.border} />
                            <Text style={styles.emptyText}>No card orders yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: '#7c3aed',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        padding: spacing.xs,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        paddingTop: 80,
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.muted,
    },
    listContent: {
        padding: spacing.lg,
    },
    orderCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    userName: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    userRole: {
        fontSize: fontSize.xs,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#d1fae5',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#059669',
    },
    detailsRow: {
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    detailText: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
    },
    orderDate: {
        fontSize: 12,
        color: colors.muted,
        fontStyle: 'italic',
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSize.base,
        color: colors.muted,
    },
});
