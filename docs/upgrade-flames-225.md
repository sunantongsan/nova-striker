# Patch content 25: movement cleanup, timed upgrades, colored fire

Published client changes:
- Remove the bottom Resources button and the selected-building Move button. Drag is the only movement input; tapping cannot reposition a pending preview. Confirming/canceling clears selection and its range ring. The existing siege lock applies to drag initiation.
- All enhancements +5–10 emit flames: green, cyan, blue, violet, gold, orange-red. Small bounded Canvas paths with no blur, dead/offscreen culling, and a six-frame-per-second home refresh only when enhanced buildings are visible. Combat retains its existing cadence.
- Offline research now uses one minute times target-level squared. Crystal-cost wall upgrades use existing building durations. Ordinary building upgrades already have durations.
- Online timer UI is capability-gated by active_upgrades in the server response. The production backend now supplies this capability, enabling server-authoritative countdowns in content 25.

Production activation completed on 2026-10-17:
`backend/nova_upgrade_timers_225.sql` was applied successfully to Nova's existing Supabase project `uzinxxeadejmzxqmqqtx` as `nova_upgrade_timers_225`, after the user explicitly authorized this project migration. The earlier automated approval rejection was resolved by that explicit approval and the tested rollback plan.

Post-application checks confirmed the jobs table exists with RLS enabled, authenticated callers can execute the timer-aware command, the old implementation alias cannot be executed by authenticated callers, direct job-table access is denied, and the command returns the active_upgrades capability.

The migration retains existing validation/debit rules, stores one paid job per item, delays the granted levels until the server deadline, preserves receipt replay and blocks double charging. It covers enhancements, infrastructure, research, and online force tier. Infra durations match ordinary building upgrades; other durations are 60 × target level² seconds. Battle snapshots stay frozen; due jobs settle after active combat. Private tables have RLS and no direct client privileges. New private implementation aliases are revoked from public/anon/authenticated.

Rollback: `backend/nova_upgrade_timers_225_rollback.sql` restores the saved function definitions, while retaining receipts, completed job records and granted levels. It deliberately refuses rollback while paid jobs remain active, avoiding lost purchases. Allow active jobs to finish and settle before rolling back. No schema/privilege rollback was executed on production.

Validation: full existing npm suite plus timers225/effects225; receipt replay, early power rejection, offline expiry, stale layout protection, research, infrastructure, tier and private access, active-battle deferral, and both rollback refusal while jobs are active and successful rollback after completion. Browser rendering inspected with Thai text at 360×740. Drag confirmation hides selection. Actual mobile hardware performance remains a tester check.
