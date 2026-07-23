export type StaticPageSlug =
  | 'privacy-policy'
  | 'terms-conditions'
  | 'community-guidelines'
  | 'child-safety'
  | 'ai-tutor-disclaimer'
  | 'refund-policy'
  | 'faqs'
  | 'account-deletion';

export type StaticPageTheme = 'light' | 'dark' | 'system';
export type StaticPageLanguage = 'en' | 'hi';
export type StaticPageFontSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface StaticPageRenderOptions {
  theme?: string;
  language?: string;
  fontSize?: string;
  boldText?: string | boolean;
  highContrast?: string | boolean;
  reduceMotion?: string | boolean;
}

interface StaticPageSection {
  title: string;
  body?: string;
  bullets?: string[];
  items?: StaticPageSection[];
}

interface StaticPageContent {
  slug: StaticPageSlug;
  title: string;
  eyebrow: string;
  subtitle: string;
  lastUpdated?: string;
  intro?: string;
  sections: StaticPageSection[];
}

const SUPPORT_EMAIL = 'support@webnza.com';
const COMPANY_NAME = 'Webnza Infotech / Mentora';

const pages: Record<StaticPageSlug, StaticPageContent> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    eyebrow: 'Mentora legal',
    subtitle:
      'How Mentora collects, uses, protects, and shares student, parent, and tutor data.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'Mentora is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Mentora mobile application, website, and related services.',
    sections: [
      {
        title: 'Information we collect',
        items: [
          {
            title: 'Personal information',
            bullets: [
              'Full name, gender, date of birth, student or guardian role, phone number, and email address.',
              'City, country, academic details, institution, subjects, goals, and learning preferences.',
              'Academic level, board, institution, language, accessibility needs, goals, subjects, course preferences, and other AI tutoring profile fields when you add them.',
              'Profile photos, video introductions, verification documents, and other media you choose to upload.',
            ],
          },
          {
            title: 'Login and authentication data',
            bullets: [
              'Email and password login information.',
              'Phone number and OTP verification data.',
              'Social login profile identifiers from providers such as Google, Facebook, or Apple when you choose to connect them.',
            ],
          },
          {
            title: 'Usage and device information',
            bullets: [
              'Device type, operating system, app version, IP address, approximate region, and crash diagnostics.',
              'App interactions including profile views, learning sessions, saved tutors or subjects, support requests, and notification preferences.',
              'Security events such as login history, active sessions, suspicious sign-in signals, blocked users, and moderation actions.',
            ],
          },
          {
            title: 'Payments, rewards, and support',
            bullets: [
              'Subscription plan, trial, renewal, invoice, refund, payment provider reference, wallet, coin, referral, and campaign attribution details.',
              'Support ticket messages, attachments, admin replies, and issue resolution history.',
            ],
          },
        ],
      },
      {
        title: 'How we use your information',
        bullets: [
          'Create and manage your account, profile, preferences, subscriptions, and support requests.',
          'Recommend compatible learning sessions and improve learning sessionmaking quality.',
          'Enable chat, notifications, student visibility controls, parental controls, and safety workflows.',
          'Detect fraud, spam, fake accounts, abuse, suspicious logins, and policy violations.',
          'Comply with applicable legal, payment, tax, security, and platform obligations.',
        ],
      },
      {
        title: 'Sharing your information',
        bullets: [
          'With students, parents, tutors, mentors, or support staff only as needed to provide learning sessions, progress support, safety workflows, and permitted contact details.',
          'With infrastructure, analytics, communication, payment, verification, and support providers that help us operate Mentora.',
          'With legal authorities when required by law, court order, safety investigation, or fraud prevention need.',
        ],
      },
      {
        title: 'Camera, media, location, and notification permissions',
        bullets: [
          'Camera and photo/media access are used for profile photos, verification selfies, documents, and optional video introductions.',
          'Microphone access may be used when you record or upload a video introduction or use communication features.',
          'Location access, when enabled, helps improve regional curriculum, timezone, language, and support preferences.',
          'Notification permission is used for learning sessions, messages, security alerts, subscription updates, and support ticket replies.',
          'You can revoke device permissions anytime from Android or iOS settings.',
        ],
      },
      {
        title: 'Security and retention',
        body: 'We use encrypted transport, access controls, monitoring, secure storage, moderation workflows, and operational review to protect student, parent, and tutor data. We retain information only as long as needed for account operation, safety, fraud prevention, legal compliance, and legitimate business records.',
      },
      {
        title: 'Your choices and rights',
        bullets: [
          'Access and update profile information from the app.',
          'Control privacy, searchability, communication, and notification settings.',
          'Block or report users and request help through support tickets.',
          'Withdraw consent where applicable.',
          'Request account deletion or data export from account settings or support.',
        ],
      },
      {
        title: 'Children and eligibility',
        body: 'Mentora is intended for adults who are legally eligible to use AI tutoring services. We do not knowingly allow minors to create AI tutoring profiles.',
      },
      {
        title: 'Contact us',
        body: `${COMPANY_NAME}\nEmail: ${SUPPORT_EMAIL}\nWebsite: www.webnza.com\nAddress: New Delhi, India`,
      },
    ],
  },
  'terms-conditions': {
    slug: 'terms-conditions',
    title: 'Terms and Conditions',
    eyebrow: 'Mentora legal',
    subtitle: 'The rules for using Mentora safely and responsibly.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'These terms describe the rules for using Mentora. By creating an account or using the service, you agree to follow these terms, our privacy policy, and our community safety standards.',
    sections: [
      {
        title: 'Eligibility and account responsibility',
        bullets: [
          'You must be legally eligible to use a AI tutoring service and create an account for a genuine AI tutoring purpose.',
          'You are responsible for keeping your login credentials secure and for all activity on your account.',
          'Parent-managed student profiles must represent the learner truthfully and must be used with appropriate consent.',
        ],
      },
      {
        title: 'Profiles and learning sessions',
        bullets: [
          'You agree to provide accurate student, parent, academic, address, guardian, payment, and learning information.',
          'AI tutor suggestions, progress scores, readiness indicators, and recommendations are informational.',
          'Parents and students are responsible for using tutor sessions, chat, documents, and support features safely.',
        ],
      },
      {
        title: 'Subscriptions and payments',
        bullets: [
          'Paid features are governed by the plan terms shown at purchase, including feature limits, trial period, renewal date, and price.',
          'Taxes, renewals, cancellations, refunds, checkout status, and payment verification follow the applicable app store, payment provider, and Mentora billing rules.',
          'Some benefits such as boosts, coins, premium visibility, who-liked-me, video intro, or assisted services may depend on your active plan and feature availability.',
        ],
      },
      {
        title: 'Acceptable use',
        bullets: [
          'Do not impersonate others, create fake accounts, scrape data, send spam, harass users, or use Mentora for commercial lead generation.',
          'Do not request money, gifts, bank details, OTPs, passwords, or sensitive documents from other users.',
          'Do not upload unlawful, explicit, hateful, violent, misleading, copyrighted, or privacy-violating content.',
        ],
      },
      {
        title: 'Account actions',
        body: 'You may deactivate your account or request deletion from account settings. Some records may be retained where required for security, legal, fraud prevention, audit, or payment compliance.',
      },
      {
        title: 'Safety, moderation, and enforcement',
        body: 'We may review, restrict, remove, suspend, or terminate accounts, content, messages, tutor sessions, or features when we detect abuse, fraud, fake accounts, payment risk, safety issues, or policy violations. Use report and block tools when needed.',
      },
      {
        title: 'Third-party services',
        body: 'Social login, payment checkout, analytics, cloud storage, notifications, verification, and communication providers may process limited data to deliver the feature you use. Their own terms may also apply.',
      },
    ],
  },
  'community-guidelines': {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    eyebrow: 'Help and support',
    subtitle: 'Keep AI tutoring discovery safe, honest, and respectful.',
    sections: [
      {
        title: 'Use truthful profile details',
        bullets: [
          'Use accurate identity, student, parent, guardian, academic, address, payment, and learning details.',
          'Do not misrepresent age, student identity, guardian authority, academic level, community, education, institution, or learning intent.',
          'Keep parent-managed student profiles transparent, age-appropriate, and respectful of the learner represented.',
        ],
      },
      {
        title: 'Upload appropriate photos and videos',
        bullets: [
          'Use clear, recent, non-misleading photos and only upload media you have permission to share.',
          'Do not upload explicit, violent, hateful, private, copyrighted, watermarked, or impersonation content.',
          'Video introductions should be respectful, family-safe, and relevant to AI tutoring discovery.',
        ],
      },
      {
        title: 'Communicate respectfully',
        bullets: [
          'Do not harass, threaten, pressure, shame, stalk, or send abusive messages.',
          'Respect boundaries around contact details, calls, family involvement, and meeting decisions.',
          'Avoid subjectist, communal, sexist, body-shaming, hateful, or degrading language.',
        ],
      },
      {
        title: 'Protect privacy',
        bullets: [
          'Do not share another user phone number, email, photos, address, documents, profile data, or chat screenshots without permission.',
          'Do not pressure students, parents, or tutors to move conversations outside Mentora.',
          'Do not collect user data for marketing, recruitment, scraping, or external databases.',
        ],
      },
      {
        title: 'Avoid fraud and solicitation',
        bullets: [
          'Do not request money, gifts, investments, loans, OTPs, passwords, bank details, or payment screenshots from other users.',
          'Do not promote outside services, agencies, crypto schemes, job offers, immigration services, or commercial learning sessionmaking without authorization.',
          'Do not impersonate anyone or create multiple misleading accounts.',
        ],
      },
      {
        title: 'Report unsafe behavior',
        bullets: [
          'Use report and block actions when a profile looks fake, suspicious, abusive, or violates privacy expectations.',
          'Open a support ticket for payment issues, impersonation, harassment, safety threats, or urgent moderation concerns.',
          'Our team may review reports and take action such as warning, limiting, suspending, or removing accounts.',
        ],
      },
    ],
  },
  'child-safety': {
    slug: 'child-safety',
    title: 'Child Safety Policy',
    eyebrow: 'Mentora safety',
    subtitle:
      'How Mentora protects students, parent-managed profiles, and learning access.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'Mentora supports students and parent-managed student profiles. This policy explains how we handle student safety, age eligibility, parental controls, learning access, and abuse prevention.',
    sections: [
      {
        title: 'Student accounts and parent-managed profiles',
        bullets: [
          'Students may create their own profile only when they meet the age and eligibility rules configured for Mentora.',
          'Parents or guardians can create and manage student profiles for their children and set credentials, limits, schedules, and safety controls.',
          'Parent accounts are for supervision, billing, settings, and progress review; they do not receive parallel learning access for themselves through a student entitlement.',
        ],
      },
      {
        title: 'Learning access controls',
        bullets: [
          'AI tutor access is checked against schedule windows, active entitlement, parental controls, and device/session limits.',
          'Students can learn only inside permitted sessions and within the plan limits purchased for that student profile.',
          'Suspicious sharing, parallel class use, or device-limit abuse may be blocked or reviewed.',
        ],
      },
      {
        title: 'Safety and reporting',
        bullets: [
          'Students and parents should report unsafe content, impersonation, harassment, payment abuse, or account misuse through support.',
          'Mentora may restrict accounts, revoke sessions, or pause access when safety, fraud, or child-protection risk is detected.',
          'Emergency issues should be reported to local authorities first, then to Mentora support with relevant account details.',
        ],
      },
    ],
  },
  'ai-tutor-disclaimer': {
    slug: 'ai-tutor-disclaimer',
    title: 'AI Tutor Disclaimer',
    eyebrow: 'Mentora learning',
    subtitle:
      'What to expect from AI tutoring, mentorship, and automated learning guidance.',
    lastUpdated: 'Last updated: 1 January 2026',
    sections: [
      {
        title: 'Educational guidance',
        body: 'Mentora provides AI-assisted tutoring, practice, explanations, and mentorship support. AI responses may be incomplete or incorrect and should be checked against textbooks, teachers, official curriculum, or qualified human tutors where accuracy matters.',
      },
      {
        title: 'No guaranteed outcomes',
        bullets: [
          'Mentora does not guarantee grades, exam scores, admissions, certifications, or career outcomes.',
          'Learning progress depends on student effort, attendance, curriculum fit, parent support, and plan usage.',
          'Progress reports and recommendations are informational and may evolve as more learning activity is recorded.',
        ],
      },
      {
        title: 'Human review and escalation',
        body: 'Where available, students or parents may request support or human review. Safety-sensitive, medical, legal, financial, or emergency questions should not rely on AI tutor output.',
      },
    ],
  },
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund and Subscription Policy',
    eyebrow: 'Mentora billing',
    subtitle:
      'How subscriptions, renewals, cancellations, entitlement changes, and refunds work.',
    lastUpdated: 'Last updated: 1 January 2026',
    sections: [
      {
        title: 'Subscriptions and entitlements',
        bullets: [
          'Plans define the student profiles, AI tutor minutes, schedules, devices, sessions, and features included with purchase.',
          'Entitlements are assigned to the eligible account or student profile and may not be shared to bypass plan limits.',
          'Access may pause or end when payment fails, a subscription expires, a refund is issued, or misuse is detected.',
        ],
      },
      {
        title: 'Cancellations and renewals',
        body: 'Renewal, cancellation, trial, and billing management depend on the checkout provider used for purchase. App store purchases must usually be managed through the relevant Apple or Google account settings.',
      },
      {
        title: 'Refunds',
        body: `Refund eligibility depends on applicable law, app store rules, payment-provider rules, plan usage, and Mentora policy. Contact ${SUPPORT_EMAIL} with your registered email, order reference, student profile, and reason for review.`,
      },
    ],
  },
  faqs: {
    slug: 'faqs',
    title: 'Frequently Asked Questions',
    eyebrow: 'Help and support',
    subtitle:
      'Quick answers about account, profile, learning sessions, safety, and deletion.',
    sections: [
      {
        title: 'How do I create or update my profile?',
        body: 'Go to Profile > Edit Profile. Add clear photos and complete all sections for better learning session recommendations.',
      },
      {
        title: 'Why should I verify my profile?',
        body: 'Verification helps improve trust and may unlock a verified badge after review. You can start verification from Settings > Account Settings > Profile KYC verification.',
      },
      {
        title: 'How does Mentora find learning sessions?',
        body: 'Mentora recommends learning sessions based on academic level, subjects, goals, schedule, language, accessibility needs, parental controls, entitlements, and learning history.',
      },
      {
        title: 'Why are some features hidden or locked?',
        body: 'Some features depend on your active plan, trial, role, or safety status. If a feature such as video intro, who-liked-me, boosts, or premium filters is not included in your current plan, the app may hide it or show an upgrade option.',
      },
      {
        title: 'How do subscriptions, trials, and renewals work?',
        body: 'Plan details are shown before checkout. Paid plans may include a trial period, renewal date, feature limits, and cancellation rules. Manage billing from Membership & Billing or the payment provider used at checkout.',
      },
      {
        title: 'How do I report or block someone?',
        body: 'Use the report or block actions from profile, chat, or safety screens. For serious issues, create a support ticket with profile details and screenshots context.',
      },
      {
        title: 'How do photos and video introductions work?',
        body: 'Photos and optional video introductions are uploaded from Edit Profile when your plan and permissions allow them. Media may be reviewed, resized, stored securely, and shown according to your privacy settings.',
      },
      {
        title: 'How do I contact support?',
        body: `Open Help & Support > Support Tickets to create and track a request. You can also email ${SUPPORT_EMAIL} from your registered email address.`,
      },
      {
        title: 'Is my information safe?',
        body: 'Yes. We use secure servers, encrypted data transfer, access controls, monitoring, and privacy controls to protect personal information.',
      },
      {
        title: 'How do I delete my account?',
        body: 'Go to Settings > Account > Delete Account. Once confirmed, your data is removed or anonymized according to standard retention timelines.',
      },
    ],
  },
  'account-deletion': {
    slug: 'account-deletion',
    title: 'Account and Data Deletion',
    eyebrow: 'User data request',
    subtitle:
      'How Mentora users can delete their account and associated personal data.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'This page explains how to request deletion of your Mentora account and personal data. It is provided for students, parents, tutors, app store reviewers, and platform compliance checks.',
    sections: [
      {
        title: 'Delete your account from the app',
        bullets: [
          'Open the Mentora app and sign in to your account.',
          'Go to Settings > Account Settings > Delete Account.',
          'Review the confirmation message and submit the deletion request.',
          'Your profile becomes unavailable after the request is accepted, subject to safety, fraud, payment, and legal checks.',
        ],
      },
      {
        title: 'If you cannot access the app',
        body: `Email ${SUPPORT_EMAIL} from your registered email address with the subject "Account deletion request". Our support team may ask for limited verification before processing the request.`,
      },
      {
        title: 'Public deletion request page',
        body: 'This page is available without signing in so app stores, reviewers, students, parents, and tutors can confirm how account and data deletion works. The preferred secure path is still the in-app request because it verifies the signed-in account automatically.',
      },
      {
        title: 'Data scheduled for deletion or anonymization',
        bullets: [
          'Profile details, academic records, learning preferences, photos, documents, and optional verification information.',
          'Chat rooms, AI tutor session activity, saved tutors or subjects, profile views, notifications, support tickets, and device/session records where deletion is legally and operationally permitted.',
          'Referral, wallet, subscription, and payment-linked profile references are removed or anonymized where possible.',
        ],
      },
      {
        title: 'Data we may retain for limited purposes',
        bullets: [
          'Payment, tax, invoice, refund, and subscription records required by law or payment providers.',
          'Security, fraud prevention, abuse reports, moderation decisions, and audit logs needed to protect users and the service.',
          'Backup copies and system logs for a limited retention period before they expire through normal backup rotation.',
        ],
      },
      {
        title: 'Permissions and device access',
        bullets: [
          'Mentora may request permissions such as camera, photos/media, notifications, location, microphone, or contacts only for app features you choose to use.',
          'Deleting your account stops Mentora from using your account data for user-facing features.',
          'You can revoke device permissions anytime from your iOS or Android system settings. Uninstalling the app also removes app access from that device.',
        ],
      },
      {
        title: 'Timeline and confirmation',
        body: `Most deletion requests are processed within 30 days unless retention is required for safety, legal, fraud prevention, or payment compliance. For help, contact ${SUPPORT_EMAIL}.`,
      },
      {
        title: 'Cancellation during grace period',
        body: 'If your account deletion is scheduled with a grace period, signing in again before permanent deletion may cancel or interrupt the deletion workflow where supported. After permanent deletion is completed, the account cannot be restored.',
      },
    ],
  },
};

