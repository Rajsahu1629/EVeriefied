import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import {
    Zap, Star, CheckCircle, Clock, AlertCircle, LogOut,
    Package, ChevronRight, X, MapPin, Phone, User, Home, Download, Share2,
    Instagram, MessageCircle, Facebook, Edit
} from 'lucide-react-native';
import { useUser, VerificationStatus, UserData } from '../contexts/UserContext';
import { colors, spacing } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { getCardOrderStatus, updateCardOrderStatus } from '../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Standard base width (iPhone 13/14 approx)
const BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const CARD_WIDTH = SCREEN_WIDTH - scale(40);
const CARD_ASPECT_RATIO = 1.586;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

// Web-matched Circuit Pattern
const CircuitPattern = ({ color, isGold, isTeal }: { color?: string, isGold?: boolean, isTeal?: boolean }) => {
    // Colors from web version
    const strokeColor = color || (isGold ? "#d4a574" : isTeal ? "#00d9cc" : "#00ccaa");

    return (
        <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.4 }}>
            {/* Horizontal lines */}
            <Line x1="10%" y1="20%" x2="30%" y2="20%" stroke={strokeColor} strokeWidth="2" />
            <Line x1="12%" y1="35%" x2="32%" y2="35%" stroke={strokeColor} strokeWidth="2" />
            <Line x1="8%" y1="55%" x2="25%" y2="55%" stroke={strokeColor} strokeWidth="1.5" />
            <Line x1="14%" y1="75%" x2="35%" y2="75%" stroke={strokeColor} strokeWidth="1.5" />

            {/* Diagonal segments */}
            <Path d="M 150 60 L 190 75 L 250 75" stroke={strokeColor} strokeWidth="2" fill="none" />
            <Path d="M 170 110 L 210 125 L 280 125" stroke={strokeColor} strokeWidth="2" fill="none" />

            {/* Right side lines */}
            <Line x1="75%" y1="15%" x2="92%" y2="15%" stroke={strokeColor} strokeWidth="1.5" />
            <Line x1="77%" y1="30%" x2="94%" y2="30%" stroke={strokeColor} strokeWidth="1.5" />

            {/* Circuit nodes */}
            <Circle cx="30%" cy="20%" r="2.5" fill={strokeColor} />
            <Circle cx="35%" cy="28%" r="2.5" fill={strokeColor} />
            <Circle cx="32%" cy="35%" r="2.5" fill={strokeColor} />
            <Circle cx="25%" cy="55%" r="2.5" fill={strokeColor} />
            <Circle cx="35%" cy="75%" r="2.5" fill={strokeColor} />
            <Circle cx="80%" cy="45%" r="2.5" fill={strokeColor} />
        </Svg>
    );
};

// QR Code Grid Pattern (Matched)
const QRCodeGrid = ({ size = 65, color = '#1f2937' }: { size?: number, color?: string }) => {
    const cols = 5;
    const cellSize = size / cols;
    const filledIndices = [0, 1, 2, 4, 5, 6, 10, 14, 18, 20, 21, 22, 24]; // Matching web pattern

    return (
        <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: 25 }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: filledIndices.includes(i) ? color : 'transparent',
                        padding: 1.5
                    }}
                />
            ))}
        </View>
    );
};

// Theme Configs (Web Matched)
const THEMES = {
    gold: {
        gradient: ['#3a2817', '#4a3520', '#5a4228'] as const,
        primaryColor: '#d4a574',
        badgeGradient: ['rgba(212, 165, 116, 0.25)', 'rgba(180, 130, 50, 0.15)'] as const,
        badgeBorder: '#d4a574',
        partnersGradient: ['rgba(160, 110, 40, 0.55)', 'rgba(180, 130, 50, 0.45)'] as const,
        partnersBorder: 'rgba(200, 150, 70, 0.7)',
    },
    teal: {
        gradient: ['#0a4d4d', '#0d5f5f', '#107373'] as const,
        primaryColor: '#00d9cc',
        badgeGradient: ['rgba(0, 217, 204, 0.25)', 'rgba(0, 217, 204, 0.15)'] as const,
        badgeBorder: '#00d9cc',
        partnersGradient: ['rgba(0, 180, 180, 0.4)', 'rgba(0, 200, 200, 0.35)'] as const,
        partnersBorder: 'rgba(0, 217, 204, 0.6)',
    },
    // Technician Theme - "Electric Blue" (Deep Blue)
    green: {
        gradient: ['#0a1929', '#0d3a5c', '#1565c0'] as const,
        primaryColor: '#64b5f6', // Light Blue
        badgeGradient: ['rgba(100, 181, 246, 0.25)', 'rgba(100, 181, 246, 0.15)'] as const,
        badgeBorder: '#42a5f5',
        partnersGradient: ['rgba(66, 165, 245, 0.3)', 'rgba(66, 165, 245, 0.2)'] as const,
        partnersBorder: 'rgba(100, 181, 246, 0.5)',
    },
};

