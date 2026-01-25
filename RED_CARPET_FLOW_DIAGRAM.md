# Red Carpet Experience — Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     🎬 FIRST-TIME USER FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

    User opens app for first time
              ↓
    ┌─────────────────────────┐
    │   Red Carpet Intro      │  ← 10-14 seconds
    │   (5 animated scenes)   │
    └─────────────────────────┘
              ↓
    Scene 1: Arrival (0-3s)
    • Black glass façade
    • Gold trim
    • Camera walk forward
              ↓
    Scene 2: Doors Open (3-6s)
    • Doors glide open
    • Gold glow
    • Soft chime
              ↓
    Scene 3: Unmarked Stores (6-9s)
    • Clean storefronts
    • No logos (curated feel)
    • Light and order
              ↓
    Scene 4: Map Reveal (9-12s)
    • Stylized map appears
    • Nodes light up sequentially
    • Still no instructions
              ↓
    Scene 5: Entry Moment (12-14s)
    • "Choose your destination."
    • Fades in, then completes
              ↓
    localStorage.setItem('redCarpet.seen.v1')
              ↓
    ┌─────────────────────────┐
    │   Onboarding Gate       │
    │   (Name Entry)          │
    └─────────────────────────┘
              ↓
    User enters first name
              ↓
    localStorage.setItem('concierge.profile.v1')
              ↓
    ┌─────────────────────────┐
    │   Map Home Screen       │  ← User lands here
    └─────────────────────────┘
              ↓
    User sees 4 destination nodes:
    • 🛒 Grocery Lab
    • 🍽️ Meal Planning
    • 💪 Workout
    • 👥 Community
              ↓
    User clicks destination
              ↓
    localStorage.setItem('lastDestination.v1')
              ↓
    Navigate to chosen zone


┌─────────────────────────────────────────────────────────────────────┐
│                    🔄 RETURNING USER FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

    User opens app (not first time)
              ↓
    Check: profile exists? ✅
    Check: Red Carpet seen? ✅
              ↓
    Auto-redirect to /app/map
              ↓
    ┌─────────────────────────┐
    │   Map Home Screen       │
    └─────────────────────────┘
              ↓
    Last destination highlighted
              ↓
    ┌──────────────────────────────────────┐
    │  ✨ "Continue where I left off"      │
    │     (Last: Grocery Lab)              │
    └──────────────────────────────────────┘
              ↓
    User can:
    • Continue to last destination (1 click)
    • Choose new destination (browse map)
    • Go to Profile (top-right button)
              ↓
    [User navigates as desired]


┌─────────────────────────────────────────────────────────────────────┐
│                      👤 PROFILE PAGE FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

    User clicks profile icon (top-right)
              ↓
    ┌─────────────────────────┐
    │  User Profile Page      │
    └─────────────────────────┘
              ↓
    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ 1. IDENTITY CARD       ┃
    ┃    👤 [Name]           ┃
    ┃    Shopping: Best Price┃
    ┃    Store: Walmart      ┃
    ┃    Member since: 1/25  ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
              ↓
    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ 2. JOB DONE BOX        ┃
    ┃    Today's Progress: 3 ┃
    ┃    ✓ Saved $15.20      ┃
    ┃    ✓ Created meal plan ┃
    ┃    ✓ Logged workout    ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
              ↓
    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ 3. SETTINGS (collapsed)┃
    ┃    [+] Settings        ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━┛
              ↓
    User clicks to expand
              ↓
    ┏━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ SETTINGS (expanded)    ┃
    ┃ ✏️  Edit Profile       ┃
    ┃ ⚙️  App Settings       ┃
    ┃ ↻  Replay Intro        ┃  ← Hidden but accessible
    ┗━━━━━━━━━━━━━━━━━━━━━━━┛


┌─────────────────────────────────────────────────────────────────────┐
│                   🔄 REPLAY INTRO FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

    User: Profile → Settings → "Replay Intro"
              ↓
    Confirmation: "This will reset onboarding"
              ↓
    localStorage.removeItem('redCarpet.seen.v1')
    localStorage.removeItem('concierge.profile.v1')
              ↓
    location.reload()
              ↓
    [Red Carpet Intro plays again]
              ↓
    [Onboarding Gate appears]
              ↓
    [Full first-time flow repeats]


