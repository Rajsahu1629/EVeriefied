import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../lib/theme';
import { Button } from './Button';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <Button onPress={onConfirm} loading={loading} fullWidth variant="destructive">
                        {confirmText}
                    </Button>
                    <Button
                        onPress={onCancel}
                        fullWidth
                        variant="outline"
                        disabled={loading}
                        style={{ marginTop: spacing.sm }}
                    >
                        {cancelText}
                    </Button>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        ...shadows.lg,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.sm,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
});
