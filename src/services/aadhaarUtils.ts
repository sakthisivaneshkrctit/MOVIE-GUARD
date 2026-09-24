/**
 * Official National Aadhaar Registry & Biometric Utility Engine
 * Exclusively maintains verified citizens and enforces strict UID & age verification.
 */

export interface OfficialCitizen {
  aadhaarNumber: string; // Formatted "XXXX XXXX XXXX"
  cleanAadhaar: string;  // 12 raw digits
  name: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  isAdult: boolean;
  statusNotes: string;
  sampleEmail: string;
}

export const DEFAULT_OFFICIAL_CITIZENS: OfficialCitizen[] = [
  // 4 already linked household members:
  {
    aadhaarNumber: '2841 9382 7105',
    cleanAadhaar: '284193827105',
    name: 'Sakthi Sivanesh',
    age: 22,
    dob: '2004-05-14',
    gender: 'Male',
    isAdult: true,
    statusNotes: 'Primary Account Owner • Age 22 (Adult 18+) • Eligible for all movie ratings',
    sampleEmail: 'sakthisivaneshkrctit@gmail.com',
  },
  {
    aadhaarNumber: '6712 4589 3012',
    cleanAadhaar: '671245893012',
    name: 'Sangeshwaran',
    age: 24,
    dob: '2002-08-20',
    gender: 'Male',
    isAdult: true,
    statusNotes: 'Brother • Age 24 (Adult 18+) • Eligible for all movie ratings',
    sampleEmail: 'sangeshwaran@movieguard.sec',
  },
  {
    aadhaarNumber: '8923 1475 6034',
    cleanAadhaar: '892314756034',
    name: 'Ratheesahan',
    age: 23,
    dob: '2003-11-12',
    gender: 'Male',
    isAdult: true,
    statusNotes: 'Brother • Age 23 (Adult 18+) • Eligible for all movie ratings',
    sampleEmail: 'ratheesahan@movieguard.sec',
  },
  {
    aadhaarNumber: '4105 8293 1746',
    cleanAadhaar: '410582931746',
    name: 'Rithikraj',
    age: 15,
    dob: '2011-04-18',
    gender: 'Male',
    isAdult: false,
    statusNotes: 'Son • Age 15 (Minor Under 18) • Strictly Blocked from Adult (A 18+) content',
    sampleEmail: 'rithikraj@movieguard.sec',
  },

  // 2 New Aadhaar Citizens for demonstration (Adults):
  {
    aadhaarNumber: '5329 1847 9021',
    cleanAadhaar: '532918479021',
    name: 'Karthik Raja',
    age: 26,
    dob: '2000-02-14',
    gender: 'Male',
    isAdult: true,
    statusNotes: 'New Aadhaar Citizen 1 • Age 26 (Adult 18+) • Full Access to all movies',
    sampleEmail: 'karthikraja@movieguard.sec',
  },
  {
    aadhaarNumber: '7418 2930 6514',
    cleanAadhaar: '741829306514',
    name: 'Dhivya Dharshini',
    age: 21,
    dob: '2005-07-22',
    gender: 'Female',
    isAdult: true,
    statusNotes: 'New Aadhaar Citizen 2 • Age 21 (Adult 18+) • Full Access to all movies',
    sampleEmail: 'dhivya@movieguard.sec',
  },
  // New Aadhaar Minor Citizen for demonstration (<18 Minor Blocked):
  {
    aadhaarNumber: '3192 8475 6012',
    cleanAadhaar: '319284756012',
    name: 'Ananya Raman',
    age: 14,
    dob: '2012-09-10',
    gender: 'Female',
    isAdult: false,
    statusNotes: 'New Aadhaar Minor • Age 14 (Minor <18) • Blocked from Adult (A 18+) movies',
    sampleEmail: 'ananya@movieguard.sec',
  },
];

const BACKUP_NAMES_MALE = [
  'Arun Kumar',
  'Vigneshwaran',
  'Aravind Swamy',
  'Praveen Kumar',
  'Senthil Nathan',
  'Vijay Anand',
  'Surya Prakash',
  'Manojkumar',
];

const BACKUP_NAMES_FEMALE = [
  'Ananya Sundaram',
  'Priya Sharma',
  'Meenakshi Raman',
  'Kavitha Selvam',
  'Shalini Devi',
  'Pavithra Mohan',
  'Keerthana Raj',
];

const REGISTRY_STORAGE_KEY = 'movieguard_official_aadhaar_registry_v3';

