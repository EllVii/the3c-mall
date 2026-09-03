# 3C Mall Mobile App Readiness

Last reviewed: 2026-09-03

## Current recommendation

Use the responsive PWA as the immediate mobile production surface. Treat Google Play and Apple distribution as a separate packaging workstream after the current authentication boundary is frozen and tested.

The current web application already provides the most important shared foundation:
- one React route tree;
- one HTTPS Cloudflare API;
- one D1 account/session system;
- phone, tablet/foldable, and desktop layouts;
- standalone PWA mode;
- safe-area-aware mobile navigation;
- install shortcuts for Meal Planning and Grocery Lab.

A store app should reuse that backend and account model. It should not create a second login implementation.

## View model

| Window | Current 3C Mall behavior | Store-app implication |
| --- | --- | --- |
| Phone / compact | top header + bottom navigation | good native-app navigation pattern |
| Tablet / foldable / medium | compact navigation rail | aligns with adaptive large-screen guidance |
| Desktop / expanded | full sidebar | useful for desktop web and large window modes |
| Installed PWA | standalone `/app` surface | current mobile distribution baseline |

## Google Play path

### Stage 1: PWA quality gate

Before packaging, verify:
- install from `the3cmall.app`, not the marketing `.com` origin;
- all critical tasks work at compact, medium, and expanded widths;
- resize without state loss;
- portrait and landscape remain usable;
- touch targets are comfortable;
- no important action is hidden below an unscrollable viewport;
- service-worker updates never discard unsaved work.

### Stage 2: packaging choice

Two practical options exist:

**Trusted Web Activity (TWA)**
- strongest fit when the web/PWA experience remains the product;
- Android only;
- requires verified ownership/association between the Android package and web origin;
- keeps the web application as the primary runtime.

**Capacitor/native shell**
- one practical path when iOS and Android need a shared packaging strategy;
- can expose native capabilities while retaining the React product and HTTPS backend;
- should use the existing server/session architecture rather than implementing a parallel account database.

Do not add a wrapper merely to obtain an app-store icon. Add native packaging when there is a concrete customer benefit.

### Android quality target

Aim for at least an adaptive-optimized experience before Play production. The existing three-mode navigation is a useful start, but native packaging still needs real-device/emulator verification for:
- foldable transitions;
- tablets;
- multi-window resizing;
- keyboard/mouse input where applicable;
- landscape;
- camera/receipt capture if enabled later.

As of August 31, 2026, new Google Play apps and app updates must target Android 16 / API level 36 or higher, except platform-specific categories with separate requirements. Any Android project created for 3C Mall should be configured around the current Play target requirement rather than an older template default.

Official references:
- https://developer.android.com/google/play/requirements/target-sdk
- https://developer.android.com/develop/adaptive-apps/quality-guidelines/adaptive-app-quality

## Apple path

### Beta distribution

The current product is explicitly in controlled beta. For a native iOS package, use TestFlight for beta distribution rather than submitting a beta build as a public App Store release.

### Public App Store release

Apple expects an app to provide meaningful app-like utility beyond a repackaged website. A future 3C Mall iOS package should therefore include clear mobile value such as some combination of:
- native receipt/photo capture integrated into the workflow;
- share-sheet input for products or lists;
- push notifications that users explicitly opt into;
- secure OS-backed storage for app-specific tokens/settings where appropriate;
- offline-safe draft/queue behavior;
- widgets or other platform features when they genuinely improve the household workflow.

Because 3C Mall requires login, App Review will need a working backend plus an active demo account or an approved fully featured demo mode at review time.

Official reference:
- https://developer.apple.com/app-store/review/guidelines/

## Authentication freeze rule

Native packaging must not begin by rewriting authentication.

Before a native shell is allowed to change auth behavior, document and test:
1. login request/response contract;
2. email verification path;
3. password reset path;
4. cookie/session behavior in embedded/native web contexts;
5. logout/session invalidation;
6. existing-user migration behavior;
7. beta/account-approval policy;
8. App Review demo-account procedure;
9. rollback plan.

Until then, the store-app track should consume the same deployed HTTPS services and leave browser auth behavior unchanged.

## Suggested release sequence

1. Production-ready responsive PWA on `the3cmall.app`.
2. Real-device Android/iOS web-app testing.
3. Resolve production R2 receipt binding and any native-feature dependencies.
4. Freeze/document auth contracts.
5. Build Android package and use internal/closed testing.
6. Build iOS package and use TestFlight.
7. Add only justified native differentiators.
8. Complete store privacy/data disclosures, screenshots, support URLs, and reviewer credentials.
9. Submit public releases after beta language and access policy match the actual release state.

This sequence keeps the current website and login plumbing operational while mobile distribution matures around it instead of underneath it.
