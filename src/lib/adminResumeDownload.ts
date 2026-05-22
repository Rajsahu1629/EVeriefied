import { Alert, Platform } from 'react-native';
import { getAdminUserProfile } from './api';
import {
    generateAndShareResumePdf,
    mapApiProfileToUserData,
    resolveResumeRoleTitle,
    ADMIN_RESUME_LABELS,
} from './resumePdf';

export async function downloadAdminEmployeeResume(
    userId: string | number,
    options?: { jobRoleRequired?: string; applicantName?: string }
): Promise<void> {
    const profile = await getAdminUserProfile(userId);
    const user = mapApiProfileToUserData(profile);
    const roleTitle = resolveResumeRoleTitle(user, options?.jobRoleRequired);

    await generateAndShareResumePdf({
        user,
        roleTitle,
        labels: ADMIN_RESUME_LABELS,
    });

    if (Platform.OS === 'web') {
        Alert.alert(
            'Download resume',
            options?.applicantName
                ? `Use your browser print dialog to save ${options.applicantName}'s resume as PDF (Portrait).`
                : 'Use your browser print dialog to save as PDF (Portrait).'
        );
    }
}
