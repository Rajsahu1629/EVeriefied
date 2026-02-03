import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Check if phone number exists
router.post('/check-phone', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const existingUsers = await query<any>(
            `SELECT id FROM users WHERE phone_number = $1`,
            [phoneNumber]
        );

        res.json({ exists: existingUsers.length > 0 });
    } catch (error) {
        console.error('Check phone error:', error);
        res.status(500).json({ error: 'Failed to check phone number' });
    }
});

// Register new user
router.post('/', async (req, res) => {
    try {
        const {
            fullName, phoneNumber, password, state, city, pincode,
            qualification, experience, currentWorkshop, brandWorkshop,
            brands, role, priorKnowledge, currentSalary,
            domain, vehicleCategory, trainingRole
        } = req.body;

        // Check if user already exists
        const existingUsers = await query<any>(
            `SELECT id FROM users WHERE phone_number = $1`,
            [phoneNumber]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists with this phone number' });
        }

        // Insert new user
        const result = await query<any>(
            `INSERT INTO users (
        full_name, phone_number, password, state, city, pincode,
        qualification, experience, current_workshop, brand_workshop,
        brands, role, verification_status, verification_step, prior_knowledge, current_salary,
        domain, vehicle_category, training_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
            [
                fullName, phoneNumber, password, state, city, pincode,
                qualification, experience, currentWorkshop, brandWorkshop,
                JSON.stringify(brands || []), role, 'pending', 1, priorKnowledge, currentSalary,
                domain, vehicleCategory || null, trainingRole || null
            ]
        );

        const user = result[0];
        res.status(201).json({
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
                domain: user.domain,
                vehicle_category: user.vehicle_category,
                training_role: user.training_role,
            }
        });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query<any>(`SELECT * FROM users WHERE id = $1`, [id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const raw = result[0];
        res.json({
            id: raw.id,
            fullName: raw.full_name,
            phoneNumber: raw.phone_number,
            state: raw.state,
            city: raw.city,
            pincode: raw.pincode,
            qualification: raw.qualification,
            experience: raw.experience,
            currentWorkshop: raw.current_workshop,
            brandWorkshop: raw.brand_workshop,
            brands: typeof raw.brands === 'string' ? JSON.parse(raw.brands) : raw.brands,
            role: raw.role,
            verificationStatus: raw.verification_status,
            verificationStep: raw.verification_step,
            quizScore: raw.quiz_score,
            totalQuestions: raw.total_questions,
            lastQuizAttempt: raw.last_quiz_attempt,
            domain: raw.domain,
            vehicle_category: raw.vehicle_category,
            training_role: raw.training_role,
            is_admin_verified: raw.is_admin_verified,
            current_workshop: raw.current_workshop,
            brand_workshop: raw.brand_workshop,
            prior_knowledge: raw.prior_knowledge,
            current_salary: raw.current_salary,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullName, state, city, pincode, qualification, experience,
            currentWorkshop, brandWorkshop, brands, priorKnowledge, currentSalary,
            domain, vehicleCategory, trainingRole
        } = req.body;

        await query(
            `UPDATE users SET 
        full_name = $1, state = $2, city = $3, pincode = $4,
        qualification = $5, experience = $6, current_workshop = $7, brand_workshop = $8,
        brands = $9, prior_knowledge = $10, current_salary = $11,
        domain = $12, vehicle_category = $13, training_role = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $15`,
            [
                fullName, state, city, pincode, qualification, experience,
                currentWorkshop, brandWorkshop, JSON.stringify(brands || []),
                priorKnowledge, currentSalary, domain, vehicleCategory || null, trainingRole || null, id
            ]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get/Update card order status
router.get('/:id/card-order', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query<{ card_ordered: boolean }>(
            `SELECT card_ordered FROM users WHERE id = $1`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ cardOrdered: result[0].card_ordered || false });
    } catch (error) {
        console.error('Get card order error:', error);
        res.status(500).json({ error: 'Failed to get card order status' });
    }
});

router.put('/:id/card-order', async (req, res) => {
    try {
        const { id } = req.params;
        const { cardOrdered } = req.body;

        await query(
            `UPDATE users SET card_ordered = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [cardOrdered, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update card order error:', error);
        res.status(500).json({ error: 'Failed to update card order status' });
    }
});

// Update user verification status (from quiz)
router.put('/:id/verification', async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus, quizScore, totalQuestions, verificationStep } = req.body;

        await query(
            `UPDATE users SET 
                verification_status = $1, 
                quiz_score = $2, 
                total_questions = $3, 
                verification_step = $4,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [verificationStatus, quizScore, totalQuestions, verificationStep, id]
        );

        res.json({ success: true, message: 'Verification status updated' });
    } catch (error) {
        console.error('Update verification error:', error);
        res.status(500).json({ error: 'Failed to update verification status' });
    }
});

export default router;
