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
    TextInput,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft, Search, MapPin, Award, Phone, Briefcase,
    CheckCircle, X, MessageCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';
import { query } from '../lib/database';

interface Candidate {
    id: number;
    full_name: string;
    phone_number: string;
    role: string;
    city: string;
    pincode: string;
    experience: string;
    verification_status: string;
}

export default function CandidateSearchScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [verifiedOnly, setVerifiedOnly] = useState(true);

    const fetchCandidates = useCallback(async () => {
        try {
            const result = await query<Candidate>(
                `SELECT id, full_name, phone_number, role, city, pincode, experience, verification_status
                 FROM users
                 ORDER BY created_at DESC`
            );
            setCandidates(result);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            Alert.alert('Error', 'Failed to load candidates');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    // Filter candidates
    useEffect(() => {
        let filtered = [...candidates];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c =>
                (c.full_name && c.full_name.toLowerCase().includes(q)) ||
                (c.city && c.city.toLowerCase().includes(q)) ||
                (c.pincode && c.pincode.includes(q))
            );
        }

        // Role filter
        if (roleFilter) {
            filtered = filtered.filter(c => c.role === roleFilter);
        }

        // Verified only filter
        if (verifiedOnly) {
            filtered = filtered.filter(c =>
                c.verification_status === 'verified' || c.verification_status === 'approved'
            );
        }

        setFilteredCandidates(filtered);
    }, [searchQuery, roleFilter, verifiedOnly, candidates]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCandidates();
    };

    // Mask phone number - show only first 4 digits
    const maskPhone = (phone: string) => {
        if (!phone || phone.length < 4) return '**********';
        return phone.substring(0, 4) + 'XXXXXX';
    };

    // Connect via EVeerified - contacts admin WhatsApp
    const handleConnect = (candidateName: string, role: string, city: string) => {
        const adminPhone = '919473928468';
        const message = `Hi EVeerified Team!\n\nI'm interested in hiring this candidate:\n\n👤 Name: ${candidateName}\n💼 Role: ${role}\n📍 Location: ${city}\n\nPlease share their contact details.`;
        Linking.openURL(`whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`).catch(() => {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to connect.');
        });
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'technician': return 'EV Technician';
            case 'sales': return 'EV Showroom Manager';
            case 'workshop': return 'EV Workshop Manager';
            case 'aspirant': return 'EV Aspirant';
            default: return role || 'Professional';
        }
    };

    const renderCandidate = ({ item }: { item: Candidate }) => {
        const isVerified = item.verification_status === 'verified' || item.verification_status === 'approved';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.full_name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.nameSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.name}>{item.full_name || 'Unknown'}</Text>
                            {isVerified && <CheckCircle size={16} color="#4CAF50" />}
                        </View>
                        <Text style={styles.role}>{getRoleLabel(item.role)}</Text>
                    </View>
                    {isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Award size={12} color="#fff" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoRow}>
                    <MapPin size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{item.city || 'N/A'} ({item.pincode || 'N/A'})</Text>
                </View>

                <View style={styles.infoRow}>
                    <Briefcase size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{item.experience || 'Fresher'} experience</Text>
                </View>

                <View style={styles.infoRow}>
                    <Phone size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{maskPhone(item.phone_number)}</Text>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.connectBtn]}
                        onPress={() => handleConnect(item.full_name, getRoleLabel(item.role), item.city)}
                    >
                        <MessageCircle size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Connect via EVeerified</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Candidates</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{filteredCandidates.length}</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={20} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, city, pincode..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.muted}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <X size={20} color={colors.muted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Role Filter Chips */}
            <View style={styles.filterRow}>
                {[
                    { label: 'All', value: null },
                    { label: 'Technician', value: 'technician' },
                    { label: 'Showroom', value: 'sales' },
                    { label: 'Workshop', value: 'workshop' },
                ].map((filter) => (
                    <TouchableOpacity
                        key={filter.label}
                        style={[
                            styles.filterChip,
                            roleFilter === filter.value && styles.filterChipActive,
                        ]}
                        onPress={() => setRoleFilter(filter.value)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            roleFilter === filter.value && styles.filterChipTextActive,
                        ]}>{filter.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Verified Toggle */}
            <TouchableOpacity
                style={styles.verifiedToggle}
                onPress={() => setVerifiedOnly(!verifiedOnly)}
            >
                <View style={[styles.checkbox, verifiedOnly && styles.checkboxActive]}>
                    {verifiedOnly && <CheckCircle size={14} color="#fff" />}
                </View>
                <Text style={styles.verifiedToggleText}>Show only verified candidates</Text>
            </TouchableOpacity>

            {/* Candidates List */}
            <FlatList
                data={filteredCandidates}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCandidate}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Search size={50} color={colors.muted} />
                        <Text style={styles.emptyTitle}>No candidates found</Text>
                        <Text style={styles.emptyText}>Try adjusting your filters</Text>
                    </View>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: spacing.xs,
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginLeft: spacing.sm,
    },
    countBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    countText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        margin: spacing.md,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.sm,
        fontSize: fontSize.base,
        color: colors.foreground,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        fontSize: 12,
        color: colors.foreground,
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    verifiedToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    verifiedToggleText: {
        fontSize: fontSize.sm,
        color: colors.foreground,
    },
    listContent: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '700',
    },
    nameSection: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    name: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.foreground,
    },
    role: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#4CAF50',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    callBtn: {
        backgroundColor: colors.primary,
    },
    whatsappBtn: {
        backgroundColor: '#25D366',
    },
    connectBtn: {
        backgroundColor: colors.primary,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: fontSize.sm,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: spacing.xs,
    },
});
