import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlusCircle, FileText, ChevronRight, LogOut, Users, Search } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

type RecruiterDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'RecruiterDashboard'>;

const RecruiterDashboardScreen: React.FC = () => {
    const navigation = useNavigation<RecruiterDashboardNavigationProp>();
    const { t } = useLanguage();
    const { recruiterData, logoutRecruiter } = useUser();

    const handleLogout = async () => {
        await logoutRecruiter();
        navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.welcomeText}>{t('welcome')}</Text>
                        <Text style={styles.companyName}>{recruiterData?.companyName}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <LogOut size={24} color={colors.primaryForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('PostJob')}
                    activeOpacity={0.7}
                >
                    <View style={styles.actionIconWrapper}>
                        <PlusCircle size={32} color={colors.primaryForeground} />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{t('postNewJob')}</Text>
                        <Text style={styles.actionDesc}>{t('postNewJobDesc')}</Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('PreviousJobs')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconWrapper, styles.actionIconSecondary]}>
                        <FileText size={32} color={colors.primary} />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{t('previousJobPosts')}</Text>
                        <Text style={styles.actionDesc}>{t('previousJobPostsDesc')}</Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>

                {/* Find Candidates */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('CandidateSearch')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                        <Search size={32} color="#0284c7" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Find Candidates</Text>
                        <Text style={styles.actionDesc}>Search verified EV professionals</Text>
                    </View>
                    <ChevronRight size={24} color={colors.muted} />
                </TouchableOpacity>
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
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    companyName: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primaryForeground,
    },
    logoutButton: {
        padding: spacing.sm,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.card,
        gap: spacing.md,
        ...shadows.md,
    },
    actionIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconSecondary: {
        backgroundColor: colors.secondary,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
    },
    actionDesc: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 2,
    },
});

export default RecruiterDashboardScreen;
