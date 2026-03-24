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

export const cmToFeetInches = (cm: number): string => {
  if (!cm) return '';

  const inchesTotal = cm / 2.54;
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

export const formatWeight = (weight: number): string => {
  if (!weight) return '';
  return `${weight} kg`;
};

export const annualIncomeFormat = (income: number): string => {
  if (!income) return '';
  if (income >= 10000000) {
    return `₹${(income / 10000000).toFixed(1)} Cr`;
  } else if (income >= 100000) {
    return `₹${(income / 100000).toFixed(1)} L`;
  } else {
    return `₹${income}`;
  }
};

export const formatAboutMe = (aboutMe: string): string => {
  if (!aboutMe || aboutMe.trim() === '') {
    return 'I am a calm and positive person who believes in mutual respect and family values. Looking for a compatible life partner.';
  }
  return aboutMe;
};
