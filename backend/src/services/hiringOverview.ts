import { query } from '../db';

export async function buildHiringCompanies(recruiterId?: number) {
    const params: number[] = [];
    let recruiterFilter = '';
    if (recruiterId != null) {
        recruiterFilter = ' AND jp.recruiter_id = $1';
        params.push(recruiterId);
    }

    const jobs = await query<any>(
        `SELECT jp.id,
              jp.recruiter_id,
              jp.brand,
              jp.role_required,
              jp.city,
              jp.is_active,
              jp.vacancies_filled,
              jp.number_of_people,
              r.company_name,
              r.phone_number AS recruiter_phone,
              (SELECT COUNT(*)::int FROM job_applications ja WHERE ja.job_post_id = jp.id AND ja.status = 'hired') AS hired_count,
              (SELECT COUNT(*)::int FROM job_applications ja WHERE ja.job_post_id = jp.id) AS application_count,
              (SELECT COUNT(*)::int FROM job_applications ja WHERE ja.job_post_id = jp.id AND ja.status IN ('applied', 'viewed')) AS needs_review
       FROM job_posts jp
       JOIN recruiters r ON jp.recruiter_id = r.id
       WHERE jp.status = 'approved'${recruiterFilter}
       ORDER BY application_count DESC, jp.created_at DESC`,
        params
    );

    const statusRows = await query<{ job_post_id: number; status: string; count: number }>(
        recruiterId != null
            ? `SELECT ja.job_post_id, ja.status, COUNT(*)::int AS count
         FROM job_applications ja
         JOIN job_posts jp ON ja.job_post_id = jp.id
         WHERE jp.recruiter_id = $1
         GROUP BY ja.job_post_id, ja.status`
            : `SELECT job_post_id, status, COUNT(*)::int AS count
         FROM job_applications
         GROUP BY job_post_id, status`,
        recruiterId != null ? [recruiterId] : []
    );

    const statusByJob = new Map<number, Record<string, number>>();
    for (const row of statusRows) {
        if (!statusByJob.has(row.job_post_id)) {
            statusByJob.set(row.job_post_id, {});
        }
        statusByJob.get(row.job_post_id)![row.status] = row.count;
    }

    const companyMap = new Map<
        number,
        {
            recruiter_id: number;
            company_name: string;
            recruiter_phone: string;
            job_count: number;
            active_job_count: number;
            total_applications: number;
            needs_review: number;
            jobs: any[];
        }
    >();

    for (const job of jobs) {
        const rid = job.recruiter_id;
        if (!companyMap.has(rid)) {
            companyMap.set(rid, {
                recruiter_id: rid,
                company_name: job.company_name,
                recruiter_phone: job.recruiter_phone,
                job_count: 0,
                active_job_count: 0,
                total_applications: 0,
                needs_review: 0,
                jobs: [],
            });
        }
        const company = companyMap.get(rid)!;
        company.job_count += 1;
        if (job.is_active && !job.vacancies_filled) {
            company.active_job_count += 1;
        }
        company.total_applications += job.application_count || 0;
        company.needs_review += job.needs_review || 0;
        company.jobs.push({
            id: job.id,
            brand: job.brand,
            role_required: job.role_required,
            city: job.city,
            is_active: job.is_active,
            vacancies_filled: job.vacancies_filled,
            number_of_people: job.number_of_people,
            hired_count: job.hired_count,
            application_count: job.application_count,
            needs_review: job.needs_review,
            status_counts: statusByJob.get(job.id) || {},
        });
    }

    return Array.from(companyMap.values()).sort(
        (a, b) => b.needs_review - a.needs_review || b.total_applications - a.total_applications
    );
}
