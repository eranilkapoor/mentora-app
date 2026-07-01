export type StaticPageSlug =
  | 'privacy-policy'
  | 'terms-conditions'
  | 'community-guidelines'
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
const COMPANY_NAME = 'Webnza Infotech / Match Mate';

const pages: Record<StaticPageSlug, StaticPageContent> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    eyebrow: 'Match Mate legal',
    subtitle:
      'How Match Mate collects, uses, protects, and shares member data.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'Match Mate is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Match Mate mobile application, website, and related services.',
    sections: [
      {
        title: 'Information we collect',
        items: [
          {
            title: 'Personal information',
            bullets: [
              'Full name, gender, date of birth, marital status, phone number, and email address.',
              'City, country, education, occupation, family details, and partner preferences.',
              'Religion, community, mother tongue, lifestyle choices, income range, horoscope or kundli details, and other matrimonial profile fields when you add them.',
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
              'App interactions including profile views, matches, interests, shortlists, support requests, and notification preferences.',
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
          'Recommend compatible matches and improve matchmaking quality.',
          'Enable chat, notifications, profile visibility controls, and safety workflows.',
          'Detect fraud, spam, fake profiles, abuse, suspicious logins, and policy violations.',
          'Comply with applicable legal, payment, tax, security, and platform obligations.',
        ],
      },
      {
        title: 'Sharing your information',
        bullets: [
          'With other members only as needed to show your profile, preferences, match activity, and permitted contact details.',
          'With infrastructure, analytics, communication, payment, verification, and support providers that help us operate Match Mate.',
          'With legal authorities when required by law, court order, safety investigation, or fraud prevention need.',
        ],
      },
      {
        title: 'Camera, media, location, and notification permissions',
        bullets: [
          'Camera and photo/media access are used for profile photos, verification selfies, documents, and optional video introductions.',
          'Microphone access may be used when you record or upload a video introduction or use communication features.',
          'Location access, when enabled, helps improve nearby match recommendations and regional preferences.',
          'Notification permission is used for matches, messages, security alerts, subscription updates, and support ticket replies.',
          'You can revoke device permissions anytime from Android or iOS settings.',
        ],
      },
      {
        title: 'Security and retention',
        body: 'We use encrypted transport, access controls, monitoring, secure storage, moderation workflows, and operational review to protect member data. We retain information only as long as needed for account operation, safety, fraud prevention, legal compliance, and legitimate business records.',
      },
      {
        title: 'Your choices and rights',
        bullets: [
          'Access and update profile information from the app.',
          'Control privacy, searchability, communication, and notification settings.',
          'Block or report members and request help through support tickets.',
          'Withdraw consent where applicable.',
          'Request account deletion or data export from account settings or support.',
        ],
      },
      {
        title: 'Children and eligibility',
        body: 'Match Mate is intended for adults who are legally eligible to use matrimonial services. We do not knowingly allow minors to create matrimonial profiles.',
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
    eyebrow: 'Match Mate legal',
    subtitle: 'The rules for using Match Mate safely and responsibly.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'These terms describe the rules for using Match Mate. By creating an account or using the service, you agree to follow these terms, our privacy policy, and our community safety standards.',
    sections: [
      {
        title: 'Eligibility and account responsibility',
        bullets: [
          'You must be legally eligible to use a matrimonial service and create an account for a genuine matrimonial purpose.',
          'You are responsible for keeping your login credentials secure and for all activity on your account.',
          'Family-managed profiles must clearly represent the member truthfully and must be used with appropriate consent.',
        ],
      },
      {
        title: 'Profiles and matches',
        bullets: [
          'You agree to provide accurate identity, relationship, family, education, occupation, location, and lifestyle information.',
          'Match suggestions, compatibility scores, curator recommendations, and search results are informational.',
          'You are responsible for evaluating profiles, conversations, and decisions safely before sharing personal details or meeting anyone.',
        ],
      },
      {
        title: 'Subscriptions and payments',
        bullets: [
          'Paid features are governed by the plan terms shown at purchase, including feature limits, trial period, renewal date, and price.',
          'Taxes, renewals, cancellations, refunds, checkout status, and payment verification follow the applicable app store, payment provider, and Match Mate billing rules.',
          'Some benefits such as boosts, coins, premium visibility, who-liked-me, video intro, or assisted services may depend on your active plan and feature availability.',
        ],
      },
      {
        title: 'Acceptable use',
        bullets: [
          'Do not impersonate others, create fake profiles, scrape data, send spam, harass members, or use Match Mate for commercial lead generation.',
          'Do not request money, gifts, bank details, OTPs, passwords, or sensitive documents from other members.',
          'Do not upload unlawful, explicit, hateful, violent, misleading, copyrighted, or privacy-violating content.',
        ],
      },
      {
        title: 'Account actions',
        body: 'You may deactivate your account or request deletion from account settings. Some records may be retained where required for security, legal, fraud prevention, audit, or payment compliance.',
      },
      {
        title: 'Safety, moderation, and enforcement',
        body: 'We may review, restrict, remove, suspend, or terminate accounts, content, messages, or features when we detect abuse, fraud, fake profiles, payment risk, safety issues, or policy violations. Use report and block tools when needed.',
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
    subtitle: 'Keep matrimonial discovery safe, honest, and respectful.',
    sections: [
      {
        title: 'Use truthful profile details',
        bullets: [
          'Use your real identity, current photos, accurate relationship status, and honest family, education, profession, income, location, and lifestyle details.',
          'Do not misrepresent age, marital status, religion, community, employment, education, visa status, family background, or intent.',
          'Keep family-managed profiles transparent and respectful of the member represented.',
        ],
      },
      {
        title: 'Upload appropriate photos and videos',
        bullets: [
          'Use clear, recent, non-misleading photos and only upload media you have permission to share.',
          'Do not upload explicit, violent, hateful, private, copyrighted, watermarked, or impersonation content.',
          'Video introductions should be respectful, family-safe, and relevant to matrimonial discovery.',
        ],
      },
      {
        title: 'Communicate respectfully',
        bullets: [
          'Do not harass, threaten, pressure, shame, stalk, or send abusive messages.',
          'Respect boundaries around contact details, calls, family involvement, and meeting decisions.',
          'Avoid casteist, communal, sexist, body-shaming, hateful, or degrading language.',
        ],
      },
      {
        title: 'Protect privacy',
        bullets: [
          'Do not share another member phone number, email, photos, address, documents, profile data, or chat screenshots without permission.',
          'Do not pressure members to move conversations outside Match Mate before they are comfortable.',
          'Do not collect member data for marketing, recruitment, scraping, or external databases.',
        ],
      },
      {
        title: 'Avoid fraud and solicitation',
        bullets: [
          'Do not request money, gifts, investments, loans, OTPs, passwords, bank details, or payment screenshots from other members.',
          'Do not promote outside services, agencies, crypto schemes, job offers, immigration services, or commercial matchmaking without authorization.',
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
  faqs: {
    slug: 'faqs',
    title: 'Frequently Asked Questions',
    eyebrow: 'Help and support',
    subtitle:
      'Quick answers about account, profile, matches, safety, and deletion.',
    sections: [
      {
        title: 'How do I create or update my profile?',
        body: 'Go to Profile > Edit Profile. Add clear photos and complete all sections for better match recommendations.',
      },
      {
        title: 'Why should I verify my profile?',
        body: 'Verification helps improve trust and may unlock a verified badge after review. You can start verification from Settings > Account Settings > Profile KYC verification.',
      },
      {
        title: 'How does Match Mate find matches?',
        body: 'Match Mate recommends matches based on your preferences such as age, location, education, interests, lifestyle, and other profile parameters.',
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
      'How Match Mate members can delete their account and associated personal data.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'This page explains how to request deletion of your Match Mate account and personal data. It is provided for members, app store reviewers, and platform compliance checks.',
    sections: [
      {
        title: 'Delete your account from the app',
        bullets: [
          'Open the Match Mate app and sign in to your account.',
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
        body: 'This page is available without signing in so app stores, reviewers, and members can confirm how account and data deletion works. The preferred secure path is still the in-app request because it verifies the signed-in account automatically.',
      },
      {
        title: 'Data scheduled for deletion or anonymization',
        bullets: [
          'Profile details, partner preferences, photos, video introductions, documents, and optional verification information.',
          'Chat rooms, match activity, interests, shortlists, profile views, notifications, support tickets, and device/session records where deletion is legally and operationally permitted.',
          'Referral, wallet, subscription, and payment-linked profile references are removed or anonymized where possible.',
        ],
      },
      {
        title: 'Data we may retain for limited purposes',
        bullets: [
          'Payment, tax, invoice, refund, and subscription records required by law or payment providers.',
          'Security, fraud prevention, abuse reports, moderation decisions, and audit logs needed to protect members and the service.',
          'Backup copies and system logs for a limited retention period before they expire through normal backup rotation.',
        ],
      },
      {
        title: 'Permissions and device access',
        bullets: [
          'Match Mate may request permissions such as camera, photos/media, notifications, location, microphone, or contacts only for app features you choose to use.',
          'Deleting your account stops Match Mate from using your account data for member-facing features.',
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
    eyebrow: 'Match Mate कानूनी',
    subtitle:
      'Match Mate सदस्य डेटा कैसे एकत्र, उपयोग, सुरक्षित और साझा करता है।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'Match Mate आपकी व्यक्तिगत जानकारी और गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि Match Mate मोबाइल ऐप, वेबसाइट और संबंधित सेवाओं का उपयोग करते समय हम आपकी जानकारी कैसे एकत्र, उपयोग, साझा और सुरक्षित करते हैं।',
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
          'इंफ्रास्ट्रक्चर, एनालिटिक्स, कम्युनिकेशन, भुगतान, सत्यापन और सपोर्ट प्रदाताओं के साथ, जो Match Mate संचालन में सहायता करते हैं।',
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
    eyebrow: 'Match Mate कानूनी',
    subtitle: 'Match Mate को सुरक्षित और जिम्मेदारी से उपयोग करने के नियम।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'ये शर्तें Match Mate उपयोग करने के नियम बताती हैं। खाता बनाकर या सेवा का उपयोग करके, आप इन शर्तों, हमारी गोपनीयता नीति और सामुदायिक सुरक्षा मानकों का पालन करने के लिए सहमत होते हैं।',
    sections: [
      {
        title: 'Match Mate का उपयोग',
        body: 'आप सही प्रोफाइल जानकारी देने, सेवा का सम्मानपूर्वक उपयोग करने और प्रतिरूपण, उत्पीड़न, स्पैम, स्क्रैपिंग, व्यावसायिक आग्रह या गैरकानूनी गतिविधि से बचने के लिए सहमत हैं।',
      },
      {
        title: 'प्रोफाइल और मैच',
        body: 'मैच सुझाव, संगतता स्कोर और सिफारिशें केवल सूचना के लिए हैं। प्रोफाइल, बातचीत और निर्णयों का सुरक्षित मूल्यांकन करना आपकी जिम्मेदारी है।',
      },
      {
        title: 'सदस्यता और भुगतान',
        body: 'पेड फीचर खरीद के समय दिखाए गए प्लान नियमों के अनुसार नियंत्रित होते हैं। टैक्स, रिन्यूअल, कैंसलेशन, ट्रायल, रिफंड और भुगतान सत्यापन संबंधित ऐप स्टोर, भुगतान प्रदाता और Match Mate बिलिंग नियमों के अनुसार होंगे।',
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
        body: 'पैसे न मांगें, बाहरी सेवाओं का प्रचार न करें, किसी और का रूप न धरें और Match Mate का उपयोग व्यावसायिक लीड जनरेशन के लिए न करें।',
      },
      {
        title: 'असुरक्षित व्यवहार रिपोर्ट करें',
        body: 'यदि कोई प्रोफाइल फर्जी, संदिग्ध, अपमानजनक या गोपनीयता अपेक्षाओं का उल्लंघन करती लगे, तो रिपोर्ट और ब्लॉक कार्रवाई का उपयोग करें।',
      },
    ],
  },
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
        title: 'Match Mate मैच कैसे ढूंढता है?',
        body: 'Match Mate आपकी आयु, स्थान, शिक्षा, रुचियों, जीवनशैली और अन्य प्रोफाइल प्राथमिकताओं के आधार पर मैच सुझाता है।',
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
      'Match Mate सदस्य अपना खाता और संबंधित व्यक्तिगत डेटा कैसे हटा सकते हैं।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'यह पेज बताता है कि आप अपना Match Mate खाता और व्यक्तिगत डेटा हटाने का अनुरोध कैसे कर सकते हैं। यह सदस्यों, ऐप स्टोर समीक्षकों और प्लेटफॉर्म अनुपालन जांच के लिए उपलब्ध है।',
    sections: [
      {
        title: 'ऐप से अपना खाता हटाएं',
        bullets: [
          'Match Mate ऐप खोलें और अपने खाते में साइन इन करें।',
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
          'Match Mate कैमरा, फोटो/मीडिया, नोटिफिकेशन, लोकेशन, माइक्रोफोन या कॉन्टैक्ट जैसी अनुमतियां केवल उन फीचर्स के लिए मांग सकता है जिन्हें आप उपयोग करना चुनते हैं।',
          'खाता हटाने के बाद Match Mate आपके खाता डेटा का सदस्य-संबंधित फीचर्स में उपयोग बंद कर देता है।',
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
    <title>${escapeHtml(page.title)} - Match Mate</title>
    <style>
      :root {
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #E94E77;
        --primary-soft: #FFF1F3;
        --accent: #D9A441;
        --page: #FFF9F7;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --text: #2B2B2B;
        --body: #4B5563;
        --muted: #6F6F6F;
        --border: #F1D5DC;
        --shadow: rgba(233, 78, 119, 0.10);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --primary: #FF5C8A;
          --primary-soft: rgba(255, 92, 138, 0.14);
          --accent: #C89B3C;
          --page: #0D0D0D;
          --surface: #1A1A1A;
          --surface-elevated: #242424;
          --text: #F8F8F8;
          --body: #E5E7EB;
          --muted: #D1D5DB;
          --border: #2D2D2D;
          --shadow: rgba(0, 0, 0, 0.30);
        }
      }

      html[data-theme="light"] {
        color-scheme: light;
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #E94E77;
        --primary-soft: #FFF1F3;
        --accent: #D9A441;
        --page: #FFF9F7;
        --surface: #FFFFFF;
        --surface-elevated: #FFFFFF;
        --text: #2B2B2B;
        --body: #4B5563;
        --muted: #6F6F6F;
        --border: #F1D5DC;
        --shadow: rgba(233, 78, 119, 0.10);
      }

      html[data-theme="dark"] {
        color-scheme: dark;
        --font-scale: ${fontScaleBySize[selectedFontSize]};
        --primary: #FF5C8A;
        --primary-soft: rgba(255, 92, 138, 0.14);
        --accent: #C89B3C;
        --page: #0D0D0D;
        --surface: #1A1A1A;
        --surface-elevated: #242424;
        --text: #F8F8F8;
        --body: #E5E7EB;
        --muted: #D1D5DB;
        --border: #2D2D2D;
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
        --primary: #D91F5C;
        --primary-soft: #FFE6EE;
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
        --primary: #FF7EA3;
        --primary-soft: rgba(255, 126, 163, 0.18);
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
        Match Mate by Webnza Infotech. For support, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  </body>
</html>`;
};