const hindiPages: Record<StaticPageSlug, StaticPageContent> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'गोपनीयता नीति',
    eyebrow: 'Mentora कानूनी',
    subtitle: 'Mentora सदस्य डेटा कैसे एकत्र, उपयोग, सुरक्षित और साझा करता है।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'Mentora आपकी व्यक्तिगत जानकारी और गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि Mentora मोबाइल ऐप, वेबसाइट और संबंधित सेवाओं का उपयोग करते समय हम आपकी जानकारी कैसे एकत्र, उपयोग, साझा और सुरक्षित करते हैं।',
    sections: [
      {
        title: 'हम कौन सी जानकारी एकत्र करते हैं',
        items: [
          {
            title: 'व्यक्तिगत जानकारी',
            bullets: [
              'पूरा नाम, लिंग, जन्म तिथि, वैवाहिक स्थिति, फोन नंबर और ईमेल पता।',
              'शहर, देश, शिक्षा, व्यवसाय, परिवार विवरण और साथी प्राथमिकताएं।',
              'प्रोफाइल फोटो, वीडियो परिचय, सत्यापन दस्तावेज और आपके द्वारा अपलोड किया गया अन्य मीडिया।',
            ],
          },
          {
            title: 'लॉगिन और प्रमाणीकरण डेटा',
            bullets: [
              'ईमेल और पासवर्ड लॉगिन जानकारी।',
              'फोन नंबर और OTP सत्यापन डेटा।',
              'Google, Facebook या Apple जैसे सोशल लॉगिन प्रदाताओं से प्राप्त प्रोफाइल पहचानकर्ता, जब आप उन्हें जोड़ते हैं।',
            ],
          },
          {
            title: 'उपयोग और डिवाइस जानकारी',
            bullets: [
              'डिवाइस प्रकार, ऑपरेटिंग सिस्टम, ऐप संस्करण, IP पता, अनुमानित क्षेत्र और क्रैश डायग्नोस्टिक्स।',
              'ऐप गतिविधि जैसे प्रोफाइल व्यू, मैच, रुचियां, शॉर्टलिस्ट, सपोर्ट अनुरोध और नोटिफिकेशन प्राथमिकताएं।',
            ],
          },
        ],
      },
      {
        title: 'हम आपकी जानकारी का उपयोग कैसे करते हैं',
        bullets: [
          'आपका खाता, प्रोफाइल, प्राथमिकताएं, सदस्यता और सपोर्ट अनुरोध प्रबंधित करने के लिए।',
          'उपयुक्त मैच सुझाने और मैचमेकिंग गुणवत्ता सुधारने के लिए।',
          'चैट, नोटिफिकेशन, प्रोफाइल विजिबिलिटी नियंत्रण और सुरक्षा प्रक्रियाएं उपलब्ध कराने के लिए।',
          'धोखाधड़ी, स्पैम, फर्जी प्रोफाइल, दुरुपयोग, संदिग्ध लॉगिन और नीति उल्लंघन पहचानने के लिए।',
          'कानूनी, भुगतान, टैक्स, सुरक्षा और प्लेटफॉर्म आवश्यकताओं का पालन करने के लिए।',
        ],
      },
      {
        title: 'आपकी जानकारी साझा करना',
        bullets: [
          'अन्य सदस्यों के साथ केवल उतनी जानकारी साझा की जाती है जितनी प्रोफाइल, प्राथमिकताओं, मैच गतिविधि और अनुमत संपर्क विवरण दिखाने के लिए आवश्यक हो।',
          'इंफ्रास्ट्रक्चर, एनालिटिक्स, कम्युनिकेशन, भुगतान, सत्यापन और सपोर्ट प्रदाताओं के साथ, जो Mentora संचालन में सहायता करते हैं।',
          'कानून, कोर्ट आदेश, सुरक्षा जांच या धोखाधड़ी रोकथाम की आवश्यकता होने पर कानूनी अधिकारियों के साथ।',
        ],
      },
      {
        title: 'सुरक्षा और डेटा रखरखाव',
        body: 'हम सदस्य डेटा की सुरक्षा के लिए एन्क्रिप्टेड ट्रांसपोर्ट, एक्सेस कंट्रोल, मॉनिटरिंग, सुरक्षित स्टोरेज, मॉडरेशन वर्कफ्लो और ऑपरेशनल रिव्यू का उपयोग करते हैं। जानकारी केवल खाता संचालन, सुरक्षा, धोखाधड़ी रोकथाम, कानूनी अनुपालन और वैध व्यावसायिक रिकॉर्ड के लिए आवश्यक अवधि तक रखी जाती है।',
      },
      {
        title: 'आपके विकल्प और अधिकार',
        bullets: [
          'ऐप से अपनी प्रोफाइल जानकारी देखें और अपडेट करें।',
          'गोपनीयता, खोज योग्यता, कम्युनिकेशन और नोटिफिकेशन सेटिंग नियंत्रित करें।',
          'जहां लागू हो, सहमति वापस लें।',
          'अकाउंट डिलीशन या डेटा एक्सपोर्ट के लिए अकाउंट सेटिंग या सपोर्ट से अनुरोध करें।',
        ],
      },
      {
        title: 'हमसे संपर्क करें',
        body: `${COMPANY_NAME}\nईमेल: ${SUPPORT_EMAIL}\nवेबसाइट: www.webnza.com\nपता: नई दिल्ली, भारत`,
      },
    ],
  },
  'terms-conditions': {
    slug: 'terms-conditions',
    title: 'नियम और शर्तें',
    eyebrow: 'Mentora कानूनी',
    subtitle: 'Mentora को सुरक्षित और जिम्मेदारी से उपयोग करने के नियम।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'ये शर्तें Mentora उपयोग करने के नियम बताती हैं। खाता बनाकर या सेवा का उपयोग करके, आप इन शर्तों, हमारी गोपनीयता नीति और सामुदायिक सुरक्षा मानकों का पालन करने के लिए सहमत होते हैं।',
    sections: [
      {
        title: 'Mentora का उपयोग',
        body: 'आप सही प्रोफाइल जानकारी देने, सेवा का सम्मानपूर्वक उपयोग करने और प्रतिरूपण, उत्पीड़न, स्पैम, स्क्रैपिंग, व्यावसायिक आग्रह या गैरकानूनी गतिविधि से बचने के लिए सहमत हैं।',
      },
      {
        title: 'प्रोफाइल और मैच',
        body: 'मैच सुझाव, संगतता स्कोर और सिफारिशें केवल सूचना के लिए हैं। प्रोफाइल, बातचीत और निर्णयों का सुरक्षित मूल्यांकन करना आपकी जिम्मेदारी है।',
      },
      {
        title: 'सदस्यता और भुगतान',
        body: 'पेड फीचर खरीद के समय दिखाए गए प्लान नियमों के अनुसार नियंत्रित होते हैं। टैक्स, रिन्यूअल, कैंसलेशन, ट्रायल, रिफंड और भुगतान सत्यापन संबंधित ऐप स्टोर, भुगतान प्रदाता और Mentora बिलिंग नियमों के अनुसार होंगे।',
      },
      {
        title: 'खाता कार्रवाई',
        body: 'आप अकाउंट सेटिंग से अपना खाता निष्क्रिय कर सकते हैं या डिलीशन का अनुरोध कर सकते हैं। सुरक्षा, कानूनी, धोखाधड़ी रोकथाम, ऑडिट या भुगतान अनुपालन के लिए कुछ रिकॉर्ड रखे जा सकते हैं।',
      },
      {
        title: 'सुरक्षा',
        body: 'अन्य सदस्यों के साथ संवेदनशील वित्तीय जानकारी साझा न करें। संदिग्ध व्यवहार रिपोर्ट करें और जरूरत पड़ने पर ब्लॉकिंग टूल का उपयोग करें।',
      },
    ],
  },
  'community-guidelines': {
    slug: 'community-guidelines',
    title: 'समुदाय दिशानिर्देश',
    eyebrow: 'सहायता और समर्थन',
    subtitle: 'मेट्रिमोनियल खोज को सुरक्षित, ईमानदार और सम्मानजनक रखें।',
    sections: [
      {
        title: 'सच्ची प्रोफाइल जानकारी दें',
        body: 'अपनी वास्तविक पहचान, वर्तमान फोटो, सही संबंध स्थिति और ईमानदार परिवार, शिक्षा, व्यवसाय और जीवनशैली विवरण दें।',
      },
      {
        title: 'सम्मानपूर्वक संवाद करें',
        body: 'उत्पीड़न, धमकी, दबाव, अपमान या अपमानजनक संदेश न भेजें। मेट्रिमोनियल बातचीत सहमति-आधारित और परिवार-सुरक्षित रहनी चाहिए।',
      },
      {
        title: 'गोपनीयता की रक्षा करें',
        body: 'बिना अनुमति किसी सदस्य का फोन नंबर, ईमेल, फोटो, पता, दस्तावेज या चैट स्क्रीनशॉट साझा न करें।',
      },
      {
        title: 'धोखाधड़ी और आग्रह से बचें',
        body: 'पैसे न मांगें, बाहरी सेवाओं का प्रचार न करें, किसी और का रूप न धरें और Mentora का उपयोग व्यावसायिक लीड जनरेशन के लिए न करें।',
      },
      {
        title: 'असुरक्षित व्यवहार रिपोर्ट करें',
        body: 'यदि कोई प्रोफाइल फर्जी, संदिग्ध, अपमानजनक या गोपनीयता अपेक्षाओं का उल्लंघन करती लगे, तो रिपोर्ट और ब्लॉक कार्रवाई का उपयोग करें।',
      },
    ],
  },
  'child-safety': pages['child-safety'],
  'ai-tutor-disclaimer': pages['ai-tutor-disclaimer'],
  'refund-policy': pages['refund-policy'],
  faqs: {
    slug: 'faqs',
    title: 'अक्सर पूछे जाने वाले प्रश्न',
    eyebrow: 'सहायता और समर्थन',
    subtitle: 'खाता, प्रोफाइल, मैच, सुरक्षा और डिलीशन से जुड़े त्वरित उत्तर।',
    sections: [
      {
        title: 'मैं अपनी प्रोफाइल कैसे बनाऊं या अपडेट करूं?',
        body: 'Profile > Edit Profile पर जाएं। बेहतर मैच सिफारिशों के लिए साफ फोटो जोड़ें और सभी सेक्शन पूरे करें।',
      },
      {
        title: 'Mentora मैच कैसे ढूंढता है?',
        body: 'Mentora आपकी आयु, स्थान, शिक्षा, रुचियों, जीवनशैली और अन्य प्रोफाइल प्राथमिकताओं के आधार पर मैच सुझाता है।',
      },
      {
        title: 'क्या मेरी जानकारी सुरक्षित है?',
        body: 'हां। हम व्यक्तिगत जानकारी की सुरक्षा के लिए सुरक्षित सर्वर, एन्क्रिप्टेड डेटा ट्रांसफर, एक्सेस कंट्रोल, मॉनिटरिंग और गोपनीयता नियंत्रण का उपयोग करते हैं।',
      },
      {
        title: 'मैं अपना खाता कैसे हटा सकता हूं?',
        body: 'Settings > Account > Delete Account पर जाएं। पुष्टि के बाद आपका डेटा मानक रिटेंशन टाइमलाइन के अनुसार हटाया या अनाम किया जाता है।',
      },
    ],
  },
  'account-deletion': {
    slug: 'account-deletion',
    title: 'खाता और डेटा हटाना',
    eyebrow: 'यूजर डेटा अनुरोध',
    subtitle:
      'Mentora सदस्य अपना खाता और संबंधित व्यक्तिगत डेटा कैसे हटा सकते हैं।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'यह पेज बताता है कि आप अपना Mentora खाता और व्यक्तिगत डेटा हटाने का अनुरोध कैसे कर सकते हैं। यह सदस्यों, ऐप स्टोर समीक्षकों और प्लेटफॉर्म अनुपालन जांच के लिए उपलब्ध है।',
    sections: [
      {
        title: 'ऐप से अपना खाता हटाएं',
        bullets: [
          'Mentora ऐप खोलें और अपने खाते में साइन इन करें।',
          'Settings > Account Settings > Delete Account पर जाएं।',
          'पुष्टि संदेश पढ़ें और डिलीशन अनुरोध सबमिट करें।',
          'अनुरोध स्वीकार होने के बाद आपका प्रोफाइल उपलब्ध नहीं रहेगा, सुरक्षा, धोखाधड़ी, भुगतान और कानूनी जांच के अधीन।',
        ],
      },
      {
        title: 'यदि आप ऐप एक्सेस नहीं कर पा रहे हैं',
        body: `अपने पंजीकृत ईमेल पते से ${SUPPORT_EMAIL} पर "Account deletion request" विषय के साथ ईमेल भेजें। अनुरोध प्रोसेस करने से पहले हमारी सपोर्ट टीम सीमित सत्यापन मांग सकती है।`,
      },
      {
        title: 'हटाए या अनाम किए जाने वाला डेटा',
        bullets: [
          'प्रोफाइल विवरण, साथी प्राथमिकताएं, फोटो, वीडियो परिचय, दस्तावेज और वैकल्पिक सत्यापन जानकारी।',
          'चैट रूम, मैच गतिविधि, रुचियां, शॉर्टलिस्ट, प्रोफाइल व्यू, नोटिफिकेशन, सपोर्ट टिकट और डिवाइस/सेशन रिकॉर्ड जहां कानूनी और परिचालन रूप से अनुमति हो।',
          'रेफरल, वॉलेट, सदस्यता और भुगतान से जुड़े प्रोफाइल संदर्भ जहां संभव हो हटाए या अनाम किए जाते हैं।',
        ],
      },
      {
        title: 'सीमित उद्देश्यों के लिए रखे जा सकने वाले डेटा',
        bullets: [
          'कानून या भुगतान प्रदाताओं द्वारा आवश्यक भुगतान, टैक्स, इनवॉइस, रिफंड और सदस्यता रिकॉर्ड।',
          'सदस्यों और सेवा की सुरक्षा के लिए आवश्यक सुरक्षा, धोखाधड़ी रोकथाम, दुरुपयोग रिपोर्ट, मॉडरेशन निर्णय और ऑडिट लॉग।',
          'बैकअप कॉपी और सिस्टम लॉग सीमित अवधि तक सामान्य बैकअप रोटेशन से समाप्त होने तक।',
        ],
      },
      {
        title: 'अनुमतियां और डिवाइस एक्सेस',
        bullets: [
          'Mentora कैमरा, फोटो/मीडिया, नोटिफिकेशन, लोकेशन, माइक्रोफोन या कॉन्टैक्ट जैसी अनुमतियां केवल उन फीचर्स के लिए मांग सकता है जिन्हें आप उपयोग करना चुनते हैं।',
          'खाता हटाने के बाद Mentora आपके खाता डेटा का सदस्य-संबंधित फीचर्स में उपयोग बंद कर देता है।',
          'आप iOS या Android सिस्टम सेटिंग से कभी भी डिवाइस अनुमतियां वापस ले सकते हैं। ऐप अनइंस्टॉल करने से उस डिवाइस से ऐप एक्सेस भी हट जाता है।',
        ],
      },
      {
        title: 'समयसीमा और पुष्टि',
        body: `अधिकांश डिलीशन अनुरोध 30 दिनों के भीतर प्रोसेस किए जाते हैं, जब तक सुरक्षा, कानूनी, धोखाधड़ी रोकथाम या भुगतान अनुपालन के लिए डेटा रखना आवश्यक न हो। सहायता के लिए ${SUPPORT_EMAIL} से संपर्क करें।`,
      },
    ],
  },
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const paragraph = (value: string): string =>
  value
    .split('\n')
    .map((line) => escapeHtml(line))
    .join('<br />');

