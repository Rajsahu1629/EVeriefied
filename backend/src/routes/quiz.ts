import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Get quiz questions
router.get('/questions', async (req, res) => {
    try {
        const { role, domain, vehicleCategory, trainingRole } = req.query;

        let queryText = `SELECT * FROM verification_questions WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;

        if (role) {
            queryText += ` AND role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        if (domain) {
            queryText += ` AND (domain = $${paramIndex} OR domain IS NULL)`;
            params.push(domain);
            paramIndex++;
        }

        if (vehicleCategory) {
            queryText += ` AND (vehicle_category = $${paramIndex} OR vehicle_category IS NULL)`;
            params.push(vehicleCategory);
            paramIndex++;
        }

        if (trainingRole) {
            queryText += ` AND (training_role = $${paramIndex} OR training_role IS NULL)`;
            params.push(trainingRole);
            paramIndex++;
        }

        queryText += ` ORDER BY RANDOM() LIMIT 10`;

        const result = await query<any>(queryText, params);
        res.json(result);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Submit quiz score
router.post('/submit', async (req, res) => {
    try {
        const { userId, score, totalQuestions, verificationStatus, verificationStep } = req.body;

        // Update user's quiz score and verification status
        await query(
            `UPDATE users SET 
        quiz_score = $1, 
        total_questions = $2, 
        verification_status = $3,
        verification_step = $4,
        last_quiz_attempt = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
            [score, totalQuestions, verificationStatus, verificationStep, userId]
        );

        // Also insert into quiz_scores for leaderboard
        await query(
            `INSERT INTO quiz_scores (user_id, score, played_at) 
       VALUES ($1, $2, CURRENT_DATE)
       ON CONFLICT (user_id, played_at) 
       DO UPDATE SET score = GREATEST(quiz_scores.score, $2)`,
            [userId, score]
        );

        res.json({ success: true, message: 'Score submitted' });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT u.full_name, qs.score FROM quiz_scores qs
             JOIN users u ON qs.user_id = u.id
             WHERE qs.played_at = CURRENT_DATE
             ORDER BY qs.score DESC LIMIT 5`
        );

        res.json(result);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Simple quiz score submission (for LearnScreen daily quiz)
router.post('/score', async (req, res) => {
    try {
        const { userId, score } = req.body;

        await query(
            `INSERT INTO quiz_scores (user_id, score, played_at) 
             VALUES ($1, $2, CURRENT_DATE)
             ON CONFLICT (user_id, played_at) 
             DO UPDATE SET score = GREATEST(quiz_scores.score, $2)`,
            [userId, score]
        );

        res.json({ success: true, message: 'Score submitted' });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

export default router;
