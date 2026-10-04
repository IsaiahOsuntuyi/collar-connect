# iOS messaging keyboard and typing fix

Make the active mobile conversation stay usable while the iPhone keyboard opens, resizes, and closes, without changing desktop messaging or other pages.

## Changes

1. Set the message composer textarea and its matching mention-highlight layer to `text-base` on phones. Keep their font metrics identical so mentions still align, and preserve the existing 16px global mobile input safeguard.
2. Use `window.visualViewport` resize/scroll events while a mobile chat is open and its composer is focused to determine the visible area above the software keyboard. Size and position the conversation pane within that area rather than relying on its current fixed `100dvh` calculation; provide a `window` resize fallback. Keep the conversation header steady, the composer at the bottom of the visible pane, and the message history as the pane's only vertical scroll region. Restore normal layout on blur, navigation, or unmount.
3. While the keyboard is genuinely visible, hide the mobile bottom tab bar and remove its reserved safe-area spacing from the messaging view. Apply normal bottom inset spacing again when the keyboard closes; use a small composer bottom padding while typing instead of the home-indicator inset. Scope this coordination to `/messages`, leaving other screens and desktop unchanged.
4. On composer focus and visible-viewport height changes, scroll the message list's own viewport to the latest message (without `scrollIntoView` on the page, which can move the sticky navbar). Continue this behavior after sending or receiving a message, and clean up listeners and scheduled scrolls.

## Technical approach

- Keep keyboard geometry and detection in a small mobile messaging-specific hook, using a focused composer plus a meaningful visual-viewport reduction so browser toolbar movement alone does not count as a keyboard.
- Derive the available conversation height from the visual viewport and the chat pane's top edge, accounting for `visualViewport.offsetTop`; cap it to a usable minimum and avoid body-level scroll manipulation where possible.
- Share only the keyboard-visible state needed by the shared mobile tab bar/content clearance; avoid altering the global viewport meta tag or safe-area behavior for unrelated views.

## Verification

- Check the preview build and type checks, then exercise an authenticated direct-message thread on mobile: focus, type, send, receive, dismiss keyboard, switch conversations, and reopen it. Confirm mention text alignment, no Safari input zoom, no hidden composer or extra bottom gap, stable top bar, and an independently scrolling message history.
- Test iPhone portrait and landscape in Safari or an iOS wrapper, plus a narrow Android device and desktop. Browser emulation can check layout and simulated `visualViewport` changes but cannot conclusively reproduce the physical iOS keyboard; verify that on a real device before release.