const renderSection = (section: StaticPageSection, index: number): string => {
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';
  const children = section.items?.length
    ? `<div class="nested">${section.items
        .map((item, childIndex) => renderSection(item, childIndex))
        .join('')}</div>`
    : '';

  return `<section class="section">
    <div class="section-number">${index + 1}</div>
    <div class="section-body">
      <h2>${escapeHtml(section.title)}</h2>
      ${section.body ? `<p>${paragraph(section.body)}</p>` : ''}
      ${bullets}
      ${children}
    </div>
  </section>`;
};

const normalizeTheme = (theme?: string): StaticPageTheme => {
  if (theme === 'dark' || theme === 'light') return theme;
  return 'system';
};

const normalizeLanguage = (language?: string): StaticPageLanguage => {
  const normalized = language?.trim().toLowerCase().split('-')[0];
  return normalized === 'hi' ? 'hi' : 'en';
};

const normalizeFontSize = (fontSize?: string): StaticPageFontSize => {
  if (
    fontSize === 'small' ||
    fontSize === 'large' ||
    fontSize === 'extra_large'
  ) {
    return fontSize;
  }

  return 'medium';
};

const normalizeBoolean = (value?: string | boolean): boolean =>
  value === true || value === 'true' || value === '1';

const fontScaleBySize: Record<StaticPageFontSize, string> = {
  small: '0.94',
  medium: '1',
  large: '1.12',
  extra_large: '1.22',
};