const getRoleLabel = (userData: UserData | null | undefined, t: (key: string) => string) => {
    const role = userData?.role;
    // Strip "Verified " if it somehow exists in the database role
    const cleanRole = (role || "").replace(/^Verified\s+/i, "");

    // BS6 Specific Logic
    if (role === 'technician' && userData?.domain === 'BS6') {
        const category = userData?.vehicle_category ? ` (${userData.vehicle_category})` : '';
        return { title: `BS6 Technician${category}` };
    }

    switch (cleanRole.toLowerCase()) {
        case "technician": return { title: t('evTechnician') };
        case "sales": return { title: t('evShowroomManager') };
        case "workshop": return { title: t('evWorkshopManager') };
        case "aspirant": return { title: t('fresher') };
        default: return { title: cleanRole || t('people') }; // Fallback
    }
};

const getVerificationProgress = (userData: UserData | null | undefined, t: (key: string) => string): string => {
    const role = userData?.role;
    const status = userData?.verificationStatus;
    const step = userData?.verificationStep || 0;

    // BS6 Technician Logic
    if (userData?.domain === 'BS6' && role === 'technician') {
        if (status === 'verified') return t('allTestsPassed');
        if (status === 'failed') return t('retryAfter7Days');

        if (step === 0) return "Basic Verification Pending";
        if (step === 1) return "Engine Expert ";
        if (step === 2) return "Diagnosis Expert(Electrical)";
        return "Diagnosis + Engine Expert";
    }

    const isSingleStepRole = role === 'sales' || role === 'workshop' || role === 'aspirant';
    if (status === 'verified') return isSingleStepRole ? t('testPassed') : t('allTestsPassed');
    if (status === 'failed') return t('retryAfter7Days');
    if (status === 'step1_completed' && !isSingleStepRole) return t('oneTestPassed');
    return t('completeVerification');
};

