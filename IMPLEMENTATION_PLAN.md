# Project Mantra App - Implementation Plan

## Overview
React Native (Expo) app for a 40-day mantra chanting journey with timer, progress tracking, and push notifications.

## Technology Stack
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context API + AsyncStorage for persistence
- **UI Components**: Custom components matching Figma designs
- **Notifications**: expo-notifications
- **YouTube Player**: react-native-youtube-iframe
- **Time Picker**: @react-native-community/datetimepicker
- **Icons**: react-native-vector-icons or custom SVGs
- **Animations**: react-native-reanimated
- **Audio**: expo-av (for completion sounds)

## Color Palette (from designs)
- **Primary Purple**: `#3D2B5C` (background)
- **Accent Cyan**: `#00D9D9` (buttons, highlights)
- **Yellow**: `#FFE100` (buttons, timer)
- **Red/Orange**: `#FF5252` (destructive actions)
- **Text White**: `#FFFFFF`
- **Text Gray**: `#9E9E9E`

## Project Structure
```
/project-mantra-app
├── /assets
│   ├── /images (logo, icons, splash)
│   ├── /fonts (Inter)
│   └── /sounds (completion-sound.mp3)
├── /src
│   ├── /components
│   │   ├── DayCircle.tsx
│   │   ├── Timer.tsx
│   │   ├── MantraCard.tsx
│   │   ├── YouTubePlayerModal.tsx
│   │   ├── TimePicker.tsx
│   │   ├── DurationPicker.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── BreathingCircle.tsx
│   │   └── CompletionAnimation.tsx
│   ├── /screens
│   │   ├── LoadingScreen.tsx
│   │   ├── OnboardingStep1.tsx
│   │   ├── OnboardingStep2.tsx
│   │   ├── OnboardingStep3.tsx
│   │   ├── PreparingScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── /context
│   │   └── AppContext.tsx
│   ├── /utils
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── /types
│   │   └── index.ts
│   └── /navigation
│       └── AppNavigator.tsx
├── App.tsx
└── app.json
```

## Data Models

### User Progress State
```typescript
interface UserProgress {
  currentDay: number; // 1-40
  completedDays: number[]; // Array of completed day numbers
  selectedMantra: Mantra | null;
  reminderTime: string | null; // "21:00" format
  reminderEnabled: boolean;
  startDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
}

interface Mantra {
  id: string;
  name: string;
  description: string;
  youtubeUrl: string;
}

interface DayCompletion {
  day: number;
  completedAt: string; // ISO timestamp
  duration: number; // minutes completed
}
```

## Screen Implementation Details

### 1. Initial Loading Screen
- **Components**: Logo, Mandala icon
- **Duration**: 2-3 seconds
- **Logic**: Check if user has completed onboarding, navigate accordingly
- **Note**: This is the initial app launch screen only

### 2. Onboarding Step 1 - Journey Status
- **Components**:
  - Two selectable cards (radio button style)
  - Conditional day selector dropdown (1-40)
- **Logic**:
  - If "I'm starting today" → set currentDay = 1
  - If "I'm already doing it" → show day selector, set currentDay = selected value
- **Validation**: Ensure day is selected if "already doing it"

### 3. Onboarding Step 2 - Mantra Selection
- **Components**:
  - Mantra cards with radio selection
  - "Listen to the mantra" toggle button
  - Embedded YouTube player (conditional)
- **Logic**:
  - Toggle YouTube player on/off
  - Store selected mantra
- **Mantras** (hardcoded):
  1. Om Namo Narayanaya
  2. Sri Vitthala Giridhari Parabrahmane Namaha

### 4. Onboarding Step 3 - Reminder Setup
- **Components**:
  - Time picker input (hours 0-23, format HH:MM)
  - "Set Reminder" button
  - "Skip for now" link
- **Logic**:
  - Request notification permissions
  - Schedule daily notification at selected time
  - Can skip and set later in settings
  - After clicking "Set Reminder" or "Skip for now" → navigate to Preparing Screen

### 5. Preparing Screen (Post-Onboarding)
- **Components**:
  - Breathing circle animation (expand/contract)
  - Text: "Preparing your practice"
- **Animation**:
  - Circle scales up and down continuously
  - Mimics breathing pattern (inhale 4s, exhale 4s)
  - Smooth, calming animation using react-native-reanimated
