# 🔍 Orphaned Components Analysis
**Generated:** January 12, 2026  
**Purpose:** Identify unused components and recommend activation vs archival

---

## 🟢 IMMEDIATE USE - Should Activate Now

### 1. **ErrorBoundary.jsx** ⚠️ CRITICAL
**Location:** `src/assets/components/ErrorBoundary.jsx`  
**Purpose:** React error boundary to catch rendering crashes  
**Status:** ✅ Production-ready  
**Recommendation:** **ACTIVATE IMMEDIATELY**

**Why:** Essential for production apps. Prevents white screen of death when components crash.

**How to Activate:**
```jsx
// In src/App.jsx or main.jsx
import ErrorBoundary from "./assets/components/ErrorBoundary.jsx";

// Wrap your app root
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Impact:** High - Improves user experience and debugging

---

### 2. **TrialGuard.jsx** 🔒
**Location:** `src/assets/components/layouts/TrialGuard.jsx`  
**Purpose:** Subscription trial enforcement wrapper  
**Status:** ✅ Production-ready with subscription logic  
**Recommendation:** **ACTIVATE IF USING SUBSCRIPTIONS**

**Why:** Already has `getSubscriptionStatus()` logic checking trial expiration.

**How to Activate:**
```jsx
// In src/assets/components/layouts/AppLayout.jsx
import TrialGuard from "./TrialGuard.jsx";

// Wrap app routes
<TrialGuard>
  {children}
</TrialGuard>
```

**Impact:** Medium-High - Enforces business model

---

### 3. **GroceryCartEditor.jsx** 🛒
**Location:** `src/assets/components/grocery/GroceryCartEditor.jsx`  
**Purpose:** Full-featured cart editor with substitutions, categories, notes  
**Status:** ✅ 332 lines, production-ready  
**Recommendation:** **USE IN GroceryLabPage**

**Why:** More complete than whatever's currently in GroceryLabPage. Has:
- Add/edit/remove items
- Quantity + unit management
- Categories (Meat, Produce, Pantry, Dairy, Frozen, Other)
- Substitution system with reasons
- localStorage persistence (GROCERY_KEY = "grocery.items.v1")

**How to Activate:**
```jsx
// In src/pages/GroceryLabPage.jsx
import GroceryCartEditor from "../assets/components/grocery/GroceryCartEditor.jsx";

// Replace current cart implementation
<GroceryCartEditor 
  title="Your Grocery Cart"
  subtitle="Smart substitutions + budget tracking"
  onChange={(items) => console.log('Cart updated:', items)}
/>
```

**Impact:** High - Significantly improves grocery feature

---

## 🟡 FUTURE USE - Keep for Planned Features

### 4. **MealPlanSetupModal.jsx** 🍽️
**Location:** `src/assets/components/MealPlanSetupModal.jsx`  
**Purpose:** Onboarding wizard for meal planning (165 lines)  
**Features:**
- Meals per day selector (1-4)
- Snacks toggle
- Fasting mode (none/intermittent/alternate-day)
- Fast hours & days config
- Prep reminder toggle

**Recommendation:** **KEEP - Add to MealPlannerPage onboarding**

**How to Activate (Future):**
```jsx
// In src/pages/MealPlannerPage.jsx
import MealPlanSetupModal from "../assets/components/MealPlanSetupModal.jsx";

// Show on first visit
const [showSetup, setShowSetup] = useState(!localStorage.getItem('meal-plan-configured'));

{showSetup && (
  <MealPlanSetupModal 
    onConfirm={(config) => {
      console.log('Meal config:', config);
      localStorage.setItem('meal-plan-configured', 'true');
      setShowSetup(false);
    }}
  />
)}
```

---

### 5. **HouseholdBlueprint.jsx** 👨‍👩‍👧‍👦
**Location:** `src/assets/components/Meal-Planner/HouseholdBlueprint.jsx`  
**Purpose:** Household size, days, protein targets, budget, leftover planning  
**Status:** ✅ 131 lines, ready to integrate  
**Recommendation:** **KEEP - Add to MealPlannerPage**

**Integration Point:** MealPlannerPage setup/config section

---

### 6. **CommunityActions.jsx** 💬
**Location:** `src/assets/components/Meal-Planner/CommunityActions.jsx`  
**Purpose:** Next-step actions (send to Grocery Lab, ask community)  
**Status:** ✅ Clean UI component  
**Recommendation:** **KEEP - Add to MealPlannerPage bottom**

**How to Activate:**
```jsx
// In src/pages/MealPlannerPage.jsx
import CommunityActions from "../assets/components/Meal-Planner/CommunityActions.jsx";

<CommunityActions
  onSendToGroceryLab={() => nav('/app/grocery-lab')}
  onAskCommunity={() => nav('/app/community')}
