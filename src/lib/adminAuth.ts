import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ADMIN_TOKEN_KEY = 'everified_admin_token';

/** In-memory cache so the token is available immediately after login (before AsyncStorage resolves). */
let memoryToken: string | null = null;

function webStorage(): Storage | null {
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        return (globalThis as typeof globalThis & { localStorage: Storage }).localStorage;
    }
    return null;
}

export async function setAdminToken(token: string): Promise<void> {
    memoryToken = token;
    const ls = webStorage();
    if (ls) {
        ls.setItem(ADMIN_TOKEN_KEY, token);
    }
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export async function getAdminToken(): Promise<string | null> {
    if (memoryToken) {
        return memoryToken;
    }
    const ls = webStorage();
    if (ls) {
        const fromWeb = ls.getItem(ADMIN_TOKEN_KEY);
        if (fromWeb) {
            memoryToken = fromWeb;
            return fromWeb;
        }
    }
    const fromAsync = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
    if (fromAsync) {
        memoryToken = fromAsync;
    }
    return fromAsync;
}

/** Hydrate memory cache from persistent storage (call on AdminDashboard mount). */
export async function hydrateAdminToken(): Promise<string | null> {
    memoryToken = null;
    return getAdminToken();
}

export async function clearAdminToken(): Promise<void> {
    memoryToken = null;
    const ls = webStorage();
    if (ls) {
        ls.removeItem(ADMIN_TOKEN_KEY);
    }
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminUnauthorizedError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('Unauthorized admin');
}