- **Duration**: 3-4 seconds
- **Logic**:
  - Save all onboarding data to AsyncStorage
  - Initialize notification scheduling
  - Navigate to Dashboard when complete

### 6. Dashboard Screen (Main)
- **Components**:
  - Date display
  - Horizontal scrolling day selector (40 days)
  - Large day counter
  - Practice info card
  - Timer display with duration selector
  - Start/Pause/Continue button
  - Mark as Complete button
  - Settings icon (navigation)

- **Day Circles Logic**:
  - Display 40 circles in horizontal ScrollView
  - Completed days: cyan filled, check icon instead of number
  - Current day: yellow ring, centered on mount
  - Future days: dark/disabled
  - Each day clickable to view/complete past days

- **Timer Logic**:
  - Get required minutes based on day (15/30/45/60)
  - Duration picker: select from total down to 01:00 in 1-minute increments
  - States: idle → running → paused → completed
  - Countdown from selected duration
  - Continue from paused time
  - When timer reaches 0:00, auto-mark as completed

- **Mark as Complete Logic**:
  - Manually complete without timer
  - Toggle: complete ↔ uncomplete
  - Update day circle visual
  - When completed:
    - Show completion animation (circle with checkmark scales in)
    - Play calm completion sound
    - Show "Completed!" text
    - Update completed days in storage
    - Check for milestone (10, 20, 30, 40) and schedule celebration notification
  - If uncompleted: restore timer interface

- **Time Calculation**:
  ```
  Day 1-10: 15 minutes
  Day 11-20: 30 minutes
  Day 21-30: 45 minutes
  Day 31-40: 60 minutes
  ```

### 7. Settings Screen
- **Components**:
  - Daily Reminder toggle + time picker
  - Restart Practice section with confirmation
  - Back button

- **Reminder Logic**:
  - Enable/disable toggle
  - Edit time and save
  - Update scheduled notification

- **Restart Practice**:
  - Show confirmation modal
  - Clear all progress data
  - Navigate back to onboarding

## Core Features Implementation

### A. Timer Functionality
```typescript
- useTimer custom hook
- States: idle, running, paused
- Countdown logic with useEffect + setInterval
- Persist timer state to handle app backgrounding
- Audio/vibration on completion
```

### B. Progress Tracking
```typescript
- AsyncStorage for persistence
- Track completed days array
- Track current day (1-40)
- Calculate progress percentage
- Handle day completion/uncompletion
```

### C. Push Notifications
**Types:**
1. **Daily Reminders**
   - Scheduled at user-selected time
   - Notification: "Time for your daily mantra practice!"
   - Deep link to Dashboard
   - **IMPORTANT**: Only send if current day is NOT yet completed
   - Check completion status before sending daily notification
   - If day is already completed, skip notification for that day

2. **Milestone Notifications**
   - Triggered immediately after completing days 10, 20, 30, 40
   - Notification: "Congratulations! You've completed 10 days! Keep going!"
   - Scheduled on day completion

**Implementation:**
```typescript
- Request permissions on onboarding
- expo-notifications for scheduling
- Handle notification responses (deep linking)
- Reschedule on time change
- Check day completion status before sending daily reminder
- Schedule milestone notification on day completion
```

### D. Day Management
```typescript
- Horizontal ScrollView with 40 day circles
- ScrollToIndex to center current day on mount
- Click handler for viewing past days
- Visual states: completed, current, future
- Handle edge cases (Day 1, Day 40)
```

### E. YouTube Player Integration
```typescript
- react-native-youtube-iframe
- Extract video ID from URL
- Toggle show/hide player
- Handle play/pause states
- Responsive sizing
```

### F. Time/Duration Pickers
**Reminder Time Picker:**
- Hours: 0-23
- Minutes: 00-59, in 10 minutes increments
- Format: HH:MM (24-hour)

**Duration Picker:**
- Based on day's required minutes
- Range: daily maximum to 01:00 
- Format: MM:SS
- Increment: 1 minute

## Implementation Phases

### Phase 1: Project Setup & Core Structure
1. Initialize Expo project with TypeScript
2. Install dependencies
3. Set up folder structure
4. Create navigation structure
5. Set up Context API for state management
6. Implement AsyncStorage utilities
7. Define TypeScript types/interfaces