export const getStaticPageHtml = (
  slug: StaticPageSlug,
  options: StaticPageRenderOptions = {},
): string => {
  const selectedLanguage = normalizeLanguage(options.language);
  const page = selectedLanguage === 'hi' ? hindiPages[slug] : pages[slug];
  const selectedTheme = normalizeTheme(options.theme);
  const selectedFontSize = normalizeFontSize(options.fontSize);
  const boldText = normalizeBoolean(options.boldText);
  const highContrast = normalizeBoolean(options.highContrast);
  const reduceMotion = normalizeBoolean(options.reduceMotion);
  const themeAttribute =
    selectedTheme === 'system' ? '' : ` data-theme="${selectedTheme}"`;
  const accessibilityAttributes = ` data-font-size="${selectedFontSize}"${
    boldText ? ' data-bold-text="true"' : ''
  }${highContrast ? ' data-high-contrast="true"' : ''}${
    reduceMotion ? ' data-reduce-motion="true"' : ''
  }`;

  return `<!doctype html>
<html lang="${selectedLanguage}"${themeAttribute}${accessibilityAttributes}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(page.title)} - Mentora</title>
    <style>
      :root {
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #2563EB;
        --primary-soft: #DBEAFE;
        --accent: #0F766E;
        --page: #F8FAFC;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --text: #0F172A;
        --body: #1E293B;
        --muted: #64748B;
        --border: #E2E8F0;
        --shadow: rgba(37, 99, 235, 0.10);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --primary: #60A5FA;
          --primary-soft: rgba(96, 165, 250, 0.16);
          --accent: #2DD4BF;
          --page: #08111F;
          --surface: #101827;
          --surface-elevated: #172033;
          --text: #F8FAFC;
          --body: #E2E8F0;
          --muted: #94A3B8;
          --border: #243044;
          --shadow: rgba(0, 0, 0, 0.30);
        }
      }

      html[data-theme="light"] {
        color-scheme: light;
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #2563EB;
        --primary-soft: #DBEAFE;
        --accent: #0F766E;
        --page: #F8FAFC;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --text: #0F172A;
        --body: #1E293B;
        --muted: #64748B;
        --border: #E2E8F0;
        --shadow: rgba(37, 99, 235, 0.10);
      }

      html[data-theme="dark"] {
        color-scheme: dark;
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #60A5FA;
        --primary-soft: rgba(96, 165, 250, 0.16);
        --accent: #2DD4BF;
        --page: #08111F;
        --surface: #101827;
        --surface-elevated: #172033;
        --text: #F8FAFC;
        --body: #E2E8F0;
        --muted: #94A3B8;
        --border: #243044;
        --shadow: rgba(0, 0, 0, 0.30);
      }

      * { box-sizing: border-box; }
      html {
        min-height: 100%;
        background: var(--page);
        scrollbar-width: none;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }
      body {
        margin: 0;
        min-height: 100%;
        background: var(--page);
        color: var(--body);
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: calc(14px * var(--font-scale));
        line-height: 1.55;
        overflow-wrap: anywhere;
        -ms-overflow-style: none;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      html[data-bold-text="true"] body {
        font-weight: 700;
      }
      html[data-high-contrast="true"] {
        --primary: #1D4ED8;
        --primary-soft: #DBEAFE;
        --page: #FFFFFF;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --text: #111111;
        --body: #1F2937;
        --muted: #374151;
        --border: #4B5563;
        --shadow: rgba(0, 0, 0, 0.16);
      }
      html[data-theme="dark"][data-high-contrast="true"] {
        --primary: #93C5FD;
        --primary-soft: rgba(147, 197, 253, 0.20);
        --page: #000000;
        --surface: #080808;
        --surface-elevated: #111111;
        --text: #FFFFFF;
        --body: #FFFFFF;
        --muted: #F3F4F6;
        --border: #D1D5DB;
        --shadow: rgba(0, 0, 0, 0.40);
      }
      html[data-reduce-motion="true"] *,
      html[data-reduce-motion="true"] *::before,
      html[data-reduce-motion="true"] *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.001ms !important;
      }
      main {
        width: min(760px, 100%);
        margin: 0 auto;
        padding: max(14px, env(safe-area-inset-top)) 16px max(28px, env(safe-area-inset-bottom));
      }
      .hero {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 1px 2px var(--shadow);
        margin: 0 0 14px;
        padding: 18px;
      }
      .eyebrow {
        color: var(--primary);
        font-size: calc(12px * var(--font-scale));
        font-weight: 800;
        letter-spacing: .6px;
        margin: 0 0 7px;
        text-transform: uppercase;
      }
      h1 {
        color: var(--text);
        font-size: clamp(calc(20px * var(--font-scale)), 4vw, calc(28px * var(--font-scale)));
        line-height: 1.18;
        margin: 0 0 6px;
      }
      .subtitle {
        color: var(--muted);
        font-size: calc(13px * var(--font-scale));
        line-height: 1.5;
        margin: 0;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 1px 2px var(--shadow);
        overflow: hidden;
      }
      .intro {
        background: var(--page);
        border-bottom: 1px solid var(--border);
        padding: 14px;
      }
      .intro p, .updated {
        margin: 0;
      }
      .intro p {
        color: var(--body);
        font-size: calc(14px * var(--font-scale));
        line-height: 1.6;
      }
      .updated {
        color: var(--primary);
        font-size: calc(12px * var(--font-scale));
        font-weight: 700;
        margin-top: 10px;
      }
      .content {
        padding: 0;
      }
      .section {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        gap: 12px;
        padding: 14px;
        border-bottom: 1px solid var(--border);
      }
      .section:last-child {
        border-bottom: 0;
      }
      .section-number {
        width: 26px;
        height: 26px;
        border-radius: 13px;
        display: grid;
        place-items: center;
        background: var(--primary-soft);
        color: var(--primary);
        font-weight: 700;
        font-size: calc(13px * var(--font-scale));
        line-height: 1;
      }
      h2 {
        color: var(--text);
        font-size: calc(15px * var(--font-scale));
        line-height: 1.35;
        margin: 2px 0 5px;
      }
      p {
        margin: 0 0 8px;
      }
      ul {
        margin: 7px 0 0;
        padding-left: 18px;
      }
      li {
        margin: 5px 0;
        padding-left: 2px;
      }
      .nested {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }
      .nested .section {
        display: block;
        background: var(--surface-elevated);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px;
      }
      .nested .section-number {
        display: none;
      }
      footer {
        color: var(--muted);
        font-size: calc(12px * var(--font-scale));
        line-height: 1.5;
        padding: 16px 2px 0;
      }
      a {
        color: var(--primary);
        font-weight: 700;
      }
      @media (min-width: 768px) {
        main {
          padding-top: 28px;
          padding-bottom: 44px;
        }
        .hero {
          padding: 22px;
          margin-bottom: 18px;
        }
        h1 {
          font-size: calc(30px * var(--font-scale));
        }
        .subtitle {
          font-size: calc(15px * var(--font-scale));
        }
        .intro {
          padding: 18px 20px;
        }
        .section {
          grid-template-columns: 34px minmax(0, 1fr);
          gap: 14px;
          padding: 18px 20px;
        }
        .section-number {
          width: 28px;
          height: 28px;
          border-radius: 14px;
        }
        h2 {
          font-size: calc(16px * var(--font-scale));
        }
      }

      @media (max-width: 360px) {
        main {
          padding-left: 12px;
          padding-right: 12px;
        }
        .hero {
          padding: 16px;
        }
        .section {
          gap: 10px;
          padding: 13px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header class="hero">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="subtitle">${escapeHtml(page.subtitle)}</p>
      </header>
      <article class="card">
        ${
          page.intro || page.lastUpdated
            ? `<div class="intro">${page.intro ? `<p>${paragraph(page.intro)}</p>` : ''}${
                page.lastUpdated
                  ? `<p class="updated">${escapeHtml(page.lastUpdated)}</p>`
                  : ''
              }</div>`
            : ''
        }
        <div class="content">
          ${page.sections.map((section, index) => renderSection(section, index)).join('')}
        </div>
      </article>
      <footer>
        Mentora by Webnza Infotech. For support, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  </body>
</html>`;
};
