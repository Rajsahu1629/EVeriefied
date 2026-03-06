import { Router } from 'express';
import { query } from '../db';
import { sendPushNotification, sendBulkNotifications } from '../services/notificationService';

const router = Router();

// Get pending job approvals
router.get('/jobs/pending', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT jp.*, r.company_name, r.entity_type, r.phone_number as recruiter_phone
       FROM job_posts jp
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE jp.status = 'pending'
       ORDER BY jp.created_at DESC`
        );

        res.json(result);
    } catch (error) {
        console.error('Get pending jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch pending jobs' });
    }
});

// Approve job
router.put('/jobs/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;

        await query(`UPDATE job_posts SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

        // 🔔 Notify the recruiter their job is live
        try {
            const job = await query<any>(
                `SELECT jp.brand, jp.role_required, jp.city, r.push_token FROM job_posts jp JOIN recruiters r ON jp.recruiter_id = r.id WHERE jp.id = $1`, [id]
            );
            if (job.length > 0) {
                const { brand, role_required, city, push_token } = job[0];

                if (push_token) {
                    await sendPushNotification(push_token, 'Job Approved! ✅', `Your ${brand} - ${role_required} post is now live!`, { screen: 'PreviousJobs' });
                }

                // 🔔 Broadcast to ALL users: new job available
                const allUserTokens = await query<any>(`SELECT push_token FROM users WHERE push_token IS NOT NULL`);
                if (allUserTokens.length > 0) {
                    await sendBulkNotifications(
                        allUserTokens.map((u: any) => u.push_token),
                        '🆕 New Job Available!',
                        `${brand} is hiring a ${role_required} in ${city || 'your area'}. Apply now!`,
                        { screen: 'Jobs' }
                    );
                }
            }
        } catch (e) { console.error('Approval notification error:', e); }

        res.json({ success: true, message: 'Job approved' });
    } catch (error) {
        console.error('Approve job error:', error);
        res.status(500).json({ error: 'Failed to approve job' });
    }
});

// Reject job
router.put('/jobs/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;

        await query(`UPDATE job_posts SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

        // 🔔 Notify the recruiter
        try {
            const job = await query<any>(
                `SELECT jp.brand, jp.role_required, r.push_token FROM job_posts jp JOIN recruiters r ON jp.recruiter_id = r.id WHERE jp.id = $1`, [id]
            );
            if (job.length > 0 && job[0].push_token) {
                await sendPushNotification(job[0].push_token, 'Job Post Update', `Your ${job[0].brand} - ${job[0].role_required} post was not approved. Please review.`, { screen: 'PreviousJobs' });
            }
        } catch (e) { console.error('Rejection notification error:', e); }

        res.json({ success: true, message: 'Job rejected' });
    } catch (error) {
        console.error('Reject job error:', error);
        res.status(500).json({ error: 'Failed to reject job' });
    }
});

// Get pending user verifications
router.get('/users/pending', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT id, full_name, phone_number, city, state, experience, 
              qualification, verification_status, domain, vehicle_category,
              training_role, quiz_score, total_questions, role, created_at
       FROM users 
       WHERE verification_status = 'step2_completed' 
          OR verification_status = 'step3_pending'
       ORDER BY created_at DESC`
        );

        res.json(result);
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ error: 'Failed to fetch pending users' });
    }
});

// Verify user (approve verification)
router.put('/users/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        await query(
            `UPDATE users SET 
        verification_status = $1, 
        is_admin_verified = $2,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
            [status, status === 'verified', id]
        );

        // 🔔 Notify the user
        try {
            const user = await query<any>(`SELECT push_token, full_name FROM users WHERE id = $1`, [id]);
            if (user.length > 0 && user[0].push_token) {
                const title = status === 'verified' ? 'Congratulations! 🎉' : 'Verification Update';
                const body = status === 'verified'
                    ? `${user[0].full_name}, you are now verified! ✅`
                    : 'Your verification needs attention. Please check the app.';
                await sendPushNotification(user[0].push_token, title, body, { screen: 'UserDashboard' });
            }
        } catch (e) { console.error('Verification notification error:', e); }

        res.json({ success: true, message: `User ${status}` });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

// Search candidates
router.get('/candidates/search', async (req, res) => {
    try {
        const { domain, vehicleCategory, city, experience, role } = req.query;

        let queryText = `
      SELECT id, full_name, phone_number, city, state, experience, 
             qualification, verification_status, domain, vehicle_category,
             training_role, brands, quiz_score, total_questions, role,
             pincode, current_salary, is_admin_verified
      FROM users 
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (domain) {
            queryText += ` AND domain = $${paramIndex}`;
            params.push(domain);
            paramIndex++;
        }

        if (vehicleCategory) {
            queryText += ` AND vehicle_category = $${paramIndex}`;
            params.push(vehicleCategory);
            paramIndex++;
        }

        if (city) {
            queryText += ` AND LOWER(city) LIKE LOWER($${paramIndex})`;
            params.push(`%${city}%`);
            paramIndex++;
        }

        if (experience) {
            queryText += ` AND experience = $${paramIndex}`;
            params.push(experience);
            paramIndex++;
        }

        if (role) {
            queryText += ` AND role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        queryText += ` ORDER BY quiz_score DESC NULLS LAST, created_at DESC`;

        const result = await query<any>(queryText, params);
        res.json(result);
    } catch (error) {
        console.error('Search candidates error:', error);
        res.status(500).json({ error: 'Failed to search candidates' });
    }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [pending, total, verified, recruiters] = await Promise.all([
            query<{ count: string }>(`SELECT COUNT(*) as count FROM job_posts WHERE status = 'pending'`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users WHERE verification_status IN ('verified', 'approved')`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM recruiters`),
        ]);

        res.json({
            pendingJobs: parseInt(pending[0]?.count || '0'),
            totalCandidates: parseInt(total[0]?.count || '0'),
            verifiedCandidates: parseInt(verified[0]?.count || '0'),
            totalRecruiters: parseInt(recruiters[0]?.count || '0'),
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Get users pending admin verification (passed test but not admin verified)
router.get('/users/pending-verification', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT id, full_name, phone_number, role, domain, vehicle_category, verification_status, quiz_score, training_role
             FROM users
             WHERE verification_status IN ('verified', 'approved') 
             AND (is_admin_verified IS NULL OR is_admin_verified = false)
             ORDER BY created_at DESC`
        );
        res.json(result);
    } catch (error) {
        console.error('Get pending verification users error:', error);
        res.status(500).json({ error: 'Failed to fetch pending verification users' });
    }
});

// Admin verify user (give green tick)
router.put('/users/:id/admin-verify', async (req, res) => {
    try {
        const { id } = req.params;
        await query(
            `UPDATE users SET is_admin_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
        res.json({ success: true, message: 'User admin verified' });
    } catch (error) {
        console.error('Admin verify user error:', error);
        res.status(500).json({ error: 'Failed to admin verify user' });
    }
});

// Get all users who have ordered a card
router.get('/card-orders', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT id, full_name, phone_number, role, city, state, pincode, 
                    vehicle_category, training_role, verification_status, updated_at
             FROM users
             WHERE card_ordered = true
             ORDER BY updated_at DESC`
        );
        res.json(result);
    } catch (error) {
        console.error('Get card orders error:', error);
        res.status(500).json({ error: 'Failed to fetch card orders' });
    }
});

export default router;
