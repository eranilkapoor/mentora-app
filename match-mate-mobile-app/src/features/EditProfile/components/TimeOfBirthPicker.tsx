import React from 'react';
import { View, Text } from 'react-native';
import { SelectPill } from './SelectPill';

interface Props {
    value?: {
        hour?: number;
        minute?: number;
        period?: 'AM' | 'PM';
    };
    onChange: (val: any) => void;
}

export const TimeOfBirthPicker = ({ value, onChange }: Props) => {
    return (
        <View>
            <Text style={{ marginBottom: 6 }}>Time of Birth</Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                    <SelectPill
                        label="Hour"
                        options={Array.from({ length: 12 }, (_, i) => `${i + 1}`)}
                        value={value?.hour ? `${value.hour}` : undefined}
                        onChange={(v) => onChange({ ...value, hour: Number(v) })}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <SelectPill
                        label="Minute"
                        options={Array.from({ length: 12 }, (_, i) =>
                            `${i * 5}`.padStart(2, '0')
                        )}
                        value={
                            value?.minute !== undefined
                                ? String(value.minute).padStart(2, '0')
                                : undefined
                        }
                        onChange={(v) => onChange({ ...value, minute: Number(v) })}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <SelectPill
                        label="AM/PM"
                        options={['AM', 'PM']}
                        value={value?.period}
                        onChange={(v) => onChange({ ...value, period: v as 'AM' | 'PM' })}
                    />
                </View>
            </View>
        </View>
    );
};