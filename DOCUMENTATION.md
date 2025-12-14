# Beauty Track App - Complete Documentation

## Table of Contents

1. [Business Overview](#business-overview)
2. [Technical Architecture](#technical-architecture)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [State Management](#state-management)
6. [Navigation Structure](#navigation-structure)
7. [UI/UX Design System](#uiux-design-system)
8. [Data Models](#data-models)
9. [Screens](#screens)
10. [Components](#components)
11. [Dependencies](#dependencies)
12. [Development Notes](#development-notes)
13. [Future Enhancements](#future-enhancements)
14. [Security Considerations](#security-considerations)

---

## Business Overview

### App Purpose

**Beauty Track** (also referred to as "Aesthetic Journal" in code comments) is a mobile application designed to help users track and manage their cosmetic and aesthetic procedures. The app serves as a personal beauty journal where users can:

- Log cosmetic procedures with detailed information
- Track before/after photos to visualize progress
- Set reminders for maintenance appointments
- Organize procedures by categories
- Monitor spending on treatments
- Maintain a comprehensive history of their aesthetic journey

### Target Audience

- Individuals who regularly undergo cosmetic procedures (fillers, Botox, laser treatments, etc.)
- Users seeking to track treatment schedules and maintenance
- People who want to visualize their transformation journey
- Users who need reminders for follow-up appointments

### Business Model

- **Free Tier**: Limited procedures (3 max) and photos (10 max)
- **Premium Tier**: Unlimited procedures and photos, cloud backup, advanced features
- In-app purchases for premium subscription

### Key Value Propositions

1. **Organization**: Centralized tracking of all aesthetic procedures
2. **Visual Progress**: Before/after photo comparison tools
3. **Reminder System**: Never miss a maintenance appointment
4. **Privacy**: Secure, local-first data storage with optional cloud backup
5. **User-Friendly**: Beautiful, intuitive interface designed for emotional safety

---

## Technical Architecture

### Technology Stack

- **Framework**: React Native with Expo (~54.0.29)
- **Language**: TypeScript (5.9.2)
- **React Version**: 19.1.0
- **React Native Version**: 0.81.5
- **State Management**: Zustand (5.0.9)
- **Navigation**: React Navigation (v7)
- **Animation**: React Native Reanimated (4.1.1)
- **Gestures**: React Native Gesture Handler (2.28.0)

### Architecture Pattern

The app follows a **component-based architecture** with:

- **Separation of Concerns**: Clear separation between UI, state, and business logic
- **State Management**: Zustand stores for global state (replacing deprecated React Context)
- **Type Safety**: Full TypeScript implementation with strict typing
- **Functional Components**: All components use functional React patterns with hooks

### Key Architectural Decisions

1. **Zustand over Context API**: Migrated from React Context to Zustand for better performance and simpler state management
2. **Expo Managed Workflow**: Using Expo's managed workflow for streamlined development and deployment
3. **TypeScript First**: All code is TypeScript with comprehensive type definitions
4. **Component Composition**: Reusable, composable components with clear interfaces
5. **Safe Area Management**: Using `react-native-safe-area-context` for proper handling of device notches and insets

---

## Project Structure

```
beauty-track/
├── App.tsx                    # Root app component
├── app.json                   # Expo configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── index.ts                   # Entry point
│
├── assets/                    # Static assets (icons, images)
│
└── src/
    ├── components/            # Reusable UI components
    │   ├── AnimatedScreen.tsx
    │   ├── Button.tsx
    │   ├── CategoryIcon.tsx
    │   ├── FloatingActionButton.tsx
    │   ├── JourneyStats.tsx
    │   ├── ProcedureCard.tsx
    │   ├── TimelineIndicator.tsx
    │   └── index.ts
    │
    ├── constants/             # App-wide constants
    │   └── theme.ts           # Colors, sizes, gradients, shadows
    │
    ├── context/               # React Context (DEPRECATED)
    │   └── AppContext.tsx     # Legacy context, use Zustand instead
    │
    ├── data/                  # Mock data and utilities
    │   └── mockData.ts        # Categories, procedures, user data
    │
    ├── hooks/                 # Custom React hooks
    │   ├── useProcedures.ts
    │   └── index.ts
    │
    ├── lib/                   # External service configurations
    │   └── supabase.ts        # Supabase client setup
    │
    ├── navigation/            # Navigation configuration
    │   └── AppNavigator.tsx   # Main navigation setup
    │
    ├── screens/               # Screen components
    │   ├── AddProcedureScreen.tsx
    │   ├── GoogleSignInScreen.tsx # Google OAuth sign-in
    │   ├── HomeScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── PhotoComparisonScreen.tsx
    │   ├── ProcedureDetailsScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── index.ts
    │
    ├── store/                 # Zustand state stores
    │   ├── index.ts
    │   ├── useAuthStore.ts    # Authentication state (Supabase)
    │   ├── useProcedureStore.ts
    │   ├── useSettingsStore.ts
    │   └── useUserStore.ts
    │
    └── types/                 # TypeScript type definitions
        └── index.ts
```

---

## Core Features

### 1. Procedure Tracking

- **Add Procedures**: Comprehensive form to log new procedures

  - Procedure name with autocomplete suggestions
  - Category selection (9 categories available)
  - Date selection
  - Clinic/provider information
  - Product/brand tracking
  - Cost tracking
  - Notes field
  - Before/after photo uploads
  - Reminder configuration

- **Edit Procedures**: Modify existing procedure details
- **Delete Procedures**: Remove procedures with confirmation
- **View Details**: Full-screen procedure details with photo gallery

### 2. Photo Management

- **Before/After Photos**: Tag photos as "before" or "after"
- **Photo Gallery**: View all photos in a grid layout
- **Photo Comparison**: Interactive slider to compare before/after photos side-by-side
- **Image Picker**: Integration with `expo-image-picker` for photo selection

### 3. Reminder System

- **Automatic Reminders**: Set reminders when adding procedures
- **Interval Options**:
  - 30 days
  - 90 days
  - 6 months
  - 1 year
  - Custom interval
- **Reminder Status**: Visual indicators for active reminders
- **Next Date Calculation**: Automatic calculation of next reminder date

### 4. Categories

Nine procedure categories with distinct icons and colors:

- Face (Primary Lavender)
- Skin (Soft Amber)
- Body (Medium Lavender)
- Hair (Honey Gold)
- Makeup (Warm Peach)
- Brows (Muted Gray)
- Lashes (Primary Lavender)
- Nails (Soft Amber)
- Tan (Honey Gold)

### 5. Statistics Dashboard

- **Journey Stats Component**: Displays key metrics
  - Total procedures count
  - Total photos count
  - Active reminders count

### 6. User Profile

- **Profile Information**: Name, email, plan status
- **Usage Tracking**: Visual progress bar showing procedure usage vs. limits
- **Settings**:
  - Face ID Lock toggle
  - Dark Mode toggle (UI ready, not fully implemented)
  - Cloud Backup option
  - Premium upgrade option
  - Help & Support
  - Privacy & Terms

### 7. Onboarding

- **First-Time Experience**: 3-slide onboarding flow
  - Track Your Beauty Journey
  - Visualize Your Progress
  - Never Miss a Touch-Up
- **Skip Option**: Users can skip onboarding
- **Persistence**: Onboarding status stored in settings

### 8. Authentication (Google Sign-In)

- **Provider**: Supabase Auth with Google OAuth
- **Flow**: Onboarding → Google Sign-In → Main App
- **Features**:
  - Google OAuth 2.0 authentication
  - Session persistence with AsyncStorage
  - Auto token refresh
  - Sign out functionality
  - Skip option for guest usage
- **User Data**: Fetches name, email, and avatar from Google profile
- **Session Management**: Automatic session restoration on app launch

---

## State Management

### Zustand Stores

The app uses **Zustand** for state management, replacing the deprecated React Context API.

#### 1. Procedure Store (`useProcedureStore.ts`)

Manages all procedure-related state and actions.

**State:**

- `procedures: Procedure[]` - Array of all procedures

**Actions:**

- `addProcedure(procedure)` - Add a new procedure
- `updateProcedure(id, updates)` - Update an existing procedure
- `deleteProcedure(id)` - Delete a procedure
- `getProcedureById(id)` - Retrieve a procedure by ID
- `reset()` - Reset to mock data

**Side Effects:**

- Automatically updates user stats (procedureCount, photoCount) when procedures are added/deleted

#### 2. User Store (`useUserStore.ts`)

Manages user profile and account information.

**State:**

- `user: User` - Current user object

**Actions:**

- `updateUser(updates)` - Update user properties
- `reset()` - Reset to mock user data

**User Properties:**

- Basic info (id, name, email, avatar)
- Subscription status (isPremium)
- Settings (faceIdEnabled, darkModeEnabled, cloudBackupEnabled)
- Usage limits (procedureCount, photoCount, maxProcedures, maxPhotos)

#### 3. Settings Store (`useSettingsStore.ts`)

Manages app-level settings.

**State:**

- `hasSeenOnboarding: boolean` - Whether user has completed onboarding
- `isDarkMode: boolean` - Dark mode preference

**Actions:**

- `setHasSeenOnboarding(value)` - Mark onboarding as seen
- `setIsDarkMode(value)` - Toggle dark mode
- `reset()` - Reset all settings

#### 4. Auth Store (`useAuthStore.ts`)

Manages authentication state with Supabase.

**State:**

- `session: Session | null` - Current Supabase session
- `user: User | null` - Authenticated user from Supabase
- `isLoading: boolean` - Loading state during auth operations
- `isInitialized: boolean` - Whether auth has been initialized

**Actions:**

- `setSession(session)` - Update the current session
- `setLoading(loading)` - Set loading state
- `initialize()` - Initialize auth, restore session, and listen for changes
- `signOut()` - Sign out the current user

**Auth Listener:**

- Automatically listens for auth state changes via `supabase.auth.onAuthStateChange()`
- Updates session and user state when auth events occur

### Deprecated: AppContext

The `AppContext.tsx` file is marked as deprecated. All new code should use Zustand stores instead.

---

## Navigation Structure

### Navigation Stack

The app uses **React Navigation v7** with a combination of Stack and Tab navigators.

```
RootStackNavigator
├── OnboardingScreen (conditional initial route - first time users)
├── GoogleSignInScreen (authentication - after onboarding)
├── MainTabsNavigator
│   ├── HomeScreen (Tab)
│   └── ProfileScreen (Tab)
├── AddProcedureScreen (Modal)
├── ProcedureDetailsScreen (Stack)
└── PhotoComparisonScreen (Full Screen Modal)
```

### Initial Route Logic

The initial route is determined by:

1. If user hasn't seen onboarding → `Onboarding`
2. If user has active session → `MainTabs`
3. Otherwise → `GoogleSignIn`

### Navigation Types

Defined in `src/types/index.ts`:

- `RootStackParamList` - Parameters for root stack screens
- `MainTabsParamList` - Parameters for tab screens

### Custom Tab Bar

- **Custom Design**: Rounded top corners, floating add button
- **Floating Action Button (FAB)**: Centered above tab bar, navigates to AddProcedure
- **Tab Indicators**: Small dots below icons to show active state
- **Safe Area Handling**: Proper padding for device insets

### Screen Transitions

- **Onboarding**: Fade animation
- **Main Tabs**: Fade animation
- **Add Procedure**: Slide from bottom (modal)
- **Procedure Details**: Slide from right
- **Photo Comparison**: Fade (full screen modal)

---

## UI/UX Design System

### Design Philosophy

The app uses a **"Hybrid Lavender & Honey Gold"** color palette designed to be:

- Premium and elegant
- Warm and emotionally safe
- Modern and approachable

### Color Palette

#### Primary Colors

- **Primary Lavender**: `#7B6EF6` - Main brand color, navigation, active states
- **Honey Gold**: `#F2B705` - CTA buttons, highlights, emotional moments
- **Soft Amber**: `#FFD27D` - Secondary accent
- **Light Peach**: `#FFEEE1` - Warm surface, sections
- **Soft Lavender**: `#EDE9FF` - Background tint

#### Text Colors

- **Dark Text**: `#3A2E5C` - Primary text (Dark Plum)
- **Warm Cocoa**: `#7A5A3A` - Secondary text
- **Muted Text**: `#9A93B8` - Icons, inactive states

#### Background Colors

- **Background**: `#FBFAFF` - Warm White (main background)
- **Card Background**: `#FFFFFF` - White or lightly tinted
- **Input Background**: `#FBFAFF` - Warm White

#### Status Colors

- **Success**: `#7CB992` - Soft green
- **Warning**: `#FFD27D` - Soft Amber
- **Error**: `#F6A5A5` - Soft warm red
- **Info**: `#7B6EF6` - Primary Lavender

### Typography

- **Font Family**: System fonts (iOS/Android native)
- **Font Sizes**:
  - `fontXs`: 12px
  - `fontSm`: 14px
  - `fontMd`: 16px
  - `fontLg`: 18px
  - `fontXl`: 22px
  - `fontXxl`: 28px
  - `fontDisplay`: 34px

### Spacing System

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Border Radius

- `radiusSm`: 12px
- `radiusMd`: 16px
- `radiusLg`: 20px
- `radiusXl`: 24px
- `radiusFull`: 9999px (circular)

### Shadows

Three shadow levels for depth:

- **Small**: Subtle elevation for cards
- **Medium**: Moderate elevation for modals
- **Large**: Strong elevation for FABs and important elements

### Gradients

- **Primary Gradient**: Lavender → Honey Gold (for CTAs)
- **Secondary Gradient**: Soft Amber → Light Peach
- **Header Gradient**: Soft Lavender → Background
- **Card Gradient**: White → Light Lavender tint
- **Background Gradient**: Purple tint → Warm White

### Component Patterns

- **Cards**: Rounded corners, subtle shadows, gradient backgrounds
- **Buttons**: Gradient backgrounds for primary actions, outlined for secondary
- **Inputs**: Rounded, with icons, subtle borders
- **Icons**: Ionicons from `@expo/vector-icons`

---

## Data Models

### Type Definitions (`src/types/index.ts`)

#### Category

```typescript
type Category =
  | "face"
  | "skin"
  | "body"
  | "hair"
  | "makeup"
  | "brows"
  | "lashes"
  | "nails"
  | "tan";
```

#### Photo

```typescript
interface Photo {
  id: string;
  uri: string;
  tag: "before" | "after";
  timestamp: Date;
}
```

#### Reminder

```typescript
interface Reminder {
  id: string;
  procedureId: string;
  interval: ReminderInterval; // '30days' | '90days' | '6months' | '1year' | 'custom'
  customDays?: number;
  nextDate: Date;
  enabled: boolean;
}
```

#### Procedure

```typescript
interface Procedure {
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
```

#### User

```typescript
interface User {
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
```

#### CategoryInfo

```typescript
interface CategoryInfo {
  id: Category;
  name: string;
  icon: string; // Ionicons name
  color: string; // Hex color
}
```

### Mock Data

Located in `src/data/mockData.ts`:

- `CATEGORIES`: Array of 9 category definitions
- `PROCEDURE_SUGGESTIONS`: Autocomplete suggestions for procedure names
- `MOCK_USER`: Sample user data
- `MOCK_PROCEDURES`: Sample procedures for development
- `ONBOARDING_SLIDES`: Onboarding content

### Utility Functions

- `getCategoryById(id)`: Get category info by ID
- `formatDate(date)`: Format date as "MMM DD, YYYY"
- `formatCurrency(amount)`: Format as USD currency
- `getReminderIntervalLabel(interval)`: Get human-readable interval label

---

## Screens

### 1. OnboardingScreen

**Purpose**: First-time user experience

**Features**:

- 3-slide carousel with animated pagination
- Skip button
- Continue/Get Started button
- Animated illustrations
- Persists onboarding status

**Navigation**:

- Replaces to `MainTabs` on completion

### 2. GoogleSignInScreen

**Purpose**: Authentication screen for Google Sign-In

**Features**:

- Google OAuth authentication via Supabase
- Loading state during authentication
- Error handling with user-friendly alerts
- Skip option for guest users
- Terms of Service and Privacy Policy links

**Authentication Flow**:

1. User taps "Continue with Google"
2. Opens system browser with Google OAuth
3. User authenticates with Google
4. Redirect back to app with tokens
5. Session stored in Supabase client
6. Navigate to MainTabs

**Components Used**:

- `expo-web-browser` for OAuth flow
- `expo-auth-session` for redirect URI generation
- Supabase client for authentication

**Navigation**:

- Replaces to `MainTabs` on successful sign-in or skip

### 3. HomeScreen

**Purpose**: Main dashboard showing procedure timeline

**Features**:

- Personalized welcome header with user's first name
- Search and notifications buttons (UI only, not functional)
- Journey Stats card (procedures, photos, reminders count)
- Timeline section with procedure cards
- Pull-to-refresh
- Empty state when no procedures
- Animated scroll header (opacity change)

**Components Used**:

- `JourneyStats`
- `ProcedureCard`
- `TimelineIndicator`
- `AnimatedScreen`

### 4. AddProcedureScreen

**Purpose**: Add or edit procedures

**Features**:

- Comprehensive form with all procedure fields
- Category grid selection
- Date picker (UI only, uses current date)
- Before/after photo uploads
- Procedure name autocomplete suggestions
- Reminder toggle and interval selection
- Save/Cancel actions

**Form Fields**:

- Procedure Name (required)
- Category (required)
- Date
- Photos (before/after)
- Clinic/Provider (optional)
- Product/Brand (optional)
- Cost (optional)
- Notes (optional)
- Reminder (optional)

**Navigation**:

- Modal presentation
- Can edit existing procedure if `procedureId` passed in route params

### 5. ProcedureDetailsScreen

**Purpose**: View full procedure details

**Features**:

- Full-screen photo gallery header with pagination
- Photo tag badges (Before/After)
- Procedure title and category
- Compare button (if both before/after photos exist)
- Details card with:
  - Date
  - Clinic/Provider
  - Product/Brand
  - Cost
  - Reminder status
- Notes section
- Photo gallery grid
- Edit and Delete buttons

**Navigation**:

- Navigates to `PhotoComparison` if comparison available
- Navigates to `AddProcedure` for editing

### 6. PhotoComparisonScreen

**Purpose**: Interactive before/after photo comparison

**Features**:

- Full-screen black background
- Side-by-side photo comparison
- Draggable slider to reveal before/after
- Before/After labels
- Procedure name and date display
- Instructions overlay
- Smooth animations with Reanimated

**Interaction**:

- Pan responder for slider drag
- Animated value for smooth transitions

### 7. ProfileScreen

**Purpose**: User profile and settings

**Features**:

- Profile card with avatar, name, email, plan badge
- **Displays authenticated user info** (name, email, avatar from Google)
- **"Signed in with Google" badge** when authenticated
- Usage bar showing procedure usage vs. limits
- Security section:
  - Face ID Lock toggle
  - Dark Mode toggle
- Premium & Features section:
  - Upgrade to Premium
  - Cloud Backup
  - Help & Support
  - Privacy & Terms
- **Dynamic Sign In/Sign Out button**:
  - Shows "Sign Out" when authenticated (with confirmation dialog)
  - Shows "Sign In with Google" when not authenticated
- App version display

**Components Used**:

- `SettingsItem` (internal component)
- `AnimatedScreen`
- `useAuthStore` for authentication state

---

## Components

### Reusable Components

#### 1. AnimatedScreen

**Purpose**: Wrapper for smooth screen transitions

**Props**:

- `children: ReactNode`
- `direction?: 'left' | 'right'` (default: 'right')

**Features**:

- Spring animations for enter/exit
- Opacity and scale transitions
- Uses `useIsFocused` from React Navigation

#### 2. Button

**Purpose**: Standardized button component

**Location**: `src/components/Button.tsx` (referenced but implementation not shown)

#### 3. CategoryIcon

**Purpose**: Display category icons with consistent styling

**Props**:

- `category: Category`
- `size?: 'small' | 'medium' | 'large'` (default: 'medium')
- `showBackground?: boolean` (default: true)

**Features**:

- Dynamic sizing
- Optional background circle
- Color-coded by category

#### 4. FloatingActionButton

**Purpose**: Floating action button component

**Location**: `src/components/FloatingActionButton.tsx` (referenced but implementation not shown)

#### 5. JourneyStats

**Purpose**: Display user statistics

**Props**:

- `procedureCount: number`
- `photoCount: number`
- `reminderCount: number`

**Features**:

- Gradient card background
- Three stat boxes with numbers and labels
- Icon header

#### 6. ProcedureCard

**Purpose**: Display procedure in timeline list

**Props**:

- `procedure: Procedure`
- `onPress: () => void`
- `index: number`

**Features**:

- Thumbnail image (prefers "after" photo)
- Procedure name and category
- Date with calendar icon
- Reminder indicator if active
- Clinic name
- Press animations (scale)
- Chevron arrow

#### 7. TimelineIndicator

**Purpose**: Visual connector between procedure cards

**Features**:

- Vertical line with decorative elements
- Used between cards in timeline

---

## Dependencies

### Core Dependencies

```json
{
  "@expo/vector-icons": "^15.0.3", // Icon library
  "@react-native-async-storage/async-storage": "^2.2.0", // Local storage & Supabase session
  "@react-navigation/bottom-tabs": "^7.8.12", // Tab navigation
  "@react-navigation/native": "^7.1.25", // Navigation core
  "@react-navigation/native-stack": "^7.8.6", // Stack navigation
  "@supabase/supabase-js": "^2.x", // Supabase client for auth
  "expo": "~54.0.29", // Expo SDK
  "expo-auth-session": "^6.x", // OAuth redirect handling
  "expo-blur": "^15.0.8", // Blur effects
  "expo-crypto": "^14.x", // Crypto for auth-session
  "expo-font": "^14.0.10", // Custom fonts
  "expo-haptics": "^15.0.8", // Haptic feedback
  "expo-image-picker": "^17.0.10", // Image selection
  "expo-linear-gradient": "^15.0.8", // Gradients
  "expo-status-bar": "~3.0.9", // Status bar control
  "expo-web-browser": "^14.x", // OAuth browser flow
  "react": "19.1.0", // React
  "react-native": "0.81.5", // React Native
  "react-native-gesture-handler": "~2.28.0", // Gesture handling
  "react-native-reanimated": "~4.1.1", // Animations
  "react-native-safe-area-context": "^5.6.2", // Safe area handling
  "react-native-screens": "~4.16.0", // Native screens
  "zustand": "^5.0.9" // State management
}
```

### Dev Dependencies

```json
{
  "@types/react": "~19.1.0",
  "babel-preset-expo": "^54.0.8",
  "typescript": "~5.9.2"
}
```

### Key Expo Modules Used

- **expo-image-picker**: Photo selection from library
- **expo-linear-gradient**: Gradient backgrounds
- **expo-haptics**: Haptic feedback (ready for implementation)
- **expo-blur**: Blur effects (available but not actively used)
- **expo-status-bar**: Status bar styling
- **expo-auth-session**: OAuth redirect URI handling
- **expo-web-browser**: Opens OAuth flow in system browser
- **expo-crypto**: Cryptographic functions for auth-session

---

## Development Notes

### Code Style

- **Functional Components**: All components use functional React patterns
- **TypeScript**: Strict typing throughout
- **Named Exports**: Preferred over default exports
- **File Naming**: PascalCase for components, camelCase for utilities
- **Comments**: Code comments for complex logic

### State Management Migration

- **Legacy**: `AppContext.tsx` is deprecated
- **Current**: Use Zustand stores (`useProcedureStore`, `useUserStore`, `useSettingsStore`)
- **Migration**: All new code should use Zustand, not Context API

### Safe Area Handling

- All screens use `useSafeAreaInsets()` from `react-native-safe-area-context`
- Proper padding for top (notch) and bottom (home indicator)
- `SafeAreaProvider` wraps entire app in `App.tsx`

### Animation Strategy

- **React Native Reanimated**: For complex animations (photo comparison slider)
- **Animated API**: For simpler animations (screen transitions, card presses)
- **Native Driver**: Used where possible for performance

### Image Handling

- Currently uses placeholder URLs from Unsplash
- `expo-image-picker` integrated for photo selection
- Photos stored as URIs (local file paths or URLs)
- No image optimization/compression implemented yet

### Data Persistence

- **Current**: In-memory state (Zustand stores)
- **Auth Sessions**: Persisted via AsyncStorage (Supabase client)
- **Future**: Should integrate AsyncStorage for procedure data persistence
- **Cloud Backup**: UI ready, backend not implemented

### Supabase Configuration

The app uses Supabase for authentication. Configuration is in `src/lib/supabase.ts`.

**Client Setup**:

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Session persistence
    autoRefreshToken: true, // Auto token refresh
    persistSession: true, // Keep user logged in
    detectSessionInUrl: false, // Disable for mobile
  },
});
```

**Required Supabase Dashboard Configuration**:

1. Enable Google provider in Authentication → Providers
2. Add Google OAuth credentials (Client ID & Secret)
3. Add redirect URLs:
   - Production: `beautytrack://` (custom scheme)
   - Development: `exp://[your-expo-url]` (Expo Go)

### Error Handling

- Basic error handling in place
- No global error boundary implemented
- No error logging service integrated

### Testing

- No test files present
- Should add Jest and React Native Testing Library
- Consider Detox for E2E testing

### Performance Considerations

- **Lazy Loading**: Not implemented (all screens load immediately)
- **Image Optimization**: Not implemented
- **Memoization**: Limited use of `useMemo`/`useCallback`
- **List Optimization**: `FlatList` not used (using `ScrollView` with `map`)

---

## Future Enhancements

### High Priority

1. **Data Persistence**

   - Integrate AsyncStorage for local data persistence
   - Implement data migration strategy
   - Add data export/import functionality

2. **Cloud Sync**

   - Backend API integration (Supabase database)
   - Real-time sync across devices
   - Cloud backup implementation
   - Row Level Security (RLS) for user data isolation

3. **Authentication Enhancements**

   - Apple Sign-In support
   - Email/password authentication option
   - Account linking (multiple providers)
   - Profile management (update name, avatar)

4. **Reminder Notifications**

   - Local notification scheduling
   - Push notification support
   - Reminder management UI

5. **Search & Filter**

   - Implement search functionality (UI exists, logic missing)
   - Filter procedures by category, date range
   - Sort options (date, cost, category)

6. **Photo Management**
   - Multiple photos per procedure
   - Photo editing/cropping
   - Image compression
   - Photo organization

### Medium Priority

1. **Dark Mode**

   - Complete dark mode implementation
   - Theme switching animation
   - System preference detection

2. **Analytics & Insights**

   - Spending analytics
   - Procedure frequency charts
   - Timeline visualization improvements
   - Progress tracking metrics

3. **Social Features**

   - Share before/after photos (optional)
   - Export procedure reports
   - PDF generation

4. **Premium Features**

   - Subscription management
   - Payment integration
   - Premium feature gates
   - Usage limit enforcement

5. **Accessibility**
   - Screen reader support
   - VoiceOver labels
   - High contrast mode
   - Font scaling

### Low Priority

1. **Internationalization**

   - Multi-language support
   - Date/time localization
   - Currency formatting by region

2. **Advanced Photo Features**

   - Face detection/alignment
   - Automatic before/after matching
   - Photo annotations
   - Comparison tools (side-by-side, overlay)

3. **Procedure Templates**

   - Common procedure presets
   - Quick add from templates
   - Procedure history patterns

4. **Clinic Integration**

   - Clinic directory
   - Appointment booking
   - Provider reviews

5. **Gamification**
   - Achievement badges
   - Journey milestones
   - Progress celebrations

### Technical Debt

1. **Testing**

   - Unit tests for stores
   - Component tests
   - Integration tests
   - E2E tests

2. **Performance**

   - Implement `FlatList` for procedure lists
   - Image lazy loading
   - Code splitting
   - Bundle size optimization

3. **Error Handling**

   - Global error boundary
   - Error logging (Sentry integration)
   - User-friendly error messages
   - Offline mode handling

4. **Code Quality**

   - ESLint configuration
   - Prettier setup
   - Pre-commit hooks
   - Code review guidelines

5. **Documentation**
   - API documentation
   - Component Storybook
   - Developer onboarding guide
   - User documentation

---

## Business Logic Notes

### Free vs Premium Limits

- **Free**: 3 procedures max, 10 photos max
- **Premium**: Unlimited procedures and photos
- Limits enforced in UI but not in store logic (should add validation)

### Reminder Calculation

- Reminders calculate next date based on interval
- Calculation happens in `AddProcedureScreen`
- No background job for reminder notifications yet

### Photo Tags

- Photos must be tagged as "before" or "after"
- Comparison feature requires both tags
- No validation for photo count per tag

### Procedure Ordering

- Procedures displayed in reverse chronological order (newest first)
- No sorting options available to user

### Cost Tracking

- Cost stored as number (USD)
- No currency conversion
- No cost analytics implemented

---

## Security Considerations

### Current State

- **Google OAuth authentication implemented** via Supabase Auth
- **Session persistence** with AsyncStorage
- **Auto token refresh** handled by Supabase client
- Local storage for app data (no cloud sync yet)
- Face ID toggle exists but not functional
- HTTPS communication with Supabase

### Authentication Implementation

- **Provider**: Supabase Auth with Google OAuth 2.0
- **Token Storage**: Secure storage via AsyncStorage
- **Session Management**: Automatic session restoration and refresh
- **Sign Out**: Clears session from both client and Supabase

### Future Requirements

- Additional OAuth providers (Apple, email/password)
- Biometric authentication (Face ID/Touch ID)
- Data encryption at rest
- Row Level Security (RLS) in Supabase
- Secure cloud data sync

---

## Deployment Notes

### Expo Configuration

- **App Name**: "beauty-track"
- **Version**: 1.0.0
- **Orientation**: Portrait only
- **New Architecture**: Enabled
- **Platforms**: iOS, Android, Web
- **URL Scheme**: `beautytrack` (for OAuth redirects)

### Bundle Identifiers

- **iOS**: `com.beautytrack.app`
- **Android**: `com.beautytrack.app`

### Build Configuration

- **iOS**: Supports tablets
- **Android**: Edge-to-edge enabled, predictive back disabled
- **Web**: Favicon configured

### Assets

- App icon: `assets/icon.png`
- Splash screen: `assets/splash-icon.png`
- Adaptive icon (Android): `assets/adaptive-icon.png`
- Favicon (Web): `assets/favicon.png`

### Publishing

- Use `expo publish` or EAS Build for production
- Configure app stores (App Store, Google Play)
- Set up OTA updates if needed

---

## Conclusion

Beauty Track is a well-structured React Native application with a solid foundation for tracking cosmetic procedures. The app features:

- **Modern Tech Stack**: React Native, Expo, TypeScript, Zustand, Supabase
- **Beautiful UI**: Carefully designed color palette and component system
- **Core Features**: Procedure tracking, photo management, reminders
- **Authentication**: Google OAuth via Supabase Auth
- **Type Safety**: Comprehensive TypeScript definitions
- **Scalable Architecture**: Component-based, state management with Zustand

The app is in a functional state for development and testing, with Google authentication fully implemented. Clear paths exist for future enhancements including data persistence, cloud sync, notifications, and premium features.

---

**Document Version**: 1.1  
**Last Updated**: December 2024  
**Maintained By**: Development Team

### Changelog

- **v1.1** (December 2024): Added Google OAuth authentication with Supabase
- **v1.0** (2024): Initial documentation
