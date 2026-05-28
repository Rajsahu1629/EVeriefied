import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, layout } from '../lib/theme';
import { TabScreenHeader } from '../components/TabScreenHeader';
import { Calendar, ChevronRight, Newspaper, ExternalLink } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { pickLocalizedText } from '../lib/localizedContent';
import { NEWS_ARTICLES, formatNewsTime, type NewsArticle } from '../data/newsArticles';

export default function NewsScreen() {
    const { language, t } = useLanguage();

    const openNews = (url: string) => {
        Linking.openURL(url);
    };

    const renderItem = ({ item }: { item: NewsArticle }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.7}
            onPress={() => openNews(item.url)}
        >
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                    {pickLocalizedText(
                        {
                            en: item.title_en,
                            hi: item.title_hi,
                            mr: item.title_mr,
                            kn: item.title_kn,
                            te: item.title_te,
                            or: item.title_or,
                        },
                        language,
                        item.title_en
                    )}
                </Text>
                <View style={styles.metaRow}>
                    <Text style={styles.sourceText}>{item.source}</Text>
                    <View style={styles.dot} />
                    <View style={styles.dateRow}>
                        <Calendar size={12} color={colors.muted} />
                        <Text style={styles.dateText}>{formatNewsTime(item, t)}</Text>
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

            <TabScreenHeader
                title={t('evNews')}
                icon={<Newspaper size={20} color="#fff" />}
                backgroundColor="#dc2626"
            />

            <FlatList
                data={NEWS_ARTICLES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() =>
                            Linking.openURL('https://www.google.com/search?q=ev+news+india&tbm=nws')
                        }
                    >
                        <ExternalLink size={16} color={colors.primary} />
                        <Text style={styles.moreBtnText}>{t('moreEvNews')}</Text>
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
    listContent: {
        paddingHorizontal: layout.screenPaddingX,
        paddingTop: layout.screenPaddingY,
        paddingBottom: 88,
        gap: layout.cardGap,
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
