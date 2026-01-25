# Red Carpet Experience - Quick Reference

## 🎯 What This Is

A luxury first-launch experience that transforms 3C Mall from "feature app" to "concierge service."

**3 Core Components:**
1. **Red Carpet Intro** — 10-14 second arrival experience (one-time)
2. **Map Home Screen** — Destination-based navigation (daily use)
3. **User Profile** — Identity + job done + settings (service-oriented)

---

## 🚀 Quick Start

### First Launch Flow
```
App opens → Red Carpet Intro (14s) → Name Entry → Map Home Screen
```

### Returning User Flow
```
App opens → Auto-redirect to Map → Choose destination
```

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `RedCarpetIntro.jsx` | Luxury 10-14s intro animation |
| `MapHomeScreen.jsx` | Map-based navigation hub |
| `UserProfilePage.jsx` | Profile with job done box |
| `userActivity.js` | Activity tracking utilities |
| `RED_CARPET_EXPERIENCE.md` | Full documentation |

---

## 🔑 localStorage Keys

```js
'redCarpet.seen.v1'      // Has user seen Red Carpet intro?
'lastDestination.v1'     // User's last visited destination
'userActivity.v1'        // Array of completed activities (max 50)
'concierge.profile.v1'   // User profile (existing)
```

---

## 🧪 Testing Commands

### Reset Red Carpet (see intro again)
```js
localStorage.removeItem('redCarpet.seen.v1');
localStorage.removeItem('concierge.profile.v1');
location.reload();
```

### Log Test Activity
```js
import { logActivity } from '../utils/userActivity';
logActivity("Test activity", "grocery");
```

### Check Activity Log
```js
import { getTodayActivities } from '../utils/userActivity';
console.log(getTodayActivities());
```

---

## 🎨 Design Principles

**Luxury = Minimal Friction, Not Minimal Features**

- ❌ No persistent settings buttons
- ❌ No tutorial spam
- ❌ No feature bombardment
- ✅ Guided autonomy
- ✅ Intentional repetition
- ✅ Service-oriented layout

---

## 🗺️ Routes

```
/app              → Dashboard (auto-redirects to /app/map if returning user)
/app/map          → Map Home Screen
/app/profile      → User Profile Page
/app/grocery-lab  → Grocery Lab
/app/meal-planner → Meal Planner
/app/fitness      → Fitness Zone
/app/community    → Community
/app/settings     → Settings (includes "Replay Intro")
```

---

## 💡 Key Insights

1. **Map as home** — Not dashboard clutter
2. **Profile not settings** — Settings are secondary
3. **Job done box** — Psychological closure
4. **Replay intro** — Hidden but accessible (luxury nostalgia)

---

## 🎬 Red Carpet Scenes

| Time | Scene | Effect |
|------|-------|--------|
| 0-3s | Arrival | Black glass façade, gold trim |
| 3-6s | Doors Open | Glide open, gold glow |
| 6-9s | Unmarked Stores | Clean storefronts (no logos) |
| 9-12s | Map Reveal | Nodes light up sequentially |
| 12-14s | Entry Moment | "Choose your destination." |

---

## 📊 What Changed

### Before
- Tutorial-heavy onboarding
- Dashboard as home
- Settings in navigation
- Feature-first messaging

### After
- Red Carpet arrival
- Map as home
- Settings in profile (below fold)
- Experience-first positioning

---

## 🔧 Integration Points

### To log activities (for Job Done box):
```js
import { logActivity } from '../utils/userActivity';

// After user completes something
logActivity("Saved $15.20 on groceries", "grocery");
logActivity("Created meal plan", "meal");
```

### To navigate to map:
```js
import { useNavigate } from 'react-router-dom';
const nav = useNavigate();
nav('/app/map');
```

### To check if user has seen intro:
```js
import { readJSON } from '../utils/Storage';
const hasSeenRedCarpet = readJSON('redCarpet.seen.v1', null);
```

---

## 🎯 User Benefits

1. **First-time users:** Feel welcomed, not taught
2. **Returning users:** Jump to action, no friction
3. **All users:** Clear navigation, calm experience

---

## 🚀 Next Steps

1. Test Red Carpet intro on first launch
2. Verify map navigation works
3. Check profile page display
4. Test "Replay Intro" in settings
5. Add activity logging to key user actions

---

**Status:** ✅ Fully implemented and ready to test

**Philosophy:** Most apps try to teach. This one welcomes.
