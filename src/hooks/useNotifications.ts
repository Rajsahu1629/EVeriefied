import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerPushToken, removePushToken } from '../lib/api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Hook to manage push notifications
 * Call after user logs in with their userId and userType
 */
export function useNotifications(
    userId: string | number | null,
    userType: 'user' | 'recruiter' | null
) {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        if (!userId || !userType) return;

        // Register for push notifications
        registerForPushNotifications().then(token => {
            if (token) {
                setPushToken(token);
                console.log(`📱 Registering token for ${userType} #${userId}:`, token);
                // Send token to backend
                registerPushToken(userId, token, userType)
                    .then(() => console.log('✅ Push token registered with backend'))
                    .catch(err => console.error('❌ Failed to register push token with backend:', err));
            } else {
                console.warn('⚠️ No push token received from registerForPushNotifications');
            }
        }).catch(err => console.error('❌ registerForPushNotifications error:', err));

        // Listen for incoming notifications (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(
            notification => {
                setNotification(notification);
                console.log('📨 Notification received:', notification.request.content.title);
            }
        );

        // Listen for notification taps
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            response => {
                const data = response.notification.request.content.data;
                console.log('👆 Notification tapped, data:', data);
                // Navigation will be handled by AppNavigator
            }
        );

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [userId, userType]);

    return { pushToken, notification };
}

/**
 * Remove push token on logout
 */
export async function cleanupPushToken(
    userId: string | number,
    userType: 'user' | 'recruiter'
) {
    try {
        await removePushToken(userId, userType);
    } catch (error) {
        console.warn('Failed to remove push token:', error);
    }
}

/**
 * Register for push notifications and get the Expo Push Token
 */
async function registerForPushNotifications(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    try {
        // Check/request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission not granted');
            return null;
        }

        // Get the Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId || 'd6c24d4b-375f-435d-b26f-19de1aa15fbe',
        });

        const token = tokenData.data;
        console.log('📱 Expo Push Token:', token);

        // Set up Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'EVeerified Notifications',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10b981',
            });
        }

        return token;
    } catch (error) {
        console.error('Error registering for push notifications:', error);
        return null;
    }
}
