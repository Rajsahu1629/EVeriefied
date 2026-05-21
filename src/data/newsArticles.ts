/** Static EV news with real translations per language (not English fallback). */

export interface NewsArticle {
    id: string;
    title_en: string;
    title_hi: string;
    title_mr: string;
    title_kn: string;
    title_te: string;
    title_or: string;
    source: string;
    hoursAgo?: number;
    daysAgo?: number;
    image: string;
    url: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
    {
        id: '1',
        title_en: 'India to have 10,000 EV charging stations by 2026',
        title_hi: 'भारत में 2026 तक 10,000 EV चार्जिंग स्टेशन होंगे',
        title_mr: '२०२६ पर्यंत भारतात १०,००० EV चार्जिंग स्टेशन',
        title_kn: '೨೦೨೬ ರವರೆಗೆ ಭಾರತದಲ್ಲಿ ೧೦,೦೦೦ EV ಚಾರ್ಜಿಂಗ್ ಸ್ಟೇಷನ್‌ಗಳು',
        title_te: '2026 నాటికి భారతదేశంలో 10,000 EV చార్జింగ్ స్టేషన్లు',
        title_or: '୨୦୨୬ ପର୍ଯ୍ୟନ୍ତ ଭାରତରେ ୧୦,୦୦୦ EV ଚାର୍ଜିଂ ଷ୍ଟେସନ୍',
        source: 'EV India News',
        hoursAgo: 2,
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
        url: 'https://www.google.com/search?q=ev+charging+stations+india',
    },
    {
        id: '2',
        title_en: 'Tata Motors announces new EV battery technology',
        title_hi: 'टाटा मोटर्स ने नई EV बैटरी तकनीक की घोषणा की',
        title_mr: 'टाटा मोटर्सने नवीन EV बॅटरी तंत्रज्ञानाची घोषणा केली',
        title_kn: 'ಟಾಟಾ ಮೋಟಾರ್ಸ್ ಹೊಸ EV ಬ್ಯಾಟರಿ ತಂತ್ರಜ್ಞಾನವನ್ನು ಘೋಷಿಸಿದೆ',
        title_te: 'టాటా మోటార్స్ కొత్త EV బ్యాటరీ టెక్నాలజీని ప్రకటించింది',
        title_or: 'ଟାଟା ମୋଟର୍ସ୍ ନୂଆ EV ବ୍ୟାଟେରୀ ପ୍ରଯୁକ୍ତି ଘୋଷଣା କଲା',
        source: 'Auto Weekly',
        hoursAgo: 5,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
        url: 'https://www.google.com/search?q=tata+motors+ev+battery',
    },
    {
        id: '3',
        title_en: 'Skills shortage in EV sector: 50,000 technicians needed',
        title_hi: 'EV क्षेत्र में कौशल की कमी: 50,000 तकनीशियनों की आवश्यकता',
        title_mr: 'EV क्षेत्रात कौशल्याची कमत: ५०,००० तंत्रज्ञांची गरज',
        title_kn: 'EV ವಲಯದಲ್ಲಿ ಕೌಶಲ್ಯ ಕೊರತೆ: ೫೦,೦೦೦ ತಂತ್ರಜ್ಞರು ಅಗತ್ಯ',
        title_te: 'EV రంగంలో నైపుణ్య లోపం: 50,000 టెక్నీషియన్లు అవసరం',
        title_or: 'EV କ୍ଷେତ୍ରରେ ଦକ୍ଷତା ଘାଟ: ୫୦,୦୦୦ ଟେକ୍ନିସିଆନ୍ ଆବଶ୍ୟକ',
        source: 'Skill India',
        daysAgo: 1,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        url: 'https://www.google.com/search?q=ev+technician+jobs+india',
    },
    {
        id: '4',
        title_en: 'Ola Electric expands footprint, opens 100 new showrooms',
        title_hi: 'ओला इलेक्ट्रिक ने 100 नए शोरूम खोले',
        title_mr: 'ओला इलेक्ट्रिकने १०० नवीन शोरूम उघडले',
        title_kn: 'ಓಲಾ ಇಲೆಕ್ಟ್ರಿಕ್ ೧೦೦ ಹೊಸ ಶೋರೂಮ್‌ಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿದೆ',
        title_te: 'ఓలా ఎలక్ట్రిక్ 100 కొత్త షోరూమ్లు ప్రారంభించింది',
        title_or: 'ଓଲା ଇଲେକ୍ଟ୍ରିକ୍ ୧୦୦ ନୂଆ ଶୋରୁମ୍ ଖୋଲିଲା',
        source: 'Business Today',
        daysAgo: 2,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        url: 'https://www.google.com/search?q=ola+electric+showrooms',
    },
    {
        id: '5',
        title_en: 'Government extends FAME II subsidy for electric vehicles',
        title_hi: 'सरकार ने FAME II सब्सिडी बढ़ाई',
        title_mr: 'सरकारने FAME II सबसिडी वाढवली',
        title_kn: 'ಸರ್ಕಾರ FAME II ಸಬ್ಸಿಡಿಯನ್ನು ವಿಸ್ತರಿಸಿದೆ',
        title_te: 'ప్రభుత్వం FAME II సబ్సిడీని పొడిగించింది',
        title_or: 'ସରକାର FAME II ସବସିଡି ବଢ଼ାଇଛନ୍ତି',
        source: 'Economic Times',
        daysAgo: 3,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
        url: 'https://www.google.com/search?q=fame+subsidy+ev+india',
    },
];

export function formatNewsTime(
    article: NewsArticle,
    t: (key: string, opts?: Record<string, unknown>) => string
): string {
    if (article.hoursAgo != null) {
        return article.hoursAgo === 1
            ? t('hoursAgoOne', { count: 1 })
            : t('hoursAgo', { count: article.hoursAgo });
    }
    if (article.daysAgo != null) {
        return article.daysAgo === 1
            ? t('daysAgoOne', { count: 1 })
            : t('daysAgoNews', { count: article.daysAgo });
    }
    return t('recently');
}
