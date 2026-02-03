import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Progress } from '../components/ui/Progress';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { createJob, updateJob } from '../lib/api';

type PostJobNavigationProp = StackNavigationProp<RootStackParamList, 'PostJob'>;

// Moved inside component for translation

// Moved inside component for translation

// Moved inside component for translation

const PostJobScreen: React.FC = () => {
    const navigation = useNavigation<PostJobNavigationProp>();
    const route = useRoute();
    const params = route.params as { isEditMode?: boolean; jobData?: any } | undefined;
    const isEditMode = params?.isEditMode;
    const existingJob = params?.jobData;

    const { t } = useLanguage();
    const { recruiterData } = useUser();



    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        brand: existingJob?.brand === 'Other' ? 'Other' : (existingJob?.brand || ''),
        otherBrand: existingJob?.brand === 'Other' ? existingJob?.brand : '', // Logic adjustment needed: if brand not in list, it's 'Other' + custom
        roleRequired: existingJob?.role_required || '',
        numberOfPeople: existingJob?.number_of_people || '',
        experience: existingJob?.experience || '',
        salaryMin: existingJob?.salary_min?.toString() || '',
        salaryMax: existingJob?.salary_max?.toString() || '',
        hasIncentive: existingJob?.has_incentive || false,
        pincode: existingJob?.pincode || '',
        city: existingJob?.city || '',
        stayProvided: existingJob?.stay_provided || false,
        urgency: existingJob?.urgency || 'within_7_days',
        jobDescription: existingJob?.job_description || '',
        vehicleCategory: existingJob?.vehicle_category || '',
        trainingRole: existingJob?.training_role || '',
    });

    // Correctly handle Other brand for pre-fill
    // If brand is not in evBrands list, set brand='Other' and otherBrand=actualBrand
    useEffect(() => {
        if (isEditMode && existingJob?.brand) {
            const brandExists = evBrands.some(b => b.value === existingJob.brand);
            if (!brandExists) {
                setFormData(prev => ({ ...prev, brand: 'Other', otherBrand: existingJob.brand }));
            }
        }
    }, [isEditMode, existingJob]);

    // Define options with translations
    const evBrands = [
        { label: 'Ola', value: 'Ola' },
        { label: 'Ather', value: 'Ather' },
        { label: 'Bajaj', value: 'Bajaj' },
        { label: 'TVS', value: 'TVS' },
        { label: 'Hero Electric', value: 'Hero Electric' },
        { label: t('other'), value: 'Other' },
    ];

    const roles = [
        { label: t('evTechnician'), value: 'technician' },
        { label: t('bs6Technician'), value: 'bs6_technician' },
        { label: t('showroomManager'), value: 'sales' },
        { label: t('workshopManager'), value: 'workshop' },
        { label: t('fresher'), value: 'fresher' },
    ];

    const experiences = [
        { label: t('fresher'), value: 'fresher' },
        { label: `0-1 ${t('years')}`, value: '0-1' },
        { label: `1-2 ${t('years')}`, value: '1-2' },
        { label: `2-3 ${t('years')}`, value: '2-3' },
        { label: `3-4 ${t('years')}`, value: '3-4' },
        { label: `4-5 ${t('years')}`, value: '4-5' },
        { label: `5-6 ${t('years')}`, value: '5-6' },
        { label: `6-7 ${t('years')}`, value: '6-7' },
        { label: `7-8 ${t('years')}`, value: '7-8' },
        { label: `8+ ${t('years')}`, value: '8+' },
    ];

    const vehicleCategories = [
        { label: '2 Wheeler', value: '2W' },
        { label: '3 Wheeler', value: '3W' },
    ];



    const trainingRoles = [
        { label: 'Basic', value: 'Basic' },
        { label: 'Engine Expert', value: 'Engine Expert' },
        { label: 'Diagnosis Expert (Electrical)', value: 'Diagnosis Expert' },
        { label: 'Diagnosis + Engine Expert', value: 'Diagnosis + Engine Expert' },
    ];


    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.brand) newErrors.brand = t('required');
        if (formData.brand === 'Other' && !formData.otherBrand) newErrors.otherBrand = t('required');
        if (!formData.roleRequired) newErrors.roleRequired = t('required');
        if (!formData.numberOfPeople) newErrors.numberOfPeople = t('required');
        // if (!formData.roleRequired) newErrors.roleRequired = t('required');

        // Vehicle Category mandatory for certain roles (Technician, Sales, Workshop)
        if (formData.roleRequired !== 'fresher' && !formData.vehicleCategory) {
            newErrors.vehicleCategory = t('required');
        }

        if (!formData.numberOfPeople) newErrors.numberOfPeople = t('required');
        if (!formData.experience) newErrors.experience = t('required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.salaryMin) newErrors.salaryMin = t('required');
        if (!formData.salaryMax) newErrors.salaryMax = t('required');
        if (!formData.pincode) {
            newErrors.pincode = t('required');
        } else if (formData.pincode.length !== 6) {
            newErrors.pincode = t('invalidPincode');
        }
        if (!formData.city) newErrors.city = t('required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setIsLoading(true);
        try {
            const brandValue = formData.brand === 'Other' ? formData.otherBrand : formData.brand;

            const jobData = {
                brand: brandValue,
                roleRequired: formData.roleRequired,
                numberOfPeople: formData.numberOfPeople,
                experience: formData.experience,
                salaryMin: parseInt(formData.salaryMin),
                salaryMax: parseInt(formData.salaryMax),
                hasIncentive: formData.hasIncentive,
                pincode: formData.pincode,
                city: formData.city,
                stayProvided: formData.stayProvided,
                urgency: formData.urgency,
                jobDescription: formData.jobDescription,
                vehicleCategory: formData.vehicleCategory || null,
                trainingRole: formData.trainingRole || null,
            };

            if (isEditMode && existingJob?.id) {
                // UPDATE via API
                await updateJob(existingJob.id, jobData);
                Alert.alert('Success', 'Job Post Updated Successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                // INSERT via API
                await createJob(parseInt(recruiterData?.id || '0'), jobData);
                Alert.alert(t('jobPostCreated'), '', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Job post error:', error);
            Alert.alert(t('error'), t('jobPostFailed'));
        } finally {
            setIsLoading(false);
        }
    };


    const renderStep1 = () => (
        <>
            <Select
                label={t('selectBrand')}
                placeholder={t('selectBrand')}
                options={evBrands}
                value={formData.brand}
                onValueChange={(v) => updateField('brand', v)}
                error={errors.brand}
            />

            {/* Show text input when Other is selected */}
            {formData.brand === 'Other' && (
                <Input
                    label="Enter Brand Name"
                    placeholder="e.g. Tata, Mahindra, etc."
                    value={formData.otherBrand}
                    onChangeText={(v) => updateField('otherBrand', v)}
                    error={errors.otherBrand}
                />
            )}

            <Select
                label={t('roleRequired')}
                placeholder={t('roleRequired')}
                options={roles}
                value={formData.roleRequired}
                onValueChange={(v) => updateField('roleRequired', v)}
                error={errors.roleRequired}
            />



            {/* Vehicle Category Selection */}
            {formData.roleRequired !== 'fresher' && (
                <Select
                    label="Vehicle Category"
                    placeholder="Select Vehicle Category"
                    options={vehicleCategories}
                    value={formData.vehicleCategory}
                    onValueChange={(v) => updateField('vehicleCategory', v)}
                    error={errors.vehicleCategory}
                />
            )}

            {/* Training Role Selection (Only for BS6 Technician) */}
            {formData.roleRequired === 'bs6_technician' && (
                <Select
                    label="Training Role"
                    placeholder="Select Training Role"
                    options={trainingRoles}
                    value={formData.trainingRole}
                    onValueChange={(v) => updateField('trainingRole', v)}
                    error={errors.trainingRole}
                />
            )}



            <Input
                label={t('numberOfPeople')}
                placeholder="1"
                keyboardType="number-pad"
                value={formData.numberOfPeople}
                onChangeText={(v) => updateField('numberOfPeople', v)}
                error={errors.numberOfPeople}
            />

            <Select
                label={t('experienceRequired')}
                placeholder={t('selectExperience')}
                options={experiences}
                value={formData.experience}
                onValueChange={(v) => updateField('experience', v)}
                error={errors.experience}
            />
        </>
    );

    const renderStep2 = () => (
        <>
            <Text style={styles.sectionTitle}>{t('salaryRange')}</Text>
            <View style={styles.salaryRow}>
                <Input
                    placeholder="Min"
                    keyboardType="number-pad"
                    value={formData.salaryMin}
                    onChangeText={(v) => updateField('salaryMin', v)}
                    error={errors.salaryMin}
                    containerStyle={{ flex: 1 }}
                />
                <Text style={styles.salaryDivider}>-</Text>
                <Input
                    placeholder="Max"
                    keyboardType="number-pad"
                    value={formData.salaryMax}
                    onChangeText={(v) => updateField('salaryMax', v)}
                    error={errors.salaryMax}
                    containerStyle={{ flex: 1 }}
                />
            </View>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateField('hasIncentive', !formData.hasIncentive)}
            >
                <Checkbox
                    checked={formData.hasIncentive}
                    onCheckedChange={(v) => updateField('hasIncentive', v)}
                />
                <Text style={styles.checkboxLabel}>
                    {formData.hasIncentive ? t('incentiveYes') : t('incentiveNo')}
                </Text>
            </TouchableOpacity>

            <Input
                label={t('pincode')}
                placeholder="123456"
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={(v) => updateField('pincode', v)}
                error={errors.pincode}
                maxLength={6}
                leftIcon={<MapPin size={20} color={colors.muted} />}
            />

            <Input
                label={t('city')}
                placeholder={t('enterCity')}
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                error={errors.city}
            />

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateField('stayProvided', !formData.stayProvided)}
            >
                <Checkbox
                    checked={formData.stayProvided}
                    onCheckedChange={(v) => updateField('stayProvided', v)}
                />
                <Text style={styles.checkboxLabel}>
                    {formData.stayProvided ? t('stayYes') : t('stayNo')}
                </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>{t('urgency')}</Text>
            <View style={styles.urgencyRow}>
                <TouchableOpacity
                    style={[
                        styles.urgencyOption,
                        formData.urgency === 'immediate' && styles.urgencyOptionSelected,
                    ]}
                    onPress={() => updateField('urgency', 'immediate')}
                >
                    <Text style={[
                        styles.urgencyText,
                        formData.urgency === 'immediate' && styles.urgencyTextSelected,
                    ]}>
                        {t('immediateUrgency')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.urgencyOption,
                        formData.urgency === 'within_7_days' && styles.urgencyOptionSelected,
                    ]}
                    onPress={() => updateField('urgency', 'within_7_days')}
                >
                    <Text style={[
                        styles.urgencyText,
                        formData.urgency === 'within_7_days' && styles.urgencyTextSelected,
                    ]}>
                        {t('within7Days')}
                    </Text>
                </TouchableOpacity>
            </View>

            <Input
                label="Job Description"
                placeholder="Enter job description, requirements, and responsibilities..."
                value={formData.jobDescription}
                onChangeText={(v) => updateField('jobDescription', v)}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
            />
        </>
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
                        onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
                    >
                        <ArrowLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        {step === 1 ? t('basics') : t('conditions')}
                    </Text>

                    <View style={styles.progressContainer}>
                        <Progress value={(step / 2) * 100} />
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}

                    <View style={styles.buttonContainer}>
                        {step < 2 ? (
                            <Button onPress={handleNext} fullWidth>
                                {t('next')}
                            </Button>
                        ) : (
                            <Button onPress={handleSubmit} loading={isLoading} fullWidth>
                                {isEditMode ? 'Update Job Post' : t('submitJob')}
                            </Button>
                        )}
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
    progressContainer: {
        marginTop: spacing.md,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    sectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.foreground,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    salaryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    salaryDivider: {
        fontSize: fontSize.lg,
        color: colors.muted,
        marginTop: spacing.md,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    checkboxLabel: {
        fontSize: fontSize.base,
        color: colors.foreground,
    },
    urgencyRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    urgencyOption: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    urgencyOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    urgencyText: {
        fontSize: fontSize.sm,
        color: colors.foreground,
        fontWeight: '500',
    },
    urgencyTextSelected: {
        color: colors.primaryForeground,
    },
    buttonContainer: {
        marginTop: spacing.xl,
    },
});

export default PostJobScreen;
