// Aesthetic Journal - Mock Data

import {
  Procedure,
  User,
  CategoryInfo,
  OnboardingSlide,
  Category,
} from "../types";

export const CATEGORIES: CategoryInfo[] = [
  { id: "face", name: "Face", icon: "person-outline", color: "#7B6EF6" }, // Primary Lavender
  { id: "skin", name: "Skin", icon: "sparkles", color: "#FFD27D" }, // Soft Amber
  { id: "body", name: "Body", icon: "heart-outline", color: "#B8A8F0" }, // Medium Lavender (more visible)
  { id: "hair", name: "Hair", icon: "cut-outline", color: "#F2B705" }, // Honey Gold
  {
    id: "makeup",
    name: "Makeup",
    icon: "color-palette-outline",
    color: "#FFC896",
  }, // Warm Peach (more visible)
  { id: "brows", name: "Brows", icon: "eye-outline", color: "#9A93B8" }, // Muted Gray
  { id: "lashes", name: "Lashes", icon: "eye", color: "#7B6EF6" }, // Primary Lavender
  { id: "nails", name: "Nails", icon: "hand-left-outline", color: "#FFD27D" }, // Soft Amber
  { id: "tan", name: "Tan", icon: "sunny-outline", color: "#F2B705" }, // Honey Gold
];

export const PROCEDURE_SUGGESTIONS = [
  "Lip Filler",
  "Botox",
  "Botox - Forehead",
  "Botox - Crow's Feet",
  "Cheek Filler",
  "Jaw Filler",
  "Chin Filler",
  "Under Eye Filler",
  "Laser Hair Removal",
  "Chemical Peel",
  "Microneedling",
  "HydraFacial",
  "PRP Treatment",
  "Microblading",
  "Lash Extensions",
  "Lash Lift",
  "Brow Lamination",
  "Hair Extensions",
  "Keratin Treatment",
  "Gel Manicure",
  "Spray Tan",
  "IPL Treatment",
  "RF Microneedling",
  "Thread Lift",
  "Kybella",
  "CoolSculpting",
];

export const MOCK_USER: User = {
  id: "1",
  name: "Sarah Mitchell",
  email: "sarah@example.com",
  isPremium: false,
  faceIdEnabled: false,
  darkModeEnabled: false,
  cloudBackupEnabled: true,
  procedureCount: 4,
  photoCount: 6,
  maxProcedures: 3,
  maxPhotos: 10,
};

export const MOCK_PROCEDURES: Procedure[] = [
  {
    id: "1",
    name: "Lip Filler",
    category: "face",
    date: new Date("2024-11-15"),
    clinic: "Glow Aesthetics",
    cost: 650,
    notes: "First time getting lip filler. Dr. recommended 0.5ml Juvederm.",
    productBrand: "Juvederm",
    photos: [
      {
        id: "p1",
        uri: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
        tag: "before",
        timestamp: new Date("2024-11-15"),
      },
      {
        id: "p2",
        uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        tag: "after",
        timestamp: new Date("2024-11-15"),
      },
    ],
    reminder: {
      id: "r1",
      procedureId: "1",
      interval: "6months",
      nextDate: new Date("2025-05-15"),
      enabled: true,
    },
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "2",
    name: "Botox - Forehead",
    category: "face",
    date: new Date("2024-10-20"),
    clinic: "Beauty Bar Clinic",
    cost: 400,
    notes: "20 units total. Very natural result!",
    productBrand: "Botox",
    photos: [
      {
        id: "p3",
        uri: "https://images.unsplash.com/photo-1546961342-ea51f4d75e44?w=400",
        tag: "before",
        timestamp: new Date("2024-10-20"),
      },
      {
        id: "p4",
        uri: "https://images.unsplash.com/photo-1552234994-66ba234fd567?w=400",
        tag: "after",
        timestamp: new Date("2024-10-20"),
      },
    ],
    reminder: {
      id: "r2",
      procedureId: "2",
      interval: "90days",
      nextDate: new Date("2025-01-18"),
      enabled: true,
    },
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: "3",
    name: "Laser Hair Removal",
    category: "body",
    date: new Date("2024-09-10"),
    clinic: "Laser Studio",
    cost: 250,
    notes: "Session 3 of 6. Underarms and legs.",
    photos: [
      {
        id: "p5",
        uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        tag: "before",
        timestamp: new Date("2024-09-10"),
      },
    ],
    reminder: {
      id: "r3",
      procedureId: "3",
      interval: "30days",
      nextDate: new Date("2024-10-10"),
      enabled: true,
    },
    createdAt: new Date("2024-09-10"),
    updatedAt: new Date("2024-09-10"),
  },
  {
    id: "4",
    name: "Chemical Peel",
    category: "skin",
    date: new Date("2024-08-05"),
    clinic: "Skin Wellness Center",
    cost: 180,
    notes: "Light glycolic peel. 2 days of peeling.",
    photos: [
      {
        id: "p6",
        uri: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=400",
        tag: "after",
        timestamp: new Date("2024-08-05"),
      },
    ],
    createdAt: new Date("2024-08-05"),
    updatedAt: new Date("2024-08-05"),
  },
];

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "Track Your Beauty Journey",
    description:
      "Keep every treatment, touch-up, and appointment beautifully organized — all in one place",
    image: "beauty",
  },
  {
    id: "2",
    title: "See Your Transformation",
    description:
      "Compare before & after photos with an intuitive slider and watch your progress unfold.",
    image: "photos",
  },
  {
    id: "3",
    title: "Never Miss a Touch-Up",
    description:
      "Set smart reminders for maintenance appointments and keep your results looking fresh.",
    image: "reminder",
  },
];

export const getCategoryById = (id: Category): CategoryInfo | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getReminderIntervalLabel = (interval: string): string => {
  switch (interval) {
    case "30days":
      return "30 Days";
    case "90days":
      return "90 Days";
    case "6months":
      return "6 Months";
    case "1year":
      return "1 Year";
    case "custom":
      return "Custom";
    default:
      return interval;
  }
};
