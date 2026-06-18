export type StaticPageSlug =
  | 'privacy-policy'
  | 'terms-conditions'
  | 'community-guidelines'
  | 'faqs';

export type StaticPageTheme = 'light' | 'dark' | 'system';
export type StaticPageLanguage = 'en' | 'hi';

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
const COMPANY_NAME = 'Webnza Infotech / MatchMate';

const pages: Record<StaticPageSlug, StaticPageContent> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    eyebrow: 'MatchMate legal',
    subtitle: 'How MatchMate collects, uses, protects, and shares member data.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'MatchMate is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the MatchMate mobile application, website, and related services.',
    sections: [
      {
        title: 'Information we collect',
        items: [
          {
            title: 'Personal information',
            bullets: [
              'Full name, gender, date of birth, marital status, phone number, and email address.',
              'City, country, education, occupation, family details, and partner preferences.',
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
          'With infrastructure, analytics, communication, payment, verification, and support providers that help us operate MatchMate.',
          'With legal authorities when required by law, court order, safety investigation, or fraud prevention need.',
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
          'Withdraw consent where applicable.',
          'Request account deletion or data export from account settings or support.',
        ],
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
    eyebrow: 'MatchMate legal',
    subtitle: 'The rules for using MatchMate safely and responsibly.',
    lastUpdated: 'Last updated: 1 January 2026',
    intro:
      'These terms describe the rules for using MatchMate. By creating an account or using the service, you agree to follow these terms, our privacy policy, and our community safety standards.',
    sections: [
      {
        title: 'Use of MatchMate',
        body: 'You agree to provide accurate profile information, use the service respectfully, and avoid impersonation, harassment, spam, scraping, commercial solicitation, or unlawful activity.',
      },
      {
        title: 'Profiles and matches',
        body: 'Match suggestions, compatibility scores, and recommendations are informational. You are responsible for evaluating profiles, conversations, and decisions safely.',
      },
      {
        title: 'Subscriptions and payments',
        body: 'Paid features are governed by the plan terms shown at purchase. Taxes, renewals, cancellations, trials, refunds, and payment verification follow the applicable app store, payment provider, and MatchMate billing rules.',
      },
      {
        title: 'Account actions',
        body: 'You may deactivate your account or request deletion from account settings. Some records may be retained where required for security, legal, fraud prevention, audit, or payment compliance.',
      },
      {
        title: 'Safety',
        body: 'Do not share sensitive financial information with other members. Report suspicious behavior and use blocking tools when needed.',
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
        body: 'Use your real identity, current photos, accurate relationship status, and honest family, education, profession, and lifestyle details.',
      },
      {
        title: 'Communicate respectfully',
        body: 'Do not harass, threaten, pressure, shame, or send abusive messages. Matrimonial conversations should remain consent-based and family-safe.',
      },
      {
        title: 'Protect privacy',
        body: 'Do not share another member phone number, email, photos, address, documents, or chat screenshots without permission.',
      },
      {
        title: 'Avoid fraud and solicitation',
        body: 'Do not request money, promote outside services, impersonate anyone, or use MatchMate for commercial lead generation.',
      },
      {
        title: 'Report unsafe behavior',
        body: 'Use report and block actions when a profile looks fake, suspicious, abusive, or violates privacy expectations.',
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
        title: 'How does MatchMate find matches?',
        body: 'MatchMate recommends matches based on your preferences such as age, location, education, interests, lifestyle, and other profile parameters.',
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
};

const hindiPages: Record<StaticPageSlug, StaticPageContent> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'गोपनीयता नीति',
    eyebrow: 'MatchMate कानूनी',
    subtitle:
      'MatchMate सदस्य डेटा कैसे एकत्र, उपयोग, सुरक्षित और साझा करता है।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'MatchMate आपकी व्यक्तिगत जानकारी और गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि MatchMate मोबाइल ऐप, वेबसाइट और संबंधित सेवाओं का उपयोग करते समय हम आपकी जानकारी कैसे एकत्र, उपयोग, साझा और सुरक्षित करते हैं।',
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
          'इंफ्रास्ट्रक्चर, एनालिटिक्स, कम्युनिकेशन, भुगतान, सत्यापन और सपोर्ट प्रदाताओं के साथ, जो MatchMate संचालन में सहायता करते हैं।',
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
    eyebrow: 'MatchMate कानूनी',
    subtitle: 'MatchMate को सुरक्षित और जिम्मेदारी से उपयोग करने के नियम।',
    lastUpdated: 'अंतिम अपडेट: 1 जनवरी 2026',
    intro:
      'ये शर्तें MatchMate उपयोग करने के नियम बताती हैं। खाता बनाकर या सेवा का उपयोग करके, आप इन शर्तों, हमारी गोपनीयता नीति और सामुदायिक सुरक्षा मानकों का पालन करने के लिए सहमत होते हैं।',
    sections: [
      {
        title: 'MatchMate का उपयोग',
        body: 'आप सही प्रोफाइल जानकारी देने, सेवा का सम्मानपूर्वक उपयोग करने और प्रतिरूपण, उत्पीड़न, स्पैम, स्क्रैपिंग, व्यावसायिक आग्रह या गैरकानूनी गतिविधि से बचने के लिए सहमत हैं।',
      },
      {
        title: 'प्रोफाइल और मैच',
        body: 'मैच सुझाव, संगतता स्कोर और सिफारिशें केवल सूचना के लिए हैं। प्रोफाइल, बातचीत और निर्णयों का सुरक्षित मूल्यांकन करना आपकी जिम्मेदारी है।',
      },
      {
        title: 'सदस्यता और भुगतान',
        body: 'पेड फीचर खरीद के समय दिखाए गए प्लान नियमों के अनुसार नियंत्रित होते हैं। टैक्स, रिन्यूअल, कैंसलेशन, ट्रायल, रिफंड और भुगतान सत्यापन संबंधित ऐप स्टोर, भुगतान प्रदाता और MatchMate बिलिंग नियमों के अनुसार होंगे।',
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
        body: 'पैसे न मांगें, बाहरी सेवाओं का प्रचार न करें, किसी और का रूप न धरें और MatchMate का उपयोग व्यावसायिक लीड जनरेशन के लिए न करें।',
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
        title: 'MatchMate मैच कैसे ढूंढता है?',
        body: 'MatchMate आपकी आयु, स्थान, शिक्षा, रुचियों, जीवनशैली और अन्य प्रोफाइल प्राथमिकताओं के आधार पर मैच सुझाता है।',
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

export const getStaticPageHtml = (
  slug: StaticPageSlug,
  theme?: string,
  language?: string,
): string => {
  const selectedLanguage = normalizeLanguage(language);
  const page = selectedLanguage === 'hi' ? hindiPages[slug] : pages[slug];
  const selectedTheme = normalizeTheme(theme);
  const themeAttribute =
    selectedTheme === 'system' ? '' : ` data-theme="${selectedTheme}"`;

  return `<!doctype html>
<html lang="${selectedLanguage}"${themeAttribute}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(page.title)} - MatchMate</title>
    <style>
      :root {
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
      body {
        margin: 0;
        background: var(--page);
        color: var(--body);
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        line-height: 1.65;
      }
      main {
        width: min(920px, 100%);
        margin: 0 auto;
        padding: max(24px, env(safe-area-inset-top)) 18px max(32px, env(safe-area-inset-bottom));
      }
      .hero {
        padding: 26px 0 18px;
      }
      .eyebrow {
        color: var(--primary);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0;
        margin: 0 0 8px;
        text-transform: uppercase;
      }
      h1 {
        color: var(--text);
        font-size: clamp(30px, 7vw, 48px);
        line-height: 1.08;
        margin: 0 0 12px;
      }
      .subtitle {
        color: var(--muted);
        font-size: 17px;
        margin: 0;
        max-width: 720px;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 16px 40px var(--shadow);
        overflow: hidden;
      }
      .intro {
        background: var(--primary-soft);
        border-bottom: 1px solid var(--border);
        padding: 22px;
      }
      .intro p, .updated {
        margin: 0;
      }
      .updated {
        color: var(--primary);
        font-weight: 700;
        margin-top: 12px;
      }
      .content {
        padding: 6px 0;
      }
      .section {
        display: grid;
        grid-template-columns: 40px 1fr;
        gap: 14px;
        padding: 20px 22px;
        border-bottom: 1px solid var(--border);
      }
      .section:last-child {
        border-bottom: 0;
      }
      .section-number {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: var(--primary-soft);
        color: var(--primary);
        font-weight: 800;
        font-size: 14px;
      }
      h2 {
        color: var(--text);
        font-size: 18px;
        margin: 2px 0 8px;
      }
      p {
        margin: 0 0 10px;
      }
      ul {
        margin: 8px 0 0;
        padding-left: 20px;
      }
      li {
        margin: 7px 0;
      }
      .nested {
        display: grid;
        gap: 10px;
        margin-top: 12px;
      }
      .nested .section {
        background: var(--surface-elevated);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 14px;
      }
      .nested .section-number {
        display: none;
      }
      footer {
        color: var(--muted);
        font-size: 13px;
        padding: 18px 2px 0;
      }
      a {
        color: var(--primary);
        font-weight: 700;
      }
      @media (max-width: 520px) {
        main { padding-left: 14px; padding-right: 14px; }
        .section {
          grid-template-columns: 1fr;
          gap: 8px;
          padding: 18px;
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
        MatchMate by Webnza Infotech. For support, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
      </footer>
    </main>
  </body>
</html>`;
};
