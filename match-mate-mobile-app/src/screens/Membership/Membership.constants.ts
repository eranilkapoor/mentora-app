import { DurationPlan, Plan } from "./Membership.types";

export const PLANS: Plan[] = [
  { name: 'Pro Lite', price: '₹1,999', contacts: 0, superInterest: 0 },
  { name: 'Pro', price: '₹3,999', contacts: 25, superInterest: 0 },
  {
    name: 'Pro Max',
    price: '₹6,999',
    contacts: 50,
    superInterest: 50,
    best: true,
  },
];

export const FEATURES: { label: string; values: string[] }[] = [
  { label: 'Unlimited calls & chat', values: ['✔', '✔', '✔'] },
  { label: 'Engage+', values: ['✔', '✔', '✔'] },
  { label: 'Advanced Search', values: ['✔', '✔', '✔'] },
  { label: 'View Contact Numbers', values: ['0', '25', '50'] },
  { label: 'Super Interest', values: ['0', '0', '50'] },
];

export const DURATION_PLANS: DurationPlan[] = [
  { months: 3, price: '₹16,585', oldPrice: '₹33,169', perMonth: '₹5,528/mo' },
  { months: 6, price: '₹26,186', oldPrice: '₹52,372', perMonth: '₹4,364/mo' },
  { months: 12, price: '₹42,373', oldPrice: '₹84,745', perMonth: '₹3,531/mo' },
];

export const BENEFITS = [
  { icon: '⭐', text: 'All Pro Max benefits + unlimited daily matches' },
  { icon: '👩‍💼', text: 'Dedicated relationship manager assigned to you' },
];

export const POINTS = [
  'Enhance and optimise your profile',
  'Find the most relevant & serious matches',
  'Get additional info on the bride & her family',
  '3× faster matching with priority placement',
  'Unlimited meeting setups with profiles',
];