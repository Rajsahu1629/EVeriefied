/**
 * API Client for EVeerified Backend
 * This replaces direct database calls with API requests
 */

import { getApiBaseUrl } from './getApiBaseUrl';
import { getAdminToken, setAdminToken, clearAdminToken } from './adminAuth';

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    data?: T;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payloadText = await response.text();
        const data = isJson && payloadText ? JSON.parse(payloadText) : payloadText;

        if (!response.ok) {
            const serverMessage =
                typeof data === 'object' && data && 'error' in data
                    ? String((data as { error?: string }).error || '')
                    : '';
            throw new Error(serverMessage || `Request failed (${response.status}) for ${endpoint}`);
        }

        if (!isJson) {
            throw new Error(`Invalid API response for ${endpoint}. Expected JSON but received ${contentType || 'non-JSON'}.`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ============ AUTH ============

export async function loginUser(phoneNumber: string, password: string) {
    return request<{ success: boolean; user: any }>('/auth/user/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
    });
}

export async function loginRecruiter(phoneNumber: string, password: string) {
    return request<{ success: boolean; recruiter: any }>('/auth/recruiter/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
    });
}

// ============ USERS ============

export async function checkPhoneExists(phoneNumber: string): Promise<boolean> {
    const result = await request<{ exists: boolean }>('/users/check-phone', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
    });
    return result.exists;
}

export async function registerUser(userData: {
    fullName: string;
    phoneNumber: string;
    password: string;
    state: string;
    city: string;
    pincode: string;
    qualification: string;
    experience: string;
    currentWorkshop: string;
    brandWorkshop: string;
    brands: string[];
    role: string;
    priorKnowledge?: string;
    currentSalary?: string;
    domain?: string;
    vehicleCategory?: string;
    trainingRole?: string;
}) {
    return request<{ success: boolean; user: any }>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function getUser(userId: string | number) {
    return request<any>(`/users/${userId}`);
}

export async function updateUser(userId: string | number, userData: any) {
    return request<{ success: boolean; message: string }>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

export async function getCardOrderStatus(userId: string | number) {
    return request<{ cardOrdered: boolean }>(`/users/${userId}/card-order`);
}

export async function updateCardOrderStatus(userId: string | number, cardOrdered: boolean) {
    return request<{ success: boolean }>(`/users/${userId}/card-order`, {
        method: 'PUT',
        body: JSON.stringify({ cardOrdered }),
    });
}

// ============ RECRUITERS ============

export async function checkRecruiterPhoneExists(phoneNumber: string): Promise<boolean> {
    const result = await request<{ exists: boolean }>('/recruiters/check-phone', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
    });
    return result.exists;
}

export async function registerRecruiter(recruiterData: {
    companyName: string;
    entityType: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    phoneNumber: string;
    password: string;
}) {
    return request<{ success: boolean; recruiter: any }>('/recruiters', {
        method: 'POST',
        body: JSON.stringify(recruiterData),
    });
}

// ============ JOBS ============

export async function getApprovedJobs(filters?: { userCity?: string; userPincode?: string }) {
    const params = new URLSearchParams();
    if (filters?.userCity?.trim()) {
        params.append('userCity', filters.userCity.trim());
    }
    if (filters?.userPincode?.trim()) {
        params.append('userPincode', filters.userPincode.trim());
    }
    const qs = params.toString();
    return request<any[]>(`/jobs${qs ? `?${qs}` : ''}`);
}

export async function createJob(recruiterId: number, jobData: {
    brand: string;
    roleRequired: string;
    numberOfPeople: string;
    experience: string;
    salaryMin: number;
    salaryMax: number;
    hasIncentive: boolean;
    pincode: string;
    city: string;
    state: string;
    stayProvided: boolean;
    urgency: string;
    jobDescription?: string;
    vehicleCategory?: string | null;
    trainingRole?: string | null;
}) {
    return request<{ success: boolean; job: any }>('/jobs', {
        method: 'POST',
        body: JSON.stringify({ recruiterId, ...jobData }),
    });
}

export async function updateJob(jobId: number, jobData: any) {
    return request<{ success: boolean; message: string }>(`/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
    });
}

export async function getRecruiterJobs(recruiterId: string | number) {
    return request<any[]>(`/jobs/recruiter/${recruiterId}`);
}

export async function getJobApplicants(jobId: number) {
    return request<any[]>(`/jobs/${jobId}/applicants`);
}

// ============ APPLICATIONS ============

export async function applyToJob(userId: string | number, jobPostId: number) {
    return request<{ success: boolean; message: string }>('/applications', {
        method: 'POST',
        body: JSON.stringify({ userId, jobPostId }),
    });
}

export async function getUserApplications(userId: string | number) {
    return request<any[]>(`/applications/user/${userId}`);
}

export async function getUserAppliedJobIds(userId: string | number) {
    return request<number[]>(`/applications/user/${userId}/ids`);
}

// ============ ADMIN ============

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAdminToken();
    if (!token) {
        throw new Error('Unauthorized admin access — please log in again as admin');
    }
    return request<T>(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function adminLogin(phoneNumber: string, password: string) {
    return request<{ success: boolean; token: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
    });
}

/**
 * Try admin login (recruiter login screen only).
 * Returns true only when credentials match admin — never throws on wrong password.
 */
export async function loginAsAdmin(phoneNumber: string, password: string): Promise<boolean> {
    try {
        const res = await adminLogin(phoneNumber.trim(), password);
        if (res.success && res.token) {
            await setAdminToken(res.token);
            return true;
        }
    } catch {
        // Not admin credentials — caller should continue with user/recruiter login
    }
    await clearAdminToken();
    return false;
}

export async function getPendingJobs() {
    return adminRequest<any[]>('/admin/jobs/pending');
}

export async function approveJob(jobId: number) {
    return adminRequest<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/approve`, {
        method: 'PUT',
    });
}

export async function rejectJob(jobId: number) {
    return adminRequest<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/reject`, {
        method: 'PUT',
    });
}

export async function getAdminActiveJobs() {
    return adminRequest<any[]>('/admin/jobs/active');
}

export async function markJobVacanciesFilled(jobId: number) {
    return adminRequest<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/mark-filled`, {
        method: 'PUT',
    });
}

