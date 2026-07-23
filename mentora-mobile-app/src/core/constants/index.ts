export const SUPPORT_EMAIL = 'support@webnza.com';
export const SUPPORT_PHONE = '+919654698878';
export const WHATSAPP_NUMBER = '919654698878';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{6,15}$/;
export const DEFAULT_COUNTRY_CODE = '91';
export const PASSWORD_MIN_LENGTH = 12;
export const PHONE_MAX_LENGTH = 10;
export const OTP_LENGTH = 6;

export const EMOJIS = ['😀', '😂', '❤️', '👍', '😍', '🙏', '🎉', '😊'];
export const MAX_PHOTOS = 6;

export const LEARNING_NOTES_MAX = 500;

export {
  EMPTY_DISPLAY_VALUE,
  FALLBACK_PROFILE_PHOTO,
  NEW_PROFILE_THRESHOLD_MS,
  ONLINE_THRESHOLD_MS,
  PROFILE_FEED_PAGE_SIZE,
} from './profileDisplay';
// ─── Range Bounds ─────────────────────────────────────────────────────────────
export const STUDENT_AGE_RANGE = { min: 5, max: 100 } as const;
export const GRADE_RANGE = { min: 1, max: 12 } as const;
export const SCORE_RANGE = { min: 0, max: 100 } as const;
export const LEARNING_PROGRESS_RANGE = { min: 0, max: 100 } as const;

// ─── Weight Bounds ────────────────────────────────────────────────────────────
export const WEIGHT_MIN = 0 as const;
export const WEIGHT_MAX = 30 as const;

// ─── Weight Labels ────────────────────────────────────────────────────────────
export const WEIGHT_KEYS = [
  'age',
  'grade',
  'subject',
  'goal',
  'location',
  'academicLevel',
  'schedule',
  'progress',
  'accessibility',
] as const;

export type WeightKey = (typeof WEIGHT_KEYS)[number];

export const COUNTRY_CODES = [
  '1',
  '44',
  '91',
  '86',
  '81',
  '33',
  '39',
  '34',
  '49',
];

export const HOBBIES = [
  'Reading',
  'Robotics',
  'Coding',
  'Sports',
  'Music',
  'Science Projects',
  'Math Puzzles',
  'Creative Writing',
  'Drawing',
  'Debate',
  'Quiz',
  'Chess',
  'Languages',
  'Writing',
  'Public Speaking',
];

export const INTERESTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Accountancy',
  'Writing',
  'Reading Comprehension',
  'Exam Preparation',
  'Olympiad Practice',
  'Coding',
  'Communication Skills',
  'Project Learning',
];

export const GOALS = [
  'Improve Concepts',
  'Prepare for Exams',
  'Finish Homework',
  'Build Study Habit',
  'Revise Weak Topics',
  'Practice Questions',
  'Learn Faster',
  'Improve Confidence',
  'Prepare for Olympiad',
  'Explore Career Skills',
];

export const LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin',
  'Hindi',
  'Arabic',
  'French',
  'German',
  'Russian',
  'Portuguese',
  'Bengali',
  'Japanese',
  'Punjabi',
  'Javanese',
  'Korean',
  'Vietnamese',
  'Italian',
  'Turkish',
  'Tamil',
  'Urdu',
  'Persian',
];

export const COUNTRIES = [
  'United States',
  'India',
  'China',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Brazil',
  'Japan',
  'Russia',
  'South Africa',
  'Italy',
  'Spain',
  'Mexico',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'New Zealand',
  'Singapore',
  'United Arab Emirates',
];

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];
