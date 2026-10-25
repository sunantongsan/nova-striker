# Fixed gameplay HUD and draggable menu windows — patch 127

The gameplay HUD uses its original anchored layout: commander/resources at the top, home action rail on the right, calendar/shop on the left and battle controls at their original positions. There are no HUD drag headings, docking targets or floating toolbar groups. Placement confirm/cancel remain together at bottom center. Obsolete `hud:` entries in device-local layout storage are removed automatically; `window:` entries are retained.

Only opened menu windows remain draggable, using the full-width sticky title grip, heading or empty navigation-header space. Immediate touch and mouse dragging, ordinary menu actions, content scrolling, saved positions and reset are retained. Support/admin, login and name windows use the same window behavior. Native platform dialogs are unaffected.

The app, battlefield and canvas fill the viewport in both home and battle modes, including behind the HUD. The former reserved battle-side strip and opaque header background are removed. Interactive controls continue to honor their existing safe-area offsets.

Verification: the real bundled game and entry HTML are tested with network mocked via `CHROME_PATH=/path/to/chromium node tests/movable353-browser.cjs`. Assertions cover full viewport geometry at 1536×709, 1000×560, 844×390, 640×360 and 390×844; fixed right rail/top resources; absence of HUD grips; migration of stale saved HUD layouts while preserving window positions; immediate touch dragging; all primary menus; ordinary clicks; reopen persistence; home/battle visibility; bottom confirm/cancel and reload. Screenshots inspected at wide and compact landscape sizes. No physical-device test was performed.
