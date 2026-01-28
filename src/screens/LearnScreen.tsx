import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, Linking, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../lib/theme';
import {
    BookOpen, Play, ExternalLink, Zap, Battery, Wrench, Award,
    Trophy, Star, CheckCircle, XCircle, Timer
} from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { query } from '../lib/database';

// Learning Videos - hardcoded, lightweight
const LEARNING_ITEMS = [
    { id: '1', title_en: 'EV Basics - How EVs Work', title_hi: 'EV की मूल बातें', icon: Zap, color: '#3b82f6', youtubeId: 'dQw4w9WgXcQ' },
    { id: '2', title_en: 'Battery Technology & BMS', title_hi: 'बैटरी तकनीक और BMS', icon: Battery, color: '#10b981', youtubeId: 'dQw4w9WgXcQ' },
    { id: '3', title_en: 'BLDC Motor Repair', title_hi: 'BLDC मोटर रिपेयर', icon: Wrench, color: '#f59e0b', youtubeId: 'dQw4w9WgXcQ' },
    { id: '4', title_en: 'EV Safety & Handling', title_hi: 'EV सेफ्टी', icon: Award, color: '#8b5cf6', youtubeId: 'dQw4w9WgXcQ' },
];

// Quiz Questions - hardcoded
const QUIZ_QUESTIONS = [
    { id: 1, question_en: 'What does BMS stand for?', question_hi: 'BMS का मतलब?', options: ['Battery Management System', 'Battery Motor System', 'Brake Motor System', 'Battery Mechanical System'], correct: 0 },
    { id: 2, question_en: 'Which motor is used in e-scooters?', question_hi: 'ई-स्कूटर में कौन सी मोटर?', options: ['DC Motor', 'BLDC Motor', 'AC Motor', 'Stepper Motor'], correct: 1 },
    { id: 3, question_en: 'What is regenerative braking?', question_hi: 'रीजेनरेटिव ब्रेकिंग क्या है?', options: ['Extra brakes', 'Energy recovery', 'Emergency brake', 'Air brake'], correct: 1 },
    { id: 4, question_en: 'Li-ion storage charge level?', question_hi: 'Li-ion स्टोरेज चार्ज?', options: ['100%', '0%', '40-60%', '80%'], correct: 2 },
    { id: 5, question_en: 'BLDC means?', question_hi: 'BLDC का मतलब?', options: ['Brushless DC', 'Battery Level DC', 'Brake Level DC', 'Basic Load DC'], correct: 0 },
];

interface LeaderboardEntry { full_name: string; score: number; }

