export const SUPPORT_EMAIL = 'support@webnza.com';
export const SUPPORT_PHONE = '+919654698878';
export const WHATSAPP_NUMBER = '919654698878';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{6,15}$/;
export const DEFAULT_COUNTRY_CODE = '91';
export const PASSWORD_MIN_LENGTH = 6;
export const PHONE_MAX_LENGTH = 10;
export const OTP_LENGTH = 6;

export const EMOJIS = ['😀', '😂', '❤️', '👍', '😍', '🙏', '🎉', '😊'];
export const MAX_PHOTOS = 6;

export const ABOUT_PARTNER_MAX = 500;
// ─── Range Bounds ─────────────────────────────────────────────────────────────
export const AGE_RANGE = { min: 18, max: 70 } as const;
export const HEIGHT_RANGE = { min: 140, max: 220 } as const;
export const INCOME_RANGE = { min: 0, max: 10000000 } as const;
export const INCOME_STEP = 50000 as const;
export const MATCH_SCORE_RANGE = { min: 0, max: 100 } as const;

// ─── Weight Bounds ────────────────────────────────────────────────────────────
export const WEIGHT_MIN = 0 as const;
export const WEIGHT_MAX = 30 as const;

// ─── Weight Labels ────────────────────────────────────────────────────────────
export const WEIGHT_KEYS = [
  'age',
  'height',
  'religion',
  'caste',
  'location',
  'education',
  'occupation',
  'lifestyle',
  'horoscope',
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
  'Traveling',
  'Cooking',
  'Sports',
  'Music',
  'Gardening',
  'Photography',
  'Dancing',
  'Painting',
  'Hiking',
  'Gaming',
  'Yoga',
  'Fishing',
  'Crafting',
  'Collecting',
  'Writing',
  'Volunteering',
  'Meditation',
  'Cycling',
  'Bird Watching',
];

export const INTERESTS = [
  'Technology',
  'Art',
  'Science',
  'History',
  'Nature',
  'Culture',
  'Food',
  'Fashion',
  'Fitness',
  'Movies',
  'Theater',
  'Travel',
  'Music',
  'Sports',
  'Photography',
  'Literature',
  'Gaming',
  'Politics',
  'Environment',
  'Health',
];

export const PROFESSIONS = [
  'Engineer',
  'Doctor',
  'Teacher',
  'Artist',
  'Scientist',
  'Lawyer',
  'Nurse',
  'Architect',
  'Chef',
  'Writer',
  'Musician',
  'Photographer',
  'Entrepreneur',
  'Designer',
  'Accountant',
  'Consultant',
  'Researcher',
  'Pharmacist',
  'Journalist',
  'Pilot',
  'Social Worker',
  'Therapist',
  'Developer',
  'Marketer',
  'Salesperson',
  'HR Manager',
  'Financial Analyst',
  'Project Manager',
  'Data Analyst',
  'UX/UI Designer',
  'Content Creator',
  'Digital Marketer',
  'Product Manager',
  'Business Analyst',
  'Customer Support',
  'Operations Manager',
  'Supply Chain Manager',
  'Quality Assurance',
  'Legal Advisor',
  'Event Planner',
  'Real Estate Agent',
  'Fitness Trainer',
  'Nutritionist',
  'Veterinarian',
  'Translator',
  'Interpreter',
  'Librarian',
  'Archivist',
  'Curator',
  'Animator',
  'Game Developer',
  'Film Director',
  'Actor/Actress',
  'Comedian',
  'Dancer/Choreographer',
  'Musician/Singer',
  'Writer/Author',
  'Poet',
  'Journalist/Reporter',
  'Photographer/Videographer',
  'Artist/Painter',
  'Sculptor',
  'Graphic Designer',
  'Fashion Designer',
  'Interior Designer',
  'Architect/Urban Planner',
  'Chef/Baker',
  'Food Critic',
  'Nutritionist/Dietitian',
  'Fitness Trainer/Coach',
  'Yoga Instructor',
  'Other',
];

export const GOALS = [
  'Long-term Relationship',
  'Short-term Relationship',
  'Friendship',
  'Networking',
  'Casual Dating',
  'Marriage',
  'Companionship',
  'Activity Partner',
  'Travel Buddy',
  'Shared Interests',
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
