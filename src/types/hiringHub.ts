export interface HiringJob {
    id: number;
    brand: string;
    role_required: string;
    city: string;
    is_active: boolean;
    vacancies_filled: boolean;
    number_of_people: number;
    hired_count: number;
    application_count: number;
    needs_review: number;
    status_counts: Record<string, number>;
}

export interface HiringCompany {
    recruiter_id: number;
    company_name: string;
    recruiter_phone: string;
    job_count: number;
    active_job_count: number;
    total_applications: number;
    needs_review: number;
    jobs: HiringJob[];
}
