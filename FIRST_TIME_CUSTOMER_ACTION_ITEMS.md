# First-Time Customer Simulation - Action Items

**Generated:** January 28, 2026  
**Simulation Type:** Static Code Analysis + Architecture Review  
**Status:** 🟡 Ready for Configuration & Testing

---

## Summary

I simulated the complete first-time customer journey from app open through dashboard/directory. The app has a **well-designed flow but has critical configuration gaps** that must be fixed before launch.

### Journey Breakdown:
1. **Landing Page** → Clean hero with CTAs
2. **Login/Sign-up** → Supabase authentication (placeholder creds) ⚠️
3. **Video Intro** → Full-screen welcome (untested)
4. **Onboarding Gate** → Name entry + path selection
5. **Dashboard/Map** → Directory navigation to 4 main zones

---

## Critical Findings

### 🔴 **MUST FIX BEFORE LAUNCH**

#### 1. Supabase Configuration
**File:** `.env` (lines 15-16)
```
❌ VITE_SUPABASE_URL=https://your-project-id.supabase.co
❌ VITE_SUPABASE_ANON_KEY=eyJhbGci... (invalid)
```

**Action:** 
- [ ] Create Supabase project (or use existing)
- [ ] Get real Supabase URL and Anon Key
- [ ] Update `.env` with valid credentials
- [ ] Test sign-up → email → login flow

**Impact:** Without this, **authentication is completely broken**

---

#### 2. Verify Video Asset
**File:** `/public/RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4`

**Action:**
- [ ] Confirm file exists in `/public/`
- [ ] Test video plays in browser
- [ ] Check file size and duration
- [ ] Add error handling if missing

**Impact:** Video Intro will fail silently on first-time users

---

#### 3. Backend API Verification
**File:** `.env` (line 21)
```
VITE_API_BASE=https://threecmall-backend.onrender.com
```

**Action:**
- [ ] Verify Render backend is running
- [ ] Test waitlist endpoint
- [ ] Test reporting endpoints
- [ ] Add error handling for API failures

**Impact:** Waitlist signups won't be recorded

---

### ⚠️ **SHOULD FIX BEFORE LAUNCH**

#### 4. Email Verification Flow
**Issue:** Users must click email link to verify account

**Test:**
- [ ] Sign up with test email (Gmail recommended)
- [ ] Check spam folder
- [ ] Click verification link
- [ ] Confirm redirect to `/app` works
- [ ] Verify session is set

**Risk:** Users may abandon if email is delayed

---

#### 5. Dashboard Redirect Logic
**Issue:** Users see dashboard briefly, then redirect to map

**Test:**
- [ ] Complete full sign-up
- [ ] Check if redirect to `/app/map` happens smoothly
- [ ] Verify no flash/flicker
- [ ] Test on slow network

