import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, borderRadius, spacing } from '../../lib/theme';

interface CheckboxProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onCheckedChange,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            onPress={() => !disabled && onCheckedChange(!checked)}
            disabled={disabled}
            style={[
                styles.checkbox,
                checked && styles.checkboxChecked,
                disabled && styles.checkboxDisabled,
            ]}
            activeOpacity={0.7}
        >
            {checked && <Check size={14} color={colors.primaryForeground} strokeWidth={3} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxDisabled: {
        opacity: 0.5,
    },
});
