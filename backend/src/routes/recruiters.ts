import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Check if recruiter phone exists
router.post('/check-phone', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const existing = await query<any>(
            `SELECT id FROM recruiters WHERE phone_number = $1`,
            [phoneNumber]
        );

        res.json({ exists: existing.length > 0 });
    } catch (error) {
        console.error('Check phone error:', error);
        res.status(500).json({ error: 'Failed to check phone number' });
    }
});

// Register new recruiter
router.post('/', async (req, res) => {
    try {
        const { companyName, entityType, phoneNumber, password } = req.body;

        // Check if recruiter already exists
        const existing = await query<any>(
            `SELECT id FROM recruiters WHERE phone_number = $1`,
            [phoneNumber]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Recruiter already exists with this phone number' });
        }

        // Insert new recruiter
        const result = await query<any>(
            `INSERT INTO recruiters (company_name, entity_type, phone_number, password)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [companyName, entityType, phoneNumber, password]
        );

        const recruiter = result[0];
        res.status(201).json({
            success: true,
            recruiter: {
                id: recruiter.id,
                companyName: recruiter.company_name,
                entityType: recruiter.entity_type,
                phoneNumber: recruiter.phone_number,
            }
        });
    } catch (error) {
        console.error('Register recruiter error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Get recruiter by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query<any>(`SELECT * FROM recruiters WHERE id = $1`, [id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }

        const recruiter = result[0];
        res.json({
            id: recruiter.id,
            companyName: recruiter.company_name,
            entityType: recruiter.entity_type,
            phoneNumber: recruiter.phone_number,
        });
    } catch (error) {
        console.error('Get recruiter error:', error);
        res.status(500).json({ error: 'Failed to get recruiter' });
    }
});

export default router;
