import { Router } from 'express';
import { query } from '../db';
import { sendPushNotification, sendBulkNotifications } from '../services/notificationService';
import { requireAdmin, getAdminCredentials } from '../middleware/adminAuth';

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

// Public admin login
router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const creds = getAdminCredentials();
        const phone = String(phoneNumber || '').replace(/\D/g, '');
        const expectedPhone = creds.phone.replace(/\D/g, '');

        if (phone !== expectedPhone || password !== creds.password) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        res.json({ success: true, token: creds.secret });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.use(requireAdmin);

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

// Active approved jobs (admin can mark vacancies filled)
router.get('/jobs/active', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT jp.*, r.company_name,
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_post_id = jp.id AND ja.status = 'hired')::int as hired_count,
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_post_id = jp.id)::int as application_count
       FROM job_posts jp
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE jp.status = 'approved' AND jp.is_active = true
       ORDER BY jp.created_at DESC`
        );
        res.json(result);
    } catch (error) {
        console.error('Get active jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch active jobs' });
    }
});

router.put('/jobs/:id/mark-filled', async (req, res) => {
    try {
        const { id } = req.params;
        await query(
            `UPDATE job_posts SET is_active = false, vacancies_filled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
        res.json({ success: true, message: 'Job hidden from candidates — vacancies marked as filled' });
    } catch (error) {
        console.error('Mark job filled error:', error);
        res.status(500).json({ error: 'Failed to mark job as filled' });
    }
});

router.put('/jobs/:id/reactivate', async (req, res) => {
    try {
        const { id } = req.params;
        await query(
            `UPDATE job_posts SET is_active = true, vacancies_filled = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'approved'`,
            [id]
        );
        res.json({ success: true, message: 'Job is live again for candidates' });
    } catch (error) {
        console.error('Reactivate job error:', error);
        res.status(500).json({ error: 'Failed to reactivate job' });
    }
});

router.put('/jobs/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`UPDATE job_posts SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

        try {
            const job = await query<any>(
                `SELECT jp.brand, jp.role_required, jp.city, r.push_token FROM job_posts jp JOIN recruiters r ON jp.recruiter_id = r.id WHERE jp.id = $1`,
                [id]
            );
            if (job.length > 0) {
                const { brand, role_required, city, push_token } = job[0];
                if (push_token) {
                    await sendPushNotification(push_token, 'Job Approved! ✅', `Your ${brand} - ${role_required} post is now live!`, { screen: 'PreviousJobs' });
                }
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
        } catch (e) {
            console.error('Approval notification error:', e);
        }

        res.json({ success: true, message: 'Job approved' });
    } catch (error) {
        console.error('Approve job error:', error);
        res.status(500).json({ error: 'Failed to approve job' });
    }
});

router.put('/jobs/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`UPDATE job_posts SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

        try {
            const job = await query<any>(
                `SELECT jp.brand, jp.role_required, r.push_token FROM job_posts jp JOIN recruiters r ON jp.recruiter_id = r.id WHERE jp.id = $1`,
                [id]
            );
            if (job.length > 0 && job[0].push_token) {
                await sendPushNotification(
                    job[0].push_token,
                    'Job Post Update',
                    `Your ${job[0].brand} - ${job[0].role_required} post was not approved. Please review.`,
                    { screen: 'PreviousJobs' }
                );
            }
        } catch (e) {
            console.error('Rejection notification error:', e);
        }

        res.json({ success: true, message: 'Job rejected' });
    } catch (error) {
        console.error('Reject job error:', error);
        res.status(500).json({ error: 'Failed to reject job' });
    }
});

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

