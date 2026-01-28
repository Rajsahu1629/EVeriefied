import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../lib/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated';
}

interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

interface CardTitleProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

interface CardDescriptionProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

interface CardFooterProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
    return (
        <View style={[
            styles.card,
            variant === 'elevated' && styles.cardElevated,
            style
        ]}>
            {children}
        </View>
    );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
    return <View style={[styles.cardHeader, style]}>{children}</View>;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
    return <Text style={[styles.cardTitle, style]}>{children}</Text>;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style }) => {
    return <Text style={[styles.cardDescription, style]}>{children}</Text>;
};

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
    return <View style={[styles.cardContent, style]}>{children}</View>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
    return <View style={[styles.cardFooter, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardElevated: {
        ...shadows.md,
    },
    cardHeader: {
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.foreground,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    cardContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    cardFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        paddingTop: 0,
    },
});
