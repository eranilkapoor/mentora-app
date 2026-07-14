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

  ADVANCED_PROFILE_COMPLETION = 'advanced_profile_completion', // Paid
  PROFILE_COMPLETION_SCORE = 'profile_completion_score', // Free

  MULTIPLE_PROFILE_PHOTOS = 'multiple_profile_photos', // Free, Paid
  VIDEO_PROFILE = 'video_profile', // Paid
  AUDIO_INTRO = 'audio_intro', // Paid

  PROFILE_BOOST = 'profile_boost', // Paid
  PROFILE_HIGHLIGHT = 'profile_highlight', // Paid
  FEATURED_PROFILE = 'featured_profile', // Paid

  HIDE_PROFILE_PHOTO = 'hide_profile_photo', // Paid
  PRIVATE_PHOTOS = 'private_photos', // Paid
  PRIVATE_ALBUM = 'private_album', // Paid

  HIDE_LAST_SEEN = 'hide_last_seen', // Free privacy control
  HIDE_ONLINE_STATUS = 'hide_online_status', // Free privacy control
  SHOW_ONLY_TO_PREMIUM = 'show_only_to_premium', // Paid
  INCOGNITO_MODE = 'incognito_mode', // Paid

  IDENTITY_VERIFICATION = 'identity_verification', // Free trust capability

  HOROSCOPE_UPLOAD = 'horoscope_upload', // Paid
  ASTROLOGY_REPORT = 'astrology_report', // Paid

  // ==========================================
  //  ENGAGEMENT
  // ==========================================

  SEND_INTEREST = 'send_interest', // Free, Paid
  SEND_INTEREST_MONTHLY_LIMIT = 'send_interest_monthly_limit', // Free monthly cap
  VIEW_INTERESTS = 'view_interests', // Free, Paid

  ACCEPT_INTEREST = 'accept_interest', // Free, Paid
  REJECT_INTEREST = 'reject_interest', // Free, Paid

  PRIORITY_INTEREST = 'priority_interest', // Paid

  SHORTLIST_PROFILES = 'shortlist_profiles', // Free, Paid
  FAVORITE_PROFILES = 'favorite_profiles', // Paid

  // ==========================================
  //  CHAT & COMMUNICATION
  // ==========================================

  CHAT_ACCESS = 'chat_access', // Free,Paid
  UNLIMITED_CHAT = 'unlimited_chat', // Paid

  CHAT_WITH_MATCHES_ONLY = 'chat_with_matches_only', // Paid
  CHAT_WITHOUT_MATCH = 'chat_without_match', // Paid

  PRIORITY_CHAT = 'priority_chat', // Paid

  READ_RECEIPTS = 'read_receipts', // Free
  TYPING_INDICATOR = 'typing_indicator', // Free
  AUTO_REPLY = 'auto_reply', // Paid
  MESSAGE_TRANSLATION = 'message_translation', // Paid

  SEND_IMAGES_IN_CHAT = 'send_images_in_chat', // Paid
  SEND_VIDEOS_IN_CHAT = 'send_videos_in_chat', // Paid
  SEND_VOICE_NOTES = 'send_voice_notes', // Paid

  VOICE_CALL = 'voice_call', // Paid
  VIDEO_CALL = 'video_call', // Paid

  // ==========================================
  //  CONTACT ACCESS
  // ==========================================

  VIEW_CONTACT = 'view_contact', // Free, Paid
  REQUEST_CONTACT = 'request_contact', // Free, Paid
  DIRECT_CONTACT_ACCESS = 'direct_contact_access', // Paid

  VIEW_PHONE_NUMBER = 'view_phone_number', // Paid
  VIEW_EMAIL_ADDRESS = 'view_email_address', // Paid

  // ==========================================
  //  MEDIA
  // ==========================================

  UPLOAD_PHOTOS = 'upload_photos', // Free, Paid
  UPLOAD_VIDEOS = 'upload_videos', // Paid

  VIEW_PROFILE_PHOTOS = 'view_profile_photos', // Free, Paid
  VIEW_PRIVATE_PHOTOS = 'view_private_photos', // Paid
  REQUEST_PHOTOS = 'request_photos', // Paid

  VIEW_PROFILE_VIDEOS = 'view_profile_videos', // Paid
  REQUEST_PRIVATE_VIDEOS = 'request_private_videos', // Paid

  PHOTO_APPROVAL = 'photo_approval', // Paid
  VIDEO_APPROVAL = 'video_approval', // Paid

  AI_PHOTO_VERIFICATION = 'ai_photo_verification', // Paid
  BLURRED_PHOTO_MODE = 'blurred_photo_mode', // Paid

  // ==========================================
  //  SEARCH & DISCOVERY
  // ==========================================

  BASIC_SEARCH = 'basic_search', // Free, Paid
  ADVANCED_SEARCH = 'advanced_search', // Paid

  BASIC_FILTERS = 'basic_filters', // Free, Paid
  ADVANCED_FILTERS = 'advanced_filters', // Paid

  UNLIMITED_SEARCH = 'unlimited_search', // Paid

  SEARCH_BY_RELIGION = 'search_by_religion', // Free
  SEARCH_BY_CASTE = 'search_by_caste', // Free
  SEARCH_BY_LOCATION = 'search_by_location', // Free
  SEARCH_BY_INCOME = 'search_by_income', // Paid
  SEARCH_BY_EDUCATION = 'search_by_education', // Free
  SEARCH_BY_PROFESSION = 'search_by_profession', // Free
  SEARCH_BY_HEIGHT = 'search_by_height', // Free

  LOCATION_BASED_SEARCH = 'location_based_search', // Free
  GLOBAL_SEARCH = 'global_search', // Paid
  INTERNATIONAL_MATCHES = 'international_matches', // Paid
  NRI_MATCHING = 'nri_matching', // Paid

  SAVED_SEARCHES = 'saved_searches', // Paid
  RECENT_SEARCHES = 'recent_searches', // Paid

  DAILY_PROFILE_VIEWS = 'daily_profile_views', // Free, Paid
  UNLIMITED_PROFILE_VIEWS = 'unlimited_profile_views', // Paid

  PROFILE_VIEWS = 'profile_views', // Paid
  WHO_VIEWED_ME = 'who_viewed_me', // Paid
  PROFILE_ANALYTICS = 'profile_analytics', // Paid

  TOP_IN_SEARCH = 'top_in_search', // Paid
  SHOW_ON_HOME = 'show_on_home', // Paid
  PRIORITY_SEARCH_RANKING = 'priority_search_ranking', // Paid
  FEATURED_IN_SEARCH = 'featured_in_search', // Paid

  // ==========================================
  //  MATCHMAKING & AI
  // ==========================================

  BASIC_MATCHING = 'basic_matching', // Free
  ADVANCED_MATCHING = 'advanced_matching', // Paid

  SMART_MATCHES = 'smart_matches', // Paid
  AI_RECOMMENDATIONS = 'ai_recommendations', // Paid

  AI_PROFILE_SUMMARY = 'ai_profile_summary', // Paid
  AI_PHOTO_SELECTION = 'ai_photo_selection', // Paid

  AI_COMPATIBILITY_ANALYSIS = 'ai_compatibility_analysis', // Paid
  AI_CONVERSATION_STARTER = 'ai_conversation_starter', // Paid

  AI_INTEREST_PREDICTION = 'ai_interest_prediction', // Paid
  AI_FAKE_PROFILE_DETECTION = 'ai_fake_profile_detection', // Paid

  COMPATIBILITY_SCORE = 'compatibility_score', // Paid
  PERSONALITY_MATCHING = 'personality_matching', // Paid
  INTEREST_MATCHING = 'interest_matching', // Paid
  LOCATION_MATCHING = 'location_matching', // Paid

  STRICT_PREFERENCES = 'strict_preferences', // Paid
  SMART_PREFERENCES = 'smart_preferences', // Paid

  // ==========================================
  //  MATRIMONY SPECIFIC
  // ==========================================

  KUNDLI_MATCHING = 'kundli_matching', // Paid
  RELIGION_PREFERENCES = 'religion_preferences', // Paid
  CASTE_PREFERENCES = 'caste_preferences', // Paid
  SUBCASTE_PREFERENCES = 'subcaste_preferences', // Paid

  MANGLIK_MATCHING = 'manglik_matching', // Paid

  COMMUNITY_BASED_MATCHING = 'community_based_matching', // Paid

  MARRIAGE_TIMELINE_PREFERENCE = 'marriage_timeline_preference', // Paid
  CHILDREN_PREFERENCE = 'children_preference', // Paid

  EATING_PREFERENCES = 'eating_preferences', // Paid
  LIFESTYLE_PREFERENCES = 'lifestyle_preferences', // Paid

  // ==========================================
  //  FAMILY FEATURES
  // ==========================================

  FAMILY_MANAGED_PROFILE = 'family_managed_profile', // Paid
  FAMILY_CONTACT_VISIBILITY = 'family_contact_visibility', // Paid

  PARENT_LOGIN = 'parent_login', // Paid
  GUARDIAN_ACCESS = 'guardian_access', // Paid

  FAMILY_DETAILS = 'family_details', // Paid
  FAMILY_PREFERENCES = 'family_preferences', // Paid

  // ==========================================
  //  ANALYTICS
  // ==========================================

  INTEREST_ANALYTICS = 'interest_analytics', // Paid
  CHAT_ANALYTICS = 'chat_analytics', // Paid

  ENGAGEMENT_SCORE = 'engagement_score', // Paid
  MATCH_SUCCESS_RATE = 'match_success_rate', // Paid

  DAILY_ACTIVITY_STATS = 'daily_activity_stats', // Paid
  WEEKLY_REPORTS = 'weekly_reports', // Paid

  // ==========================================
  //  NOTIFICATIONS
  // ==========================================

  PUSH_NOTIFICATIONS = 'push_notifications', // Free, Paid
  EMAIL_NOTIFICATIONS = 'email_notifications', // Free, Paid
  SMS_NOTIFICATIONS = 'sms_notifications', // Paid

  INSTANT_MATCH_ALERTS = 'instant_match_alerts', // Paid
  DAILY_MATCH_DIGEST = 'daily_match_digest', // Paid

  MARKETING_NOTIFICATIONS = 'marketing_notifications', // Paid

  // ==========================================
  //  LOCATION FEATURES
  // ==========================================

  LOCATION_BASED_MATCHING = 'location_based_matching', // Paid
  NEARBY_PROFILES = 'nearby_profiles', // Paid

  TRAVEL_MODE = 'travel_mode', // Paid

  // ==========================================
  //  PREMIUM EXPERIENCE
  // ==========================================

  AD_FREE_EXPERIENCE = 'ad_free_experience', // Paid
  PRIORITY_SUPPORT = 'priority_support', // Paid

  VIP_BADGE = 'vip_badge', // Paid
  PREMIUM_BADGE = 'premium_badge', // Paid

  RELATIONSHIP_MANAGER = 'relationship_manager', // Paid
  DEDICATED_RELATIONSHIP_MANAGER = 'dedicated_relationship_manager', // Paid

  CONCIERGE_MATCHMAKING = 'concierge_matchmaking', // Paid
  PERSONAL_MATCHMAKER = 'personal_matchmaker', // Paid

  // ==========================================
  //  BOOST / MONETIZATION
  // ==========================================

  DAILY_BOOSTS = 'daily_boosts', // Paid
  WEEKLY_BOOSTS = 'weekly_boosts', // Paid
  MONTHLY_BOOSTS = 'monthly_boosts', // Paid

  UNLIMITED_BOOSTS = 'unlimited_boosts', // Paid

  SPOTLIGHT_PROFILE = 'spotlight_profile', // Paid

  // ==========================================
  //  PAYMENTS & SUBSCRIPTIONS
  // ==========================================

  MONTHLY_SUBSCRIPTION = 'monthly_subscription', // Paid
  QUARTERLY_SUBSCRIPTION = 'quarterly_subscription', // Paid
  YEARLY_SUBSCRIPTION = 'yearly_subscription', // Paid

  ONE_TIME_BOOST_PURCHASE = 'one_time_boost_purchase', // Paid

  WALLET_SYSTEM = 'wallet_system', // Paid
  PROMO_CODES = 'promo_codes', // Paid

  REFERRAL_REWARDS = 'referral_rewards', // Paid
  REFERRAL_BONUS = 'referral_bonus', // Paid

  EARN_CREDITS = 'earn_credits', // Paid

  AUTO_RENEWAL = 'auto_renewal', // Free, Paid
  GRACE_PERIOD = 'grace_period', // Free, Paid

  // ==========================================
  //  SAFETY & TRUST
  // ==========================================

  REPORT_USER = 'report_user', // Free, Paid
  BLOCK_USERS = 'block_users', // Free, Paid

  SAFE_MODE = 'safe_mode', // Free, Paid
  RESTRICTED_PROFILES = 'restricted_profiles', // Free, Paid

  FRAUD_DETECTION = 'fraud_detection', // Free, Paid
  SPAM_DETECTION = 'spam_detection', // Free, Paid

  MANUAL_PROFILE_REVIEW = 'manual_profile_review', // Free, Paid

  // ==========================================
  //  LIMIT BASED FEATURES
  // ==========================================

  SHORTLIST_LIMIT = 'shortlist_limit', // Free, Paid
  CONTACT_VIEW_LIMIT = 'contact_view_limit', // Free, Paid
  MESSAGE_LIMIT = 'message_limit', // Free, Paid

  MATCH_LIMIT = 'match_limit', // Free, Paid

  // ==========================================
  //  GAMIFICATION
  // ==========================================

  STREAK_REWARDS = 'streak_rewards', // Free, Paid
  DAILY_LOGIN_REWARDS = 'daily_login_rewards', // Free, Paid

  MATCH_QUIZ = 'match_quiz', // Free, Paid
  COMPATIBILITY_GAMES = 'compatibility_games', // Free, Paid

  // ==========================================
  //  SUPPORT & MISC
  // ==========================================

  CUSTOMER_SUPPORT_CHAT = 'customer_support_chat', // Free, Paid
  SUPPORT_TICKETS = 'support_tickets', // Free, Paid

  ACCOUNT_EXPORT = 'account_export', // Free, Paid
  ACCOUNT_DELETION = 'account_deletion', // Free, Paid

  GDPR_COMPLIANCE = 'gdpr_compliance', // Free, Paid
  DATA_EXPORT = 'data_export', // Free, Paid

  CONSENT_MANAGEMENT = 'consent_management', // Free, Paid
  PRIVACY_CONTROLS = 'privacy_controls', // Free, Paid

  // ==========================================
  //  ENTERPRISE
  // ==========================================

  ENTERPRISE_SSO = 'enterprise_sso',
  ADMIN_DASHBOARD = 'admin_dashboard',
  API_ACCESS = 'api_access',
  CUSTOM_BRANDING = 'custom_branding',
  BULK_SEAT_MANAGEMENT = 'bulk_seat_management',
  SLA_SUPPORT = 'sla_support',
  DATA_RESIDENCY = 'data_residency',
  DEDICATED_ACCOUNT_MANAGER = 'dedicated_account_manager',
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
  ENTERPRISE = 'Enterprise',
}
