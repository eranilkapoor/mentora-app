export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const getAgeFromDOB = (dob: string | Date): string => {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return `${age} yrs`;
};

export const formatAgeRange = (minAge: number, maxAge: number): string => {
  return `${minAge} yrs - ${maxAge} yrs`;
};

export const cmToFeetInches = (cm: number | string): string => {
  const cmValue = typeof cm === 'string' ? parseFloat(cm) : cm;
  if (!cmValue) return '';

  const inchesTotal = cmValue / 2.54;
  const feet = Math.floor(inchesTotal / 12);
  const inches = Math.round(inchesTotal % 12);

  return `${feet}ft ${inches}in`;
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatMaritalStatus = (status: string): string => {
  if (!status) return '';
  const formatted = status.replace(/_/g, ' ').toLowerCase();
  const words = formatted.split(' ');
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatLifestyleChoice = (choice: string): string => {
  if (!choice) return '';
  const formatted = choice.replace(/_/g, ' ').toLowerCase();
  const words = formatted.split(' ');
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatWeight = (weight: number | string): string => {
  const weightValue = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (!weightValue) return '';
  return `${weightValue} kg`;
};

export const annualIncomeFormat = (income: number | string): string => {
  const incomeValue = typeof income === 'string' ? parseFloat(income) : income;
  if (!incomeValue) return '';
  if (incomeValue >= 10000000) {
    return `₹${(incomeValue / 10000000).toFixed(1)} Cr`;
  } else if (incomeValue >= 100000) {
    return `₹${(incomeValue / 100000).toFixed(1)} L`;
  } else {
    return `₹${incomeValue}`;
  }
};

export const formatAboutMe = (aboutMe: string | undefined): string => {
  if (!aboutMe || aboutMe.trim() === '') {
    return 'I am a calm and positive person who believes in mutual respect and family values. Looking for a compatible life partner.';
  }
  return aboutMe;
};
