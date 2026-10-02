# iOS Mobile Wrapper Safe-Area Preparation

Prepare the application shell and shared overlays for edge-to-edge iPhone screens without changing application behavior or desktop layouts.

## Viewport and mobile gesture behavior

- Replace the current viewport declaration in `index.html` with the requested wrapper-safe settings: `maximum-scale=1.0`, `user-scalable=no`, and `viewport-fit=cover`.
- Update the global `html` and `body` rules to use `overscroll-behavior-y: none` and `touch-action: pan-y`, preventing pull-to-refresh and horizontal bounce while preserving vertical scrolling.
- Keep the existing horizontal overflow protection and iOS input-size safeguards.

## Application shell and fixed navigation

- Add top safe-area padding to the shared sticky `Navbar`, so the compact mobile header begins below the notch/status area.
- Adjust the tablet `SideNav` top boundary to account for the header plus the top inset rather than relying on the current fixed `top-14` alone.
- Keep the existing bottom safe-area padding on `BottomNav`, and retain the matching content clearance in `AppShell` so the home indicator and tab bar never cover page content.
- Apply the same top-inset treatment to public or exceptional sticky headers outside the shared shell, including the landing page and recruiter review screen.
- Preserve the existing safe-area-aware update banner.

## Modals, drawers, notifications, and full-screen overlays

- Harden the shared `Dialog` and `AlertDialog` primitives with mobile viewport bounds, safe-area-aware outer spacing, and internal scrolling so every existing modal—including Connections—remains reachable above notches and the home indicator.
- Update shared `Sheet` positioning and padding for top, bottom, left, and right drawers; the mobile menu and Talent filters will inherit this centrally.
- Add bottom safe-area padding to the shared `Drawer` primitive and top/bottom safe-area spacing to toast notifications.
- Keep component-specific sizes such as the resume preview intact while constraining them to the usable mobile viewport.

## Technical notes

- Use CSS `env(safe-area-inset-*)` values through Tailwind arbitrary utilities; no native-wrapper package or backend change is required.
- Prefer shared primitive changes over editing every modal individually, then address only exceptional full-screen components that override shared spacing.
- Record the safe-area ownership rule in `AGENTS.md`: global gestures live in the base stylesheet, shell insets live in layout components, and overlay insets live in shared UI primitives.

## Verification

- Run the project TypeScript/test checks and confirm the preview build has no errors.
- Test representative public and authenticated screens at narrow iPhone portrait and landscape dimensions, plus tablet and desktop widths.
- Open the Connections modal, mobile menu sheet, Talent filter sheet, a confirmation dialog, and a tall modal to verify close buttons and actions remain visible and scrollable.
- Confirm there is no horizontal movement, top-notch obstruction, bottom-home-indicator obstruction, or content hidden behind fixed navigation.
