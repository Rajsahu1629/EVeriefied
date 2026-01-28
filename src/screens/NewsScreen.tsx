import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../lib/theme';
import { Calendar, ChevronRight, Newspaper, ExternalLink } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

// Hardcoded EV News - lightweight, no database
const NEWS_DATA = [
    {
        id: '1',
        title_en: 'India to have 10,000 EV charging stations by 2026',
        title_hi: 'भारत में 2026 तक 10,000 EV चार्जिंग स्टेशन होंगे',
        source: 'EV India News',
        date: '2 hours ago',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
        url: 'https://www.google.com/search?q=ev+charging+stations+india',
    },
    {
        id: '2',
        title_en: 'Tata Motors announces new EV battery technology',
        title_hi: 'टाटा मोटर्स ने नई EV बैटरी तकनीक की घोषणा की',
        source: 'Auto Weekly',
        date: '5 hours ago',
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
        url: 'https://www.google.com/search?q=tata+motors+ev+battery',
    },
    {
        id: '3',
        title_en: 'Skills shortage in EV sector: 50,000 technicians needed',
        title_hi: 'EV क्षेत्र में कौशल की कमी: 50,000 तकनीशियनों की आवश्यकता',
        source: 'Skill India',
        date: '1 day ago',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        url: 'https://www.google.com/search?q=ev+technician+jobs+india',
    },
    {
        id: '4',
        title_en: 'Ola Electric expands footprint, opens 100 new showrooms',
        title_hi: 'ओला इलेक्ट्रिक ने 100 नए शोरूम खोले',
        source: 'Business Today',
        date: '2 days ago',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        url: 'https://www.google.com/search?q=ola+electric+showrooms',
    },
    {
        id: '5',
        title_en: 'Government extends FAME II subsidy for electric vehicles',
        title_hi: 'सरकार ने FAME II सब्सिडी बढ़ाई',
        source: 'Economic Times',
        date: '3 days ago',
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
        url: 'https://www.google.com/search?q=fame+subsidy+ev+india',
    },
];

export default function NewsScreen() {
    const { language } = useLanguage();
    const isHindi = language === 'hi';

    const openNews = (url: string) => {
        Linking.openURL(url);
    };

    const renderItem = ({ item }: { item: typeof NEWS_DATA[0] }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.7}
            onPress={() => openNews(item.url)}
        >
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                    {isHindi ? item.title_hi : item.title_en}
                </Text>
                <View style={styles.metaRow}>
                    <Text style={styles.sourceText}>{item.source}</Text>
                    <View style={styles.dot} />
                    <View style={styles.dateRow}>
                        <Calendar size={12} color={colors.muted} />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.arrowContainer}>
                <ChevronRight size={20} color={colors.muted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Newspaper size={22} color="#fff" />
                <Text style={styles.headerTitle}>
                    {isHindi ? 'EV समाचार' : 'EV News'}
                </Text>
            </View>

            <FlatList
                data={NEWS_DATA}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => Linking.openURL('https://www.google.com/search?q=ev+news+india&tbm=nws')}
                    >
                        <ExternalLink size={16} color={colors.primary} />
                        <Text style={styles.moreBtnText}>
                            {isHindi ? 'और समाचार देखें' : 'More EV News'}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#dc2626',
        padding: spacing.md,
        paddingTop: spacing.lg,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    newsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: borderRadius.xl,
        padding: spacing.sm,
        gap: spacing.md,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: spacing.sm,
    },
    newsImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.lg,
        backgroundColor: '#f1f1f1',
    },
    newsContent: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sourceText: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '600',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.muted,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 11,
        color: colors.muted,
    },
    arrowContainer: {
        paddingRight: spacing.sm,
    },
    moreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: spacing.lg,
    },
    moreBtnText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
});
