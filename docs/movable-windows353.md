# Movable menus — content patch 125

Move-building confirm and cancel start together at bottom center, above the safe-area inset, clear of the side rail. Their validation, cancel and confirm actions are unchanged.

Menu sheets, home/attack toolbars, resource panel, building selection, guide panel, battle-action group and move-confirmation group have a top-left grip. Hold it for 280 ms then drag. Only the grip captures the gesture: map panning, panel scrolling and normal button actions retain their existing behavior. Positions are saved locally on the device (not uploaded), per menu heading or HUD group. They are clamped to the viewport on resize and orientation changes. Settings includes Reset button and window positions. Keyboard arrows on the focused grip move it by 10 px.

Verification: browser smoke test exercises real touch long-press via Chromium touch events, mouse dragging, independent resource/side-rail dragging, selection dragging during HUD refresh, bottom control/sidebar separation, confirm/cancel, ordinary button clicks, reopen position persistence, reset, and 1000×560 / 640×360 / 390×844 / 844×390 viewports. Existing integrated HQ, online snapshot and platform packaging tests pass. The browser test is opt-in and requires Playwright plus an installed Chromium (CHROME_PATH may select it).
