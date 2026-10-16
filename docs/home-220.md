# Home return performance, content patch 20

Follow-up to patch 19: raid rendering had stopped using live Canvas color filters, but home still applied a per-building hue/sepia filter and repainted the entire base at 10fps. Remove the remaining home filters (level markers/modules retain progression). Idle home now redraws on HUD/data/input changes instead of a fixed 10fps timer. Buildings under construction retain the animated clock cadence. Pan and zoom invalidate immediately; menus suppress canvas painting.

The existing home transition already clears Engine.raid/defense and completed live-room state. No battle/network simulation or economy behavior was removed. This fixes confirmed remaining home rendering costs, not a claim to have measured every possible cause of Android stalls.

Validation: home220 tests return-home clears combat and stops ticks, no active filters at level 12, idle redraw budget, next-frame zoom, construction animation and hidden-canvas suppression. Full existing npm test also required. Real phone performance remains to be checked.
