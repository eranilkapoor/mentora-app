import { Countries } from '@/core/types';
import type { Country } from '@/core/types';
import type { SelectOption } from '@/core/hooks/useEnumOptions';

export const INDIA_COUNTRY_OPTIONS: SelectOption<Country>[] = [
  {
    value: Countries.INDIA,
    label: 'India',
    searchText: 'India india',
  },
];

export const NRI_COUNTRY_OPTIONS: SelectOption<Country>[] = [
  {
    value: Countries.UNITED_STATES,
    label: 'United States',
    searchText: 'United States USA US America united_states',
  },
  {
    value: Countries.UNITED_KINGDOM,
    label: 'United Kingdom',
    searchText: 'United Kingdom UK Britain England united_kingdom',
  },
  {
    value: Countries.CANADA,
    label: 'Canada',
    searchText: 'Canada canada',
  },
  {
    value: Countries.AUSTRALIA,
    label: 'Australia',
    searchText: 'Australia AUS australia',
  },
  {
    value: Countries.UNITED_ARAB_EMIRATES,
    label: 'United Arab Emirates',
    searchText:
      'United Arab Emirates UAE Dubai Abu Dhabi Gulf united_arab_emirates',
  },
  {
    value: Countries.SINGAPORE,
    label: 'Singapore',
    searchText: 'Singapore singapore',
  },
  {
    value: Countries.NEW_ZEALAND,
    label: 'New Zealand',
    searchText: 'New Zealand new_zealand',
  },
  {
    value: Countries.OTHER,
    label: 'Other',
    searchText: 'Other other',
  },
];

const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

const INDIA_STATE_ALIASES: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  Chhattisgarh: 'CG',
  Delhi: 'NCR New Delhi',
  Gujarat: 'GJ',
  Haryana: 'HR',
  'Himachal Pradesh': 'HP',
  Jharkhand: 'JH',
  Karnataka: 'KA Bengaluru Bangalore',
  Kerala: 'KL',
  'Madhya Pradesh': 'MP',
  Maharashtra: 'MH Mumbai Pune',
  Odisha: 'OR OD',
  Punjab: 'PB',
  Rajasthan: 'RJ',
  'Tamil Nadu': 'TN Chennai',
  Telangana: 'TS TG Hyderabad',
  'Uttar Pradesh': 'UP',
  Uttarakhand: 'UK UA',
  'West Bengal': 'WB Kolkata',
  Chandigarh: 'CH',
  'Jammu and Kashmir': 'J&K JK',
};

export const INDIA_STATE_OPTIONS: SelectOption<string>[] = INDIA_STATES.map(
  (state) => ({
    value: state,
    label: state,
    searchText: `${state} ${INDIA_STATE_ALIASES[state] ?? ''}`,
  })
);
