import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback
} from 'react-native';
import { Globe, Check } from 'lucide-react-native';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

interface LanguageSelectorProps {
    color?: string; // Icon color
    style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    color = colors.primary,
    style
}) => {
    const { language, setLanguage } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);

    const activeLanguage = languages.find(l => l.code === language);

    const handleSelect = async (code: any) => {
        await setLanguage(code);
        setModalVisible(false);
    };

    return (
        <View style={style}>
            <TouchableOpacity
                style={styles.triggerButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Globe size={24} color={color} />
                <Text style={[styles.triggerText, { color: color }]}>
                    {activeLanguage?.code.toUpperCase()}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select Language</Text>
                                    <Text style={styles.modalSubtitle}>भाषा चुनें / ಭಾಷೆಯನ್ನು ಆರಿಸಿ</Text>
                                </View>

                                <FlatList
                                    data={languages}
                                    keyExtractor={item => item.code}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.languageOption,
                                                language === item.code && styles.activeOption
                                            ]}
                                            onPress={() => handleSelect(item.code)}
                                        >
                                            <View>
                                                <Text style={[
                                                    styles.languageNative,
                                                    language === item.code && styles.activeText
                                                ]}>
                                                    {item.native}
                                                </Text>
                                                <Text style={[
                                                    styles.languageLabel,
                                                    language === item.code && styles.activeText
                                                ]}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                            {language === item.code && (
                                                <Check size={20} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    triggerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: spacing.xs,
        borderRadius: borderRadius.md,
    },
    triggerText: {
        fontSize: fontSize.sm,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        ...shadows.lg,
        padding: spacing.lg,
    },
    modalHeader: {
        marginBottom: spacing.lg,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.md,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    modalSubtitle: {
        fontSize: fontSize.sm,
        color: colors.muted,
        marginTop: 4,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
    },
    activeOption: {
        backgroundColor: colors.primary + '10', // 10% opacity
    },
    languageNative: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.foreground,
    },
    languageLabel: {
        fontSize: fontSize.sm,
        color: colors.muted,
    },
    activeText: {
        color: colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.5,
    },
});
