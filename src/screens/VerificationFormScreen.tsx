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
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, User, Phone, Lock, MapPin, Briefcase, BookOpen } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser, UserRole } from '../contexts/UserContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Progress } from '../components/ui/Progress';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { checkPhoneExists, registerUser, updateUser } from '../lib/api';

type VerificationFormNavigationProp = StackNavigationProp<RootStackParamList, 'VerificationForm'>;

const states = [
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Goa', value: 'Goa' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Haryana', value: 'Haryana' },
    { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
    { label: 'Jharkhand', value: 'Jharkhand' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Manipur', value: 'Manipur' },
    { label: 'Meghalaya', value: 'Meghalaya' },
    { label: 'Mizoram', value: 'Mizoram' },
    { label: 'Nagaland', value: 'Nagaland' },
    { label: 'Odisha', value: 'Odisha' },
    { label: 'Punjab', value: 'Punjab' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Sikkim', value: 'Sikkim' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tripura', value: 'Tripura' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
    { label: 'Uttarakhand', value: 'Uttarakhand' },
    { label: 'West Bengal', value: 'West Bengal' },
];

// Moved inside component for translation

const experiences = [
    { label: 'Fresher', value: 'fresher' },
    { label: '0-1 years', value: '0-1' },
    { label: '1-2 years', value: '1-2' },
    { label: '2-3 years', value: '2-3' },
    { label: '3-4 years', value: '3-4' },
    { label: '4-5 years', value: '4-5' },
    { label: '5-6 years', value: '5-6' },
    { label: '6-7 years', value: '6-7' },
    { label: '7-8 years', value: '7-8' },
    { label: '8+ years', value: '8+' },
];

const evBrands = ['Bajaj', 'Ola', 'Ather', 'TVS', 'Hero', 'Mahindra', 'Tata', 'Hero Electric', 'Other'];

const domains = [
    { label: 'EV (Electric Vehicle)', value: 'EV' },
    { label: 'BS6 (Internal Combustion)', value: 'BS6' },
];

// Moved inside component for translation

const VerificationFormScreen: React.FC = () => {
    const navigation = useNavigation<VerificationFormNavigationProp>();
    // @ts-ignore - Route params
    const route = useRoute();
    // @ts-ignore
    const isEditMode = route.params?.isEditMode;

    const { t } = useLanguage();
    const { selectedRole, selectedDomain, userData, refreshUserData } = useUser();

    // Define options with translations
    const qualifications = [
        { label: t('pass10th'), value: '10th' },
        { label: t('pass12th'), value: '12th' },
        { label: t('iti'), value: 'iti' },
        { label: t('diploma'), value: 'diploma' },
        { label: t('btech'), value: 'btech' },
        { label: t('other'), value: 'other' },
    ];

    const vehicleCategories = [
        { label: t('twoWheeler'), value: '2W' },
        { label: t('threeWheeler'), value: '3W' },
    ];

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // Auto-set experience for Aspirants
    // Auto-set experience removed to allow selection

    // Form data

    const [formData, setFormData] = useState({
        fullName: userData?.fullName || '',
        phoneNumber: userData?.phoneNumber || '',
        password: '', // Don't pre-fill password
        confirmPassword: '',
        state: userData?.state || '',
        city: userData?.city || '',
        pincode: userData?.pincode || '',
        qualification: userData?.qualification || '',
        experience: userData?.experience === 'fresher' && selectedRole !== 'aspirant' ? '0-1' : (userData?.experience || ''),
        currentWorkshop: userData?.current_workshop || '',
        brandWorkshop: userData?.brand_workshop || '',
        brands: userData?.brands ? (Array.isArray(userData.brands) ? userData.brands : JSON.parse(userData.brands)) : [] as string[],
        otherBrandName: '',
        otherQualification: '',
        priorKnowledge: userData?.prior_knowledge || '',
        agreedToTerms: isEditMode ? true : false,
        currentSalary: userData?.current_salary || '',
        domain: userData?.domain || selectedDomain || '',
        vehicleCategory: userData?.vehicle_category || '',
        trainingRole: userData?.training_role || '',
    });

    // Populate password if edit mode (optional, or just leave blank to keep same)
    // Actually for edit profile we usually don't verify password unless changing it.
    // For now let's assume password change is not primary goal here, or we can make it optional.

    // Fix brands if they are just ["Other"] etc.
    useEffect(() => {
        if (isEditMode && userData) {
            // Logic to extract "Other" brand name if needed, but JSON.parse should handle array
            // If brands contains something not in list, it might be custom.
            // Our toggle logic uses exact strings.
        }
    }, [isEditMode, userData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string | string[] | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const toggleBrand = (brand: string) => {
        const newBrands = formData.brands.includes(brand)
            ? formData.brands.filter((b: string) => b !== brand)
            : [...formData.brands, brand];
        updateField('brands', newBrands);
    };

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName) newErrors.fullName = t('required');
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = t('required');
        } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = t('invalidPhone');
        }
        if (!isEditMode) {
            if (!formData.password) {
                newErrors.password = t('required');
            } else if (formData.password.length < 6) {
                newErrors.password = t('passwordLength');
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = t('passwordMismatch');
            }
        }
        if (!formData.state) newErrors.state = t('required');

        if (!formData.domain) newErrors.domain = t('required');

        if (selectedRole !== 'aspirant' && selectedRole !== 'recruiter' && !formData.vehicleCategory) {
            newErrors.vehicleCategory = t('required');
        }

        if (selectedRole === 'aspirant') {
            if (!formData.qualification) newErrors.qualification = t('required');
            if (formData.qualification === 'other' && !formData.otherQualification) {
                newErrors.otherQualification = t('required');
            }
        }

        // Terms & conditions required in Step 1 only for aspirants (checkbox is in Step 1 for them)
        if (selectedRole === 'aspirant' && !formData.agreedToTerms) {
            newErrors.agreedToTerms = t('termsRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.qualification) newErrors.qualification = t('required');
        if (formData.qualification === 'other' && !formData.otherQualification) {
            newErrors.otherQualification = t('required');
        }
        if (!formData.experience) newErrors.experience = t('required');

        // Brands only required for experienced professionals
        if (selectedRole !== 'aspirant' && formData.brands.length === 0) {
            newErrors.brands = t('selectAtLeastOne');
        } else if (formData.brands.includes('Other') && !formData.otherBrandName) {
            newErrors.otherBrandName = t('required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            if (selectedRole === 'aspirant') {
                // For Freshers, submit directly after Step 1
                handleSubmit();
            } else {
                setStep(2);
            }
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        // Validate terms for technicians (not aspirants, not edit mode)
        if (!isEditMode && selectedRole !== 'aspirant' && !formData.agreedToTerms) {
            setErrors(prev => ({ ...prev, agreedToTerms: t('termsRequired') }));
            Alert.alert(t('error'), t('termsRequired'));
            return;
        }

        setIsLoading(true);
        try {
            if (isEditMode && userData?.id) {
                // UPDATE via API
                const updateData = {
                    fullName: formData.fullName,
                    state: formData.state,
                    city: formData.city,
                    pincode: formData.pincode,
                    qualification: formData.qualification === 'other' ? formData.otherQualification : formData.qualification,
                    experience: selectedRole === 'aspirant' ? 'fresher' : formData.experience,
                    currentWorkshop: formData.currentWorkshop,
                    brandWorkshop: formData.brandWorkshop,
                    brands: selectedRole === 'aspirant'
                        ? []
                        : formData.brands.map((b: string) => b === 'Other' ? formData.otherBrandName : b),
                    priorKnowledge: formData.priorKnowledge,
                    currentSalary: selectedRole === 'aspirant' ? '0' : formData.currentSalary,
                    domain: formData.domain,
                    vehicleCategory: formData.vehicleCategory || null,
                    trainingRole: formData.trainingRole || null,
                };

                await updateUser(userData.id, updateData);

                if (refreshUserData) await refreshUserData(); // Ensure context updates

                Alert.alert('Success', 'Profile Updated Successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                setIsLoading(false);
                return;
            }

            // Check if user already exists via API
            const phoneExists = await checkPhoneExists(formData.phoneNumber);

            if (phoneExists) {
                setErrors(prev => ({ ...prev, phoneNumber: t('userAlreadyExists') }));

                if (step > 1) {
                    Alert.alert(t('error'), t('userAlreadyExists'), [
                        { text: 'OK', onPress: () => setStep(1) } // Send them back to fix it
                    ]);
                }

                setIsLoading(false);
                return;
            }

            // Register new user via API
            const registrationData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode,
                qualification: formData.qualification === 'other' ? formData.otherQualification : formData.qualification,
                experience: selectedRole === 'aspirant' ? 'fresher' : formData.experience,
                currentWorkshop: formData.currentWorkshop,
                brandWorkshop: formData.brandWorkshop,
                brands: selectedRole === 'aspirant'
                    ? []
                    : formData.brands.map((b: string) => b === 'Other' ? formData.otherBrandName : b),
                role: selectedRole || 'technician',
                priorKnowledge: formData.priorKnowledge,
                currentSalary: selectedRole === 'aspirant' ? '0' : formData.currentSalary,
                domain: formData.domain,
                vehicleCategory: formData.vehicleCategory || undefined,
                trainingRole: formData.trainingRole || undefined,
            };

            await registerUser(registrationData);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Success' }],
            });
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert(t('error'), t('registrationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <Input
                label={t('fullName')}
                placeholder={t('fullName')}
                value={formData.fullName}
                onChangeText={(v) => updateField('fullName', v)}
                error={errors.fullName}
                leftIcon={<User size={20} color={colors.muted} />}
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

            {!isEditMode && (
                <Input
                    label={t('createPassword')}
                    placeholder="••••••"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v) => updateField('password', v)}
                    error={errors.password}
                    leftIcon={<Lock size={20} color={colors.muted} />}
                />
            )}

            {!isEditMode && (
                <Input
                    label={t('confirmPassword')}
                    placeholder="••••••"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateField('confirmPassword', v)}
                    error={errors.confirmPassword}
                    leftIcon={<Lock size={20} color={colors.muted} />}
                />
            )}

            <Select
                label={t('state')}
                placeholder={t('selectState')}
                options={states}
                value={formData.state}
                onValueChange={(v) => updateField('state', v)}
                error={errors.state}
            />

            <Input
                label={t('city')}
                placeholder={t('city')}
                value={formData.city}
                onChangeText={(v) => updateField('city', v)}
                error={errors.city}
                leftIcon={<MapPin size={20} color={colors.muted} />}
            />

            {/* Domain Selection */}
            <Select
                label="Select Domain" // Using literal string as translation might be missing
                placeholder="Select Domain"
                options={domains}
                value={formData.domain}
                onValueChange={(v) => updateField('domain', v)}
                error={errors.domain}
            />

            {/* Vehicle Category for All Relevant Roles (Technician, Sales, Showroom, etc.) */}
            {selectedRole !== 'aspirant' && selectedRole !== 'recruiter' && (
                <Select
                    label="Vehicle Category"
                    placeholder="Select Vehicle Category"
                    options={vehicleCategories}
                    value={formData.vehicleCategory}
                    onValueChange={(v) => updateField('vehicleCategory', v)}
                    error={errors.vehicleCategory}
                />
            )}

            <Input
                label={t('pincode')}
                placeholder="123456"
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={(v) => updateField('pincode', v)}
                maxLength={6}
                error={errors.pincode}
            />

            {selectedRole === 'aspirant' && (
                <>
                    <Select
                        label={t('qualification')}
                        placeholder={t('selectQualification')}
                        options={qualifications}
                        value={formData.qualification}
                        onValueChange={(v) => updateField('qualification', v)}
                        error={errors.qualification}
                    />

                    {formData.qualification === 'other' && (
                        <Input
                            label={t('specifyQualification')}
                            placeholder="Enter your degree/diploma"
                            value={formData.otherQualification}
                            onChangeText={(v) => updateField('otherQualification', v)}
                            error={errors.otherQualification}
                        />
                    )}

                    {selectedRole === 'aspirant' && (
                        <View style={{ marginTop: spacing.md }}>
                            <Input
                                label={t('priorKnowledge')}
                                placeholder={t('priorKnowledgePlaceholder')}
                                value={formData.priorKnowledge}
                                onChangeText={(v) => updateField('priorKnowledge', v)}
                                multiline
                                numberOfLines={3}
                                style={{ height: 100, textAlignVertical: 'top' }}
                            />
                        </View>
                    )}

                    {selectedRole === 'aspirant' && (
                        <View style={{ marginTop: spacing.md }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}
                                onPress={() => updateField('agreedToTerms', !formData.agreedToTerms)}
                            >
                                <Checkbox
                                    checked={formData.agreedToTerms}
                                    onCheckedChange={(v) => updateField('agreedToTerms', v)}
                                />
                                <Text style={{ marginLeft: spacing.sm, flex: 1, color: colors.foreground }}>
                                    {t('termsAndConditions')}
                                </Text>
                            </TouchableOpacity>
                            {errors.agreedToTerms && <Text style={{ color: colors.error, fontSize: fontSize.sm }}>{errors.agreedToTerms}</Text>}
                        </View>
                    )}
                </>
            )}

        </>
    );

    const renderStep2 = () => (
        <>
            <Select
                label={t('qualification')}
                placeholder={t('selectQualification')}
                options={qualifications}
                value={formData.qualification}
                onValueChange={(v) => updateField('qualification', v)}
                error={errors.qualification}
            />

            {/* BS6 Specific Field: Training Role */}
            {(formData.domain === 'BS6' || selectedDomain === 'BS6') && selectedRole === 'technician' && (
                <View style={{ marginTop: spacing.md }}>
                    <Select
                        label="Training Role"
                        placeholder="Select Training Role"
                        options={[
                            { label: 'Basic', value: 'Basic' },
                            { label: 'Engine Expert ', value: 'Engine Expert (Electrical)' },
                            { label: 'Diagnosis Expert (Electrical)', value: 'Diagnosis Expert' },
                            { label: 'Diagnosis + Engine Expert', value: 'Diagnosis + Engine Expert' },
                        ]}
                        value={formData.trainingRole}
                        onValueChange={(v) => updateField('trainingRole', v)}
                        error={errors.trainingRole} // We need to add error handling for this too if required
                    />
                </View>
            )}

            {formData.qualification === 'other' && (
                <Input
                    label={t('specifyQualification')} // Ensure translation exists or use literal
                    placeholder="Enter your degree/diploma"
                    value={formData.otherQualification}
                    onChangeText={(v) => updateField('otherQualification', v)}
                    error={errors.otherQualification}
                />
            )}

            <Select
                label={t('totalExperience')}
                placeholder={t('selectExperience')}
                options={selectedRole === 'aspirant' ?
                    [
                        { label: 'Fresher (No Experience)', value: 'fresher' }
                    ] :
                    [
                        { label: '0-1 years', value: '0-1' },
                        { label: '1-2 years', value: '1-2' },
                        { label: '2-3 years', value: '2-3' },
                        { label: '3-4 years', value: '3-4' },
                        { label: '4-5 years', value: '4-5' },
                        { label: '5-6 years', value: '5-6' },
                        { label: '6-7 years', value: '6-7' },
                        { label: '7-8 years', value: '7-8' },
                        { label: '8+ years', value: '8+' },
                    ]
                }
                value={formData.experience}
                onValueChange={(v) => updateField('experience', v)}
                error={errors.experience}
            />

            {selectedRole !== 'aspirant' && (
                <Input
                    label={t('currentWorkshop')}
                    placeholder={t('currentWorkshop')}
                    value={formData.currentWorkshop}
                    onChangeText={(v) => updateField('currentWorkshop', v)}
                    leftIcon={<Briefcase size={20} color={colors.muted} />}
                />
            )}

            {selectedRole !== 'aspirant' && (
                <Input
                    label={t('currentSalary')}
                    placeholder="e.g. 25000"
                    value={formData.currentSalary}
                    onChangeText={(v) => updateField('currentSalary', v)}
                    keyboardType="numeric"
                    leftIcon={<Text style={{ fontSize: 18, color: colors.muted }}>₹</Text>}
                />
            )}

            {selectedRole !== 'aspirant' && (
                <View style={styles.brandsSection}>
                    <Text style={styles.brandsLabel}>{t('brandsWorkedWith')}</Text>
                    {errors.brands && <Text style={styles.errorText}>{errors.brands}</Text>}
                    <View style={styles.brandsGrid}>
                        {evBrands.map((brand) => (
                            <TouchableOpacity
                                key={brand}
                                style={[
                                    styles.brandChip,
                                    formData.brands.includes(brand) && styles.brandChipSelected,
                                ]}
                                onPress={() => toggleBrand(brand)}
                                activeOpacity={0.7}
                            >
                                <Checkbox
                                    checked={formData.brands.includes(brand)}
                                    onCheckedChange={() => toggleBrand(brand)}
                                />
                                <Text style={[
                                    styles.brandChipText,
                                    formData.brands.includes(brand) && styles.brandChipTextSelected,
                                ]}>
                                    {brand}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Input for Other Brand */}
                    {formData.brands.includes('Other') && (
                        <View style={{ marginTop: spacing.md }}>
                            <Input
                                label={t('specifyBrand') || "Specify Brand Name"}
                                placeholder="Enter other brand name"
                                value={formData.otherBrandName}
                                onChangeText={(v) => updateField('otherBrandName', v)}
                                error={errors.otherBrandName}
                            />
                        </View>
                    )}
                </View>
            )}
        </>
    );

    const renderStep3 = () => (
        <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>{t('reviewSubmit')}</Text>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{t('fullName')}</Text>
                <Text style={styles.reviewValue}>{formData.fullName}</Text>
            </View>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{t('phoneNumber')}</Text>
                <Text style={styles.reviewValue}>{formData.phoneNumber}</Text>
            </View>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{t('state')}</Text>
                <Text style={styles.reviewValue}>{formData.state}</Text>
            </View>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{t('city')}</Text>
                <Text style={styles.reviewValue}>{formData.city}</Text>
            </View>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{t('qualification')}</Text>
                <Text style={styles.reviewValue}>{formData.qualification}</Text>
            </View>

            <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Domain</Text>
                <Text style={styles.reviewValue}>{formData.domain}</Text>
            </View>

            {formData.vehicleCategory ? (
                <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Vehicle Category</Text>
                    <Text style={styles.reviewValue}>{formData.vehicleCategory}</Text>
                </View>
            ) : null}

            {selectedRole !== 'aspirant' && (
                <>
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>{t('totalExperience')}</Text>
                        <Text style={styles.reviewValue}>{formData.experience}</Text>
                    </View>

                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>{t('brandsWorkedWith')}</Text>
                        <Text style={styles.reviewValue}>{formData.brands.join(', ')}</Text>
                    </View>
                </>
            )}

            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}
                onPress={() => updateField('agreedToTerms', !formData.agreedToTerms)}
            >
                <Checkbox
                    checked={formData.agreedToTerms}
                    onCheckedChange={(v) => updateField('agreedToTerms', v)}
                />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={{ color: colors.foreground }}>
                        {t('termsAndConditions').split(' ')[0]}
                        <Text
                            style={{ color: colors.primary, fontWeight: 'bold' }}
                            onPress={() => setShowTerms(true)}
                        >
                            {" " + t('termsAndConditions').substring(2)}
                        </Text>
                    </Text>
                </View>
            </TouchableOpacity>
            {errors.agreedToTerms && <Text style={{ color: colors.error, fontSize: fontSize.sm }}>{errors.agreedToTerms}</Text>}
        </View>
    );

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
                            1. **Data Collection**: We collect your Name, Phone Number, Location, and Professional Qualifications to create your EV Technician Profile.{"\n\n"}
                            2. **Purpose**: Your data is used to verify your skills and connect you with job opportunities in the EV sector.{"\n\n"}
                            3. **Sharing**: Verified profiles may be shared with registered Recruiters (OEMs, Dealers, Fleets).{"\n\n"}
                            4. **User Rights**: You can request to edit or delete your data at any time by contacting support.{"\n\n"}
                            5. **Consent**: By registering, you agree to receive communications (SMS/WhatsApp) regarding your application and jobs.
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
                        onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
                    >
                        <ArrowLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <LanguageSelector style={{ position: 'absolute', right: spacing.lg, top: spacing.md }} />

                    <Text style={styles.headerTitle}>
                        {t('step')} {step}/{selectedRole === 'aspirant' ? 1 : 3}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {step === 1 ? (isEditMode ? 'Edit Basic Details' : t('basicDetails')) : step === 2 ? t('professionalDetails') : t('reviewSubmit')}
                    </Text>

                    <View style={styles.progressContainer}>
                        <Progress value={(step / (selectedRole === 'aspirant' ? 1 : 3)) * 100} />
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
                    {step === 3 && renderStep3()}

                    <View style={styles.buttonContainer}>
                        {step < 3 && selectedRole !== 'aspirant' ? (
                            <Button onPress={handleNext} fullWidth>
                                {t('next')}
                            </Button>
                        ) : selectedRole === 'aspirant' && step === 1 ? (
                            <Button onPress={handleNext} loading={isLoading} fullWidth>
                                {isEditMode ? 'Update Profile' : t('submit')}
                            </Button>
                        ) : (
                            <Button onPress={handleSubmit} loading={isLoading} fullWidth>
                                {isEditMode ? 'Update Profile' : t('submit')}
                            </Button>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {renderTermsModal()}
        </SafeAreaView>
    );
};

const useRoute = () => {
    // Quick shim if @react-navigation/native useRoute is not imported or typed
    const { useRoute: originalUseRoute } = require('@react-navigation/native');
    return originalUseRoute();
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
    headerSubtitle: {
        fontSize: fontSize.sm,
        color: colors.muted,
        textAlign: 'center',
        marginTop: spacing.xs,
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
    brandsSection: {
        marginBottom: spacing.md,
    },
    brandsLabel: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.foreground,
        marginBottom: spacing.sm,
    },
    brandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    brandChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        gap: spacing.sm,
    },
    brandChipSelected: {
        backgroundColor: colors.secondary,
        borderColor: colors.primary,
    },
    brandChipText: {
        fontSize: fontSize.sm,
        color: colors.foreground,
    },
    brandChipTextSelected: {
        color: colors.primary,
        fontWeight: '500',
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginBottom: spacing.xs,
    },
    reviewSection: {
        gap: spacing.md,
    },
    reviewTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
        marginBottom: spacing.sm,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    reviewLabel: {
        fontSize: fontSize.sm,
        color: colors.muted,
        flex: 1,
    },
    reviewValue: {
        fontSize: fontSize.sm,
        color: colors.foreground,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    buttonContainer: {
        marginTop: spacing.xl,
    },
});

export default VerificationFormScreen;
