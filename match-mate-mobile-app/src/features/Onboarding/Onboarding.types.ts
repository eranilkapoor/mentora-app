export type RegistrationStep = 'basic' | 'preferences' | 'photos';

export interface DropdownPickerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  field: string;
  errors: Record<string, string>;
  onClearError: (field: string) => void;
  showDropdown: string | null;
  onSetShowDropdown: (val: string | null) => void;
}

export interface ErrorTextProps {
  field: string;
  errors: Record<string, string>;
}

export interface ProfileImage {
  uri: string;
  isPrimary?: boolean;
}