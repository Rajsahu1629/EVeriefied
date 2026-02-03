import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Get verification questions by role and step (for SkillVerificationScreen)
router.get('/questions', async (req, res) => {
    try {
        const { role, step } = req.query;

        const result = await query<any>(
            `SELECT * FROM verification_questions WHERE role = $1 AND step = $2 ORDER BY RANDOM() LIMIT 10`,
            [role || 'technician', step || 1]
        );

        res.json(result);
    } catch (error) {
        console.error('Get verification questions error:', error);
        res.status(500).json({ error: 'Failed to fetch verification questions' });
    }
});

export default router;
