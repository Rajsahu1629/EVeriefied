import { Router } from 'express';
import { query } from '../db';
import { buildHiringCompanies } from '../services/hiringOverview';
import { sendPushNotification } from '../services/notificationService';

const router = Router();

const VALID_APPLICATION_STATUSES = ['applied', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected'] as const;

const STATUS_NOTIFICATIONS: Record<string, { title: string; body: (brand: string, role: string) => string }> = {
    viewed: {
        title: 'Application In Review 👀',
        body: (brand, role) => `Your application for ${role} at ${brand} is now being reviewed.`,
    },
    shortlisted: {
        title: 'Shortlisted! ⭐',
        body: (brand, role) => `Great news! You've been shortlisted for ${role} at ${brand}.`,
    },
    interview: {
        title: 'Interview Stage 📅',
        body: (brand, role) => `Your application for ${role} at ${brand} has moved to the interview stage.`,
    },
    hired: {
        title: 'Hired! 🎉',
        body: (brand, role) => `Congratulations! You've been hired for ${role} at ${brand}.`,
    },
    rejected: {
        title: 'Application Update',
        body: (brand, role) => `Your application for ${role} at ${brand} was not selected this time.`,
    },
};

async function maybeCloseJobVacancies(jobPostId: number) {
    const jobs = await query<any>(
        `SELECT number_of_people, is_active FROM job_posts WHERE id = $1`,
        [jobPostId]
    );
    if (jobs.length === 0) return;

    const capacity = parseInt(String(jobs[0].number_of_people || '0'), 10);
    if (!capacity || capacity <= 0) return;

    const hired = await query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM job_applications WHERE job_post_id = $1 AND status = 'hired'`,
        [jobPostId]
    );
    const hiredCount = parseInt(hired[0]?.count || '0', 10);

    if (hiredCount >= capacity) {
        await query(
            `UPDATE job_posts SET is_active = false, vacancies_filled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [jobPostId]
        );
    }
}

async function recruiterOwnsApplication(recruiterId: string, applicationId: string) {
    const rows = await query<{ id: number }>(
        `SELECT ja.id FROM job_applications ja
         JOIN job_posts jp ON ja.job_post_id = jp.id
         WHERE ja.id = $1 AND jp.recruiter_id = $2`,
        [applicationId, recruiterId]
    );
    return rows.length > 0;
}