/>
```

---

### 7. **ConciergePane.jsx** 🎭
**Location:** `src/assets/components/ConciergePane.jsx`  
**Purpose:** Tone selection (Coach/Clinical/Chill modes)  
**Status:** ✅ Well-designed UX pattern  
**Recommendation:** **KEEP - Concierge personality feature**

**Future Use:** Add to SettingsPage or ConciergeHub when implementing AI tone control

---

### 8. **ConciergeHelpChoose.jsx** 🧭
**Location:** `src/assets/components/ConciergeHelpChoose.jsx`  
**Purpose:** Quick vs Guided mode selector  
**Status:** ✅ Ready to use  
**Recommendation:** **KEEP - Onboarding helper**

**Future Use:** Add to DashboardPage or first-time user flow

---

### 9. **DateTimePopout.jsx** 📅
**Location:** `src/assets/components/DateTimePopout.jsx`  
**Purpose:** Custom date/time picker (185 lines)  
**Features:**
- Calendar grid with month navigation
- Time selector
- ISO date format support
- Proper accessibility

**Recommendation:** **KEEP - Native pickers often lack features**

**Future Use:** Meal planning, fasting schedules, grocery delivery dates

---

### 10. **ScreenPager.jsx** 📱
**Location:** `src/assets/components/ScreenPager.jsx`  
**Purpose:** Mobile-style horizontal swipe pager (101 lines)  
**Features:**
- Swipe left/right gestures
- Dot indicators
- Programmatic navigation
- No vertical scrolling

**Recommendation:** **KEEP - Onboarding flows**

**Future Use:** Feature tours, multi-step wizards

---

### 11. **FeedbackButton.jsx** + **FeedbackDrawer.jsx** 💭
**Location:** 
- `src/assets/components/FeedbackButton.jsx`
- `src/assets/components/FeedbackDrawer.jsx`

**Purpose:** User feedback collection system  
**Status:** ✅ Production-ready (94 lines total)  
**Recommendation:** **KEEP - Add to AppLayout**

**Note:** SettingsPage already uses `FeedbackPanel.jsx` - these provide alternative UIs

---

### 12. **StoreRequestPanel.jsx** + **DeliveryOptionsPanel.jsx** 🏪
**Location:** `src/assets/components/grocery/`  
**Purpose:** Store requests & delivery options  
**Status:** ✅ Simple, functional  
**Recommendation:** **KEEP - Phase 2 grocery features**

---

## 🔴 ARCHIVE - Duplicate/Redundant

### 13. **ThemeSelector.jsx** ⚠️ DUPLICATE
**Location:** `src/assets/components/settings/ThemeSelector.jsx`  
**Purpose:** Theme selection UI  
**Status:** ⛔ **DUPLICATE of SettingsPage theme grid**  
**Recommendation:** **ARCHIVE**

**Why Archive:** SettingsPage.jsx (lines 1-229) already has:
```jsx
import { THEMES, getThemeId, setThemeId, applyTheme } from "../utils/Settings/theme.js";
// Full theme grid UI with state management
```

ThemeSelector.jsx is 27 lines doing the exact same thing.

**Action:** Move to `src/_archived/ThemeSelector.jsx`

---

### 14. **RecipeCard.jsx** 🍲
**Location:** `src/assets/components/Meal-Planner/RecipeCard.jsx`  
**Status:** ⚠️ **COMMENTED OUT** in MealPlannerPage.jsx line 15  
**Recommendation:** **CHECK IF STILL NEEDED**

Likely replaced by RecipeDeck or newer implementation.

---

## 📋 Summary & Action Plan

### ✅ Activate Now (High ROI):
1. **ErrorBoundary** - Wrap App.jsx root (5 min)
2. **TrialGuard** - Wrap AppLayout if using subscriptions (10 min)
3. **GroceryCartEditor** - Replace current cart in GroceryLabPage (30 min)

### 📦 Keep for Future:
4. MealPlanSetupModal - Onboarding wizard
5. HouseholdBlueprint - Household config
6. CommunityActions - Next-step navigation
7. ConciergePane - AI tone selection
8. ConciergeHelpChoose - Mode selector
9. DateTimePopout - Advanced date picker
10. ScreenPager - Swipe navigation
11. FeedbackButton/Drawer - Alternative feedback UIs
12. StoreRequestPanel/DeliveryOptions - Phase 2 grocery

### 🗑️ Archive (Duplicates):
13. ThemeSelector.jsx → `src/_archived/`
14. RecipeCard.jsx (verify first) → `src/_archived/` or delete

---

## 🎯 Next Steps

**Option A: Quick Wins (30 min)**
```bash
# 1. Activate ErrorBoundary
# Edit src/main.jsx to wrap <App />

# 2. Activate GroceryCartEditor  
# Edit src/pages/GroceryLabPage.jsx import

# 3. Archive duplicates
mv src/assets/components/settings/ThemeSelector.jsx src/_archived/
```

**Option B: Full Activation (2-3 hours)**
- Implement all "Activate Now" items
- Add MealPlanSetupModal to onboarding
- Wire up CommunityActions in MealPlannerPage
- Add HouseholdBlueprint config section

**Option C: Clean Archive Only (5 min)**
```bash
mv src/assets/components/settings/ThemeSelector.jsx src/_archived/
# Comment imports are already commented, just document
```

---

## 🔧 Testing Checklist

After activation:
- [ ] ErrorBoundary: Trigger error, verify crash UI appears
- [ ] TrialGuard: Test with expired trial status
- [ ] GroceryCartEditor: Add/edit/delete items, verify persistence
- [ ] Theme changes work on all pages (existing issue - already tracked)

---

**Last Updated:** January 12, 2026  
**Maintainer:** Code Quality Audit  
**Next Review:** After implementing quick wins