router.put('/users/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await query(
            `UPDATE users SET 
        verification_status = $1, 
        is_admin_verified = $2,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
            [status, status === 'verified', id]
        );

        try {
            const user = await query<any>(`SELECT push_token, full_name FROM users WHERE id = $1`, [id]);
            if (user.length > 0 && user[0].push_token) {
                const title = status === 'verified' ? 'Congratulations! 🎉' : 'Verification Update';
                const body =
                    status === 'verified'
                        ? `${user[0].full_name}, you are now verified! ✅`
                        : 'Your verification needs attention. Please check the app.';
                await sendPushNotification(user[0].push_token, title, body, { screen: 'UserDashboard' });
            }
        } catch (e) {
            console.error('Verification notification error:', e);
        }

        res.json({ success: true, message: `User ${status}` });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

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

router.get('/stats', async (req, res) => {
    try {
        const [pending, total, verified, recruiters, pendingApps, filledJobs] = await Promise.all([
            query<{ count: string }>(`SELECT COUNT(*) as count FROM job_posts WHERE status = 'pending'`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM users WHERE verification_status IN ('verified', 'approved')`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM recruiters`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM job_applications WHERE status = 'applied'`),
            query<{ count: string }>(`SELECT COUNT(*) as count FROM job_posts WHERE status = 'approved' AND is_active = false`),
        ]);

        res.json({
            pendingJobs: parseInt(pending[0]?.count || '0'),
            totalCandidates: parseInt(total[0]?.count || '0'),
            verifiedCandidates: parseInt(verified[0]?.count || '0'),
            totalRecruiters: parseInt(recruiters[0]?.count || '0'),
            newApplications: parseInt(pendingApps[0]?.count || '0'),
            filledJobs: parseInt(filledJobs[0]?.count || '0'),
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const [byStatus, byJob, totals] = await Promise.all([
            query<any>(
                `SELECT status, COUNT(*)::int as count FROM job_applications GROUP BY status ORDER BY count DESC`
            ),
            query<any>(
                `SELECT jp.id, jp.brand, jp.role_required, jp.city,
                  COUNT(ja.id)::int as total_applications,
                  COUNT(ja.id) FILTER (WHERE ja.status = 'hired')::int as hired,
                  COUNT(ja.id) FILTER (WHERE ja.status = 'rejected')::int as rejected,
                  COUNT(ja.id) FILTER (WHERE ja.status IN ('viewed','shortlisted','interview'))::int as in_pipeline
           FROM job_posts jp
           LEFT JOIN job_applications ja ON ja.job_post_id = jp.id
           WHERE jp.status = 'approved'
           GROUP BY jp.id, jp.brand, jp.role_required, jp.city
           ORDER BY total_applications DESC
           LIMIT 50`
            ),
            query<any>(
                `SELECT 
            COUNT(*)::int as total_applications,
            COUNT(*) FILTER (WHERE status = 'hired')::int as total_hired,
            COUNT(*) FILTER (WHERE status = 'applied')::int as awaiting_review
           FROM job_applications`
            ),
        ]);

        const t = totals[0] || {};
        const totalApps = t.total_applications || 0;
        const hired = t.total_hired || 0;

        res.json({
            byStatus,
            byJob,
            totals: {
                ...t,
                conversionRate: totalApps > 0 ? Math.round((hired / totalApps) * 100) : 0,
            },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

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

router.put('/users/:id/admin-verify', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`UPDATE users SET is_admin_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        res.json({ success: true, message: 'User admin verified' });
    } catch (error) {
        console.error('Admin verify user error:', error);
        res.status(500).json({ error: 'Failed to admin verify user' });
    }
});

router.get('/applications', async (req, res) => {
    try {
        const { status, jobId, dateFrom, dateTo } = req.query;

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
       WHERE 1=1
    `;
        const params: any[] = [];
        let i = 1;

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
        if (dateFrom) {
            queryText += ` AND ja.applied_at >= $${i}`;
            params.push(dateFrom);
            i++;
        }
        if (dateTo) {
            queryText += ` AND ja.applied_at <= $${i}`;
            params.push(dateTo);
            i++;
        }

        queryText += ` ORDER BY ja.applied_at DESC NULLS LAST, ja.id DESC`;

        const result = await query<any>(queryText, params);
        res.json(result);
    } catch (error) {
        console.error('Get admin applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

router.put('/applications/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, adminNotes } = req.body;

        if (!status || !VALID_APPLICATION_STATUSES.includes(status)) {
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
            [status, status === 'rejected' ? rejectionReason : null, adminNotes || null, id]
        );

        const rows = await query<any>(
            `SELECT ja.user_id, ja.job_post_id, u.push_token, u.full_name,
              jp.brand, jp.role_required
       FROM job_applications ja
       JOIN users u ON ja.user_id = u.id
       JOIN job_posts jp ON ja.job_post_id = jp.id
       WHERE ja.id = $1`,
            [id]
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
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

router.put('/applications/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;
        await query(
            `UPDATE job_applications SET admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [adminNotes || '', id]
        );
        res.json({ success: true, message: 'Notes saved' });
    } catch (error) {
        console.error('Update notes error:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

router.get('/card-orders', async (req, res) => {
    try {
        const result = await query<any>(
            `SELECT id, full_name, phone_number, role, city, state, pincode, 
                    vehicle_category, training_role, verification_status, updated_at,
                    COALESCE(card_fulfillment_status, 'ordered') as card_fulfillment_status
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

router.put('/card-orders/:userId/fulfillment', async (req, res) => {
    try {
        const { userId } = req.params;
        const { fulfillmentStatus } = req.body;
        const allowed = ['ordered', 'fulfilled', 'shipped'];
        if (!allowed.includes(fulfillmentStatus)) {
            return res.status(400).json({ error: `Use one of: ${allowed.join(', ')}` });
        }

        await query(
            `UPDATE users SET card_fulfillment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [fulfillmentStatus, userId]
        );

        try {
            const user = await query<any>(`SELECT push_token, full_name FROM users WHERE id = $1`, [userId]);
            if (user.length > 0 && user[0].push_token) {
                const titles: Record<string, string> = {
                    fulfilled: 'ID Card Ready 📇',
                    shipped: 'ID Card Shipped 🚚',
                    ordered: 'ID Card Order Received',
                };
                await sendPushNotification(
                    user[0].push_token,
                    titles[fulfillmentStatus] || 'ID Card Update',
                    `Hi ${user[0].full_name}, your EVerified ID card status: ${fulfillmentStatus}.`,
                    { screen: 'IDCard' }
                );
            }
        } catch (e) {
            console.error('Card fulfillment notification error:', e);
        }

        res.json({ success: true, message: 'Card fulfillment status updated' });
    } catch (error) {
        console.error('Card fulfillment error:', error);
        res.status(500).json({ error: 'Failed to update card fulfillment' });
    }
});

export default router;
