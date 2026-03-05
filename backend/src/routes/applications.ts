import { Router } from 'express';
import { query } from '../db';
import { sendPushNotification } from '../services/notificationService';

const router = Router();

// Apply to job
router.post('/', async (req, res) => {
    try {
        const { userId, jobPostId } = req.body;

        await query(
            `INSERT INTO job_applications (user_id, job_post_id, status) 
       VALUES ($1, $2, 'applied')
       ON CONFLICT (user_id, job_post_id) DO NOTHING`,
            [userId, jobPostId]
        );

        // 🔔 Notify the recruiter when someone applies to their job
        try {
            const jobInfo = await query<any>(
                `SELECT jp.role_required, jp.brand, r.push_token 
                 FROM job_posts jp 
                 JOIN recruiters r ON jp.recruiter_id = r.id 
                 WHERE jp.id = $1`, [jobPostId]
            );
            if (jobInfo.length > 0 && jobInfo[0].push_token) {
                await sendPushNotification(
                    jobInfo[0].push_token,
                    'New Applicant! 🎉',
                    `Someone applied for your ${jobInfo[0].brand} - ${jobInfo[0].role_required} position`,
                    { screen: 'JobApplicants', jobId: jobPostId }
                );
            }
        } catch (notifError) {
            console.error('Notification error (non-blocking):', notifError);
        }

        res.json({ success: true, message: 'Applied successfully' });
    } catch (error) {
        console.error('Apply to job error:', error);
        res.status(500).json({ error: 'Failed to apply to job' });
    }
});

// Get user's applied jobs
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await query<any>(
            `SELECT ja.*, jp.brand, jp.role_required, jp.city, jp.salary_min, jp.salary_max,
              jp.experience, jp.pincode, jp.stay_provided, jp.has_incentive,
              jp.vehicle_category, jp.training_role, jp.job_description,
              r.company_name
       FROM job_applications ja
       JOIN job_posts jp ON ja.job_post_id = jp.id
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE ja.user_id = $1
       ORDER BY jp.created_at DESC`,
            [userId]
        );

        res.json(result);
    } catch (error) {
        console.error('Get applied jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch applied jobs' });
    }
});

// Get user's applied job IDs (for checking if already applied)
router.get('/user/:userId/ids', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await query<{ job_post_id: number }>(
            `SELECT job_post_id FROM job_applications WHERE user_id = $1`,
            [userId]
        );

        const appliedJobIds = result.map(r => r.job_post_id);
        res.json(appliedJobIds);
    } catch (error) {
        console.error('Get applied job IDs error:', error);
        res.status(500).json({ error: 'Failed to fetch applied job IDs' });
    }
});

export default router;
