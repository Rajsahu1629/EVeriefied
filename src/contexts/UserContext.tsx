import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'technician' | 'sales' | 'workshop' | 'aspirant';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'step1_completed' | 'step2_pending' | 'verified' | 'failed';
export type EntityType = 'dealer' | 'fleet' | 'oem' | 'workshop';

export interface UserData {
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
    role: UserRole;
    verificationStatus: VerificationStatus;
    verificationStep?: number;
    quizScore?: number;
    totalQuestions?: number;
    lastQuizAttempt?: string;
}

export interface RecruiterData {
    id: string;
    companyName: string;
    entityType: EntityType;
    phoneNumber: string;
}

interface UserContextType {
    selectedRole: UserRole | 'recruiter' | null;
    setSelectedRole: (role: UserRole | 'recruiter' | null) => void;
    userData: UserData | null;
    setUserData: (data: UserData | null) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    logout: () => void;
    isLoading: boolean;
    recruiterData: RecruiterData | null;
    setRecruiterData: (data: RecruiterData | null) => void;
    isRecruiterLoggedIn: boolean;
    setIsRecruiterLoggedIn: (value: boolean) => void;
    logoutRecruiter: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// AsyncStorage keys
const USER_DATA_KEY = 'everified_user_data';
const IS_LOGGED_IN_KEY = 'everified_is_logged_in';
const RECRUITER_DATA_KEY = 'everified_recruiter_data';
const IS_RECRUITER_LOGGED_IN_KEY = 'everified_is_recruiter_logged_in';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole | 'recruiter' | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [recruiterData, setRecruiterData] = useState<RecruiterData | null>(null);
    const [isRecruiterLoggedIn, setIsRecruiterLoggedIn] = useState(false);

    // Load data from AsyncStorage on mount
    useEffect(() => {
        const loadStoredData = async () => {
            try {
                // Load user data
                const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
                const storedIsLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);

                if (storedUserData && storedIsLoggedIn === 'true') {
                    const parsedUser = JSON.parse(storedUserData) as UserData;
                    setUserData(parsedUser);
                    setSelectedRole(parsedUser.role);
                    setIsLoggedIn(true);
                }

                // Load recruiter data
                const storedRecruiterData = await AsyncStorage.getItem(RECRUITER_DATA_KEY);
                const storedIsRecruiterLoggedIn = await AsyncStorage.getItem(IS_RECRUITER_LOGGED_IN_KEY);

                if (storedRecruiterData && storedIsRecruiterLoggedIn === 'true') {
                    const parsedRecruiter = JSON.parse(storedRecruiterData) as RecruiterData;
                    setRecruiterData(parsedRecruiter);
                    setSelectedRole('recruiter');
                    setIsRecruiterLoggedIn(true);
                }
            } catch (e) {
                console.error('Failed to load stored data:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    // Persist user data when it changes
    useEffect(() => {
        const persistUserData = async () => {
            if (userData && isLoggedIn) {
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
                await AsyncStorage.setItem(IS_LOGGED_IN_KEY, 'true');
            }
        };
        persistUserData();
    }, [userData, isLoggedIn]);

    // Persist recruiter data when it changes
    useEffect(() => {
        const persistRecruiterData = async () => {
            if (recruiterData && isRecruiterLoggedIn) {
                await AsyncStorage.setItem(RECRUITER_DATA_KEY, JSON.stringify(recruiterData));
                await AsyncStorage.setItem(IS_RECRUITER_LOGGED_IN_KEY, 'true');
            }
        };
        persistRecruiterData();
    }, [recruiterData, isRecruiterLoggedIn]);

    const logout = async () => {
        setUserData(null);
        setIsLoggedIn(false);
        setSelectedRole(null);
        await AsyncStorage.removeItem(USER_DATA_KEY);
        await AsyncStorage.removeItem(IS_LOGGED_IN_KEY);
    };

    const logoutRecruiter = async () => {
        setRecruiterData(null);
        setIsRecruiterLoggedIn(false);
        setSelectedRole(null);
        await AsyncStorage.removeItem(RECRUITER_DATA_KEY);
        await AsyncStorage.removeItem(IS_RECRUITER_LOGGED_IN_KEY);
    };

    return (
        <UserContext.Provider
            value={{
                selectedRole,
                setSelectedRole,
                userData,
                setUserData,
                isLoggedIn,
                setIsLoggedIn,
                logout,
                isLoading,
                recruiterData,
                setRecruiterData,
                isRecruiterLoggedIn,
                setIsRecruiterLoggedIn,
                logoutRecruiter,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
