import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ActionSelectionScreen from '../screens/ActionSelectionScreen';
import VerificationFormScreen from '../screens/VerificationFormScreen';
import LoginScreen from '../screens/LoginScreen';
import SuccessScreen from '../screens/SuccessScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import SkillVerificationScreen from '../screens/SkillVerificationScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

// Recruiter Screens
import RecruiterActionScreen from '../screens/RecruiterActionScreen';
import RecruiterRegistrationScreen from '../screens/RecruiterRegistrationScreen';
import RecruiterLoginScreen from '../screens/RecruiterLoginScreen';
import RecruiterDashboardScreen from '../screens/RecruiterDashboardScreen';
import PostJobScreen from '../screens/PostJobScreen';
import PreviousJobsScreen from '../screens/PreviousJobsScreen';
import AdminJobApprovalScreen from '../screens/AdminJobApprovalScreen';
import CandidateSearchScreen from '../screens/CandidateSearchScreen';
import AdminVerificationRecheckScreen from '../screens/AdminVerificationRecheckScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import JobApplicantsScreen from '../screens/JobApplicantsScreen';

// Navigators
import UserTabNavigator from './UserTabNavigator';

export type RootStackParamList = {
    LanguageSelection: undefined;
    RoleSelection: undefined;
    ActionSelection: undefined;
    VerificationForm: undefined;
    Login: undefined;
    Success: undefined;
    UserDashboard: undefined;
    SkillVerification: { step?: number };

    // Recruiter
    RecruiterAction: undefined;
    RecruiterRegistration: undefined;
    RecruiterLogin: undefined;
    RecruiterDashboard: undefined;
    PostJob: undefined;
    PreviousJobs: undefined;
    AdminJobApproval: undefined;
    CandidateSearch: undefined;
    AdminVerificationRecheck: undefined;
    AdminDashboard: undefined;
    JobApplicants: { jobId: number; jobTitle: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="LanguageSelection"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="ActionSelection" component={ActionSelectionScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="RecruiterLogin" component={RecruiterLoginScreen} />

                <Stack.Screen name="RecruiterAction" component={RecruiterActionScreen} />

                <Stack.Screen name="VerificationForm" component={VerificationFormScreen} />
                <Stack.Screen name="RecruiterRegistration" component={RecruiterRegistrationScreen} />
                <Stack.Screen name="Success" component={SuccessScreen} />

                {/* Replaced UserDashboard with Tab Navigator */}
                <Stack.Screen
                    name="UserDashboard"
                    component={UserTabNavigator}
                    options={{
                        gestureEnabled: false,
                        headerLeft: () => null,
                    }}
                />

                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                <Stack.Screen name="RecruiterDashboard" component={RecruiterDashboardScreen} />
                <Stack.Screen name="PostJob" component={PostJobScreen} />
                <Stack.Screen name="PreviousJobs" component={PreviousJobsScreen} />
                <Stack.Screen name="SkillVerification" component={SkillVerificationScreen} />
                <Stack.Screen name="AdminJobApproval" component={AdminJobApprovalScreen} />
                <Stack.Screen name="CandidateSearch" component={CandidateSearchScreen} />
                <Stack.Screen name="AdminVerificationRecheck" component={AdminVerificationRecheckScreen} />
                <Stack.Screen name="JobApplicants" component={JobApplicantsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
