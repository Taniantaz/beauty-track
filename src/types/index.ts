// Aesthetic Journal - TypeScript Types

export type Category = 
  | 'face' 
  | 'skin' 
  | 'body' 
  | 'hair' 
  | 'makeup' 
  | 'brows' 
  | 'lashes' 
  | 'nails' 
  | 'tan';

export type PhotoTag = 'before' | 'after';

export interface Photo {
  id: string;
  uri: string;
  tag: PhotoTag;
  timestamp: Date;
}

export type ReminderInterval = 
  | '30days' 
  | '90days' 
  | '6months' 
  | '1year' 
  | 'custom';

export interface Reminder {
  id: string;
  procedureId: string;
  interval: ReminderInterval;
  customDays?: number;
  nextDate: Date;
  enabled: boolean;
}

export interface Procedure {
  id: string;
  name: string;
  category: Category;
  date: Date;
  clinic?: string;
  cost?: number;
  notes?: string;
  productBrand?: string;
  photos: Photo[];
  reminder?: Reminder;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  faceIdEnabled: boolean;
  darkModeEnabled: boolean;
  cloudBackupEnabled: boolean;
  procedureCount: number;
  photoCount: number;
  maxProcedures: number;
  maxPhotos: number;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  color: string;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  GoogleSignIn: undefined;
  MainTabs: undefined;
  ProcedureDetails: { procedureId: string };
  PhotoComparison: { procedureId: string };
  AddProcedure: { procedureId?: string };
  Settings: undefined;
  PremiumUpgrade: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Profile: undefined;
};

