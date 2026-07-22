type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {};

const compact = (value: UnknownRecord): UnknownRecord =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  );

export const presentProfileSummary = (
  value: unknown,
): UnknownRecord & { userId?: unknown } => {
  const profile = asRecord(value);
  const personal = asRecord(profile.personal);
  const physical = asRecord(profile.physical);
  const education = asRecord(profile.education);

  return compact({
    _id: profile._id,
    userId: profile.userId,
    profileFor: profile.profileFor,
    age: profile.age,
    personal: compact({
      firstName: personal.firstName,
      gender: personal.gender,
      religion: personal.religion,
      country: personal.country,
      state: personal.state,
      city: personal.city,
      isNri: personal.isNri,
      motherTongue: personal.motherTongue,
      maritalStatus: personal.maritalStatus,
      hasChildren: personal.hasChildren,
      smoking: personal.smoking,
      drinking: personal.drinking,
      eating: personal.eating,
      hobbies: personal.hobbies,
      personalityBadges: personal.personalityBadges,
      languages: personal.languages,
      aboutMe: personal.aboutMe,
    }),
    physical: compact({
      height: physical.height,
      bodyType: physical.bodyType,
      complexion: physical.complexion,
      disabilityStatus: physical.disabilityStatus,
    }),
    education: compact({
      qualification: education.qualification,
      field: education.field,
      occupationType: education.occupationType,
      occupation: education.occupation,
      companyName: education.companyName,
      jobRole: education.jobRole,
    }),
    profileScore: profile.profileScore,
    profileCompletionPercentage: profile.profileCompletionPercentage,
    isPremium: profile.isPremium,
    status: profile.status,
    images: profile.images,
    matchScore: profile.matchScore,
    compatibility: profile.compatibility,
    activeBoost: profile.activeBoost,
    boostedMatchScore: profile.boostedMatchScore,
  });
};

export const presentProfileDetail = (
  value: unknown,
  options: {
    showPersonalDetails: boolean;
    showExactAge: boolean;
    showIncome: boolean;
    showLastSeen: boolean;
  },
): UnknownRecord => {
  const summary = presentProfileSummary(value);
  const profile = asRecord(value);
  const personal = asRecord(profile.personal);
  const physical = asRecord(profile.physical);
  const education = asRecord(profile.education);
  const family = asRecord(profile.family);

  return compact({
    ...summary,
    age: options.showExactAge ? profile.age : undefined,
    personal: compact({
      ...(options.showPersonalDetails
        ? asRecord(summary.personal)
        : {
            firstName: personal.firstName,
            city: personal.city,
            state: personal.state,
            country: personal.country,
            isNri: personal.isNri,
            gender: personal.gender,
            maritalStatus: personal.maritalStatus,
            hobbies: [],
            languages: [],
          }),
      lastName: options.showPersonalDetails ? personal.lastName : undefined,
      citizenship: options.showPersonalDetails
        ? personal.citizenship
        : undefined,
      residencyCountry: options.showPersonalDetails
        ? personal.residencyCountry
        : undefined,
      visaStatus: options.showPersonalDetails ? personal.visaStatus : undefined,
      abroadSince: options.showPersonalDetails
        ? personal.abroadSince
        : undefined,
      willingToRelocate: options.showPersonalDetails
        ? personal.willingToRelocate
        : undefined,
      religiousDetails: options.showPersonalDetails
        ? personal.religiousDetails
        : undefined,
      sonsCount: options.showPersonalDetails ? personal.sonsCount : undefined,
      daughtersCount: options.showPersonalDetails
        ? personal.daughtersCount
        : undefined,
    }),
    physical: options.showPersonalDetails
      ? compact({
          height: physical.height,
          weight: physical.weight,
          bloodGroup: physical.bloodGroup,
          bodyType: physical.bodyType,
          complexion: physical.complexion,
          disabilityStatus: physical.disabilityStatus,
          disabilityNote:
            physical.disabilityStatus === true
              ? physical.disabilityNote
              : undefined,
        })
      : undefined,
    education: options.showPersonalDetails
      ? compact({
          qualification: education.qualification,
          field: education.field,
          university: education.university,
          occupationType: education.occupationType,
          occupation: education.occupation,
          companyName: education.companyName,
          jobRole: education.jobRole,
          annualIncomeAmount: options.showIncome
            ? education.annualIncomeAmount
            : undefined,
        })
      : undefined,
    family: options.showPersonalDetails
      ? compact({
          familyType: family.familyType,
          familyStatus: family.familyStatus,
          familyValues: family.familyValues,
          siblings: family.siblings,
        })
      : undefined,
    lastActiveAt: options.showLastSeen ? profile.lastActiveAt : undefined,
  });
};