export default function IDCardScreen() {
    const { userData, logout } = useUser();
    const { t } = useLanguage();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const cardRef = useRef(null);

    // Order Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [orderForm, setOrderForm] = useState({
        fullName: userData?.fullName || '',
        address: '',
        city: userData?.city || '',
        pincode: userData?.pincode || '',
        mobile: userData?.phoneNumber || '',
    });
    const [cardOrdered, setCardOrdered] = useState(false);
    const [isOrderLoading, setIsOrderLoading] = useState(false);

    // Check if card was already ordered
    React.useEffect(() => {
        const checkCardOrderStatus = async () => {
            if (!userData?.id) return;
            try {
                const result = await getCardOrderStatus(userData.id);
                if (result.cardOrdered) {
                    setCardOrdered(true);
                }
            } catch (error) {
                console.error('Error checking order status:', error);
            }
        };
        checkCardOrderStatus();
    }, [userData?.id]);

    // Theme Logic - Decoupled from Verification Status
    // Step 1: User Passed Test (verificationStatus is verified/approved)
    const hasPassedTest = userData?.verificationStatus === 'verified' || userData?.verificationStatus === 'approved';

    // Step 2: Admin Manually Verified (is_admin_verified is true)
    // If Admin Verified -> GREEN TICK (isFullyVerified)
    // If Only Passed Test -> YELLOW TICK (isPendingAdmin)
    const isFullyVerified = hasPassedTest && (userData?.is_admin_verified === true);

    // Logic for UI states
    const isVerified = hasPassedTest; // Used for "Test Passed" text logic
    const showGreenTick = isFullyVerified;
    const showYellowTick = hasPassedTest && !isFullyVerified;
    const isPending = !isVerified;

    // Theme depends strictly on Role
    const role = (userData?.role || "").toLowerCase();
    const isGold = role === 'sales';
    const isTeal = role === 'workshop';
    // Both technicians and aspirants use the Titanium (green/black) theme
    // const isTitanium = userData?.role === 'technician' || userData?.role === 'aspirant';

    const theme = isGold ? THEMES.gold : isTeal ? THEMES.teal : THEMES.green;
    const roleInfo = getRoleLabel(userData, t);

    // Experience Partners - Use user's selected brands from registration
    const userBrands = userData?.brands || [];
    const experiencePartners = useMemo(() => {
        const defaultPartners = [
            { name: "OLA", sub: "Electric" },
            { name: "Ather", sub: "Energy" },
            { name: "TVS", sub: "iQube" }
        ];

        // Strictly hide for Freshers/Aspirants regardless of brands
        const role = (userData?.role || "").toLowerCase();
        const experience = (userData?.experience || "").toLowerCase();

        if (role === 'aspirant' || !experience || experience === 'fresher') {
            return [];
        }

        // Filter out "Other" from brands to avoid "Other Electric"
        const validBrands = userBrands.filter(b => b && b !== 'Other');

        if (validBrands.length > 0) {
            // Map user's brands to display format
            return validBrands.slice(0, 3).map((brand, index) => ({
                name: brand,
                sub: "", // Removed automatic suffixes as per user request
                color: index === 0 ? theme.primaryColor : "#ffffff"
            }));
        }

        return [];
    }, [userBrands, theme.primaryColor, userData?.role, userData?.experience]);

    // Format Experience Text Compactly
    const getExperienceLabel = (exp?: string) => {
        if (!exp || exp === 'fresher') return t('fresher');
        if (exp === '0-1') return `0-1 ${t('yearExperienced')}`;
        if (exp === '1-2') return `1+ ${t('yearExperienced')}`;
        if (exp === '2-5') return `2+ ${t('yearExperienced')}`;
        if (exp === '5+') return `5+ ${t('yearExperienced')}`;
        return `${exp} ${t('yearExperienced')}`;
    };

    const experienceText = getExperienceLabel(userData?.experience);

    // Dynamic styles based on theme
    const accentColor = theme.primaryColor;

    // Show loading/empty state instead of early return (to avoid hooks error)
    // if (!userData) { return null; } -- REMOVED

    const handleLogout = async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
    };

    const handleStartVerification = () => {
        // Only technicians have step 2, sales/workshop/aspirant only have step 1
        const isSingleStepRole = userData?.role === 'sales' || userData?.role === 'workshop' || userData?.role === 'aspirant';
        const step = (!isSingleStepRole && userData?.verificationStatus === 'step1_completed') ? 2 : 1;
        navigation.navigate('SkillVerification', { step });
    };

    const handleOrderCard = async () => {
        if (!orderForm.fullName || !orderForm.address || !orderForm.pincode || !orderForm.mobile) {
            Alert.alert('Missing Details', 'Please fill all required fields');
            return;
        }

        setIsOrderLoading(true);
        try {
            await updateCardOrderStatus(userData?.id || '', true);
            setCardOrdered(true);
            Alert.alert('Order Placed!', 'Your physical ID Card for Rs 199 will be delivered within 7-10 days.');
            setShowOrderModal(false);
        } catch (error) {
            console.error('Order error:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setIsOrderLoading(false);
        }
    };

    const handleShare = async (platform?: 'whatsapp' | 'instagram' | 'facebook') => {
        try {
            const uri = await captureRef(cardRef, {
                format: 'png',
                quality: 0.9,
            });

            const isSharingAvailable = await Sharing.isAvailableAsync();
            if (!isSharingAvailable) {
                Alert.alert('Error', 'Sharing not available on this device');
                return;
            }

            // Always use system share sheet - it properly sends image + allows adding message
            // This works best for WhatsApp, Instagram, Facebook, etc.
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Share your EV Professional ID Card',
                UTI: 'public.png', // for iOS
            });

            setShowShareModal(false);
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Share', 'Could not share. Please try downloading and sharing manually.');
        }
    };

    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant library access to save your ID card.');
                return;
            }

            const uri = await captureRef(cardRef, {
                format: 'png',
                quality: 1.0,
            });

            // Using createAssetAsync which is more robust in many Expo environments
            await MediaLibrary.createAssetAsync(uri);

            Alert.alert('Success', 'ID Card saved to your gallery!');
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Could not save. Please take a screenshot manually.');
        }
    };

    if (!userData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#666' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={['#1a9d6e', '#137a55']} style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <Zap size={20} color="#00d9a3" fill="#00d9a3" />
                        <Text style={styles.headerLogoText}>
                            <Text style={{ color: '#00d9a3' }}>EV</Text>erified
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <LanguageSelector color="#fff" />
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <LogOut size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.welcomeText}>{t('welcome')}, {userData?.fullName?.split(' ')[0] || 'User'}!</Text>
                <Text style={styles.roleText}>{roleInfo.title}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ID Card */}
                <View ref={cardRef} collapsable={false} style={[styles.cardContainer, { height: CARD_HEIGHT }]}>
                    <LinearGradient
                        colors={isGold ? ['#3a2817', '#4a3520', '#5a4228'] : ['#0a3434', '#0f4545', '#145555']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardGradient}
                    >
                        {/* Circuit Pattern Background (Opacity handled in component) */}
                        <CircuitPattern color={accentColor} isGold={isGold} />

                        {/* Top Left: Logo */}
                        <View style={styles.cardHeader}>
                            <Zap size={20} color="#00d9a3" fill="#00d9a3" />
                            <Text style={styles.miniLogoText}>
                                <Text style={[{ color: '#00d9a3', letterSpacing: 0.5 }]}>EV</Text>erified
                            </Text>
                        </View>

                        {/* User Details */}
                        <View style={styles.userDetails}>
                            <Text style={styles.cardName} numberOfLines={1}>{userData?.fullName}</Text>
                            <Text style={styles.cardRole}>{roleInfo.title}</Text>
                            <Text style={styles.cardSub}>| {experienceText}</Text>
                        </View>

                        {/* Verification Badge */}
                        <View style={[styles.badgeContainer, { marginBottom: isPending ? scale(30) : scale(20) }]} >
                            {showGreenTick ? (
                                // GREEN TICK (Fully Verified)
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
                                    <View style={styles.verifiedCircle}>
                                        <CheckCircle size={scale(28)} color="#fff" fill="#00d9a3" />
                                    </View>
                                    <View>
                                        <Text style={{ color: '#00d9a3', fontSize: scale(10), fontWeight: 'bold', letterSpacing: scale(1) }}>{t('verified').toUpperCase()}</Text>
                                        <View style={{ flexDirection: 'row', gap: scale(2) }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} size={scale(10)} color="#FFD700" fill="#FFD700" />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ) : showYellowTick ? (
                                // YELLOW TICK (Passed Test, Pending Admin)
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
                                    <View style={[styles.verifiedCircle, { borderColor: '#FFC107', backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
                                        <CheckCircle size={scale(28)} color="#fff" fill="#FFEE58" />
                                    </View>
                                    <View>
                                        <Text style={{ color: '#FFC107', fontSize: scale(10), fontWeight: 'bold', letterSpacing: scale(1) }}>{t('testPassed').toUpperCase()}</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: scale(8) }}>Pending Admin Approval</Text>
                                    </View>
                                </View>
                            ) : (
                                // PENDING (Not Passed Yet)
                                <View style={[styles.pendingCircle, { marginTop: -scale(8) }]}>
                                    <View>
                                        <Text style={styles.pendingText}>{t('pending').toUpperCase()}</Text>
                                        <Text style={styles.pendingText}>{t('verificationPending').split(' ')[0].toUpperCase()}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* QR Code Circle - Absolute Right */}
                        <View style={[styles.qrCircle, { borderColor: accentColor }]}>
                            {/* <Text style={styles.qrLabel}>SCAN TO VERIFY{'\n'}LIVE SKILLS</Text> */}
                            <View style={styles.qrBg}>
                                <QRCodeGrid size={scale(45)} color={isGold ? '#3a2817' : '#0a3434'} />
                            </View>
                        </View>

                        {/* Bottom: Experience Partners */}
                        {experiencePartners.length > 0 && (
                            <View style={styles.bottomBar}>
                                {/* Label */}
                                <Text style={styles.partnersLabel}>{t('experiencePartners').toUpperCase()}</Text>

                                {/* Partners Box */}
                                <LinearGradient
                                    colors={isGold ? ['rgba(160, 110, 40, 0.55)', 'rgba(180, 130, 50, 0.45)'] : ['rgba(0, 160, 140, 0.5)', 'rgba(0, 180, 160, 0.4)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.partnersBox, {
                                        borderColor: isGold ? 'rgba(212, 165, 116, 0.8)' : 'rgba(0, 204, 170, 0.7)'
                                    }]}
                                >
                                    {experiencePartners.map((p, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'baseline', gap: scale(4) }}>
                                            <Text style={{ color: p.color, fontSize: scale(11), fontWeight: 'bold' }}>{p.name}</Text>
                                            {p.sub && <Text style={{ color: p.color, fontSize: scale(9), opacity: 0.85 }}>{p.sub}</Text>}
                                        </View>
                                    ))}
                                </LinearGradient>
                            </View>
                        )}

                    </LinearGradient>
                </View>

                {/* Verification Status / Actions */}
                <View style={[
                    styles.statusCard,
                    {
                        backgroundColor: isVerified ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                        borderColor: isVerified ? '#d1fae5' : isPending ? '#fef3c7' : '#fecaca'
                    }
                ]}>
                    <View style={[styles.statusIcon, {
                        backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                    }]}>
                        {isVerified ? <CheckCircle size={scale(22)} color="#10b981" /> : <Clock size={scale(22)} color="#f59e0b" />}
                    </View>
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: isVerified ? '#10b981' : '#f59e0b' }]}>
                            {isVerified ? t('verificationCompleteTitle') : t('actionRequired')}
                        </Text>
                        <Text style={styles.statusSub}>
                            {getVerificationProgress(userData, t)}
                        </Text>
                    </View>
                    {!isVerified && userData?.verificationStatus !== 'failed' && (
                        <TouchableOpacity onPress={handleStartVerification} style={styles.verifyBtn}>
                            <Text style={styles.verifyBtnText}>
                                {userData?.verificationStatus === 'step1_completed' ? t('continue') : t('startVerification').split(' ')[0]}
                            </Text>
                            <ChevronRight size={scale(16)} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Buttons (Edit/Download/Share) */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#f59e0b', flex: 0.8 }]}
                        onPress={() => navigation.navigate('VerificationForm', { isEditMode: true } as any)}
                    >
                        <Edit size={scale(18)} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('edit') || 'Edit'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                        <Download size={scale(18)} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('download')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={() => setShowShareModal(true)}>
                        <Share2 size={scale(18)} color={colors.foreground} />
                        <Text style={[styles.actionBtnText, { color: colors.foreground }]}>{t('share')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Physical Card Order - Now visible to all professionals */}
                <TouchableOpacity
                    style={[styles.orderBtn, cardOrdered && { opacity: 0.7 }]}
                    onPress={() => !cardOrdered && setShowOrderModal(true)}
                    disabled={cardOrdered}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
                        <View style={{ width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: cardOrdered ? 'rgba(76, 175, 80, 0.2)' : 'rgba(26, 157, 110, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                            {cardOrdered ? <CheckCircle size={scale(20)} color="#4CAF50" /> : <Package size={scale(20)} color="#1a9d6e" />}
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: scale(16) }}>
                                {cardOrdered ? t('cardOrdered') : t('orderCard')}
                            </Text>
                            <Text style={{ fontSize: scale(12), color: colors.muted }}>
                                {cardOrdered ? t('cardDeliveredMsg') : t('getPremiumCard')}
                            </Text>
                        </View>
                    </View>
                    {!cardOrdered && <ChevronRight size={scale(20)} color={colors.muted} />}
                </TouchableOpacity>

                {/* WhatsApp Support Button */}
                <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={() => {
                        const whatsappNumber = '919473928468';
                        const message = 'Hi, I need help with EVerified app.';
                        const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
                        Linking.openURL(url).catch(() => {
                            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to contact support.');
                        });
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12) }}>
                        <View style={{ width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: 'rgba(37, 211, 102, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
                            <MessageCircle size={scale(20)} color="#25D366" />
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: scale(16) }}>{t('whatsappSupport')}</Text>
                            <Text style={{ fontSize: scale(12), color: colors.muted }}>{t('getHelp')}</Text>
                        </View>
                    </View>
                    <ChevronRight size={scale(20)} color={colors.muted} />
                </TouchableOpacity>

            </ScrollView>

            {/* Share Modal */}
            <Modal visible={showShareModal} animationType="fade" transparent>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowShareModal(false)}
                >
                    <View style={styles.shareMenu}>
                        <Text style={styles.shareTitle}>Share via</Text>
                        <View style={styles.shareGrid}>
                            <TouchableOpacity style={styles.shareItem} onPress={() => handleShare('whatsapp')}>
                                <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>
                                    <MessageCircle size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareLabel}>WhatsApp</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareItem} onPress={() => handleShare('instagram')}>
                                <View style={[styles.shareIcon, { backgroundColor: '#E4405F' }]}>
                                    <Instagram size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareLabel}>Instagram</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareItem} onPress={() => handleShare('facebook')}>
                                <View style={[styles.shareIcon, { backgroundColor: '#1877F2' }]}>
                                    <Facebook size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareLabel}>Facebook</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareItem} onPress={() => handleShare()}>
                                <View style={[styles.shareIcon, { backgroundColor: '#6b7280' }]}>
                                    <Share2 size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareLabel}>More</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Order Modal */}
            <Modal visible={showOrderModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Physical ID Card (Rs 199)</Text>
                            <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                                <X size={24} color={colors.muted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <Text style={styles.formLabel}>Full Name *</Text>
                            <View style={styles.inputBox}><User size={18} color="#9ca3af" /><TextInput style={styles.input} value={orderForm.fullName} onChangeText={t => setOrderForm({ ...orderForm, fullName: t })} /></View>

                            <Text style={styles.formLabel}>Address *</Text>
                            <View style={styles.inputBox}><Home size={18} color="#9ca3af" /><TextInput style={styles.input} value={orderForm.address} onChangeText={t => setOrderForm({ ...orderForm, address: t })} /></View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.formLabel}>City *</Text>
                                    <View style={styles.inputBox}><MapPin size={18} color="#9ca3af" /><TextInput style={styles.input} value={orderForm.city} onChangeText={t => setOrderForm({ ...orderForm, city: t })} /></View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.formLabel}>Pincode *</Text>
                                    <View style={styles.inputBox}><TextInput style={styles.input} value={orderForm.pincode} onChangeText={t => setOrderForm({ ...orderForm, pincode: t })} keyboardType='numeric' /></View>
                                </View>
                            </View>

                            <Text style={styles.formLabel}>Mobile *</Text>
                            <View style={styles.inputBox}><Phone size={18} color="#9ca3af" /><TextInput style={styles.input} value={orderForm.mobile} onChangeText={t => setOrderForm({ ...orderForm, mobile: t })} keyboardType='phone-pad' /></View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleOrderCard}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Place Order</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },

    // Header
    header: { padding: scale(20), paddingTop: Platform.OS === 'android' ? scale(35) : scale(10), paddingBottom: scale(20) },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(12) },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
    headerLogoText: { color: '#fff', fontSize: scale(18), fontWeight: '700' },
    logoutBtn: { padding: scale(4) },
    welcomeText: { color: '#fff', fontSize: scale(22), fontWeight: 'bold' },
    roleText: { color: 'rgba(255,255,255,0.9)', fontSize: scale(14), marginTop: scale(2) },

    scrollContent: { padding: scale(20), paddingBottom: scale(100) },

    // Card Styles
    cardContainer: {
        width: '100%',
        borderRadius: scale(20),
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(10) },
        shadowOpacity: 0.3,
        shadowRadius: scale(15),
        marginBottom: scale(20),
    },
    cardGradient: { flex: 1, padding: scale(20), position: 'relative' },

    // Large Circle with QR
    largeCircle: {
        position: 'absolute',
        top: '50%',
        right: '8%',
        width: CARD_HEIGHT * 0.7, // 70% of height (already scaled via CARD_HEIGHT)
        height: CARD_HEIGHT * 0.7,
        borderRadius: (CARD_HEIGHT * 0.7) / 2,
        borderWidth: scale(2),
        opacity: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: -(CARD_HEIGHT * 0.7) / 2 }],
    },

    // Card Header Logo
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: scale(16) },
    miniLogoBg: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        borderWidth: scale(2),
        alignItems: 'center',
        justifyContent: 'center'
    },
    miniLogoText: { color: '#fff', fontSize: scale(16), fontWeight: 'bold', letterSpacing: 0.5 },

    // User Details
    userDetails: { marginBottom: scale(20), maxWidth: '65%' },
    cardName: { color: '#fff', fontSize: scale(24), fontWeight: 'bold', lineHeight: scale(28), marginBottom: scale(4) },
    cardRole: { color: '#fff', fontSize: scale(13), fontWeight: '600' },
    cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: scale(11), marginTop: scale(2) },

    // Badge
    badgeContainer: { marginBottom: scale(20) },
    verifiedCircle: {
        width: scale(45),
        height: scale(45),
        borderRadius: scale(22.5),
        borderWidth: scale(2),
        borderColor: '#00d9a3',
        backgroundColor: 'rgba(0, 217, 163, 0.15)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pendingCircle: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(30),
        borderWidth: scale(2),
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.15)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    pendingText: { color: '#FFC107', fontSize: scale(5), fontWeight: 'bold', textAlign: 'center' },

    // QR Circle
    qrCircle: {
        position: 'absolute',
        top: '50%',
        right: '4%',
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        borderWidth: scale(2),
        opacity: 0.8, // Slightly higher visibility in RN
        transform: [{ translateY: -scale(50) }],
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
    },
    qrLabel: { color: 'rgba(255,255,255,0.8)', fontSize: scale(7), fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
    qrBg: { backgroundColor: '#fff', padding: scale(2), borderRadius: scale(6) },

    // Bottom Bar (Partners)
    bottomBar: {
        position: 'absolute',
        bottom: '2%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        paddingLeft: '5%',
    },
    partnersLabel: { color: 'rgba(255,255,255,0.8)', fontSize: scale(7), fontWeight: '700', letterSpacing: 0.5 },
    partnersBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopLeftRadius: scale(30),
        borderBottomLeftRadius: scale(30),
        paddingVertical: scale(10),
        paddingHorizontal: scale(16),
        borderWidth: scale(2),
        borderRightWidth: 0,
    },

    // Status Card
    statusCard: { flexDirection: 'row', alignItems: 'center', padding: scale(14), borderRadius: scale(12), borderWidth: 1, gap: scale(12), marginBottom: scale(16) },
    statusIcon: { width: scale(40), height: scale(40), borderRadius: scale(20), justifyContent: 'center', alignItems: 'center' },
    statusInfo: { flex: 1 },
    statusTitle: { fontSize: scale(15), fontWeight: 'bold' },
    statusSub: { fontSize: scale(12), color: '#6b7280' },
    verifyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: scale(14), paddingVertical: scale(8), borderRadius: scale(8), gap: scale(4) },
    verifyBtnText: { color: '#fff', fontSize: scale(13), fontWeight: '600' },

    // Actions
    actionRow: { flexDirection: 'row', gap: scale(12), marginBottom: scale(16) },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: scale(8), padding: scale(14), backgroundColor: '#1a9d6e', borderRadius: scale(14) },
    shareBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
    actionBtnText: { color: '#fff', fontWeight: '600', fontSize: scale(14) },

    // Order Btn
    orderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16), backgroundColor: '#fff', borderRadius: scale(16), borderWidth: 1, borderColor: '#e5e7eb', marginBottom: scale(16) },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(24) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(20) },
    modalTitle: { fontSize: scale(18), fontWeight: 'bold' },
    formLabel: { fontSize: scale(13), fontWeight: '600', marginBottom: scale(6), marginTop: scale(12) },
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: scale(12), paddingHorizontal: scale(12), height: scale(48), gap: scale(10) },
    input: { flex: 1, fontSize: scale(14) },
    submitBtn: { backgroundColor: '#1a9d6e', borderRadius: scale(12), height: scale(50), justifyContent: 'center', alignItems: 'center', marginTop: scale(24) },

    // Share Modal
    shareMenu: {
        backgroundColor: '#fff',
        borderTopLeftRadius: scale(32),
        borderTopRightRadius: scale(32),
        padding: scale(32),
        width: '100%',
        alignItems: 'center',
    },
    shareTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: scale(24),
    },
    shareGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: scale(10),
    },
    shareItem: {
        alignItems: 'center',
        gap: scale(8),
    },
    shareIcon: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
    },
    shareLabel: {
        fontSize: scale(12),
        color: colors.muted,
        fontWeight: '500',
    },
});
