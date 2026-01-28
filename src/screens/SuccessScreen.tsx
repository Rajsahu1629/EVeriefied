import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CheckCircle } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

type SuccessNavigationProp = StackNavigationProp<RootStackParamList, 'Success'>;

const SuccessScreen: React.FC = () => {
    const navigation = useNavigation<SuccessNavigationProp>();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <CheckCircle size={80} color={colors.success} />
                </View>

                <Text style={styles.title}>{t('applicationSubmitted')}</Text>
                <Text style={styles.message}>{t('applicationSuccess')}</Text>

                <Button
                    onPress={() => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })}
                    fullWidth
                    style={{ marginTop: spacing.xl }}
                >
                    {t('goToLogin')}
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    iconContainer: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    message: {
        fontSize: fontSize.base,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default SuccessScreen;
