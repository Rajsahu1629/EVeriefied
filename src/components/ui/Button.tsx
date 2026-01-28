import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../../lib/theme';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    children,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.lg,
            gap: spacing.sm,
        };

        // Size styles
        const sizeStyles: Record<ButtonSize, ViewStyle> = {
            sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
            md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
            lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
        };

        // Variant styles
        const variantStyles: Record<ButtonVariant, ViewStyle> = {
            default: { backgroundColor: colors.primary },
            outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
            ghost: { backgroundColor: 'transparent' },
            destructive: { backgroundColor: colors.error },
            secondary: { backgroundColor: colors.secondary },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            ...(fullWidth && { width: '100%' }),
            ...(disabled && { opacity: 0.5 }),
        };
    };

    const getTextStyle = (): TextStyle => {
        const sizeStyles: Record<ButtonSize, TextStyle> = {
            sm: { fontSize: fontSize.sm },
            md: { fontSize: fontSize.base },
            lg: { fontSize: fontSize.lg },
        };

        const variantStyles: Record<ButtonVariant, TextStyle> = {
            default: { color: colors.primaryForeground },
            outline: { color: colors.foreground },
            ghost: { color: colors.foreground },
            destructive: { color: colors.primaryForeground },
            secondary: { color: colors.foreground },
        };

        return {
            fontWeight: '600',
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[getButtonStyle(), style]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'default' || variant === 'destructive' ? colors.primaryForeground : colors.primary}
                />
            ) : (
                <>
                    {leftIcon}
                    <Text style={[getTextStyle(), textStyle]}>{children}</Text>
                    {rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
};
