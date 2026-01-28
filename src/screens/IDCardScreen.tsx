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
    Instagram, MessageCircle, Facebook
} from 'lucide-react-native';
import { useUser, VerificationStatus } from '../contexts/UserContext';
import { colors, spacing } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LanguageSelector } from '../components/LanguageSelector';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { query } from '../lib/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_ASPECT_RATIO = 1.586;
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT_RATIO;

// Web-matched Circuit Pattern
const CircuitPattern = ({ color = '#ffd700', isGold, isTeal }: { color?: string, isGold?: boolean, isTeal?: boolean }) => {
    // Colors from web version
    const strokeColor = isGold ? "#d4a574" : isTeal ? "#00d9cc" : "#00ccaa";

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

// QR Code Grid Pattern
const QRCodeGrid = ({ size = 65 }: { size?: number }) => {
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
                        backgroundColor: filledIndices.includes(i) ? '#1f2937' : 'transparent', // bg-gray-800
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

const getRoleLabel = (role?: string) => {
    // Strip "Verified " if it somehow exists in the database role
    const cleanRole = (role || "").replace(/^Verified\s+/i, "");

    switch (cleanRole.toLowerCase()) {
        case "technician": return { title: "Technician" };
        case "sales": return { title: "Showroom Manager" };
        case "workshop": return { title: "Workshop Manager" };
        case "aspirant": return { title: "Fresher" };
        default: return { title: cleanRole || "Professional" };
    }
};

const getVerificationProgress = (role?: string, status?: VerificationStatus, step?: number): string => {
    const isSingleStepRole = role === 'sales' || role === 'workshop' || role === 'aspirant';
    if (status === 'verified') return isSingleStepRole ? 'Test passed ✓' : 'All tests passed ✓';
    if (status === 'failed') return 'Retry after 7 days';
    if (status === 'step1_completed' && !isSingleStepRole) return '1 test passed, 1 remaining';
    return 'Complete your verification';
};

export default function IDCardScreen() {
    const { userData, logout } = useUser();
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
                const result = await query<{ card_ordered: boolean }>(
                    `SELECT card_ordered FROM users WHERE id = $1`,
                    [userData.id]
                );
                if (result.length > 0 && result[0].card_ordered) {
                    setCardOrdered(true);
                }
            } catch (error) {
                console.error('Error checking order status:', error);
            }
        };
        checkCardOrderStatus();
    }, [userData?.id]);

    // Theme Logic - Decoupled from Verification Status
    const isVerified = userData?.verificationStatus === 'verified' || userData?.verificationStatus === 'approved';
    const isPending = !isVerified;

    // Theme depends strictly on Role
    const isGold = userData?.role === 'sales';
    const isTeal = userData?.role === 'workshop';
    // Both technicians and aspirants use the Titanium (green/black) theme
    // const isTitanium = userData?.role === 'technician' || userData?.role === 'aspirant';

    const theme = isGold ? THEMES.gold : isTeal ? THEMES.teal : THEMES.green;
    const roleInfo = getRoleLabel(userData?.role);

    // Experience Partners - Use user's selected brands from registration
    const userBrands = userData?.brands || [];
    const experiencePartners = useMemo(() => {
        const defaultPartners = [
            { name: "OLA", sub: "Electric" },
            { name: "Ather", sub: "Energy" },
            { name: "TVS", sub: "iQube" }
        ];

        if (userBrands.length > 0) {
            // Map user's brands to display format
            return userBrands.slice(0, 3).map((brand, index) => ({
                name: brand,
                sub: index === 0 ? "Electric" : "EV",
                color: index === 0 ? theme.primaryColor : "#ffffff"
            }));
        }

        return defaultPartners.map((p, index) => ({
            ...p,
            color: index === 0 ? theme.primaryColor : "#ffffff"
        }));
    }, [userBrands, theme.primaryColor]);

    // Format Experience Text Compactly
    const getExperienceLabel = (exp?: string) => {
        if (!exp || exp === 'fresher') return 'Fresher';
        if (exp === '0-1') return '0-1 Year Experienced';
        if (exp === '1-2') return '1+ Year Experienced';
        if (exp === '2-5') return '2+ Year Experienced';
        if (exp === '5+') return '5+ Year Experienced';
        return `${exp} Year Experienced`;
    };


    const experienceText = getExperienceLabel(userData?.experience);

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
            // Save order to database
            await query(
                `UPDATE users SET card_ordered = true WHERE id = $1`,
                [userData?.id]
            );
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
                <Text style={styles.welcomeText}>Welcome, {userData?.fullName?.split(' ')[0] || 'User'}!</Text>
                <Text style={styles.roleText}>{roleInfo.title}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ID Card */}
                <View ref={cardRef} collapsable={false} style={[styles.cardContainer, { height: CARD_HEIGHT }]}>
                    <LinearGradient
                        colors={[...theme.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardGradient}
                    >
                        {/* Background Pattern */}
                        <CircuitPattern isGold={isGold} isTeal={isTeal} />

                        {/* Large Circle with QR Code */}
                        <View style={[styles.largeCircle, { borderColor: theme.primaryColor }]}>
                            <View style={styles.qrBg}>
                                <QRCodeGrid size={60} />
                            </View>
                        </View>



                        {/* Top Left: Logo */}
                        <View style={styles.cardHeader}>
                            <View style={styles.miniLogoBg}>
                                <Zap size={10} color={theme.primaryColor} fill={theme.primaryColor} />
                            </View>
                            <Text style={styles.miniLogoText}>
                                <Text style={{ color: theme.primaryColor }}>EV</Text>erified
                            </Text>
                        </View>

                        {/* User Details */}
                        <View style={styles.userDetails}>
                            <Text style={styles.cardName} numberOfLines={1}>{userData?.fullName}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.cardRole}>{roleInfo.title}</Text>
                            </View>
                            <Text style={styles.cardSub}>
                                {experienceText}
                            </Text>
                        </View>

                        {/* Badge - Absolute Positioned at Top Right */}
                        <View style={[styles.badgeContainer, { borderColor: isVerified ? theme.badgeBorder : '#FFC107' }]}>
                            <LinearGradient
                                colors={isVerified ? [...theme.badgeGradient] : ['rgba(255, 193, 7, 0.25)', 'rgba(255, 193, 7, 0.15)']}
                                style={styles.badgeValues}
                            >
                                {isVerified ? (
                                    <View style={styles.verifiedSeal}>
                                        <CheckCircle size={28} color={theme.primaryColor} fill={theme.primaryColor} />
                                        <View style={styles.sealCheckBg}>
                                            <CheckCircle size={18} color="#fff" />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.pendingSeal}>
                                        <Clock size={24} color="#FFC107" />
                                    </View>
                                )}
                            </LinearGradient>
                        </View>

                        {/* Spacer to push partners down */}
                        <View style={{ flex: 1 }} />

                        {/* Experience Partners */}
                        {userData?.role !== 'aspirant' && (
                            <View style={styles.partnersWrapper}>
                                <View style={styles.partnersSection}>
                                    <Text style={styles.partnersLabel}>EXPERIENCE{'\n'}PARTNERS</Text>

                                    <View style={styles.partnersDill}>
                                        {experiencePartners.map((p, i) => (
                                            <View key={i} style={{ alignItems: 'center' }}>
                                                <Text style={{ color: p.color, fontSize: 10, fontWeight: 'bold' }}>{p.name}</Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 7 }}>{p.sub}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
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
                        {isVerified ? <CheckCircle size={22} color="#10b981" /> : <Clock size={22} color="#f59e0b" />}
                    </View>
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: isVerified ? '#10b981' : '#f59e0b' }]}>
                            {isVerified ? 'Verification Complete' : 'Action Required'}
                        </Text>
                        <Text style={styles.statusSub}>
                            {getVerificationProgress(userData?.role, userData?.verificationStatus, userData?.verificationStep)}
                        </Text>
                    </View>
                    {!isVerified && (
                        <TouchableOpacity onPress={handleStartVerification} style={styles.verifyBtn}>
                            <Text style={styles.verifyBtnText}>
                                {userData?.verificationStatus === 'step1_completed' ? 'Continue' : 'Start'}
                            </Text>
                            <ChevronRight size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Buttons (Download/Share) */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                        <Download size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={() => setShowShareModal(true)}>
                        <Share2 size={18} color={colors.foreground} />
                        <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Physical Card Order - Now visible to all professionals */}
                <TouchableOpacity
                    style={[styles.orderBtn, cardOrdered && { opacity: 0.7 }]}
                    onPress={() => !cardOrdered && setShowOrderModal(true)}
                    disabled={cardOrdered}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: cardOrdered ? 'rgba(76, 175, 80, 0.2)' : 'rgba(26, 157, 110, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                            {cardOrdered ? <CheckCircle size={20} color="#4CAF50" /> : <Package size={20} color="#1a9d6e" />}
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                {cardOrdered ? 'Card Already Ordered ✓' : 'Order Physical Card (Rs 199)'}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.muted }}>
                                {cardOrdered ? 'Your card will be delivered in 7-10 days' : 'Get your premium ID card at your door step'}
                            </Text>
                        </View>
                    </View>
                    {!cardOrdered && <ChevronRight size={20} color={colors.muted} />}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(37, 211, 102, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
                            <MessageCircle size={20} color="#25D366" />
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>WhatsApp Support</Text>
                            <Text style={{ fontSize: 12, color: colors.muted }}>Get help instantly</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color={colors.muted} />
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
    header: { padding: 20, paddingTop: 10, paddingBottom: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerLogoText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    logoutBtn: { padding: 4 },
    welcomeText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    roleText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2 },

    scrollContent: { padding: 20 },

    // Card Styles
    cardContainer: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        marginBottom: 20,
    },
    cardGradient: { flex: 1, padding: 20, position: 'relative' },

    // Large Circle with QR
    largeCircle: {
        position: 'absolute',
        top: '50%',
        right: '8%',
        width: CARD_HEIGHT * 0.7, // 70% of height
        height: CARD_HEIGHT * 0.7,
        borderRadius: (CARD_HEIGHT * 0.7) / 2,
        borderWidth: 2,
        opacity: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: -(CARD_HEIGHT * 0.7) / 2 }],
    },
    qrBg: {
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 8,
    },



    // Card Header Logo
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    miniLogoBg: {
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: 'rgba(0, 217, 163, 0.2)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    miniLogoText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

    // User Details
    userDetails: { marginBottom: 20 },
    cardName: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    cardRole: { color: '#fff', fontSize: 11, fontWeight: '700' },
    cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4 },

    // Bottom Section
    bottomSection: { marginTop: 'auto', gap: 12 },

    badgeContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        overflow: 'hidden',
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    badgeValues: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    verifiedSeal: { alignItems: 'center', justifyContent: 'center' },
    sealCheckBg: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -9 }, { translateY: -9 }],
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
    pendingSeal: { alignItems: 'center', justifyContent: 'center' },

    // Partners
    partnersWrapper: {
        marginTop: 10,
    },
    partnersSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: 8,
    },
    partnersLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 7, fontWeight: '700', lineHeight: 9 },
    partnersDill: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 10,
    },

    // Status Card
    statusCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 16 },
    statusIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    statusInfo: { flex: 1 },
    statusTitle: { fontSize: 15, fontWeight: 'bold' },
    statusSub: { fontSize: 12, color: '#6b7280' },
    verifyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
    verifyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // Actions
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#1a9d6e', borderRadius: 14 },
    shareBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
    actionBtnText: { color: '#fff', fontWeight: '600' },

    // Order Btn
    orderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 48, gap: 10 },
    input: { flex: 1, fontSize: 14 },
    submitBtn: { backgroundColor: '#1a9d6e', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 24 },

    // Share Modal
    shareMenu: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    shareTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 24,
    },
    shareGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    shareItem: {
        alignItems: 'center',
        gap: 8,
    },
    shareIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    shareLabel: {
        fontSize: 12,
        color: colors.muted,
        fontWeight: '500',
    },
});