function mapUserProfile(raw: any) {
    let brands = raw.brands;
    if (typeof brands === 'string') {
        try {
            brands = JSON.parse(brands);
        } catch {
            brands = [];
        }
    }
    return {
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
        brands,
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
    };
}

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

        const rid = parseInt(String(recruiterId), 10);
        if (!rid || Number.isNaN(rid)) {
            return res.status(400).json({ error: 'Valid recruiterId is required' });
        }

        const recruiterCheck = await query<{ id: number }>(
            'SELECT id FROM recruiters WHERE id = $1',
            [rid]
        );
        if (!recruiterCheck.length) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }

        const result = await query<any>(
            `INSERT INTO job_posts (
        recruiter_id, brand, role_required, number_of_people, experience,
        salary_min, salary_max, has_incentive, pincode, city, stay_provided,
        urgency, job_description, status, is_active, vehicle_category, training_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
            [
                rid, brand, roleRequired, numberOfPeople, experience,
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

// Recruiter Hiring Hub — same company → vacancy → applicants view (scoped to one recruiter)
router.get('/recruiter/:recruiterId/hiring/overview', async (req, res) => {
    try {
        const recruiterId = parseInt(req.params.recruiterId, 10);
        if (Number.isNaN(recruiterId)) {
            return res.status(400).json({ error: 'Invalid recruiter id' });
        }
        const companies = await buildHiringCompanies(recruiterId);
        res.json({ companies });
    } catch (error) {
        console.error('Recruiter hiring overview error:', error);
        res.status(500).json({ error: 'Failed to fetch hiring overview' });
    }
});

router.get('/recruiter/:recruiterId/applications', async (req, res) => {
    try {
        const recruiterId = req.params.recruiterId;
        const { status, jobId } = req.query;

        let queryText = `
      SELECT ja.id,
              ja.status,
              ja.applied_at,
              ja.rejection_reason,
              ja.admin_notes,
              ja.status_updated_at,
              ja.user_id,
              ja.job_post_id,
              u.full_name AS applicant_name,
              u.phone_number AS applicant_phone,
              r.company_name,
              r.phone_number AS recruiter_phone,
              jp.brand,
              jp.role_required,
              jp.city,
              jp.is_active as job_is_active,
              jp.vacancies_filled
       FROM job_applications ja
       JOIN users u ON ja.user_id = u.id
       JOIN job_posts jp ON ja.job_post_id = jp.id
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE jp.recruiter_id = $1
    `;
        const params: any[] = [recruiterId];
        let i = 2;

        if (status) {
            queryText += ` AND ja.status = $${i}`;
            params.push(status);
            i++;
        }
        if (jobId) {
            queryText += ` AND ja.job_post_id = $${i}`;
            params.push(jobId);
            i++;
        }

        queryText += ` ORDER BY ja.applied_at DESC NULLS LAST, ja.id DESC`;

        const result = await query<any>(queryText, params);
        res.json(result);
    } catch (error) {
        console.error('Recruiter applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

router.put('/recruiter/:recruiterId/applications/:applicationId/status', async (req, res) => {
    try {
        const { recruiterId, applicationId } = req.params;
        const { status, rejectionReason, adminNotes } = req.body;

        if (!(await recruiterOwnsApplication(recruiterId, applicationId))) {
            return res.status(403).json({ error: 'Not authorized for this application' });
        }

        if (!status || !(VALID_APPLICATION_STATUSES as readonly string[]).includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Use one of: ${VALID_APPLICATION_STATUSES.join(', ')}`,
            });
        }

        if (status === 'rejected' && !rejectionReason?.trim()) {
            return res.status(400).json({ error: 'Rejection reason is required when rejecting an application' });
        }

        await query(
            `UPDATE job_applications SET 
        status = $1,
        rejection_reason = $2,
        admin_notes = COALESCE($3, admin_notes),
        status_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
            [status, status === 'rejected' ? rejectionReason : null, adminNotes || null, applicationId]
        );

        const rows = await query<any>(
            `SELECT ja.user_id, ja.job_post_id, u.push_token, jp.brand, jp.role_required
       FROM job_applications ja
       JOIN users u ON ja.user_id = u.id
       JOIN job_posts jp ON ja.job_post_id = jp.id
       WHERE ja.id = $1`,
            [applicationId]
        );

        if (rows.length > 0) {
            const row = rows[0];
            const notif = STATUS_NOTIFICATIONS[status];
            if (notif && row.push_token) {
                let body = notif.body(row.brand, row.role_required);
                if (status === 'rejected' && rejectionReason) {
                    body += ` Reason: ${rejectionReason}`;
                }
                await sendPushNotification(row.push_token, notif.title, body, { screen: 'AppliedJobs' });
            }
            if (status === 'hired') {
                await maybeCloseJobVacancies(row.job_post_id);
            }
        }

        res.json({ success: true, message: 'Application status updated' });
    } catch (error) {
        console.error('Recruiter update status error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

router.put('/recruiter/:recruiterId/applications/:applicationId/notes', async (req, res) => {
    try {
        const { recruiterId, applicationId } = req.params;
        const { adminNotes } = req.body;

        if (!(await recruiterOwnsApplication(recruiterId, applicationId))) {
            return res.status(403).json({ error: 'Not authorized for this application' });
        }

        await query(
            `UPDATE job_applications SET admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [adminNotes || '', applicationId]
        );
        res.json({ success: true, message: 'Notes saved' });
    } catch (error) {
        console.error('Recruiter update notes error:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

router.get('/recruiter/:recruiterId/users/:userId/profile', async (req, res) => {
    try {
        const { recruiterId, userId } = req.params;

        const link = await query(
            `SELECT 1 FROM job_applications ja
             JOIN job_posts jp ON ja.job_post_id = jp.id
             WHERE jp.recruiter_id = $1 AND ja.user_id = $2
             LIMIT 1`,
            [recruiterId, userId]
        );
        if (link.length === 0) {
            return res.status(403).json({ error: 'Candidate has not applied to your jobs' });
        }

        const result = await query<any>(`SELECT * FROM users WHERE id = $1`, [userId]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(mapUserProfile(result[0]));
    } catch (error) {
        console.error('Recruiter get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Mark job vacancies as filled (hide from candidate job list)
router.put('/:id/mark-filled', async (req, res) => {
    try {
        const { id } = req.params;
        const { recruiterId } = req.body;

        const job = await query<any>(`SELECT recruiter_id FROM job_posts WHERE id = $1`, [id]);
        if (job.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (recruiterId && String(job[0].recruiter_id) !== String(recruiterId)) {
            return res.status(403).json({ error: 'Not authorized to update this job' });
        }

        await query(
            `UPDATE job_posts SET is_active = false, vacancies_filled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );

        res.json({ success: true, message: 'Vacancies marked as filled. Job hidden from candidates.' });
    } catch (error) {
        console.error('Mark job filled error:', error);
        res.status(500).json({ error: 'Failed to mark job as filled' });
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
