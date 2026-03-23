import httpClient from '../api/httpClient';
import { 
    PersonalData, 
    PhysicalData,
    EducationData, 
    FamilyData, 
    PreferencesData 
} from '../types/profile.types';

export const ProfileService = {
    getMyProfile: () => httpClient.get('/profile/me'),
    updatePersonalInfo: (personalData: PersonalData) => httpClient.put('/profile/personal', personalData),
    updatePhysicalInfo: (physicalData: PhysicalData) => httpClient.put('/profile/physical', physicalData),
    updateEducationInfo: (educationData: EducationData) => httpClient.put('/profile/education', educationData),
    updateFamilyInfo: (familyData: FamilyData) => httpClient.put('/profile/family', familyData),
    updatePreferences: (preferencesData: PreferencesData) => httpClient.put('/profile/preferences', preferencesData),
};