import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a push notification to a single user
 */
export async function sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<boolean> {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`Invalid Expo push token: ${pushToken}`);
        return false;
    }

    const message: ExpoPushMessage = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
    };

    try {
        const tickets = await expo.sendPushNotificationsAsync([message]);
        const ticket = tickets[0];

        if ((ticket as any).status === 'error') {
            console.error(`Notification error: ${(ticket as any).message}`);
            return false;
        }

        console.log(`📨 Notification sent: "${title}" → ${pushToken.slice(0, 20)}...`);
        return true;
    } catch (error) {
        console.error('Failed to send notification:', error);
        return false;
    }
}

/**
 * Send push notifications to multiple users
 */
export async function sendBulkNotifications(
    pushTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<number> {
    const validTokens = pushTokens.filter(t => Expo.isExpoPushToken(t));

    if (validTokens.length === 0) return 0;

    const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: 'default' as const,
        title,
        body,
        data: data || {},
    }));

    const chunks = expo.chunkPushNotifications(messages);
    let successCount = 0;

    for (const chunk of chunks) {
        try {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            successCount += tickets.filter((t: any) => t.status === 'ok').length;
        } catch (error) {
            console.error('Bulk notification chunk error:', error);
        }
    }

    console.log(`📨 Sent ${successCount}/${validTokens.length} bulk notifications: "${title}"`);
    return successCount;
}
