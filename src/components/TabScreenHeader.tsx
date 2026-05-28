import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontSize, layout, spacing } from '../lib/theme';

interface TabScreenHeaderProps {
    title: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    right?: React.ReactNode;
    backgroundColor?: string;
    style?: ViewStyle;
}

/** Slim fixed header for bottom-tab screens — does not scroll with list content */
export const TabScreenHeader: React.FC<TabScreenHeaderProps> = ({
    title,
    icon,
    badge,
    right,
    backgroundColor = colors.primary,
    style,
}) => (
    <View style={[styles.header, { backgroundColor }, style]}>
        <View style={styles.left}>
            {icon}
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
            {badge}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
    </View>
);

const styles = StyleSheet.create({
    header: {
        minHeight: layout.headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPaddingX,
        paddingVertical: spacing.sm,
    },
    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    title: {
        flexShrink: 1,
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.primaryForeground,
    },
});
