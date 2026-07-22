import {
  validateEmail,
  validateLogin,
  validatePassword,
  validatePhone,
  validateRegister,
} from './authValidators';

describe('authValidators', () => {
  it('validates individual email, phone, and password fields', () => {
    expect(validateEmail(' user@example.com ')).toBe(true);
    expect(validateEmail('broken')).toBe(false);
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('123')).toBe(false);
    expect(validatePassword('Matchmate2026!')).toBe(true);
    expect(validatePassword('short')).toBe(false);
  });

  it('returns login validation errors only for invalid fields', () => {
    expect(validateLogin({ email: 'bad', password: '' })).toEqual({
      email: 'Invalid email',
      password: 'Password is required',
    });
    expect(
      validateLogin({ email: 'valid@example.com', password: 'password' })
    ).toEqual({});
  });

  it('returns register validation errors for missing or weak values', () => {
    expect(
      validateRegister({
        name: '',
        email: 'bad',
        phone: '12',
        password: 'short',
      })
    ).toEqual({
      name: 'Name is required',
      email: 'Invalid email',
      phone: 'Invalid phone number',
      password: 'Password too weak',
    });

    expect(
      validateRegister({
        name: 'Asha',
        email: 'asha@example.com',
        phone: '9876543210',
        password: 'Matchmate2026!',
      })
    ).toEqual({});
  });
});
