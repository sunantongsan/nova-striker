# Welcome and account entry (content 17 / Android 21)

Original portrait Nova art generated with built-in imagegen: bright polished 3D sci-fi marine, medic drone, alien and tank defending a crystal-powered base; blue sky above and a dark landing platform below for live registration controls. Asset: assets/nova-welcome-217.webp.

New and existing unregistered players see email registration, Google entry, existing-account login and password recovery. Email verification remains required by the existing native auth provider. Passwords are cleared immediately after submission. The welcome overlay cannot be dismissed with Android Back. This is a UI entry gate; server authorization remains unchanged.

Android 21 checks encrypted local account presence without exposing credentials or requiring a network request. Native 19/20 use the existing authenticated load callback on first patched launch; subsequent confirmed sessions retain a UI-only local marker for offline access. Explicit sign-out clears it. The marker grants no server privileges. Existing local campaign state is retained. Cloud restore/overwrite remains an explicit player choice.

Content patch 17 supports native 19, 20 and 21. The new in-game artwork and signup page can reach 19/20 through the updater. Replacing the earlier native download splash requires Android 21 (1.7.4) through a native release. Never describe a content deployment as a Play rollout.

Validation: npm test includes welcome217.cjs for registration, verification, back handling, recovery, duplicate submits, signed-in/offline entry, legacy bridge, logout and preservation of campaign buildings. Android CI builds the native splash and account-presence bridge. A real account verification/Google consent flow still requires the tester on a phone; no accounts are created by automated tests.
