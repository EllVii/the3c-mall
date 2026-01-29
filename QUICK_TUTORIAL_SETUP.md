# Quick Tutorial Implementation Guide

**Version:** 1.0  
**Date:** January 29, 2026  
**Status:** ✅ Complete & Ready to Deploy

---

## 📋 What You Have

### Components Created

#### 1. **QuickTutorial.jsx**
**Location:** `src/assets/components/QuickTutorial.jsx`

The 30-second guided walkthrough component with:
- 6 interactive slides
- Tap-through navigation (Next/Back)
- Dot indicator showing current slide
- Action buttons for direct navigation to key features
- Settings breadcrumb hint showing where to re-run

**Slides:**
1. Welcome intro
2. Meal Planner walkthrough
3. Grocery Lab overview
4. Savings tracking info
5. Concierge introduction
6. Completion with next steps

#### 2. **TutorialContext.jsx**
**Location:** `src/context/TutorialContext.jsx`

React Context for managing tutorial state:
- `showTutorial` - Boolean state controlling visibility
- `startTutorial()` - Manually trigger the tutorial
- `completeTutorial()` - Mark tutorial as complete and close
- `resetTutorial()` - Clear completion history, show again
- Auto-show on first visit (1.2s delay to let app settle)
- Tracks completion count in localStorage

#### 3. **QuickTutorial.css**
**Location:** `src/assets/styles/QuickTutorial.css`

Production-grade styling:
- Smooth slide-in animation (cubic-bezier timing)
- Floating icon animation
- Responsive design (mobile-optimized)
- High contrast, accessibility-friendly colors
- Glass-morphism design with backdrop blur

### Integration Points

#### In App.jsx
```jsx
import { TutorialProvider, useTutorial } from "./context/TutorialContext.jsx";
import QuickTutorial from "./assets/components/QuickTutorial.jsx";

// Wrapped the app with TutorialProvider
export default function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <AppContent />
      </TutorialProvider>
    </AuthProvider>
  );
}

// In AppContent:
function AppContent() {
  const { showTutorial, completeTutorial } = useTutorial();
  
  return (
    <div className="app-shell">
      <QuickTutorial open={showTutorial} onComplete={completeTutorial} />
      {/* rest of routes */}
    </div>
  );
}
```

#### In SettingsPage.jsx
```jsx
import { useTutorial } from "../context/TutorialContext.jsx";

export default function SettingsPage() {
  const { startTutorial } = useTutorial();
  
  // Button in Experience & Onboarding section:
  <button className="btn btn-primary" onClick={startTutorial}>
    ▶ Re-run Quick Tutorial (30 sec)
  </button>
}
```

---

## 🎯 User Experience Flow

### First-Time Users
1. User logs in → Dashboard loads
2. After 1.2 seconds, Quick Tutorial auto-shows
3. User taps through 6 slides (optional actions available)
4. User can jump to Meal Planner or Grocery Lab directly
5. Tutorial marks as "seen" in localStorage
6. Won't auto-show again

### Returning Users
- Tutorial won't auto-show (localStorage check)
- Available in **Settings → Experience & Onboarding → ▶ Re-run Quick Tutorial**

### Key Features Highlighted
| Slide | Feature | Action Available |
|-------|---------|------------------|
| 1 | Welcome | —— |
| 2 | Meal Planner | "Try it →" jumps to `/app/meal-plans` |
| 3 | Grocery Lab | "Try it →" jumps to `/app/grocery-lab` |
| 4 | Savings Tracker | —— |
| 5 | Concierge AI | —— |
| 6 | Completion | "Done" button closes tutorial |

---

## 💾 localStorage Keys

**Tutorial Completion Tracking:**
```
Key: "tutorial.quickstart.seen.v1"
Value: {
  completedAt: "2026-01-29T12:34:56.000Z",
  count: 1
}
```

