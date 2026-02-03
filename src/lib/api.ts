/**
 * API Client for EVeerified Backend
 * This replaces direct database calls with API requests
 */

// For development, use localhost. For production, update this URL.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

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
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
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
    phoneNumber: string;
    password: string;
}) {
    return request<{ success: boolean; recruiter: any }>('/recruiters', {
        method: 'POST',
        body: JSON.stringify(recruiterData),
    });
}

// ============ JOBS ============

export async function getApprovedJobs() {
    return request<any[]>('/jobs');
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

export async function getPendingJobs() {
    return request<any[]>('/admin/jobs/pending');
}

export async function approveJob(jobId: number) {
    return request<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/approve`, {
        method: 'PUT',
    });
}

export async function rejectJob(jobId: number) {
    return request<{ success: boolean; message: string }>(`/admin/jobs/${jobId}/reject`, {
        method: 'PUT',
    });
}

export async function getPendingUserVerifications() {
    return request<any[]>('/admin/users/pending');
}

export async function verifyUser(userId: number, status: 'verified' | 'rejected') {
    return request<{ success: boolean; message: string }>(`/admin/users/${userId}/verify`, {
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

    return request<any[]>(`/admin/candidates/search?${params.toString()}`);
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
    return request<{
        pendingJobs: number;
        totalCandidates: number;
        verifiedCandidates: number;
        totalRecruiters: number;
    }>('/admin/stats');
}

export async function getPlatformStats() {
    return request<{
        totalUsers: number;
        verifiedUsers: number;
        totalRecruiters: number;
    }>('/stats/platform');
}

// ============ ADMIN VERIFICATION ============

export async function getPendingVerificationUsers() {
    return request<any[]>('/admin/users/pending-verification');
}

export async function verifyUserByAdmin(userId: string) {
    return request<{ success: boolean; message: string }>(`/admin/users/${userId}/admin-verify`, {
        method: 'PUT',
    });
}