┌─────────────────────────────────────────────────────────────────────┐
│                   📊 ACTIVITY LOGGING FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

    User completes action in app
    (e.g., saves money, creates plan)
              ↓
    logActivity("Saved $15.20", "grocery")
              ↓
    Activity stored in localStorage
    'userActivity.v1': [
      {
        label: "Saved $15.20",
        type: "grocery",
        completedAt: "2026-01-25T10:30:00Z"
      },
      ...
    ]
              ↓
    Displayed in Profile → Job Done Box
    (filtered to today's activities)


┌─────────────────────────────────────────────────────────────────────┐
│                  🗺️ MAP NAVIGATION STRUCTURE                         │
└─────────────────────────────────────────────────────────────────────┘

                    Map Home Screen
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    🛒 Grocery      🍽️ Meal         💪 Workout
       Lab           Planning
         │                │                │
         v                v                v
    /app/grocery-   /app/meal-       /app/fitness
      lab            planner
                          │
                          │
                     👥 Community
                          │
                          v
                    /app/community

    All routes accessible from map
    Last visited highlighted
    "Continue where left off" available


┌─────────────────────────────────────────────────────────────────────┐
│                   🔑 localStorage STRUCTURE                          │
└─────────────────────────────────────────────────────────────────────┘

    'redCarpet.seen.v1': {
      seenAt: "2026-01-25T10:00:00Z"
    }

    'lastDestination.v1': {
      id: "grocery-lab",
      label: "Grocery Lab",
      route: "/app/grocery-lab",
      visitedAt: "2026-01-25T10:30:00Z"
    }

    'userActivity.v1': [
      {
        label: "Saved $15.20 on groceries",
        type: "grocery",
        completedAt: "2026-01-25T10:30:00Z"
      },
      {
        label: "Created 5-day meal plan",
        type: "meal",
        completedAt: "2026-01-25T11:00:00Z"
      }
      // ... (max 50 activities)
    ]

    'concierge.profile.v1': {
      firstName: "John",
      defaultStoreId: "walmart",
      shoppingMode: "best_price",
      reasonId: "closest",
      birthMonth: "03",
      createdAt: "2026-01-25T10:00:00Z",
      updatedAt: "2026-01-25T10:00:00Z"
    }


┌─────────────────────────────────────────────────────────────────────┐
│                   🎯 DECISION TREE                                   │
└─────────────────────────────────────────────────────────────────────┘

    App loads
       │
       ├─ Has profile? NO
       │    ├─ Has seen Red Carpet? NO
       │    │    └─→ Show Red Carpet Intro
       │    │         └─→ Show Onboarding Gate
       │    │              └─→ Create profile
       │    │                   └─→ Redirect to Map
       │    │
       │    └─ Has seen Red Carpet? YES
       │         └─→ Show Onboarding Gate
       │              └─→ Create profile
       │                   └─→ Redirect to Map
       │
       └─ Has profile? YES
            └─→ Auto-redirect to Map
                 └─→ Show last destination highlight
                      └─→ User navigates


┌─────────────────────────────────────────────────────────────────────┐
│                   ✨ LUXURY PRINCIPLES                               │
└─────────────────────────────────────────────────────────────────────┘

    Arrival over Tutorial
       │
       └─→ Red Carpet > Feature walkthrough

    Permission over Force
       │
       └─→ "Continue where left off" vs auto-navigation

    Service over Settings
       │
       └─→ Profile → Settings (below fold)

    Autonomy over Hand-holding
       │
       └─→ Map choice > forced workflows

    Status over Utility
       │
       └─→ Experience-first, not feature-first
```

---

**Key Insight:** This isn't a feature update. It's a positioning shift.

**From:** "Here's what we can do"  
**To:** "Where do you want to go?"

**Result:** Luxury concierge service, not utility app.