- **`count`** increments each time user re-runs tutorial
- Used to detect first-time users (key doesn't exist = first time)

---

## 🛠️ How to Test

### Test on First Load
```bash
# Clear localStorage and refresh
localStorage.clear();
location.reload();
```
→ Tutorial should auto-show after 1.2 seconds

### Test Re-run from Settings
1. Complete the tutorial (or close it)
2. Go to **Settings** (⚙️ icon)
3. Scroll to **Experience & Onboarding**
4. Click **▶ Re-run Quick Tutorial (30 sec)**
5. Tutorial displays again

### Test Navigation
- Click any dot to jump to that slide
- Click **Next →** to progress
- Click **← Back** to go back (disabled on first slide)
- Click **✕** to skip/close

### Test Feature Links
- On Meal Planner slide (2): Click "Try it →" → Should navigate to `/app/meal-plans`
- On Grocery Lab slide (3): Click "Try it →" → Should navigate to `/app/grocery-lab`

---

## 📱 Responsive Behavior

| Device | Max Width | Behavior |
|--------|-----------|----------|
| Desktop | 480px | Centered modal |
| Tablet | 95vw | Slightly narrower |
| Mobile | 100vw - 2rem | Full-width with padding |
| Scrollable | 85vh max | Content scrolls if needed |

---

## ✨ Customization

### To Edit Slide Content

Edit `src/assets/components/QuickTutorial.jsx`, `TUTORIAL_SLIDES` array:

```jsx
{
  id: "your-slide-id",
  title: "🎯 Your Title",
  tagline: "Short tagline",
  copy: "Main description text",
  feature: null, // or "feature-name" for badge
  icon: "🚀",
  action: { label: "Try it →", route: "/app/your-page" }, // optional
}
```

### To Adjust Timing

- **Auto-show delay:** In `TutorialContext.jsx`, line 17: `setTimeout(() => setShowTutorial(true), 1200);`
- **Slide animation:** In `QuickTutorial.css`, `.qt-slideIn` keyframes
- **Icon float animation:** In `QuickTutorial.css`, `.qt-float` keyframes

### To Change Colors

All colors use CSS custom properties (theme-aware):
```css
.qt-panel {
  background: linear-gradient(135deg, rgba(12, 16, 26, 0.97) 0%, rgba(12, 16, 26, 0.94) 100%);
  border: 1px solid rgba(126, 224, 255, 0.18);
}
```

Modify the RGBA values to match your theme system.

---

## 🐛 Troubleshooting

### Tutorial Not Showing
1. Check browser console for errors
2. Verify `localStorage.getItem("tutorial.quickstart.seen.v1")` returns `null` on first visit
3. Ensure `TutorialProvider` wraps the app (check `App.jsx`)

### Tutorial Showing Every Time
- `localStorage` may be disabled
- Check Privacy/Incognito mode
- Manually set: `localStorage.setItem("tutorial.quickstart.seen.v1", JSON.stringify({completedAt: new Date().toISOString()}))`

### Styling Issues
- Check CSS import in `QuickTutorial.jsx`: `import "../styles/QuickTutorial.css"`
- Verify theme variables are defined (background, border colors)
- Test in different themes to ensure consistency

### Navigation Not Working
- Verify React Router is available in component scope (`useNavigate` hook)
- Check that `/app/meal-plans` and `/app/grocery-lab` routes exist in `App.jsx`

---

## 📊 Metrics You Can Track

Add this to `completeTutorial()` for analytics:

```jsx
const completeTutorial = () => {
  const data = JSON.parse(localStorage.getItem(TUTORIAL_SEEN_KEY) || '{}');
  
  // Send to analytics:
  analytics.track('tutorial_completed', {
    completedAt: new Date().toISOString(),
    totalCompletions: data.count + 1,
  });
  
  localStorage.setItem(TUTORIAL_SEEN_KEY, JSON.stringify({
    completedAt: new Date().toISOString(),
    count: (data?.count || 0) + 1,
  }));
  setShowTutorial(false);
};
```

Track:
- Slide views (add click handlers per slide)
- Feature link clicks (Meal Planner / Grocery Lab actions)
- Skip rate (close button clicks)
- Completion rate (done button clicks)

---

## 🚀 Deployment Checklist

- [x] QuickTutorial.jsx created
- [x] TutorialContext.jsx created
- [x] QuickTutorial.css created
- [x] App.jsx integrated with TutorialProvider
- [x] App.jsx displays QuickTutorial component
- [x] SettingsPage.jsx has startTutorial button
- [x] Build succeeds without errors
- [ ] Test on production domain
- [ ] Verify first-time user flow
- [ ] Verify Settings re-run button works
- [ ] Monitor analytics for completion rates

---

## 📚 File Manifest

```
src/
├── context/
│   └── TutorialContext.jsx (NEW)
├── assets/
│   ├── components/
│   │   └── QuickTutorial.jsx (NEW)
│   └── styles/
│       └── QuickTutorial.css (NEW)
├── pages/
│   └── SettingsPage.jsx (MODIFIED - added startTutorial button)
└── App.jsx (MODIFIED - added TutorialProvider wrapper)
```

---

## 🎓 Summary

**What the user sees:**
1. ✅ Auto-plays on first load (optional via Settings anytime)
2. ✅ 30 seconds to walk through 6 key features
3. ✅ Can jump directly to Meal Planner or Grocery Lab
4. ✅ Professional, animated UI with accessibility support
5. ✅ Remember when shown (localStorage), don't spam

**What you maintain:**
- Slide content in `TUTORIAL_SLIDES` array
- Styling in `QuickTutorial.css`
- Auto-show timing in `TutorialContext.jsx`
- Integration points in `App.jsx` and `SettingsPage.jsx`

**Status: 🟢 PRODUCTION READY**
