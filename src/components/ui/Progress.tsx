import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../lib/theme';

interface ProgressProps {
    value: number; // 0-100
    height?: number;
    backgroundColor?: string;
    progressColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    height = 8,
    backgroundColor = colors.secondary,
    progressColor = colors.primary,
}) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    return (
        <View style={[styles.container, { height, backgroundColor }]}>
            <View
                style={[
                    styles.progress,
                    {
                        width: `${clampedValue}%`,
                        backgroundColor: progressColor,
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
});
