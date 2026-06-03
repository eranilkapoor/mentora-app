export enum FeatureKey {
  // ==========================================
  //  AUTH & ACCOUNT
  // ==========================================
  EMAIL_REGISTRATION = 'email_registration',
  PHONE_REGISTRATION = 'phone_registration',
  SOCIAL_LOGIN_GOOGLE = 'social_login_google',
  SOCIAL_LOGIN_APPLE = 'social_login_apple',
  SOCIAL_LOGIN_FACEBOOK = 'social_login_facebook',

  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  OTP_LOGIN = 'otp_login',

  TWO_FACTOR_AUTH = 'two_factor_auth',
  DEVICE_MANAGEMENT = 'device_management',
  MULTI_DEVICE_LOGIN = 'multi_device_login',
  SESSION_HISTORY = 'session_history',

  // ==========================================
  //  PROFILE
  // ==========================================
  CREATE_PROFILE = 'create_profile',
  EDIT_PROFILE = 'edit_profile',
  DELETE_PROFILE = 'delete_profile',

  ADVANCED_PROFILE_COMPLETION = 'advanced_profile_completion',
  PROFILE_COMPLETION_SCORE = 'profile_completion_score',

  MULTIPLE_PROFILE_PHOTOS = 'multiple_profile_photos',
  VIDEO_PROFILE = 'video_profile',
  AUDIO_INTRO = 'audio_intro',

  PROFILE_BOOST = 'profile_boost',
  PROFILE_HIGHLIGHT = 'profile_highlight',
  FEATURED_PROFILE = 'featured_profile',

  HIDE_PROFILE_PHOTO = 'hide_profile_photo',
  PRIVATE_PHOTOS = 'private_photos',
  PRIVATE_ALBUM = 'private_album',

  HIDE_LAST_SEEN = 'hide_last_seen',
  HIDE_ONLINE_STATUS = 'hide_online_status',
  INCOGNITO_MODE = 'incognito_mode',

  PROFILE_VERIFICATION = 'profile_verification',
  ID_VERIFICATION = 'id_verification',
  VERIFIED_BADGE = 'verified_badge',

  HOROSCOPE_UPLOAD = 'horoscope_upload',
  KUNDLI_MATCHING = 'kundli_matching',
  ASTROLOGY_REPORT = 'astrology_report',

  // ==========================================
  //  ENGAGEMENT
  // ==========================================
  SEND_INTEREST = 'send_interest',
  VIEW_INTERESTS = 'view_interests',

  ACCEPT_INTEREST = 'accept_interest',
  REJECT_INTEREST = 'reject_interest',

  PRIORITY_INTEREST = 'priority_interest',

  SHORTLIST_PROFILES = 'shortlist_profiles',
  FAVORITE_PROFILES = 'favorite_profiles',

  // ==========================================
  //  CHAT & COMMUNICATION
  // ==========================================
  CHAT_ACCESS = 'chat_access',
  UNLIMITED_CHAT = 'unlimited_chat',

  CHAT_WITH_MATCHES_ONLY = 'chat_with_matches_only',
  CHAT_WITHOUT_MATCH = 'chat_without_match',

  PRIORITY_CHAT = 'priority_chat',

  READ_RECEIPTS = 'read_receipts',
  TYPING_INDICATOR = 'typing_indicator',
  MESSAGE_TRANSLATION = 'message_translation',

  SEND_IMAGES_IN_CHAT = 'send_images_in_chat',
  SEND_VIDEOS_IN_CHAT = 'send_videos_in_chat',
  SEND_VOICE_NOTES = 'send_voice_notes',

  VOICE_CALL = 'voice_call',
  VIDEO_CALL = 'video_call',

  // ==========================================
  //  CONTACT ACCESS
  // ==========================================
  VIEW_CONTACT = 'view_contact',
  REQUEST_CONTACT = 'request_contact',
  DIRECT_CONTACT_ACCESS = 'direct_contact_access',

  VIEW_PHONE_NUMBER = 'view_phone_number',
  VIEW_EMAIL_ADDRESS = 'view_email_address',

  // ==========================================
  //  MEDIA
  // ==========================================
  UPLOAD_PHOTOS = 'upload_photos',
  UPLOAD_VIDEOS = 'upload_videos',

  VIEW_PROFILE_PHOTOS = 'view_profile_photos',
  VIEW_PRIVATE_PHOTOS = 'view_private_photos',
  REQUEST_PHOTOS = 'request_photos',

  VIEW_PROFILE_VIDEOS = 'view_profile_videos',
  REQUEST_PRIVATE_VIDEOS = 'request_private_videos',

  PHOTO_APPROVAL = 'photo_approval',
  VIDEO_APPROVAL = 'video_approval',

  AI_PHOTO_VERIFICATION = 'ai_photo_verification',
  BLURRED_PHOTO_MODE = 'blurred_photo_mode',

  // ==========================================
  //  SEARCH & DISCOVERY
  // ==========================================
  BASIC_SEARCH = 'basic_search',
  ADVANCED_SEARCH = 'advanced_search',

  BASIC_FILTERS = 'basic_filters',
  ADVANCED_FILTERS = 'advanced_filters',

  UNLIMITED_SEARCH = 'unlimited_search',

  SEARCH_BY_RELIGION = 'search_by_religion',
  SEARCH_BY_CASTE = 'search_by_caste',
  SEARCH_BY_LOCATION = 'search_by_location',
  SEARCH_BY_INCOME = 'search_by_income',
  SEARCH_BY_EDUCATION = 'search_by_education',
  SEARCH_BY_PROFESSION = 'search_by_profession',
  SEARCH_BY_HEIGHT = 'search_by_height',

  LOCATION_BASED_SEARCH = 'location_based_search',
  GLOBAL_SEARCH = 'global_search',
  INTERNATIONAL_MATCHES = 'international_matches',
  NRI_MATCHING = 'nri_matching',

  SAVED_SEARCHES = 'saved_searches',
  RECENT_SEARCHES = 'recent_searches',

  DAILY_PROFILE_VIEWS = 'daily_profile_views',
  UNLIMITED_PROFILE_VIEWS = 'unlimited_profile_views',

  PROFILE_VIEWS = 'profile_views',
  WHO_VIEWED_ME = 'who_viewed_me',
  PROFILE_ANALYTICS = 'profile_analytics',

  TOP_IN_SEARCH = 'top_in_search',
  SHOW_ON_HOME = 'show_on_home',
  PRIORITY_SEARCH_RANKING = 'priority_search_ranking',
  FEATURED_IN_SEARCH = 'featured_in_search',

  // ==========================================
  //  MATCHMAKING & AI
  // ==========================================
  BASIC_MATCHING = 'basic_matching',
  ADVANCED_MATCHING = 'advanced_matching',

  SMART_MATCHES = 'smart_matches',
  AI_RECOMMENDATIONS = 'ai_recommendations',

  AI_PROFILE_SUMMARY = 'ai_profile_summary',
  AI_PHOTO_SELECTION = 'ai_photo_selection',

  AI_COMPATIBILITY_ANALYSIS = 'ai_compatibility_analysis',
  AI_CONVERSATION_STARTER = 'ai_conversation_starter',

  AI_INTEREST_PREDICTION = 'ai_interest_prediction',
  AI_FAKE_PROFILE_DETECTION = 'ai_fake_profile_detection',

  COMPATIBILITY_SCORE = 'compatibility_score',
  PERSONALITY_MATCHING = 'personality_matching',
  INTEREST_MATCHING = 'interest_matching',
  LOCATION_MATCHING = 'location_matching',

  STRICT_PREFERENCES = 'strict_preferences',
  SMART_PREFERENCES = 'smart_preferences',

  // ==========================================
  //  MATRIMONY SPECIFIC
  // ==========================================
  RELIGION_PREFERENCES = 'religion_preferences',
  CASTE_PREFERENCES = 'caste_preferences',
  SUBCASTE_PREFERENCES = 'subcaste_preferences',

  MANGLIK_MATCHING = 'manglik_matching',

  COMMUNITY_BASED_MATCHING = 'community_based_matching',

  MARRIAGE_TIMELINE_PREFERENCE = 'marriage_timeline_preference',
  CHILDREN_PREFERENCE = 'children_preference',

  EATING_PREFERENCES = 'eating_preferences',
  LIFESTYLE_PREFERENCES = 'lifestyle_preferences',

  // ==========================================
  //  FAMILY FEATURES
  // ==========================================
  FAMILY_MANAGED_PROFILE = 'family_managed_profile',
  FAMILY_CONTACT_VISIBILITY = 'family_contact_visibility',

  PARENT_LOGIN = 'parent_login',
  GUARDIAN_ACCESS = 'guardian_access',

  FAMILY_DETAILS = 'family_details',
  FAMILY_PREFERENCES = 'family_preferences',

  // ==========================================
  //  ANALYTICS
  // ==========================================
  INTEREST_ANALYTICS = 'interest_analytics',
  CHAT_ANALYTICS = 'chat_analytics',

  ENGAGEMENT_SCORE = 'engagement_score',
  MATCH_SUCCESS_RATE = 'match_success_rate',

  DAILY_ACTIVITY_STATS = 'daily_activity_stats',
  WEEKLY_REPORTS = 'weekly_reports',

  // ==========================================
  //  NOTIFICATIONS
  // ==========================================
  PUSH_NOTIFICATIONS = 'push_notifications',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  SMS_NOTIFICATIONS = 'sms_notifications',

  INSTANT_MATCH_ALERTS = 'instant_match_alerts',
  DAILY_MATCH_DIGEST = 'daily_match_digest',

  MARKETING_NOTIFICATIONS = 'marketing_notifications',

  // ==========================================
  //  LOCATION FEATURES
  // ==========================================
  LOCATION_BASED_MATCHING = 'location_based_matching',
  NEARBY_PROFILES = 'nearby_profiles',

  TRAVEL_MODE = 'travel_mode',

  // ==========================================
  //  PREMIUM EXPERIENCE
  // ==========================================
  AD_FREE_EXPERIENCE = 'ad_free_experience',
  PRIORITY_SUPPORT = 'priority_support',

  VIP_BADGE = 'vip_badge',
  PREMIUM_BADGE = 'premium_badge',

  RELATIONSHIP_MANAGER = 'relationship_manager',
  DEDICATED_RELATIONSHIP_MANAGER = 'dedicated_relationship_manager',

  CONCIERGE_MATCHMAKING = 'concierge_matchmaking',
  PERSONAL_MATCHMAKER = 'personal_matchmaker',

  // ==========================================
  //  BOOST / MONETIZATION
  // ==========================================
  DAILY_BOOSTS = 'daily_boosts',
  WEEKLY_BOOSTS = 'weekly_boosts',
  MONTHLY_BOOSTS = 'monthly_boosts',

  UNLIMITED_BOOSTS = 'unlimited_boosts',

  SPOTLIGHT_PROFILE = 'spotlight_profile',

  // ==========================================
  //  PAYMENTS & SUBSCRIPTIONS
  // ==========================================
  MONTHLY_SUBSCRIPTION = 'monthly_subscription',
  QUARTERLY_SUBSCRIPTION = 'quarterly_subscription',
  YEARLY_SUBSCRIPTION = 'yearly_subscription',

  ONE_TIME_BOOST_PURCHASE = 'one_time_boost_purchase',

  WALLET_SYSTEM = 'wallet_system',
  PROMO_CODES = 'promo_codes',

  REFERRAL_REWARDS = 'referral_rewards',
  REFERRAL_BONUS = 'referral_bonus',

  EARN_CREDITS = 'earn_credits',

  AUTO_RENEWAL = 'auto_renewal',
  GRACE_PERIOD = 'grace_period',

  // ==========================================
  //  SAFETY & TRUST
  // ==========================================
  REPORT_USER = 'report_user',
  BLOCK_USERS = 'block_users',

  SAFE_MODE = 'safe_mode',
  RESTRICTED_PROFILES = 'restricted_profiles',

  FRAUD_DETECTION = 'fraud_detection',
  SPAM_DETECTION = 'spam_detection',

  MANUAL_PROFILE_REVIEW = 'manual_profile_review',

  // ==========================================
  //  LIMIT BASED FEATURES
  // ==========================================
  SHORTLIST_LIMIT = 'shortlist_limit',
  CONTACT_VIEW_LIMIT = 'contact_view_limit',
  MESSAGE_LIMIT = 'message_limit',

  MATCH_LIMIT = 'match_limit',

  // ==========================================
  //  ENGAGEMENT & GAMIFICATION
  // ==========================================
  STREAK_REWARDS = 'streak_rewards',
  DAILY_LOGIN_REWARDS = 'daily_login_rewards',

  MATCH_QUIZ = 'match_quiz',
  COMPATIBILITY_GAMES = 'compatibility_games',

  // ==========================================
  //  SUPPORT & MISC
  // ==========================================
  CUSTOMER_SUPPORT_CHAT = 'customer_support_chat',
  SUPPORT_TICKETS = 'support_tickets',

  ACCOUNT_EXPORT = 'account_export',
  ACCOUNT_DELETION = 'account_deletion',

  GDPR_COMPLIANCE = 'gdpr_compliance',
  DATA_EXPORT = 'data_export',

  CONSENT_MANAGEMENT = 'consent_management',
  PRIVACY_CONTROLS = 'privacy_controls',
}

// ==========================================
//  FEATURE CATEGORIES (for analytics, grouping, etc.)
// ==========================================

export enum FeatureCategory {
  AUTH = 'Authentication & Account',
  PROFILE = 'Profile',
  ENGAGEMENT = 'Engagement',
  CHAT = 'Chat & Communication',
  CONTACT_ACCESS = 'Contact Access',
  MEDIA = 'Media',
  SEARCH = 'Search & Discovery',
  MATCHMAKING = 'Matchmaking & AI',
  MATRIMONY = 'Matrimony Specific',
  FAMILY = 'Family Features',
  ANALYTICS = 'Analytics',
  NOTIFICATIONS = 'Notifications',
  LOCATION = 'Location Features',
  PREMIUM = 'Premium Experience',
  BOOST = 'Boost / Monetization',
  PAYMENTS = 'Payments & Subscriptions',
  SAFETY = 'Safety & Trust',
  LIMITS = 'Limit Based Features',
  GAMIFICATION = 'Engagement & Gamification',
  SUPPORT = 'Support & Miscellaneous',
}
