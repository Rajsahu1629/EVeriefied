import { Router } from 'express';
import { query } from '../db';
import { sendPushNotification, sendBulkNotifications } from '../services/notificationService';

const router = Router();

/**
 * Register or update push token for a user or recruiter
 * POST /api/notifications/register-token
 * Body: { userId, userType: 'user' | 'recruiter', pushToken }
 */
router.post('/register-token', async (req, res) => {
    try {
        const { userId, userType, pushToken } = req.body;

        if (!userId || !userType || !pushToken) {
            return res.status(400).json({ error: 'userId, userType, and pushToken are required' });
        }

        const table = userType === 'recruiter' ? 'recruiters' : 'users';

        await query(
            `UPDATE ${table} SET push_token = $1 WHERE id = $2`,
            [pushToken, userId]
        );

        console.log(`📱 Push token registered for ${userType} #${userId}`);
        res.json({ success: true, message: 'Push token registered' });
    } catch (error) {
        console.error('Register token error:', error);
        res.status(500).json({ error: 'Failed to register push token' });
    }
});

/**
 * Remove push token (on logout)
 * POST /api/notifications/remove-token
 * Body: { userId, userType: 'user' | 'recruiter' }
 */
router.post('/remove-token', async (req, res) => {
    try {
        const { userId, userType } = req.body;
        const table = userType === 'recruiter' ? 'recruiters' : 'users';

        await query(
            `UPDATE ${table} SET push_token = NULL WHERE id = $1`,
            [userId]
        );

        res.json({ success: true, message: 'Push token removed' });
    } catch (error) {
        console.error('Remove token error:', error);
        res.status(500).json({ error: 'Failed to remove push token' });
    }
});

/**
 * Send a test notification to a single user
 * POST /api/notifications/test
 * Body: { userId, userType, title, body }
 */
router.post('/test', async (req, res) => {
    try {
        const { userId, userType, title, body } = req.body;
        const table = userType === 'recruiter' ? 'recruiters' : 'users';

        const result = await query<any>(
            `SELECT push_token FROM ${table} WHERE id = $1`,
            [userId]
        );

        if (result.length === 0 || !result[0].push_token) {
            return res.status(404).json({ error: 'No push token found for this user' });
        }

        const success = await sendPushNotification(
            result[0].push_token,
            title || 'Test Notification 🔔',
            body || 'This is a test from EVeerified!'
        );

        res.json({ success, message: success ? 'Notification sent' : 'Failed to send' });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

/**
 * Broadcast notification to all users, all recruiters, or both
 * POST /api/notifications/broadcast
 * Body: { target: 'users' | 'recruiters' | 'all', title, body, data? }
 */
router.post('/broadcast', async (req, res) => {
    try {
        const { target, title, body, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'title and body are required' });
        }

        let tokens: string[] = [];
        let sentTo = '';

        if (target === 'users' || target === 'all') {
            const users = await query<any>(`SELECT push_token FROM users WHERE push_token IS NOT NULL`);
            tokens.push(...users.map((u: any) => u.push_token));
            sentTo += `${users.length} users`;
        }

        if (target === 'recruiters' || target === 'all') {
            const recruiters = await query<any>(`SELECT push_token FROM recruiters WHERE push_token IS NOT NULL`);
            tokens.push(...recruiters.map((r: any) => r.push_token));
            sentTo += sentTo ? ` + ${recruiters.length} recruiters` : `${recruiters.length} recruiters`;
        }

        if (tokens.length === 0) {
            return res.json({ success: true, message: 'No devices to send to', sent: 0 });
        }

        const sent = await sendBulkNotifications(tokens, title, body, data);

        console.log(`📢 Broadcast sent to ${sentTo} (${sent}/${tokens.length} delivered)`);
        res.json({
            success: true,
            message: `Notification sent to ${sentTo}`,
            sent,
            total: tokens.length
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ error: 'Failed to send broadcast notification' });
    }
});

export default router;

