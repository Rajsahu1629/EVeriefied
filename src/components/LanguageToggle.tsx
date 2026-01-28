import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, borderRadius, spacing, fontSize } from '../lib/theme';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export const LanguageToggle: React.FC = () => {
    const { language } = useLanguage();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const getLanguageDisplay = () => {
        switch (language) {
            case 'hi': return 'हि';
            case 'mr': return 'म';
            case 'kn': return 'ಕ';
            case 'te': return 'తె';
            case 'or': return 'ଓ';
            default: return 'EN';
        }
    };

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('LanguageSelection')}
            style={styles.container}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>
                {getLanguageDisplay()}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        right: spacing.md,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    text: {
        color: colors.primaryForeground,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
});

export default LanguageToggle;
