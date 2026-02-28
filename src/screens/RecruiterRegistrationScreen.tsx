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
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Building, Phone, Lock, MapPin } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, RecruiterData, EntityType } from '../contexts/UserContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { checkRecruiterPhoneExists, registerRecruiter } from '../lib/api';

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
        fullAddress: '',
        city: '',
        state: '',
        pincode: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.companyName) newErrors.companyName = t('required');
        if (!formData.entityType) newErrors.entityType = t('required');
        if (!formData.fullAddress) newErrors.fullAddress = t('required');
        if (!formData.city) newErrors.city = t('required');
        if (!formData.state) newErrors.state = t('required');
        if (!formData.pincode) {
            newErrors.pincode = t('required');
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = t('invalidPincode');
        }
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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordMismatch');
        }

        if (!formData.agreedToTerms) {
            newErrors.agreedToTerms = t('termsRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Check if recruiter already exists via API
            const exists = await checkRecruiterPhoneExists(formData.phoneNumber);

            if (exists) {
                Alert.alert(t('error'), t('phoneAlreadyRegistered'));
                setIsLoading(false);
                return;
            }

            // Register new recruiter via API
            const result = await registerRecruiter({
                companyName: formData.companyName,
                entityType: formData.entityType,
                fullAddress: formData.fullAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
            });

            const recruiterData: RecruiterData = {
                id: result.recruiter.id,
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
        } catch (error: any) {
            console.error('Registration error:', error);
            const rawMessage = error?.message || '';
            let userMessage = t('registrationFailed');

            if (rawMessage.toLowerCase().includes('network')) {
                userMessage = t('networkError');
            } else if (rawMessage) {
                // If we get a readable error from backend, show it (cleaned up)
                userMessage = rawMessage;
            }

            Alert.alert(t('error'), userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTermsModal = () => (
        <Modal
            visible={showTerms}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowTerms(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.md }}>
                <View style={{ backgroundColor: colors.card, borderRadius: spacing.md, padding: spacing.lg, maxHeight: '80%' }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: 'bold', marginBottom: spacing.md, color: colors.foreground }}>
                        Privacy Policy & Terms
                    </Text>
                    <ScrollView>
                        <Text style={{ color: colors.foreground, lineHeight: 22 }}>
                            1. INTRODUCTION{"\n"}
                            Welcome to EVerified. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application.{"\n\n"}
                            2. INFORMATION WE COLLECT{"\n"}
                            To provide our verification and job connection services, we collect the following types of information:{"\n"}
                            • Personal Information: Name, Phone Number, Email Address.{"\n"}
                            • Professional Information: Qualifications, Experience, Current Salary, Brands Worked With.{"\n"}
                            • Business Information: Company Name, Entity Type, Address, GST/Business Proof.{"\n"}
                            • Location Data: State, City, and Pincode to match you with local job opportunities.{"\n\n"}
                            3. HOW WE USE YOUR INFORMATION{"\n"}
                            We use your data for the following purposes:{"\n"}
                            • Verification: To verify your identity and professional skills.{"\n"}
                            • Job Matching: To connect Candidates with Recruiters.{"\n"}
                            • Communication: To send you important updates via SMS or WhatsApp.{"\n\n"}
                            4. DATA SHARING{"\n"}
                            • Recruiters: Verified candidate profiles are visible to registered Recruiters.{"\n"}
                            • Legal Requirements: We may disclose your information if required by law.{"\n\n"}
                            5. DATA SECURITY{"\n"}
                            We implement appropriate security measures to protect your personal information.{"\n\n"}
                            6. YOUR RIGHTS{"\n"}
                            You have the right to access, update, or request the deletion of your personal data. You can update your profile directly within the app or contact our support team.{"\n\n"}
                            7. CONTACT US{"\n"}
                            If you have any questions, please contact us at: rajsahu1629@gmail.com
                        </Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={{ backgroundColor: colors.primary, padding: spacing.md, borderRadius: spacing.sm, marginTop: spacing.md, alignItems: 'center' }}
                        onPress={() => setShowTerms(false)}
                    >
                        <Text style={{ color: colors.primaryForeground, fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

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
                        label={t('fullAddress')}
                        placeholder={t('enterFullAddress')}
                        value={formData.fullAddress}
                        onChangeText={(v) => updateField('fullAddress', v)}
                        error={errors.fullAddress}
                        leftIcon={<MapPin size={20} color={colors.muted} />}
                        multiline
                        numberOfLines={2}
                    />

                    <Input
                        label={t('city')}
                        placeholder={t('enterCity')}
                        value={formData.city}
                        onChangeText={(v) => updateField('city', v)}
                        error={errors.city}
                    />

                    <Select
                        label={t('state')}
                        placeholder={t('enterState')}
                        options={[
                            { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
                            { label: 'Bihar', value: 'Bihar' },
                            { label: 'Chhattisgarh', value: 'Chhattisgarh' },
                            { label: 'Delhi', value: 'Delhi' },
                            { label: 'Goa', value: 'Goa' },
                            { label: 'Gujarat', value: 'Gujarat' },
                            { label: 'Haryana', value: 'Haryana' },
                            { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
                            { label: 'Jammu & Kashmir', value: 'Jammu & Kashmir' },
                            { label: 'Jharkhand', value: 'Jharkhand' },
                            { label: 'Karnataka', value: 'Karnataka' },
                            { label: 'Kerala', value: 'Kerala' },
                            { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
                            { label: 'Maharashtra', value: 'Maharashtra' },
                            { label: 'Odisha', value: 'Odisha' },
                            { label: 'Punjab', value: 'Punjab' },
                            { label: 'Rajasthan', value: 'Rajasthan' },
                            { label: 'Tamil Nadu', value: 'Tamil Nadu' },
                            { label: 'Telangana', value: 'Telangana' },
                            { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
                            { label: 'Uttarakhand', value: 'Uttarakhand' },
                            { label: 'West Bengal', value: 'West Bengal' },
                        ]}
                        value={formData.state}
                        onValueChange={(v) => updateField('state', v)}
                        error={errors.state}
                    />

                    <Input
                        label={t('pincode')}
                        placeholder="110001"
                        keyboardType="number-pad"
                        value={formData.pincode}
                        onChangeText={(v) => updateField('pincode', v)}
                        error={errors.pincode}
                        maxLength={6}
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

                    <Input
                        label={t('confirmPassword')}
                        placeholder="••••••"
                        secureTextEntry
                        value={formData.confirmPassword}
                        onChangeText={(v) => updateField('confirmPassword', v)}
                        error={errors.confirmPassword}
                        leftIcon={<Lock size={20} color={colors.muted} />}
                    />

                    <View style={{ marginTop: spacing.md }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}
                            onPress={() => setFormData(prev => ({ ...prev, agreedToTerms: !formData.agreedToTerms }))}
                        >
                            <Checkbox
                                checked={formData.agreedToTerms}
                                onCheckedChange={(v) => setFormData(prev => ({ ...prev, agreedToTerms: v }))}
                            />
                            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                <Text style={{ color: colors.foreground }}>
                                    {t('termsAndConditions') ? t('termsAndConditions').split(' ')[0] : 'I agree to'}
                                    <Text
                                        style={{ color: colors.primary, fontWeight: 'bold' }}
                                        onPress={() => setShowTerms(true)}
                                    >
                                        {" " + (t('termsAndConditions') ? t('termsAndConditions').substring(t('termsAndConditions').indexOf(' ') + 1) : 'Terms & Conditions')}
                                    </Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {errors.agreedToTerms && <Text style={{ color: colors.error, fontSize: fontSize.sm }}>{errors.agreedToTerms}</Text>}
                    </View>

                    <Button
                        onPress={handleSubmit}
                        loading={isLoading}
                        fullWidth
                        style={{ marginTop: spacing.lg }}
                    >
                        {t('register')}
                    </Button>
                    {renderTermsModal()}

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
