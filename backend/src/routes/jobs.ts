import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Get approved jobs (for users to view)
router.get('/', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT jp.*, r.company_name 
       FROM job_posts jp
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE jp.is_active = true AND jp.status = 'approved'
       ORDER BY jp.created_at DESC`
        );

        res.json(result);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Create new job post
router.post('/', async (req, res) => {
    try {
        const {
            recruiterId, brand, roleRequired, numberOfPeople, experience,
            salaryMin, salaryMax, hasIncentive, pincode, city, stayProvided,
            urgency, jobDescription, vehicleCategory, trainingRole
        } = req.body;

        const result = await query<any>(
            `INSERT INTO job_posts (
        recruiter_id, brand, role_required, number_of_people, experience,
        salary_min, salary_max, has_incentive, pincode, city, stay_provided,
        urgency, job_description, status, is_active, vehicle_category, training_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
            [
                recruiterId, brand, roleRequired, numberOfPeople, experience,
                salaryMin, salaryMax, hasIncentive, pincode, city, stayProvided,
                urgency, jobDescription, 'pending', true, vehicleCategory || null, trainingRole || null
            ]
        );

        res.status(201).json({ success: true, job: result[0] });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Failed to create job post' });
    }
});

// Update job post
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            brand, roleRequired, numberOfPeople, experience,
            salaryMin, salaryMax, hasIncentive, pincode, city, stayProvided,
            urgency, jobDescription, vehicleCategory, trainingRole
        } = req.body;

        // Check current status
        const currentJob = await query<any>('SELECT status FROM job_posts WHERE id = $1', [id]);

        if (currentJob.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        if (currentJob[0].status === 'approved') {
            return res.status(403).json({ error: 'Cannot edit an approved job post' });
        }

        await query(
            `UPDATE job_posts SET 
        brand = $1, role_required = $2, number_of_people = $3, experience = $4,
        salary_min = $5, salary_max = $6, has_incentive = $7, pincode = $8, city = $9, 
        stay_provided = $10, urgency = $11, job_description = $12, vehicle_category = $13,
        training_role = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $15`,
            [
                brand, roleRequired, numberOfPeople, experience,
                salaryMin, salaryMax, hasIncentive, pincode, city, stayProvided,
                urgency, jobDescription, vehicleCategory || null, trainingRole || null, id
            ]
        );

        res.json({ success: true, message: 'Job post updated successfully' });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ error: 'Failed to update job post' });
    }
});

// Get recruiter's job posts
router.get('/recruiter/:recruiterId', async (req, res) => {
    try {
        const { recruiterId } = req.params;

        const result = await query<any>(
            `SELECT jp.*, COUNT(ja.user_id) as application_count 
       FROM job_posts jp
       LEFT JOIN job_applications ja ON jp.id = ja.job_post_id
       WHERE jp.recruiter_id = $1 
       GROUP BY jp.id
       ORDER BY jp.created_at DESC`,
            [recruiterId]
        );

        res.json(result);
    } catch (error) {
        console.error('Get recruiter jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch recruiter jobs' });
    }
});

// Get job applicants
router.get('/:id/applicants', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query<any>(
            `SELECT u.id, u.full_name, u.phone_number, u.city, u.state, u.experience, 
              u.qualification, u.verification_status, u.domain, u.vehicle_category,
              u.training_role, u.brands, u.quiz_score, u.total_questions, u.role,
              u.pincode, u.current_salary, u.is_admin_verified,
              ja.status as application_status,
              u.created_at as applied_at
       FROM job_applications ja
       JOIN users u ON ja.user_id = u.id
       WHERE ja.job_post_id = $1
       ORDER BY u.created_at DESC`,
            [id]
        );

        res.json(result);
    } catch (error) {
        console.error('Get applicants error:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
});

export default router;
