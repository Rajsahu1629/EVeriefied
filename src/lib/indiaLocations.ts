/** Indian states and major cities for dropdowns (consistent spelling). */

export const INDIAN_STATES: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
];

export const CITIES_BY_STATE: Record<string, string[]> = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
    'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Rohtak'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Davangere', 'Bellary'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Ratlam'],
    'Maharashtra': [
        'Mumbai',
        'Pune',
        'Nagpur',
        'Thane',
        'Nashik',
        'Aurangabad',
        'Solapur',
        'Kolhapur',
        'Amravati',
        'Navi Mumbai',
        'Borivali',
        'Andheri',
        'Vasai',
        'Kalyan',
    ],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
    'Mizoram': ['Aizawl', 'Lunglei'],
    'Nagaland': ['Kohima', 'Dimapur'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar'],
    'Sikkim': ['Gangtok', 'Namchi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'Tripura': ['Agartala', 'Udaipur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Noida', 'Meerut', 'Prayagraj'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
    'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman'],
};

export function getStateOptions() {
    return INDIAN_STATES.map((state) => ({ label: state, value: state }));
}

export function getCityOptions(state: string, currentCity?: string) {
    const cities = CITIES_BY_STATE[state] || [];
    const options = cities.map((city) => ({ label: city, value: city }));
    const trimmed = currentCity?.trim();
    if (trimmed) {
        const exists = options.some(
            (o) => o.value.toLowerCase() === trimmed.toLowerCase()
        );
        if (!exists) {
            const resolved = resolveCityInState(state, trimmed);
            if (!options.some((o) => o.value === resolved)) {
                options.unshift({ label: resolved, value: resolved });
            }
        }
    }
    return options;
}

export interface PincodeLookupResult {
    state: string;
    city: string;
}

/**
 * Try to resolve city/state from Indian pincode.
 * Uses public postal API, returns null if unavailable.
 */
export async function lookupLocationByPincode(
    pincode: string
): Promise<PincodeLookupResult | null> {
    const pin = normalizePincode(pincode);
    if (!/^\d{6}$/.test(pin)) {
        return null;
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = (await response.json()) as Array<{
            Status?: string;
            PostOffice?: Array<{ State?: string; District?: string; Division?: string }>;
        }>;
        const first = data?.[0];
        if (!first || first.Status !== 'Success' || !first.PostOffice?.length) {
            return null;
        }

        const postOffice = first.PostOffice[0];
        const state = String(postOffice.State || '').trim();
        const district = String(postOffice.District || postOffice.Division || '').trim();
        if (!state || !district) {
            return null;
        }
        return { state, city: district };
    } catch {
        return null;
    }
}

/**
 * Fetch state cities from API; fallback to local list if API fails/empty.
 */
export async function getCitiesByStateWithApi(
    state: string,
    currentCity?: string
): Promise<Array<{ label: string; value: string }>> {
    const trimmed = state.trim();
    if (!trimmed) {
        return [];
    }

    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: 'India', state: trimmed }),
        });
        const data = (await response.json()) as {
            error?: boolean;
            data?: string[];
        };
        if (!data.error && Array.isArray(data.data) && data.data.length > 0) {
            const apiOptions = data.data
                .filter((c) => Boolean(c?.trim()))
                .map((city) => ({ label: city.trim(), value: city.trim() }));
            if (currentCity?.trim()) {
                const exists = apiOptions.some(
                    (o) => o.value.toLowerCase() === currentCity.trim().toLowerCase()
                );
                if (!exists) {
                    apiOptions.unshift({ label: currentCity.trim(), value: currentCity.trim() });
                }
            }
            return apiOptions;
        }
    } catch {
        // fall back below
    }

    return getCityOptions(trimmed, currentCity);
}

/** Match stored city to dropdown spelling (e.g. nagpur → Nagpur). */
export function resolveCityInState(state: string, city: string): string {
    if (!state?.trim() || !city?.trim()) {
        return city?.trim() || '';
    }
    const found = CITIES_BY_STATE[state]?.find(
        (c) => c.toLowerCase() === city.trim().toLowerCase()
    );
    return found ?? city.trim();
}

export function normalizePincode(pincode: string): string {
    return pincode.replace(/\D/g, '').slice(0, 6);
}

export function isValidPincode(pincode: string): boolean {
    return /^\d{6}$/.test(normalizePincode(pincode));
}

export function validateLocationFields(
    state: string,
    city: string,
    pincode: string,
    messages: { required: string; invalidPincode: string }
): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!state?.trim()) {
        errors.state = messages.required;
    }
    if (!city?.trim()) {
        errors.city = messages.required;
    }
    const pin = normalizePincode(pincode || '');
    if (!pin) {
        errors.pincode = messages.required;
    } else if (!/^\d{6}$/.test(pin)) {
        errors.pincode = messages.invalidPincode;
    }
    return errors;
}
