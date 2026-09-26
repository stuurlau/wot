# Keyboard handling — react-native-keyboard-controller

**Date:** 2026-09-26
**Status:** done

## Why

Issue #5: throughout the app the software keyboard opened on top of input
fields. The previous setup combined `softwareKeyboardLayoutMode: "pan"`
(Android) with React Native core `KeyboardAvoidingView` in a few places, and
it broke in different ways per screen:

- Sheets (`components/ui/sheet.tsx`) anchor content with
  `position: absolute; bottom: 0`. Core `KeyboardAvoidingView` with
  `behavior="padding"` (iOS) only adds padding, which does not move
  absolutely positioned children — the sheet stayed under the keyboard.
- The workout screen used `behavior={undefined}` on Android (a no-op) and
  core KAV never scrolls a focused input into view inside long lists
  (set rows).
- With `edgeToEdgeEnabled` on Android 15+, `adjustPan` no longer reliably
  reveals focused inputs.

## Decision

Use [`react-native-keyboard-controller`](https://kirillzyusko.github.io/react-native-keyboard-controller/)
(v1.18, the Expo SDK 54 pinned version) as the single keyboard-handling
mechanism:

- `KeyboardProvider` wraps the app in `app/_layout.tsx`. It puts the app in
  edge-to-edge + `adjustResize` mode where the window no longer auto-resizes,
  and its components compensate for exactly the overlap between the keyboard
  and the focused input / container — so there is no double compensation and
  it works inside `Modal`s.
- `softwareKeyboardLayoutMode` in `app.json` is `"resize"` (library
  requirement). Because the window no longer resizes, the bottom tab bar is
  also not pushed above the keyboard anymore.
- Screens with inputs use `KeyboardAwareScrollView` (login, register,
  workout) — the focused input is scrolled above the keyboard automatically.
- `components/ui/sheet.tsx` uses the library's `KeyboardAvoidingView` with
  `behavior="height"` so the bottom sheet lifts above the keyboard on both
  platforms (covers pain, check-in, finish and exercise-picker sheets).

## Rules going forward

- Do not use React Native core `KeyboardAvoidingView` — use the components
  from `react-native-keyboard-controller` instead.
- Any new screen with text input: wrap in `KeyboardAwareScrollView`; any new
  bottom sheet: render inside `Sheet`.
- The library's components are not wired into NativeWind — pass `style`
  objects, not `className`.
- Keep `softwareKeyboardLayoutMode: "resize"` in `app.json`.