export async function reactivateJob(jobId: number) {
    return adminRequest<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/reactivate`, {
        method: 'PUT',
    });
}

export async function markJobFilledAsRecruiter(jobId: number, recruiterId: string | number) {
    return request<{ success: boolean; message: string }>(`/jobs/${jobId}/mark-filled`, {
        method: 'PUT',
        body: JSON.stringify({ recruiterId }),
    });
}

export async function getPendingUserVerifications() {
    return adminRequest<any[]>('/admin/users/pending');
}

export async function verifyUser(userId: number, status: 'verified' | 'rejected') {
    return adminRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

export async function searchCandidates(filters: {
    domain?: string;
    vehicleCategory?: string;
    city?: string;
    experience?: string;
    role?: string;
}) {
    const params = new URLSearchParams();
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.vehicleCategory) params.append('vehicleCategory', filters.vehicleCategory);
    if (filters.city) params.append('city', filters.city);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.role) params.append('role', filters.role);

    return adminRequest<any[]>(`/admin/candidates/search?${params.toString()}`);
}

// ============ QUIZ ============

export async function getQuizQuestions(filters: {
    role?: string;
    domain?: string;
    vehicleCategory?: string;
    trainingRole?: string;
}) {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.vehicleCategory) params.append('vehicleCategory', filters.vehicleCategory);
    if (filters.trainingRole) params.append('trainingRole', filters.trainingRole);

    return request<any[]>(`/quiz/questions?${params.toString()}`);
}

export async function submitQuizScore(userId: string | number, score: number) {
    return request<{ success: boolean; message: string }>('/quiz/score', {
        method: 'POST',
        body: JSON.stringify({ userId, score }),
    });
}

export async function getLeaderboard() {
    return request<any[]>('/quiz/leaderboard');
}

// ============ VERIFICATION QUESTIONS ============

export async function getVerificationQuestions(role: string, step: number) {
    return request<any[]>(`/verification/questions?role=${role}&step=${step}`);
}

export async function updateUserVerification(userId: string, data: {
    verificationStatus: string;
    quizScore: number;
    totalQuestions: number;
    verificationStep: number;
}) {
    return request<{ success: boolean; message: string }>(`/users/${userId}/verification`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// ============ STATS ============

export async function getAdminStats() {
    return adminRequest<{
        pendingJobs: number;
        totalCandidates: number;
        verifiedCandidates: number;
        totalRecruiters: number;
        newApplications?: number;
        filledJobs?: number;
    }>('/admin/stats');
}

export async function getAdminAnalytics() {
    return adminRequest<{
        byStatus: { status: string; count: number }[];
        byJob: any[];
        totals: {
            total_applications: number;
            total_hired: number;
            awaiting_review: number;
            conversionRate: number;
        };
    }>('/admin/analytics');
}

export async function getAdminHiringOverview() {
    return adminRequest<{
        companies: {
            recruiter_id: number;
            company_name: string;
            recruiter_phone: string;
            job_count: number;
            active_job_count: number;
            total_applications: number;
            needs_review: number;
            jobs: {
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
            }[];
        }[];
    }>('/admin/hiring/overview');
}

export async function getAdminApplications(filters?: {
    status?: string;
    jobId?: number;
    dateFrom?: string;
    dateTo?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.jobId) params.append('jobId', String(filters.jobId));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const qs = params.toString();
    return adminRequest<any[]>(`/admin/applications${qs ? `?${qs}` : ''}`);
}

export async function updateApplicationStatus(
    applicationId: number,
    data: { status: string; rejectionReason?: string; adminNotes?: string }
) {
    return adminRequest<{ success: boolean; message: string }>(
        `/admin/applications/${applicationId}/status`,
        { method: 'PUT', body: JSON.stringify(data) }
    );
}

export async function updateApplicationNotes(applicationId: number, adminNotes: string) {
    return adminRequest<{ success: boolean; message: string }>(
        `/admin/applications/${applicationId}/notes`,
        { method: 'PUT', body: JSON.stringify({ adminNotes }) }
    );
}

// ============ RECRUITER HIRING HUB ============

export async function getRecruiterHiringOverview(recruiterId: string | number) {
    return request<{
        companies: {
            recruiter_id: number;
            company_name: string;
            recruiter_phone: string;
            job_count: number;
            active_job_count: number;
            total_applications: number;
            needs_review: number;
            jobs: {
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
            }[];
        }[];
    }>(`/jobs/recruiter/${recruiterId}/hiring/overview`);
}

export async function getRecruiterApplications(
    recruiterId: string | number,
    filters?: { status?: string; jobId?: number }
) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.jobId) params.append('jobId', String(filters.jobId));
    const qs = params.toString();
    return request<any[]>(`/jobs/recruiter/${recruiterId}/applications${qs ? `?${qs}` : ''}`);
}

export async function updateRecruiterApplicationStatus(
    recruiterId: string | number,
    applicationId: number,
    data: { status: string; rejectionReason?: string; adminNotes?: string }
) {
    return request<{ success: boolean; message: string }>(
        `/jobs/recruiter/${recruiterId}/applications/${applicationId}/status`,
        { method: 'PUT', body: JSON.stringify(data) }
    );
}

export async function updateRecruiterApplicationNotes(
    recruiterId: string | number,
    applicationId: number,
    adminNotes: string
) {
    return request<{ success: boolean; message: string }>(
        `/jobs/recruiter/${recruiterId}/applications/${applicationId}/notes`,
        { method: 'PUT', body: JSON.stringify({ adminNotes }) }
    );
}

export async function getRecruiterApplicantProfile(recruiterId: string | number, userId: string | number) {
    return request<any>(`/jobs/recruiter/${recruiterId}/users/${userId}/profile`);
}

export async function getPlatformStats() {
    return request<{
        totalUsers: number;
        verifiedUsers: number;
        totalRecruiters: number;
    }>('/stats/platform');
}

// ============ ADMIN CARD ORDERS ============

export async function getAllCardOrders() {
    return adminRequest<any[]>('/admin/card-orders');
}

export async function updateCardFulfillment(userId: string, fulfillmentStatus: 'ordered' | 'fulfilled' | 'shipped') {
    return adminRequest<{ success: boolean; message: string }>(
        `/admin/card-orders/${userId}/fulfillment`,
        { method: 'PUT', body: JSON.stringify({ fulfillmentStatus }) }
    );
}

// ============ PUSH NOTIFICATIONS ============

export async function getPendingVerificationUsers() {
    return adminRequest<any[]>('/admin/users/pending-verification');
}

export async function verifyUserByAdmin(userId: string) {
    return adminRequest<{ success: boolean; message: string }>(`/admin/users/${userId}/admin-verify`, {
        method: 'PUT',
    });
}

export async function getAdminUserProfile(userId: string | number) {
    return adminRequest<{
        id: string;
        fullName: string;
        phoneNumber: string;
        state: string;
        city: string;
        pincode?: string;
        qualification: string;
        experience: string;
        currentWorkshop: string;
        brandWorkshop?: string;
        brands: string[];
        role: string;
        verificationStatus: string;
        domain?: 'EV' | 'BS6';
        vehicle_category?: string;
        training_role?: string;
        is_admin_verified?: boolean;
        current_workshop?: string;
        brand_workshop?: string;
        prior_knowledge?: string;
        current_salary?: string;
    }>(`/admin/users/${userId}`);
}

// ============ PUSH NOTIFICATIONS ============

export async function registerPushToken(
    userId: string | number,
    pushToken: string,
    userType: 'user' | 'recruiter'
) {
    return request<{ success: boolean }>('/notifications/register-token', {
        method: 'POST',
        body: JSON.stringify({ userId, pushToken, userType }),
    });
}

export async function removePushToken(
    userId: string | number,
    userType: 'user' | 'recruiter'
) {
    return request<{ success: boolean }>('/notifications/remove-token', {
        method: 'POST',
        body: JSON.stringify({ userId, userType }),
    });
}

export async function broadcastNotification(
    target: 'users' | 'recruiters' | 'all',
    title: string,
    body: string
) {
    return adminRequest<{ success: boolean; message: string; sent: number; total: number }>(
        '/notifications/broadcast',
        {
            method: 'POST',
            body: JSON.stringify({ target, title, body }),
        }
    );
}
