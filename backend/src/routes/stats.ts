import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Get platform statistics (for RoleSelectionScreen)
router.get('/platform', async (req, res) => {
    try {
        const [users, verified, recruiters] = await Promise.all([
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users WHERE verification_status IN ('verified', 'approved')`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM recruiters`),
        ]);

        res.json({
            totalUsers: parseInt(users[0]?.count || '0'),
            verifiedUsers: parseInt(verified[0]?.count || '0'),
            totalRecruiters: parseInt(recruiters[0]?.count || '0'),
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
});

export default router;
