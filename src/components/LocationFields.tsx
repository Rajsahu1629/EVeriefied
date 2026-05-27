import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react-native';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { colors } from '../lib/theme';
import {
    getCitiesByStateWithApi,
    getCityOptions,
    getStateOptions,
    lookupLocationByPincode,
    normalizePincode,
    resolveCityInState,
} from '../lib/indiaLocations';

export interface LocationValues {
    state: string;
    city: string;
    pincode: string;
}

interface LocationFieldsProps {
    values: LocationValues;
    onChange: (field: keyof LocationValues, value: string) => void;
    errors?: Partial<Record<keyof LocationValues, string>>;
    labels: {
        state: string;
        city: string;
        pincode: string;
        selectState: string;
        selectCity: string;
        selectStateFirst?: string;
    };
}

export function LocationFields({
    values,
    onChange,
    errors = {},
    labels,
}: LocationFieldsProps) {
    const stateOptions = useMemo(() => getStateOptions(), []);
    const [cityOptions, setCityOptions] = useState<Array<{ label: string; value: string }>>(
        () => getCityOptions(values.state, values.city)
    );
    const pincodeLookupRef = useRef<string>('');

    const handleStateChange = (state: string) => {
        onChange('state', state);
        const cities = getCityOptions(state).map((c) => c.value);
        if (values.city && !cities.includes(values.city)) {
            onChange('city', '');
        }
    };

    useEffect(() => {
        let cancelled = false;
        const loadCities = async () => {
            const options = await getCitiesByStateWithApi(values.state, values.city);
            if (!cancelled) {
                setCityOptions(options);
            }
        };
        loadCities();
        return () => {
            cancelled = true;
        };
    }, [values.state, values.city]);

    useEffect(() => {
        let cancelled = false;
        const pin = normalizePincode(values.pincode || '');
        if (pin.length !== 6 || pin === pincodeLookupRef.current) {
            return;
        }
        pincodeLookupRef.current = pin;

        const runLookup = async () => {
            const resolved = await lookupLocationByPincode(pin);
            if (!resolved || cancelled) {
                return;
            }

            const nextState = resolved.state.trim();
            const nextCity = resolveCityInState(nextState, resolved.city);

            if (nextState && nextState !== values.state) {
                onChange('state', nextState);
            }
            if (nextCity && nextCity !== values.city) {
                onChange('city', nextCity);
            }
        };
        runLookup();

        return () => {
            cancelled = true;
        };
    }, [values.pincode, values.state, values.city, onChange]);

    return (
        <>
            <Select
                label={labels.state}
                placeholder={labels.selectState}
                options={stateOptions}
                value={values.state}
                onValueChange={handleStateChange}
                error={errors.state}
            />

            <Select
                label={labels.city}
                placeholder={
                    values.state
                        ? labels.selectCity
                        : labels.selectStateFirst || labels.selectState
                }
                options={cityOptions}
                value={values.city}
                onValueChange={(v) => onChange('city', v)}
                error={errors.city}
                disabled={!values.state}
            />

            <Input
                label={labels.pincode}
                placeholder="123456"
                keyboardType="number-pad"
                value={values.pincode}
                onChangeText={(v) => onChange('pincode', normalizePincode(v))}
                error={errors.pincode}
                maxLength={6}
                leftIcon={<MapPin size={20} color={colors.muted} />}
            />
        </>
    );
}