**Files:**
- [src/pages/DashboardPage.jsx](src/pages/DashboardPage.jsx#L216-L224)

---

#### 6. Cross-Device Session Persistence
**Issue:** Profile is localStorage-only (not synced to Supabase)

**Current Behavior:**
- Same device: ✅ Works
- Different device: ❌ Onboarding repeats

**Solution Options:**
1. (Quick) Add localStorage warning: "Profile is device-specific"
2. (Better) Sync profile to Supabase on save
3. (Best) Create `user_profiles` table in Supabase

---

### 📋 **NICE-TO-HAVE IMPROVEMENTS**

#### 7. Video Skip Button
- Add skip option for users who want to enter app faster
- Store preference: `videoIntro.skipped.v1`

#### 8. Profile Data Validation
- Add backend validation for first name
- Sanitize inputs before localStorage
- Validate email format on sign-up

#### 9. Error Recovery
- If Supabase is down, show friendly message
- If video fails to load, skip automatically
- Provide manual sign-up retry with explanation

#### 10. Analytics Integration
- Track onboarding completion rate
- Monitor drop-off at each step
- Record time spent in video intro
- Track path selection (Groceries vs Explore)

---

## Testing Plan

### Phase 1: Configuration (1-2 hours)
```bash
# 1. Get real Supabase credentials
# 2. Update .env
# 3. Verify video file exists
# 4. Test backend API is running
```

### Phase 2: End-to-End Test (1-2 hours)
```bash
npm run dev
# In browser:
# 1. Sign up new account
# 2. Check email for verification link
# 3. Click link and log in
# 4. Watch video intro
# 5. Enter name and choose path
# 6. Verify redirect to map/grocery-lab
# 7. Navigate all zones
```

### Phase 3: Edge Cases (30 minutes)
- [ ] Try duplicate email (should show error)
- [ ] Try weak password (should reject)
- [ ] Network timeout during sign-up
- [ ] Video doesn't load
- [ ] Close video before completion
- [ ] Go back during onboarding

### Phase 4: Multi-Device (1 hour)
- [ ] Sign up on Desktop → Chrome
- [ ] Log in on Mobile → Safari
- [ ] Log in on Tablet → Firefox
- [ ] Log out and log back in

---

## File Dependencies

### Auth Flow
- ✅ [src/context/AuthContext.jsx](src/context/AuthContext.jsx) - Core auth logic
- ✅ [src/lib/supabaseClient.js](src/lib/supabaseClient.js) - Supabase config
- ✅ [src/pages/Login.jsx](src/pages/Login.jsx) - Sign-up/login UI

### Onboarding Flow
- ✅ [src/pages/DashboardPage.jsx](src/pages/DashboardPage.jsx) - Entry point
- ✅ [src/assets/components/VideoIntro.jsx](src/assets/components/VideoIntro.jsx) - Video
- ✅ [src/assets/components/OnboardingGate.jsx](src/assets/components/OnboardingGate.jsx) - Name entry
- ✅ [src/assets/components/MapHomeScreen.jsx](src/assets/components/MapHomeScreen.jsx) - Directory

### Data Storage
- ✅ [src/utils/Storage.js](src/utils/Storage.js) - localStorage helper
- ⚠️ Supabase auth table - Not yet reviewed (needs real DB)

---

## Success Criteria

### ✅ Must Have (Blocking)
- [ ] User can sign up with email/password
- [ ] Confirmation email arrives within 5 minutes
- [ ] Email verification link works
- [ ] User lands in app authenticated
- [ ] Video intro plays (or skips gracefully)
- [ ] Name entry form validates
- [ ] Onboarding completes without errors
- [ ] Redirect to map/grocery-lab successful

### ✅ Should Have (High Priority)
- [ ] All 4 zones accessible (Grocery, Meals, Fitness, Community)
- [ ] Settings modal opens
- [ ] Profile persists on page reload
- [ ] Works on mobile/tablet
- [ ] Error messages are clear

### ✅ Nice to Have (Low Priority)
- [ ] Skip video option works
- [ ] Analytics track completion
- [ ] Smooth animations/transitions
- [ ] Keyboard navigation works

---

## Estimated Timeline

| Task | Effort | Owner | Due |
|------|--------|-------|-----|
| Get Supabase credentials | 15 min | Devops | ASAP |
| Configure .env | 5 min | Dev | ASAP |
| Verify video asset | 10 min | Dev | ASAP |
| Test sign-up flow | 30 min | QA | ASAP |
| Test all zones | 30 min | QA | ASAP |
| Fix critical bugs | 1-2 hrs | Dev | Before launch |
| Multi-device testing | 1 hr | QA | Before launch |
| **Total** | **~3-4 hours** | **Team** | **24-48 hrs** |

---

## Launch Readiness Checklist

### Pre-Launch (Today)
- [ ] Supabase credentials configured
- [ ] Video asset verified
- [ ] Backend API running
- [ ] Email verification tested
- [ ] Full flow tested on desktop
- [ ] Full flow tested on mobile

### Go/No-Go Decision
| Component | Status | Owner | Confidence |
|-----------|--------|-------|-----------|
| Auth | ❌ Needs creds | Devops | 0% |
| Video | ⚠️ Untested | Dev | 50% |
| Onboarding | ✅ Code OK | Dev | 85% |
| Navigation | ✅ Code OK | Dev | 90% |
| Data Storage | ⚠️ LocalStorage only | Dev | 60% |

**Current Verdict:** 🟡 **NOT READY** - Auth configuration required

---

## Questions for Product/Devops

1. **Supabase:** Do we have an existing Supabase project? If so, where are the real credentials?
2. **Video:** Is the video file in the repo? If not, where should it come from?
3. **Backend:** Is the Render backend running? Can we test it now?
4. **Email:** What email service should Supabase use for verification? (Supabase default or custom?)
5. **Users:** Do we need social sign-up (Google/GitHub) or email-only is OK?

---

## Next Steps (Immediate)

### 👤 Devops
1. [ ] Provide real Supabase URL and Anon Key
2. [ ] Verify Render backend status
3. [ ] Share backup of `.env.production` if available

### 👨‍💻 Dev
1. [ ] Update `.env` with real credentials
2. [ ] Verify video file at `/public/RUIDb230dc15...mp4`
3. [ ] Add error handling for Supabase connection failures
4. [ ] Implement video skip button (optional)

### 🧪 QA
1. [ ] Run Phase 1 & 2 testing plan
2. [ ] Document any bugs found
3. [ ] Test on real devices (iPhone, Android, etc.)
4. [ ] Record user testing video (optional)

### 📊 Product
1. [ ] Review onboarding UX
2. [ ] Decide: Is cross-device profile sync required?
3. [ ] Finalize welcome video (check timing, clarity)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Supabase not configured | High | Blocking | Get credentials NOW |
| Video doesn't load | Medium | UX issue | Add fallback/skip |
| Email verification slow | Medium | Drop-off | Monitor email latency |
| Redirect loop on mobile | Medium | UX issue | Test before launch |
| LocalStorage data loss | Low | Data loss | Add sync to Supabase |

---

## Summary

**The app is architecturally sound** with a thoughtful onboarding flow. However, **authentication infrastructure is not yet configured**. Once Supabase credentials are set, testing should take 2-3 hours. 

**Recommendation:** 
1. Get Supabase credentials today
2. Run Phase 1-2 testing by EOD
3. Make go/no-go decision for launch
4. Fix any bugs within 1-2 hours
5. Go live

**Current Status:** 🟡 Awaiting configuration (50% ready for launch)

---

*Report generated January 28, 2026*  
*Next review: After Supabase configuration*
