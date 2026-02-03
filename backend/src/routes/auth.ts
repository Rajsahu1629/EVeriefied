import { Router } from 'express';
import { query } from '../db';

const router = Router();

// User login
router.post('/user/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({ error: 'Phone number and password are required' });
        }

        // First check if user exists
        const existingUsers = await query<any>(
            `SELECT * FROM users WHERE phone_number = $1`,
            [phoneNumber]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({ error: 'User not registered. Please sign up first.' });
        }

        // Check password
        const user = existingUsers[0];
        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.full_name,
                phoneNumber: user.phone_number,
                state: user.state || '',
                city: user.city || '',
                pincode: user.pincode || '',
                qualification: user.qualification || '',
                experience: user.experience || '',
                currentWorkshop: user.current_workshop || '',
                brandWorkshop: user.brand_workshop || '',
                brands: user.brands || [],
                role: user.role,
                verificationStatus: user.verification_status,
                verificationStep: user.verification_step || 0,
                quizScore: user.quiz_score || 0,
                totalQuestions: user.total_questions || 0,
                lastQuizAttempt: user.last_quiz_attempt,
                domain: user.domain,
                vehicle_category: user.vehicle_category,
                training_role: user.training_role,
                is_admin_verified: user.is_admin_verified,
                current_workshop: user.current_workshop,
                brand_workshop: user.brand_workshop,
                prior_knowledge: user.prior_knowledge,
                current_salary: user.current_salary,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// Recruiter login  
router.post('/recruiter/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return res.status(400).json({ error: 'Phone number and password are required' });
        }

        // First check if recruiter exists
        const existingRecruiters = await query<any>(
            `SELECT * FROM recruiters WHERE phone_number = $1`,
            [phoneNumber]
        );

        if (existingRecruiters.length === 0) {
            return res.status(404).json({ error: 'Recruiter not registered. Please sign up first.' });
        }

        // Check password
        const recruiter = existingRecruiters[0];
        if (recruiter.password !== password) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        res.json({
            success: true,
            recruiter: {
                id: recruiter.id,
                companyName: recruiter.company_name,
                entityType: recruiter.entity_type,
                phoneNumber: recruiter.phone_number,
            }
        });
    } catch (error) {
        console.error('Recruiter login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

export default router;
