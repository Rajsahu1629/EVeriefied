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
    Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Phone, Lock, Zap } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, UserData, UserRole, VerificationStatus } from '../contexts/UserContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { loginUser } from '../lib/api';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginNavigationProp>();
    const { t } = useLanguage();
    const { setUserData, setIsLoggedIn, selectedRole } = useUser();

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

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Admin login check first
            if (phoneNumber === '9473928468' && password === 'admin123@') {
                console.log('Admin login successful!');
                setIsLoading(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminDashboard' }],
                });
                return;
            }

            // Call API for user login
            const response = await loginUser(phoneNumber, password);

            if (!response.success || !response.user) {
                Alert.alert(t('error'), t('loginFailed'));
                setIsLoading(false);
                return;
            }

            const user = response.user;
            const userData: UserData = {
                id: user.id,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                state: user.state || '',
                city: user.city || '',
                pincode: user.pincode || '',
                qualification: user.qualification || '',
                experience: user.experience || '',
                currentWorkshop: user.currentWorkshop || '',
                brandWorkshop: user.brandWorkshop || '',
                brands: user.brands || [],
                role: user.role as UserRole,
                verificationStatus: user.verificationStatus as VerificationStatus,
                verificationStep: user.verificationStep || 0,
                quizScore: user.quizScore || 0,
                totalQuestions: user.totalQuestions || 0,
                lastQuizAttempt: user.lastQuizAttempt,
                domain: user.domain,
                vehicle_category: user.vehicle_category,
                training_role: user.training_role,
            };

            setUserData(userData);
            setIsLoggedIn(true);
            navigation.reset({
                index: 0,
                routes: [{ name: 'UserDashboard' }],
            });
        } catch (error: any) {
            const rawMessage = error?.message || '';
            let userMessage = t('networkError');

            if (rawMessage.toLowerCase().includes('not found') || rawMessage.toLowerCase().includes('not register')) {
                userMessage = t('userNotRegistered');
            } else if (rawMessage.toLowerCase().includes('password') || rawMessage.toLowerCase().includes('credential')) {
                userMessage = t('invalidCredentials');
            } else if (rawMessage) {
                userMessage = rawMessage; // Fallback to raw message if specific case not matched, but formatted nicely
            }

            Alert.alert(t('error'), userMessage);
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
                                navigation.navigate('ActionSelection');
                            }
                        }}
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

                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={() => {
                                const phone = phoneNumber || "your_registered_number";
                                const message = encodeURIComponent(`Hello Support, I forgot my password for mobile number: ${phone}`);
                                Linking.openURL(`whatsapp://send?phone=+919473928468&text=${message}`);
                            }}
                        >
                            <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
                        </TouchableOpacity>

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
                            <TouchableOpacity onPress={() => navigation.navigate('VerificationForm')}>
                                <Text style={styles.footerLink}>{t('applyNow')}</Text>
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    forgotPasswordText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default LoginScreen;
