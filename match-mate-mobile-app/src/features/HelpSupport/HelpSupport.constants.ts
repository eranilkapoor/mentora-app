import { FaqItem } from './HelpSupport.types';

export const FAQ_DATA: FaqItem[] = [
  {
    icon: 'user',
    question: 'How do I create or update my profile?',
    answer:
      'Go to Profile → Edit Profile. Add clear photos and complete all sections for better match recommendations.',
  },
  {
    icon: 'heart',
    question: 'How does MatchMate find matches?',
    answer:
      'Our algorithm recommends matches based on your preferences such as age, location, education, interests, and other profile parameters.',
  },
  {
    icon: 'shield',
    question: 'Is my information safe?',
    answer:
      'Yes. We use secure servers, encrypted data transfer, and strict privacy policies to protect your personal information.',
  },
  {
    icon: 'trash-2',
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Account → Delete Account. Once deleted, your data will be removed within standard retention timelines.',
  },
];
