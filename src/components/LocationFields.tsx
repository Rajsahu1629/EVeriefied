import React, { useEffect, useMemo, useRef } from 'react';
import { MapPin } from 'lucide-react-native';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { colors } from '../lib/theme';
import {
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
        cityPlaceholder?: string;
    };
}

export function LocationFields({
    values,
    onChange,
    errors = {},
    labels,
}: LocationFieldsProps) {
    const stateOptions = useMemo(() => getStateOptions(), []);
    const pincodeLookupRef = useRef<string>('');

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
            const nextCity = resolveCityInState(nextState, resolved.city) || resolved.city.trim();

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
                onValueChange={(v) => onChange('state', v)}
                error={errors.state}
            />

            <Input
                label={labels.city}
                placeholder={labels.cityPlaceholder || 'Enter city or home address'}
                value={values.city}
                onChangeText={(v) => onChange('city', v)}
                error={errors.city}
                autoCapitalize="words"
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
