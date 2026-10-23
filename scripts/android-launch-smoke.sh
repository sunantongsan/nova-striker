#!/usr/bin/env bash
set -euo pipefail
pkg=com.sunantongsan.novastriker
adb install -r app/build/outputs/apk/debug/app-debug.apk
for attempt in 1 2 3; do
  adb shell am force-stop "$pkg"
  adb logcat -c
  adb shell am start -W -n "$pkg/.MainActivity"
  sleep 12
  adb shell pidof "$pkg"
  adb logcat -d -b crash > "/tmp/nova-crash-$attempt.log"
  if grep -q "Process: $pkg" "/tmp/nova-crash-$attempt.log"; then
    cat "/tmp/nova-crash-$attempt.log"
    exit 1
  fi
done
echo "Three Android 11 cold launches survived without a process crash."