### Phase 2: UI Components
1. Create reusable components (DayCircle, Timer, Buttons)
2. Implement custom colors and theme
3. Build time/duration picker components
4. Create modal components (YouTube, Confirmation)
5. Create BreathingCircle animation component
6. Create CompletionAnimation component
7. Add completion sound asset
8. Ensure responsive design for different screen sizes

### Phase 3: Screens Implementation
1. Initial Loading Screen
2. Onboarding Step 1 (journey status)
3. Onboarding Step 2 (mantra selection + YouTube)
4. Onboarding Step 3 (reminder setup)
5. Preparing Screen (breathing animation + data setup)
6. Dashboard Screen (main functionality)
7. Settings Screen

### Phase 4: Core Functionality
1. Timer logic (countdown, pause, resume)
2. Day completion/uncompletion with animation and sound
3. Progress tracking and persistence
4. Horizontal day scroller with auto-centering
5. Duration picker logic based on current day
6. Breathing animation for Preparing Screen
7. Completion animation and sound playback

### Phase 5: Notifications
1. Request permissions
2. Schedule daily reminders (with completion check logic)
3. Implement conditional daily notification (only if day not completed)
4. Implement milestone notifications (every 10 days)
5. Handle notification responses
6. Update notifications on settings change

### Phase 6: Data Persistence
1. Save/load user progress
2. Handle app state (background/foreground)
3. Persist timer state
4. Handle edge cases (app closed mid-timer)

### Phase 7: Polish & Edge Cases
1. Handle restart practice flow
2. Add loading states
3. Error handling
4. Smooth animations and transitions
5. Handle date changes (new day at midnight)
6. Test notification scheduling
7. Add haptic feedback

### Phase 8: Testing & Refinement
1. Test all user flows
2. Test notifications on physical device
3. Test persistence across app restarts
4. Verify timer accuracy
5. Test edge cases (Day 1, Day 40, restarting)
6. Performance optimization

## Key Considerations

### Date Handling
- Store start date to calculate which day user should be on
- Compare with last active date to detect skipped days
- Option: Auto-advance to current day or let user catch up

### Timer State Management
- Persist remaining time when app backgrounds
- Resume correctly when app returns to foreground
- Clear interval on component unmount

### Notification Permissions
- Handle permission denial gracefully
- Allow enabling notifications later in Settings
- Test on iOS and Android (different permission flows)

### Mantra Data
- Currently hardcoded (2 mantras)
- Consider future: dynamic loading, more mantras
- Store YouTube URLs securely

### Edge Cases
- User completes Day 40: Celebration screen, to be provided later. Use placeholder now.
- User skips days: do nothing
- User changes time zone
- Notification scheduling limits (iOS: 64 notifications max)

## Dependencies
```json
{
  "expo": "~50.0.0",
  "react-native": "0.73.0",
  "react": "18.2.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "expo-notifications": "~0.27.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-youtube-iframe": "^2.3.0",
  "@react-native-community/datetimepicker": "^7.6.1",
  "react-native-gesture-handler": "~2.14.0",
  "react-native-reanimated": "~3.6.0",
  "expo-av": "~13.10.0",
  "typescript": "^5.3.0"
}
```

## Next Steps After Review
1. Initialize Expo project
2. Set up Git repository (already done)
3. Install all dependencies
4. Start with Phase 1 implementation
5. Iterative development with regular testing

## New Features Added

### 1. Preparing Screen (Post-Onboarding)
- Shows after completing onboarding (Step 3)
- Breathing circle animation that expands/contracts
- Text: "Preparing your practice"
- Saves all data and initializes app
- Duration: 3-4 seconds

### 2. Completion Animation & Sound
- When user completes a day (timer or manual):
  - Animated circle with checkmark scales in
  - Plays calm, interesting completion sound
  - Smooth transition using react-native-reanimated
- Sound asset needed: completion-sound.mp3

### 3. Smart Daily Notifications
- Daily reminders only sent if day NOT completed
- Check completion status before sending notification
- Prevents unnecessary notifications after practice complete
- Milestone notifications still sent immediately on completion

## Questions to Confirm
1. Should we auto-advance to the correct day based on calendar, or let users manually navigate?
2. What happens after Day 40 is completed? Show completion screen or allow restart?
3. Should we track partial timer completions (e.g., user does 10 mins of 15)?
4. Do we need offline support for YouTube videos, or always require internet?
5. Any analytics or tracking requirements?
6. App name and bundle identifier for Expo configuration?
7. Do you have a specific completion sound file, or should I find/suggest a calm sound?
