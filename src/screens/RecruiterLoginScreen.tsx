import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Phone, Lock, Users } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, RecruiterData, EntityType } from '../contexts/UserContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { query } from '../lib/database';

type RecruiterLoginNavigationProp = StackNavigationProp<RootStackParamList, 'RecruiterLogin'>;

const RecruiterLoginScreen: React.FC = () => {
    const navigation = useNavigation<RecruiterLoginNavigationProp>();
    const { t } = useLanguage();
    const { setRecruiterData, setIsRecruiterLoggedIn } = useUser();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

    const validate = (): boolean => {
        const newErrors: { phone?: string; password?: string } = {};

        if (!phoneNumber) {
            newErrors.phone = t('required');
        } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
            newErrors.phone = t('invalidPhone');
        }

        if (!password) {
            newErrors.password = t('required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Admin credentials
    const ADMIN_PHONE = '9473928468';
    const ADMIN_PASSWORD = 'Rajsahu@2000';

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);

        // Trim inputs to remove accidental spaces
        const trimmedPhone = phoneNumber.trim();
        const trimmedPassword = password.trim();

        console.log('Login attempt:', { phone: trimmedPhone, passwordLength: trimmedPassword.length });

        // Check for admin login
        if (trimmedPhone === ADMIN_PHONE && trimmedPassword === ADMIN_PASSWORD) {
            console.log('Admin login successful!');
            navigation.reset({
                index: 0,
                routes: [{ name: 'AdminJobApproval' }],
            });
            setIsLoading(false);
            return;
        }

        try {
            const recruiters = await query<any>(
                `SELECT * FROM recruiters WHERE phone_number = $1 AND password = $2`,
                [phoneNumber, password]
            );

            if (recruiters.length === 0) {
                Alert.alert(t('error'), t('loginFailed'));
                setIsLoading(false);
                return;
            }

            const dbRecruiter = recruiters[0];
            const recruiterData: RecruiterData = {
                id: dbRecruiter.id,
                companyName: dbRecruiter.company_name,
                entityType: dbRecruiter.entity_type as EntityType,
                phoneNumber: dbRecruiter.phone_number,
            };

            setRecruiterData(recruiterData);
            setIsRecruiterLoggedIn(true);

            navigation.reset({
                index: 0,
                routes: [{ name: 'RecruiterDashboard' }],
            });
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert(t('error'), t('networkError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('RecruiterAction');
                            }
                        }}
                    >
                        <ArrowLeft size={24} color={colors.primaryForeground} />
                    </TouchableOpacity>
                    <LanguageToggle />

                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconWrapper}>
                            <Users size={28} color={colors.primaryForeground} />
                        </View>
                    </View>
                    <Text style={styles.appTitle}>{t('recruiterLogin')}</Text>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('loginTitle')}</Text>

                        <Input
                            label={t('phoneNumber')}
                            placeholder="9876543210"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            error={errors.phone}
                            maxLength={10}
                            leftIcon={<Phone size={20} color={colors.muted} />}
                        />

                        <Input
                            label={t('password')}
                            placeholder="••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                            leftIcon={<Lock size={20} color={colors.muted} />}
                        />

                        <Button
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            style={{ marginTop: spacing.md }}
                        >
                            {t('loginButton')}
                        </Button>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('noAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('RecruiterRegistration')}>
                                <Text style={styles.footerLink}>{t('registerNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
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
        marginBottom: spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
        gap: spacing.xs,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    footerLink: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default RecruiterLoginScreen;
