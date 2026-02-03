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
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';
import { getVerificationQuestions, updateUserVerification } from '../lib/api';
import { LanguageSelector } from '../components/LanguageSelector';

type SkillVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'SkillVerification'>;
type SkillVerificationRouteProp = RouteProp<RootStackParamList, 'SkillVerification'>;

interface Question {
    id: string;
    question_text_hi: string;
    question_text_en: string;
    question_text_mr?: string;
    question_text_kn?: string;
    question_text_te?: string;
    question_text_or?: string;
    options: {
        hi: string;
        en: string;
        mr?: string;
        kn?: string;
        te?: string;
        or?: string;
        isCorrect: boolean
    }[];
}

const SkillVerificationScreen: React.FC = () => {
    const navigation = useNavigation<SkillVerificationNavigationProp>();
    const route = useRoute<SkillVerificationRouteProp>();
    const { t, language } = useLanguage();
    const { userData, setUserData } = useUser();

    const currentStep = route.params?.step || 1;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const role = (userData?.role === 'aspirant' ? 'technician' : userData?.role) || 'technician';
            const result = await getVerificationQuestions(role, currentStep);
            setQuestions(result);

            if (result.length === 0) {
                console.warn('No questions found');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            Alert.alert(t('error'), t('failedToLoadQuestions'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questions[currentQuestionIndex].id]: optionIndex,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q) => {
            const selectedIndex = answers[q.id];
            if (selectedIndex !== undefined && q.options[selectedIndex]?.isCorrect) {
                correct++;
            }
        });
        return correct;
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            Alert.alert(t('incompleteQuiz'), t('answerAllQuestions'));
            return;
        }

        setIsSubmitting(true);
        const finalScore = calculateScore();
        setScore(finalScore);

        try {
            const percentage = (finalScore / questions.length) * 100;
            const passed = percentage >= 70;

            let newStatus = userData?.verificationStatus;
            // Sales and Workshop only need step 1, Technician needs both step 1 and step 2
            const isSingleStepRole = userData?.role === 'sales' || userData?.role === 'workshop' || userData?.role === 'aspirant';

            // BS6 Technician Logic
            if (userData?.domain === 'BS6' && userData?.role === 'technician') {
                if (passed) {
                    if (currentStep === 1) newStatus = 'step1_completed';
                    else if (currentStep === 2) newStatus = 'verified'; // Fixed: Step 2 is final for BS6 too
                } else {
                    newStatus = 'failed';
                }
            } else {
                if (currentStep === 1 && passed) {
                    // For single-step roles, step 1 = verified
                    // For technician, step 1 = step1_completed (needs step 2)
                    newStatus = isSingleStepRole ? 'verified' : 'step1_completed';
                } else if (currentStep === 2 && passed) {
                    newStatus = 'verified';
                } else if (!passed) {
                    newStatus = 'failed';
                }
            }

            // Update via API
            await updateUserVerification(userData?.id || '', {
                verificationStatus: newStatus || '',
                quizScore: finalScore,
                totalQuestions: questions.length,
                verificationStep: currentStep,
            });

            if (userData) {
                setUserData({
                    ...userData,
                    verificationStatus: newStatus as any,
                    quizScore: finalScore,
                    totalQuestions: questions.length,
                    verificationStep: currentStep,
                });
            }

            setShowResults(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            Alert.alert(t('error'), t('submitFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (showResults) {
        const percentage = (score / questions.length) * 100;
        const passed = percentage >= 70;

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.resultsContainer}>
                    {passed ? (
                        <CheckCircle size={80} color={colors.success} />
                    ) : (
                        <XCircle size={80} color={colors.error} />
                    )}

                    <Text style={styles.resultsTitle}>
                        {passed ? t('congratulations') : t('quizFailed')}
                    </Text>

                    <Text style={styles.scoreText}>
                        {t('score')}: {score}/{questions.length} ({percentage.toFixed(0)}%)
                    </Text>

                    <Text style={styles.resultsMessage}>
                        {passed
                            ? (currentStep === 1 && userData?.role === 'technician'
                                ? t('step1PassedMessage')
                                : t('verificationPassedMessage'))
                            : t('verificationFailedMessage')
                        }
                    </Text>

                    {passed && userData?.role === 'technician' && (
                        (userData?.domain === 'BS6' && currentStep < 2) ||
                        (!userData?.domain && currentStep < 2)
                    ) ? (
                        <Button
                            onPress={() => navigation.replace('SkillVerification', { step: currentStep + 1 })}
                            fullWidth
                            style={{ marginTop: spacing.xl }}
                        >
                            {t('continueToStep') + ' ' + (currentStep + 1)}
                        </Button>
                    ) : (
                        <Button
                            onPress={() => navigation.reset({
                                index: 0,
                                routes: [{ name: 'UserDashboard' }],
                            })}
                            fullWidth
                            style={{ marginTop: spacing.xl }}
                        >
                            {t('goToDashboard')}
                        </Button>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion?.id];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <LanguageSelector style={{ position: 'absolute', right: spacing.lg, top: spacing.md }} />
                <Text style={styles.headerTitle}>
                    {t('skillVerification')} - {t('step')} {currentStep}
                </Text>

                <View style={styles.progressWrapper}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelText}>{t('question')}</Text>
                        <Text style={styles.progressCountText}>
                            {currentQuestionIndex + 1} / {questions.length}
                        </Text>
                    </View>
                    <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.questionNumber}>
                    {t('question')} {currentQuestionIndex + 1}
                </Text>

                <Text style={styles.questionText}>
                    {language === 'hi' ? currentQuestion?.question_text_hi :
                        language === 'mr' ? (currentQuestion?.question_text_mr || currentQuestion?.question_text_en) :
                            language === 'kn' ? (currentQuestion?.question_text_kn || currentQuestion?.question_text_en) :
                                language === 'te' ? (currentQuestion?.question_text_te || currentQuestion?.question_text_en) :
                                    language === 'or' ? (currentQuestion?.question_text_or || currentQuestion?.question_text_en) :
                                        currentQuestion?.question_text_en}
                </Text>

                <View style={styles.optionsContainer}>
                    {currentQuestion?.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                selectedAnswer === index && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleAnswer(index)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.optionRadio,
                                selectedAnswer === index && styles.optionRadioSelected,
                            ]}>
                                {selectedAnswer === index && <View style={styles.optionRadioInner} />}
                            </View>
                            <Text style={[
                                styles.optionText,
                                selectedAnswer === index && styles.optionTextSelected,
                            ]}>
                                {language === 'hi' ? option.hi :
                                    language === 'mr' ? (option.mr || option.en) :
                                        language === 'kn' ? (option.kn || option.en) :
                                            language === 'te' ? (option.te || option.en) :
                                                language === 'or' ? (option.or || option.en) :
                                                    option.en}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerButtons}>
                    {currentQuestionIndex > 0 && (
                        <Button
                            onPress={handlePrevious}
                            variant="outline"
                            style={{ flex: 1 }}
                        >
                            {t('previous')}
                        </Button>
                    )}

                    {currentQuestionIndex < questions.length - 1 ? (
                        <Button
                            onPress={handleNext}
                            style={{ flex: 1 }}
                            disabled={selectedAnswer === undefined}
                        >
                            {t('next')}
                        </Button>
                    ) : (
                        <Button
                            onPress={handleSubmit}
                            loading={isSubmitting}
                            style={{ flex: 1 }}
                            disabled={selectedAnswer === undefined}
                        >
                            {t('submit')}
                        </Button>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: colors.background,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        position: 'absolute',
        top: spacing.md,
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
    progressWrapper: {
        marginTop: spacing.lg,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    progressLabelText: {
        fontSize: fontSize.sm,
        color: colors.muted,
        fontWeight: '500',
    },
    progressCountText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl, // Ensure bottom content is accessible
    },
    questionNumber: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    questionText: {
        fontSize: fontSize.lg,
        color: colors.foreground,
        lineHeight: 28,
        marginBottom: spacing.lg,
        flexWrap: 'wrap',
    },
    optionsContainer: {
        gap: spacing.sm,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        gap: spacing.md,
        overflow: 'hidden',
    },
    optionButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    optionRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionRadioSelected: {
        borderColor: colors.primary,
    },
    optionRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    optionText: {
        flex: 1,
        fontSize: fontSize.base,
        color: colors.foreground,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: '500',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    resultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    resultsTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.foreground,
        marginTop: spacing.lg,
        textAlign: 'center',
    },
    scoreText: {
        fontSize: fontSize.xl,
        color: colors.primary,
        fontWeight: '600',
        marginTop: spacing.md,
    },
    resultsMessage: {
        fontSize: fontSize.base,
        color: colors.muted,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 24,
    },
});

export default SkillVerificationScreen;
