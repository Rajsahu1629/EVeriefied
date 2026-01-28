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
import { ArrowLeft, Building, Phone, Lock } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, RecruiterData, EntityType } from '../contexts/UserContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { query } from '../lib/database';

type RecruiterRegistrationNavigationProp = StackNavigationProp<RootStackParamList, 'RecruiterRegistration'>;

const entityTypes = [
    { label: 'Dealer', value: 'dealer' },
    { label: 'Fleet', value: 'fleet' },
    { label: 'OEM', value: 'oem' },
    { label: 'Workshop', value: 'workshop' },
];

const RecruiterRegistrationScreen: React.FC = () => {
    const navigation = useNavigation<RecruiterRegistrationNavigationProp>();
    const { t } = useLanguage();
    const { setRecruiterData, setIsRecruiterLoggedIn } = useUser();

    const [formData, setFormData] = useState({
        companyName: '',
        entityType: '',
        phoneNumber: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.companyName) newErrors.companyName = t('required');
        if (!formData.entityType) newErrors.entityType = t('required');
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = t('required');
        } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = t('invalidPhone');
        }
        if (!formData.password) {
            newErrors.password = t('required');
        } else if (formData.password.length < 6) {
            newErrors.password = t('passwordLength');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Check if recruiter already exists
            const existing = await query<any>(
                `SELECT id FROM recruiters WHERE phone_number = $1`,
                [formData.phoneNumber]
            );

            if (existing.length > 0) {
                Alert.alert(t('error'), t('phoneAlreadyRegistered'));
                setIsLoading(false);
                return;
            }

            // Insert new recruiter
            const result = await query<any>(
                `INSERT INTO recruiters (company_name, entity_type, phone_number, password)
         VALUES ($1, $2, $3, $4) RETURNING id`,
                [formData.companyName, formData.entityType, formData.phoneNumber, formData.password]
            );

            const recruiterData: RecruiterData = {
                id: result[0].id,
                companyName: formData.companyName,
                entityType: formData.entityType as EntityType,
                phoneNumber: formData.phoneNumber,
            };

            setRecruiterData(recruiterData);
            setIsRecruiterLoggedIn(true);

            navigation.reset({
                index: 0,
                routes: [{ name: 'RecruiterDashboard' }],
            });
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert(t('error'), t('registrationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{t('recruiterRegistration')}</Text>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Input
                        label={t('companyName')}
                        placeholder={t('companyName')}
                        value={formData.companyName}
                        onChangeText={(v) => updateField('companyName', v)}
                        error={errors.companyName}
                        leftIcon={<Building size={20} color={colors.muted} />}
                    />

                    <Select
                        label={t('entityType')}
                        placeholder={t('selectEntityType')}
                        options={entityTypes}
                        value={formData.entityType}
                        onValueChange={(v) => updateField('entityType', v)}
                        error={errors.entityType}
                    />

                    <Input
                        label={t('phoneNumber')}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        value={formData.phoneNumber}
                        onChangeText={(v) => updateField('phoneNumber', v)}
                        error={errors.phoneNumber}
                        maxLength={10}
                        leftIcon={<Phone size={20} color={colors.muted} />}
                    />

                    <Input
                        label={t('createPassword')}
                        placeholder="••••••"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(v) => updateField('password', v)}
                        error={errors.password}
                        leftIcon={<Lock size={20} color={colors.muted} />}
                    />

                    <Button
                        onPress={handleSubmit}
                        loading={isLoading}
                        fullWidth
                        style={{ marginTop: spacing.lg }}
                    >
                        {t('register')}
                    </Button>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('RecruiterLogin')}>
                            <Text style={styles.footerLink}>{t('login')}</Text>
                        </TouchableOpacity>
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
        backgroundColor: colors.background,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        position: 'absolute',
        top: spacing.lg,
        left: spacing.md,
        padding: spacing.sm,
        zIndex: 100,
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
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

export default RecruiterRegistrationScreen;
