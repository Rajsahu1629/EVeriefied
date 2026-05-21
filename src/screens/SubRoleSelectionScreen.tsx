import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    ArrowLeft,
    Zap,
    ChevronRight,
    ShoppingBag,
    Building2,
    User,
    Wrench,
    ClipboardList,
    Users,
    Package,
    Briefcase,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

type SubRoleSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'SubRoleSelection'>;
type SubRoleSelectionRouteProp = RouteProp<RootStackParamList, 'SubRoleSelection'>;

export type SubRoleKey =
    | 'sales_executive'
    | 'showroom_manager'
    | 'cre'
    | 'fleet_manager'
    | 'service_manager'
    | 'service_advisor'
    | 'floor_supervisor'
    | 'spare_part_manager';

interface SubRoleItem {
    key: SubRoleKey;
    icon: React.FC<{ size?: number; color?: string }>;
    titleKey: string;
}

const SHOWROOM_SUB_ROLES: SubRoleItem[] = [
    { key: 'sales_executive', icon: Briefcase, titleKey: 'subRoleSalesExecutive' },
    { key: 'showroom_manager', icon: ShoppingBag, titleKey: 'subRoleShowroomManager' },
    { key: 'cre', icon: User, titleKey: 'subRoleCRE' },
];

const WORKSHOP_SUB_ROLES: SubRoleItem[] = [
    { key: 'fleet_manager', icon: Building2, titleKey: 'subRoleFleetManager' },
    { key: 'service_manager', icon: Wrench, titleKey: 'subRoleServiceManager' },
    { key: 'service_advisor', icon: ClipboardList, titleKey: 'subRoleServiceAdvisor' },
    { key: 'floor_supervisor', icon: Users, titleKey: 'subRoleFloorSupervisor' },
    { key: 'cre', icon: User, titleKey: 'subRoleCRE' },
    { key: 'spare_part_manager', icon: Package, titleKey: 'subRoleSparePartManager' },
];

const SubRoleSelectionScreen: React.FC = () => {
    const navigation = useNavigation<SubRoleSelectionNavigationProp>();
    const route = useRoute<SubRoleSelectionRouteProp>();
    const { t } = useLanguage();
    const { setSelectedSubRole } = useUser();

    const parentRole = route.params.parentRole;
    const isShowroom = parentRole === 'sales';
    const subRoles = isShowroom ? SHOWROOM_SUB_ROLES : WORKSHOP_SUB_ROLES;
    const headerTitleKey = isShowroom ? 'showroom' : 'workshopFleet';
    const subtitleKey = 'selectSubRole';

    const handleSubRoleSelect = (titleKey: string) => {
        setSelectedSubRole(t(titleKey));
        navigation.navigate('ActionSelection');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color={colors.primaryForeground} />
                </TouchableOpacity>
                <LanguageToggle />

                <View style={styles.logoContainer}>
                    <View style={styles.logoIconWrapper}>
                        <Zap size={28} color={colors.primaryForeground} />
                    </View>
                </View>
                <Text style={styles.appTitle}>{t('appName')}</Text>
                <Text style={styles.tagline}>{t('tagline')}</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t(headerTitleKey)}</Text>
                    <Text style={styles.cardSubtitle}>{t(subtitleKey)}</Text>

                    <View style={styles.rolesList}>
                        {subRoles.map(({ key, icon: Icon, titleKey }) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.roleItem}
                                onPress={() => handleSubRoleSelect(titleKey)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.roleIconWrapper}>
                                    <Icon size={24} color={colors.primaryForeground} />
                                </View>
                                <View style={styles.roleTextContainer}>
                                    <Text style={styles.roleTitle}>{t(titleKey)}</Text>
                                </View>
                                <ChevronRight size={20} color={colors.muted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xxl + spacing.lg,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: spacing.xl,
        left: spacing.md,
        padding: spacing.sm,
        zIndex: 100,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.primaryForeground,
        textAlign: 'center',
    },
    tagline: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        marginTop: -spacing.xl,
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        ...shadows.lg,
    },
    cardTitle: {
        fontSize: fontSize.xl,
        fontWeight: '600',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: fontSize.sm,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    rolesList: {
        gap: spacing.sm,
    },
    roleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: spacing.md,
    },
    roleIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTextContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: fontSize.base,
        fontWeight: '500',
        color: colors.foreground,
    },
});

export default SubRoleSelectionScreen;