export default function LearnScreen() {
    const { language } = useLanguage();
    const { userData } = useUser();
    const isHindi = language === 'hi';

    const [tab, setTab] = useState<'videos' | 'quiz'>('videos');
    const [quizState, setQuizState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLB, setLoadingLB] = useState(false);
    const [timeToQuiz, setTimeToQuiz] = useState('');
    const [isQuizTime, setIsQuizTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const h = new Date().getHours();
            setIsQuizTime(h >= 20 && h < 23);
            let hoursTo = 20 - h;
            if (hoursTo < 0) hoursTo += 24;
            setTimeToQuiz(h >= 20 && h < 23 ? 'LIVE 🔥' : `${hoursTo}h to go`);
        };
        checkTime();
        const i = setInterval(checkTime, 60000);
        return () => clearInterval(i);
    }, []);

    useEffect(() => { if (tab === 'quiz') fetchLeaderboard(); }, [tab]);

    const fetchLeaderboard = async () => {
        setLoadingLB(true);
        try {
            const result = await query<LeaderboardEntry>(
                `SELECT u.full_name, qs.score FROM quiz_scores qs 
                 JOIN users u ON qs.user_id = u.id 
                 WHERE qs.played_at = CURRENT_DATE
                 ORDER BY qs.score DESC LIMIT 5`
            );
            setLeaderboard(result);
        } catch (e) { console.log(e); }
        setLoadingLB(false);
    };

    const startQuiz = () => { setQuizState('playing'); setCurrentQuestion(0); setScore(0); setSelectedAnswer(null); setShowResult(false); };

    const handleAnswer = (idx: number) => {
        if (showResult) return;
        setSelectedAnswer(idx);
        setShowResult(true);
        if (idx === QUIZ_QUESTIONS[currentQuestion].correct) setScore(s => s + 10);
        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) { setCurrentQuestion(q => q + 1); setSelectedAnswer(null); setShowResult(false); }
            else finishQuiz(idx === QUIZ_QUESTIONS[currentQuestion].correct);
        }, 1200);
    };

    const finishQuiz = async (lastCorrect: boolean) => {
        setQuizState('finished');
        const finalScore = score + (lastCorrect ? 10 : 0);
        if (userData?.id) {
            try {
                await query(`INSERT INTO quiz_scores (user_id, score, played_at) VALUES ($1, $2, CURRENT_DATE)
                     ON CONFLICT (user_id, played_at) DO UPDATE SET score = GREATEST(quiz_scores.score, $2)`,
                    [userData.id, finalScore]);
                fetchLeaderboard();
            } catch (e) { console.log(e); }
        }
    };

    const openYouTube = (id: string) => Linking.openURL(`https://www.youtube.com/watch?v=${id}`);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}><BookOpen size={22} color="#fff" /><Text style={styles.headerTitle}>{isHindi ? 'सीखें' : 'Learn'}</Text></View>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, tab === 'videos' && styles.tabActive]} onPress={() => setTab('videos')}>
                    <Play size={16} color={tab === 'videos' ? '#fff' : colors.muted} />
                    <Text style={[styles.tabText, tab === 'videos' && styles.tabTextActive]}>{isHindi ? 'वीडियो' : 'Videos'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'quiz' && styles.tabActive]} onPress={() => setTab('quiz')}>
                    <Trophy size={16} color={tab === 'quiz' ? '#fff' : colors.muted} />
                    <Text style={[styles.tabText, tab === 'quiz' && styles.tabTextActive]}>{isHindi ? 'क्विज़' : 'Quiz'}</Text>
                    {isQuizTime && <View style={styles.liveDot} />}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {tab === 'videos' ? (
                    <>
                        <Text style={styles.sectionTitle}>🎓 {isHindi ? 'वीडियो कोर्स' : 'Video Courses'}</Text>
                        {LEARNING_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <TouchableOpacity key={item.id} style={styles.courseCard} onPress={() => openYouTube(item.youtubeId)}>
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}><Icon size={22} color={item.color} /></View>
                                    <Text style={styles.courseTitle}>{isHindi ? item.title_hi : item.title_en}</Text>
                                    <View style={styles.playBtn}><Play size={14} color="#fff" fill="#fff" /></View>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity style={styles.moreBtn} onPress={() => Linking.openURL('https://www.youtube.com/results?search_query=EV+technician+training')}>
                            <ExternalLink size={16} color={colors.primary} /><Text style={styles.moreBtnText}>{isHindi ? 'और वीडियो' : 'More Videos'}</Text>
                        </TouchableOpacity>
                    </>
                ) : quizState === 'playing' ? (
                    <View style={styles.quizContainer}>
                        <View style={styles.quizHeader}><Text style={styles.qNum}>{currentQuestion + 1}/5</Text><View style={styles.scoreBox}><Star size={14} color="#f59e0b" /><Text style={styles.scoreText}>{score}</Text></View></View>
                        <View style={styles.questionCard}><Text style={styles.questionText}>{isHindi ? QUIZ_QUESTIONS[currentQuestion].question_hi : QUIZ_QUESTIONS[currentQuestion].question_en}</Text></View>
                        {QUIZ_QUESTIONS[currentQuestion].options.map((opt, i) => {
                            let bg = '#fff', border = '#e2e8f0', txtColor = colors.foreground;
                            if (showResult && i === QUIZ_QUESTIONS[currentQuestion].correct) { bg = '#10b981'; border = '#10b981'; txtColor = '#fff'; }
                            else if (showResult && i === selectedAnswer) { bg = '#ef4444'; border = '#ef4444'; txtColor = '#fff'; }
                            return (<TouchableOpacity key={i} style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]} onPress={() => handleAnswer(i)} disabled={showResult}><Text style={[styles.optionText, { color: txtColor }]}>{opt}</Text>{showResult && i === QUIZ_QUESTIONS[currentQuestion].correct && <CheckCircle size={18} color="#fff" />}{showResult && i === selectedAnswer && i !== QUIZ_QUESTIONS[currentQuestion].correct && <XCircle size={18} color="#fff" />}</TouchableOpacity>);
                        })}
                    </View>
                ) : quizState === 'finished' ? (
                    <View style={styles.finishedCard}><Trophy size={50} color="#f59e0b" /><Text style={styles.finishedTitle}>{score >= 40 ? '🎉 Great!' : '💪 Keep Learning!'}</Text><Text style={styles.finalScore}>{score}/50</Text><TouchableOpacity style={styles.backBtn} onPress={() => setQuizState('waiting')}><Text style={styles.backBtnText}>{isHindi ? 'वापस' : 'Back'}</Text></TouchableOpacity></View>
                ) : (
                    <>
                        <View style={[styles.quizBanner, isQuizTime && { backgroundColor: '#10b981' }]}>
                            <Trophy size={32} color="#fff" /><Text style={styles.bannerTitle}>{isHindi ? 'डेली क्विज़' : 'Daily Quiz'}</Text><Text style={styles.bannerSub}>{isHindi ? 'हर रात 8 बजे' : 'Every night 8 PM'}</Text>
                            <View style={styles.timerBox}><Timer size={16} color={isQuizTime ? '#dc2626' : '#f59e0b'} /><Text style={[styles.timerText, isQuizTime && { color: '#dc2626' }]}>{timeToQuiz}</Text></View>
                            {isQuizTime ? (<TouchableOpacity style={styles.playNowBtn} onPress={startQuiz}><Play size={18} color="#fff" fill="#fff" /><Text style={styles.playNowText}>{isHindi ? 'खेलें' : 'Play'}</Text></TouchableOpacity>) : (<Text style={styles.waitText}>{isHindi ? '8 PM पर आएं!' : 'Come at 8 PM!'}</Text>)}
                        </View>
                        <Text style={styles.sectionTitle}>🏆 {isHindi ? 'लीडरबोर्ड' : 'Leaderboard'}</Text>
                        {loadingLB ? <ActivityIndicator color={colors.primary} /> : leaderboard.length === 0 ? (<Text style={styles.emptyText}>{isHindi ? 'आज कोई नहीं खेला' : 'No one played today'}</Text>) : leaderboard.map((e, i) => (<View key={i} style={[styles.lbRow, i === 0 && { backgroundColor: '#fef3c7' }]}><Text style={styles.lbRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</Text><Text style={styles.lbName} numberOfLines={1}>{e.full_name}</Text><Text style={styles.lbScore}>{e.score} pts</Text></View>))}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#1a9d6e', padding: spacing.md, paddingTop: spacing.lg },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
    tabTextActive: { color: '#fff' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
    content: { flex: 1, padding: spacing.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm, marginTop: spacing.sm },
    courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: '#e2e8f0' },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    courseTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.foreground, marginLeft: spacing.sm },
    playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
    moreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: spacing.md },
    moreBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
    quizBanner: { backgroundColor: '#7c3aed', borderRadius: 16, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
    bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: spacing.sm },
    timerText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    playNowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: spacing.sm },
    playNowText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
    waitText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm },
    emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', padding: spacing.md },
    lbRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: spacing.sm, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
    lbRank: { width: 36, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    lbName: { flex: 1, fontSize: 13, color: colors.foreground },
    lbScore: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
    quizContainer: { flex: 1 },
    quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    qNum: { fontSize: 13, fontWeight: '600', color: colors.muted },
    scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    scoreText: { fontSize: 13, fontWeight: 'bold', color: '#d97706' },
    questionCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: '#e2e8f0' },
    questionText: { fontSize: 16, fontWeight: '600', color: colors.foreground, textAlign: 'center', lineHeight: 24 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: 10, marginBottom: 8, borderWidth: 2 },
    optionText: { fontSize: 14, flex: 1 },
    finishedCard: { backgroundColor: '#fff', borderRadius: 16, padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl, borderWidth: 1, borderColor: '#e2e8f0' },
    finishedTitle: { fontSize: 22, fontWeight: 'bold', color: colors.foreground, marginTop: spacing.sm },
    finalScore: { fontSize: 40, fontWeight: 'bold', color: '#7c3aed', marginVertical: spacing.sm },
    backBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: spacing.sm },
    backBtnText: { color: '#fff', fontWeight: '600' },
});
