import React from 'react';
import { PasswordStrengthHint } from '@/features/Auth/shared/components/PasswordStrengthHint';

export function PasswordStrengthBar({
  password,
}: {
  password: string;
}): React.ReactElement | null {
  return <PasswordStrengthHint password={password} />;
}
