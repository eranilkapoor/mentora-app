// ==========================================
// PLAN FEATURE MAPPING SEED SCRIPT
// ==========================================

const plans = {
  FREE: db.plans.findOne({ name: 'FREE' }),
  GOLD_MONTHLY: db.plans.findOne({ name: 'GOLD_MONTHLY' }),
  GOLD_QUARTERLY: db.plans.findOne({ name: 'GOLD_QUARTERLY' }),
  GOLD_YEARLY: db.plans.findOne({ name: 'GOLD_YEARLY' }),
  PLATINUM_MONTHLY: db.plans.findOne({ name: 'PLATINUM_MONTHLY' }),
  PLATINUM_QUARTERLY: db.plans.findOne({ name: 'PLATINUM_QUARTERLY' }),
  PLATINUM_YEARLY: db.plans.findOne({ name: 'PLATINUM_YEARLY' }),
};

const features = {};
db.features.find().forEach((f) => {
  features[f.key] = f._id;
});

const mappings = [];

// ==========================================
// HELPER
// ==========================================

function addFeature(plan, featureKey, value = 1) {
  if (!plans[plan] || !features[featureKey]) return;

  mappings.push({
    planId: plans[plan]._id,
    featureId: features[featureKey],
    value,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ==========================================
// 🆓 FREE PLAN
// ==========================================

[
  ['CREATE_PROFILE', 1],
  ['EDIT_PROFILE', 1],
  ['UPLOAD_PHOTOS', 5],
  ['DAILY_LIKES', 10],
  ['SEND_INTEREST', 10],
  ['VIEW_PROFILE_PHOTOS', 1],
  ['BASIC_SEARCH', 1],
  ['BASIC_FILTERS', 1],
  ['MATCH_LIMIT', 20],
  ['DAILY_PROFILE_VIEWS', 25],
  ['CHAT_ACCESS', 1],
  ['MESSAGE_LIMIT', 20],
  ['PROFILE_COMPLETION_SCORE', 1],
  ['PROFILE_VERIFICATION', 1],
  ['PUSH_NOTIFICATIONS', 1],
  ['REPORT_USER', 1],
  ['BLOCK_USERS', 1],
  ['CUSTOMER_SUPPORT_CHAT', 1],
].forEach(([feature, value]) =>
  addFeature('FREE', feature, value)
);

// ==========================================
// 🥇 GOLD FEATURES
// ==========================================

const goldFeatures = [
  ['CREATE_PROFILE', 1],
  ['EDIT_PROFILE', 1],
  ['UPLOAD_PHOTOS', 20],
  ['UPLOAD_VIDEOS', 5],
  ['UNLIMITED_LIKES', -1],
  ['UNLIMITED_CHAT', -1],
  ['SEND_INTEREST', -1],
  ['VIEW_INTERESTS', 1],
  ['ACCEPT_INTEREST', 1],
  ['REJECT_INTEREST', 1],
  ['VIEW_CONTACT', 1],
  ['VIEW_PHONE_NUMBER', 1],
  ['VIEW_EMAIL_ADDRESS', 1],
  ['CHAT_ACCESS', 1],
  ['READ_RECEIPTS', 1],
  ['TYPING_INDICATOR', 1],
  ['SEND_IMAGES_IN_CHAT', 1],
  ['SEND_VOICE_NOTES', 1],
  ['VOICE_CALL', 1],
  ['VIEW_PROFILE_PHOTOS', 1],
  ['VIEW_PRIVATE_PHOTOS', 1],
  ['ADVANCED_SEARCH', 1],
  ['ADVANCED_FILTERS', 1],
  ['UNLIMITED_SEARCH', -1],
  ['UNLIMITED_PROFILE_VIEWS', -1],
  ['WHO_VIEWED_ME', 1],
  ['PROFILE_ANALYTICS', 1],
  ['TOP_IN_SEARCH', 1],
  ['SHOW_ON_HOME', 1],
  ['SMART_MATCHES', 1],
  ['COMPATIBILITY_SCORE', 1],
  ['RELIGION_PREFERENCES', 1],
  ['CASTE_PREFERENCES', 1],
  ['MANGLIK_MATCHING', 1],
  ['FAMILY_DETAILS', 1],
  ['PUSH_NOTIFICATIONS', 1],
  ['EMAIL_NOTIFICATIONS', 1],
  ['AD_FREE_EXPERIENCE', 1],
  ['PROFILE_BOOST', 2],
  ['DAILY_BOOSTS', 1],
  ['PRIORITY_SUPPORT', 1],
  ['REPORT_USER', 1],
  ['BLOCK_USERS', 1],
];

[
  'GOLD_MONTHLY',
  'GOLD_QUARTERLY',
  'GOLD_YEARLY',
].forEach((plan) => {
  goldFeatures.forEach(([feature, value]) =>
    addFeature(plan, feature, value)
  );
});

// ==========================================
// 💎 PLATINUM FEATURES
// ==========================================

const platinumFeatures = [
  ...goldFeatures,

  ['VIDEO_PROFILE', 1],
  ['AUDIO_INTRO', 1],
  ['FEATURED_PROFILE', 1],
  ['PRIVATE_ALBUM', 1],
  ['INCOGNITO_MODE', 1],
  ['ID_VERIFICATION', 1],
  ['VERIFIED_BADGE', 1],
  ['HOROSCOPE_UPLOAD', 1],
  ['KUNDLI_MATCHING', 1],
  ['ASTROLOGY_REPORT', 1],

  ['UNLIMITED_SUPER_LIKES', -1],
  ['SUPER_LIKE', -1],
  ['PRIORITY_INTEREST', 1],
  ['SHORTLIST_PROFILES', -1],
  ['FAVORITE_PROFILES', -1],

  ['CHAT_WITHOUT_MATCH', 1],
  ['PRIORITY_CHAT', 1],
  ['MESSAGE_TRANSLATION', 1],
  ['SEND_VIDEOS_IN_CHAT', 1],
  ['VIDEO_CALL', 1],

  ['DIRECT_CONTACT_ACCESS', 1],

  ['REQUEST_PRIVATE_VIDEOS', 1],
  ['AI_PHOTO_VERIFICATION', 1],
  ['BLURRED_PHOTO_MODE', 1],

  ['GLOBAL_SEARCH', 1],
  ['INTERNATIONAL_MATCHES', 1],
  ['NRI_MATCHING', 1],
  ['SAVED_SEARCHES', 1],
  ['RECENT_SEARCHES', 1],
  ['FEATURED_IN_SEARCH', 1],
  ['PRIORITY_SEARCH_RANKING', 1],

  ['ADVANCED_MATCHING', 1],
  ['AI_RECOMMENDATIONS', 1],
  ['AI_PROFILE_SUMMARY', 1],
  ['AI_PHOTO_SELECTION', 1],
  ['AI_COMPATIBILITY_ANALYSIS', 1],
  ['AI_CONVERSATION_STARTER', 1],
  ['AI_INTEREST_PREDICTION', 1],
  ['AI_FAKE_PROFILE_DETECTION', 1],
  ['PERSONALITY_MATCHING', 1],
  ['INTEREST_MATCHING', 1],
  ['LOCATION_MATCHING', 1],
  ['STRICT_PREFERENCES', 1],
  ['SMART_PREFERENCES', 1],

  ['SUBCASTE_PREFERENCES', 1],
  ['COMMUNITY_BASED_MATCHING', 1],
  ['MARRIAGE_TIMELINE_PREFERENCE', 1],
  ['CHILDREN_PREFERENCE', 1],
  ['EATING_PREFERENCES', 1],
  ['LIFESTYLE_PREFERENCES', 1],

  ['FAMILY_MANAGED_PROFILE', 1],
  ['PARENT_LOGIN', 1],
  ['GUARDIAN_ACCESS', 1],
  ['FAMILY_PREFERENCES', 1],

  ['INTEREST_ANALYTICS', 1],
  ['CHAT_ANALYTICS', 1],
  ['ENGAGEMENT_SCORE', 1],
  ['MATCH_SUCCESS_RATE', 1],
  ['WEEKLY_REPORTS', 1],

  ['SMS_NOTIFICATIONS', 1],
  ['INSTANT_MATCH_ALERTS', 1],
  ['DAILY_MATCH_DIGEST', 1],

  ['LOCATION_BASED_MATCHING', 1],
  ['NEARBY_PROFILES', 1],
  ['TRAVEL_MODE', 1],

  ['VIP_BADGE', 1],
  ['PREMIUM_BADGE', 1],
  ['RELATIONSHIP_MANAGER', 1],
  ['DEDICATED_RELATIONSHIP_MANAGER', 1],
  ['CONCIERGE_MATCHMAKING', 1],
  ['PERSONAL_MATCHMAKER', 1],

  ['WEEKLY_BOOSTS', 7],
  ['MONTHLY_BOOSTS', 30],
  ['UNLIMITED_BOOSTS', -1],
  ['SPOTLIGHT_PROFILE', 1],

  ['PROMO_CODES', 1],
  ['REFERRAL_REWARDS', 1],
  ['REFERRAL_BONUS', 1],
  ['EARN_CREDITS', 1],

  ['SAFE_MODE', 1],
  ['FRAUD_DETECTION', 1],
  ['SPAM_DETECTION', 1],
  ['MANUAL_PROFILE_REVIEW', 1],

  ['SHORTLIST_LIMIT', -1],
  ['CONTACT_VIEW_LIMIT', -1],
  ['MESSAGE_LIMIT', -1],
  ['MATCH_LIMIT', -1],
  ['SWIPE_LIMIT', -1],

  ['UNLIMITED_SWIPES', -1],
  ['STREAK_REWARDS', 1],
  ['DAILY_LOGIN_REWARDS', 1],
  ['MATCH_QUIZ', 1],
  ['COMPATIBILITY_GAMES', 1],

  ['SUPPORT_TICKETS', 1],
  ['ACCOUNT_EXPORT', 1],
  ['DATA_EXPORT', 1],
  ['PRIVACY_CONTROLS', 1],
];

[
  'PLATINUM_MONTHLY',
  'PLATINUM_QUARTERLY',
  'PLATINUM_YEARLY',
].forEach((plan) => {
  platinumFeatures.forEach(([feature, value]) =>
    addFeature(plan, feature, value)
  );
});

// ==========================================
// INSERT
// ==========================================

db.planfeatures.insertMany(mappings);

print(`Inserted ${mappings.length} plan-feature mappings`);