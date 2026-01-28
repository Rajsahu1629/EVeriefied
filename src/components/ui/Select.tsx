import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { colors, borderRadius, spacing, fontSize, shadows } from '../../lib/theme';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onValueChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    placeholder = 'Select an option',
    options,
    value,
    onValueChange,
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option: SelectOption) => {
        onValueChange(option.value);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                onPress={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                style={[
                    styles.trigger,
                    error && styles.triggerError,
                    disabled && styles.triggerDisabled,
                ]}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.triggerText,
                    !selectedOption && styles.placeholderText
                ]}>
                    {selectedOption?.label || placeholder}
                </Text>
                <ChevronDown size={20} color={colors.muted} />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                                <TouchableOpacity onPress={() => setIsOpen(false)}>
                                    <X size={24} color={colors.foreground} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            item.value === value && styles.optionSelected,
                                        ]}
                                        onPress={() => handleSelect(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            item.value === value && styles.optionTextSelected,
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {item.value === value && (
                                            <Check size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                style={styles.optionsList}
                            />
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.foreground,
        marginBottom: spacing.xs,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        minHeight: 48,
    },
    triggerError: {
        borderColor: colors.error,
    },
    triggerDisabled: {
        backgroundColor: colors.secondary,
        opacity: 0.7,
    },
    triggerText: {
        fontSize: fontSize.base,
        color: colors.foreground,
        flex: 1,
    },
    placeholderText: {
        color: colors.mutedForeground,
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderTopLeftRadius: borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        maxHeight: '70%',
    },
    modalContent: {
        padding: spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.foreground,
    },
    optionsList: {
        maxHeight: 400,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
    },
    optionSelected: {
        backgroundColor: colors.secondary,
    },
    optionText: {
        fontSize: fontSize.base,
        color: colors.foreground,
        flex: 1,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: '500',
    },
});