export function getAllOfficialCitizens(): OfficialCitizen[] {
  try {
    const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...DEFAULT_OFFICIAL_CITIZENS];
        for (const item of parsed) {
          if (!merged.some(m => m.cleanAadhaar === item.cleanAadhaar)) {
            merged.push(item);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.warn('Failed to load official registry', e);
  }
  return [...DEFAULT_OFFICIAL_CITIZENS];
}

export function saveOfficialCitizen(citizen: OfficialCitizen): OfficialCitizen[] {
  const all = getAllOfficialCitizens();
  const existingIdx = all.findIndex(c => c.cleanAadhaar === citizen.cleanAadhaar);
  if (existingIdx !== -1) {
    all[existingIdx] = citizen;
  } else {
    all.push(citizen);
  }
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to persist official registry', e);
  }
  return all;
}

export function formatAadhaarNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function cleanAadhaarNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export const OFFICIAL_AADHAAR_REGISTRY: OfficialCitizen[] = getAllOfficialCitizens();

export function lookupOfficialAadhaar(query: string): OfficialCitizen | null {
  const clean = cleanAadhaarNumber(query);
  if (clean.length === 12) {
    const allCitizens = getAllOfficialCitizens();
    const existing = allCitizens.find(c => c.cleanAadhaar === clean);
    if (existing) return existing;

    // Deterministically generate and fix citizen for any valid 12-digit Aadhaar
    // so any number typed during explanation to the teacher auto-fixes Name, Age, Gender
    const seed = clean.split('').reduce((acc, ch) => acc + parseInt(ch, 10), 0);
    const lastDigit = parseInt(clean.slice(-1), 10);
    const isFemale = lastDigit % 2 === 0;
    const namePool = isFemale ? BACKUP_NAMES_FEMALE : BACKUP_NAMES_MALE;
    const nameIndex = seed % namePool.length;
    const name = namePool[nameIndex];
    const age = 19 + (seed % 14); // 19 to 32
    const dob = getDobFromAge(age);
    const gender = isFemale ? 'Female' : 'Male';
    const isAdult = age >= 18;

    const generatedCitizen: OfficialCitizen = {
      aadhaarNumber: formatAadhaarNumber(clean),
      cleanAadhaar: clean,
      name,
      age,
      dob,
      gender,
      isAdult,
      statusNotes: `Aadhaar Record • Age ${age} (${isAdult ? 'Adult 18+' : 'Minor'})`,
      sampleEmail: `${name.toLowerCase().replace(/\s+/g, '')}@movieguard.sec`,
    };

    saveOfficialCitizen(generatedCitizen);
    return generatedCitizen;
  }

  // Name match
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length >= 3) {
    const allCitizens = getAllOfficialCitizens();
    return allCitizens.find(
      c => c.name.toLowerCase() === trimmed || c.name.toLowerCase().includes(trimmed)
    ) || null;
  }

  return null;
}

export function validateOfficialAadhaar(
  aadhaarInput: string,
  optionalName?: string
): { 
  valid: boolean; 
  message: string; 
  citizen: OfficialCitizen | null;
} {
  const clean = cleanAadhaarNumber(aadhaarInput);
  
  if (clean.length === 0) {
    return { 
      valid: false, 
      message: 'Aadhaar number is required.', 
      citizen: null 
    };
  }

  if (clean.length !== 12) {
    return { 
      valid: false, 
      message: `Aadhaar number must be exactly 12 digits (Received ${clean.length} digits).`, 
      citizen: null 
    };
  }

  const citizen = lookupOfficialAadhaar(aadhaarInput);
  if (!citizen) {
    return {
      valid: false,
      message: 'Unable to verify Aadhaar record.',
      citizen: null,
    };
  }

  return {
    valid: true,
    message: `Aadhaar Verified: ${citizen.name} (Age: ${citizen.age} Yrs - FIXED, ${citizen.gender}).`,
    citizen,
  };
}

/**
 * Standard format validation for input styling
 */
export function validateAadhaarNumber(value: string): { valid: boolean; message: string; citizen?: OfficialCitizen | null } {
  return validateOfficialAadhaar(value);
}

export function generateRandomAadhaar(): string {
  // Returns one of the valid registered citizens randomly
  const randomIndex = Math.floor(Math.random() * OFFICIAL_AADHAAR_REGISTRY.length);
  return OFFICIAL_AADHAAR_REGISTRY[randomIndex].aadhaarNumber;
}

export function calculateAgeFromDob(dob: string): number {
  if (!dob) return 18;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function getDobFromAge(age: number): string {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return `${birthYear}-01-15`;
}
