import { EMAIL_REGEX, PHONE_REGEX, PASSWORD_MIN_LENGTH } from './constants';

import { isEmpty, minLength } from './commonValidators';

// Email
export const validateEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value.trim());
};

// Phone
export const validatePhone = (value: string): boolean => {
  return PHONE_REGEX.test(value);
};

// Password
export const validatePassword = (value: string): boolean => {
  return minLength(value, PASSWORD_MIN_LENGTH);
};

// Login Form Validation
export const validateLogin = (data: { email: string; password: string }) => {
  const errors: Record<string, string> = {};

  if (!validateEmail(data.email)) {
    errors.email = 'Invalid email';
  }

  if (!validatePassword(data.password)) {
    errors.password = 'Password too short';
  }

  return errors;
};

// Register Form Validation
export const validateRegister = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const errors: Record<string, string> = {};

  if (isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Invalid email';
  }

  if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (!validatePassword(data.password)) {
    errors.password = 'Password too weak';
  }

  return errors;
};
