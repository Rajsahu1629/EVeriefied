import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3001;
const API_PATH = '/api';

/** Metro / Expo Go reports the dev machine IP as debuggerHost (e.g. 192.168.1.69:8081). */
function getLanHostFromExpo(): string | null {
    const debuggerHost =
        Constants.expoGoConfig?.debuggerHost ??
        (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } })?.extra?.expoGo
            ?.debuggerHost;

    if (!debuggerHost) return null;
    return debuggerHost.split(':')[0] ?? null;
}

function isLocalUrl(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Resolves API base URL for web, emulator, and physical device (Expo Go).
 * On a real phone, localhost points to the phone itself — use the PC's LAN IP instead.
 */
export function getApiBaseUrl(): string {
    const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

    if (__DEV__ && Platform.OS !== 'web') {
        if (!fromEnv || isLocalUrl(fromEnv)) {
            const lanHost = getLanHostFromExpo();
            if (lanHost) {
                return `http://${lanHost}:${API_PORT}${API_PATH}`;
            }
        }
    }

    if (fromEnv) return fromEnv;
    return `http://localhost:${API_PORT}${API_PATH}`;
}
