# WOT Design System

**WOT (Work-Out-Tracker)** is a mobile app for injury prevention: log any training fast, then see your training load, balance and risk signals. "Tracking training load should be easy. Getting insights into your training load should be easier." The name is deliberately unserious ("Do you even WOT bro?").

One product surface: the **Expo / React Native mobile app** (`mobile-client/`, iOS/Android/web), backed by a Fastify + Postgres API. Internal code name for the visual system: **"Kinetic Manuscript"** — a clean notebook with a hint of scientific paper.

## Sources
- GitHub: **https://github.com/stuurlau/wot** (branch `master`) — explore it further for exact behaviour; key paths: `mobile-client/constants/theme.ts`, `mobile-client/global.css`, `mobile-client/tailwind.config.js`, `mobile-client/components/**`, `mobile-client/app/**`, `docs/20260408_design_branding.md`, `docs/20260906_ux_design.md`.
- Upload: `uploads/20261010_insights_dashboard_implementation.md` (insights maturity stages, signal rules, baseline copy).
- `assets/reference/early-concept-*.png` are early generated concept screens from `docs/ui-designs/` — **not** the shipped UI (they predate the current code; e.g. "System_REC.042" jargon). Use the code, not these.

## Index
- `styles.css` → imports `tokens/fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `backgrounds.css`
- `fonts/` Space Grotesk + Inter (latin woff2, variable)
- `assets/` wot-logo.svg/png, app icons (light/dark), favicon, reference/
- `guidelines/` foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/` React primitives (below), one card per folder
- `ui_kits/mobile-app/` click-through recreation of the app
- `SKILL.md` agent-skill entry point · `github.md` sync record

## Components
- **core/** — `Screen` (ruled background root), `AppHeader`, `TabBar`, `ActiveSessionBar`, `VersionFooter`, `DataState`, `Icon`
- **forms/** — `Button`, `TextLink`, `Chip`, `ChipGroup`, `UnderlineInput`, `RatingScale`
- **overlay/** — `Sheet`, `SheetField`
- **home/** — `ActionCard` (= CheckInCard / Unfinished workout card), `SessionHistoryCard`, `WeekStrip`
- **insights/** — `LoadTrendChart`, `StrengthProgression`, `BalanceBars`, `SignalCard`, `MetricRow`
- **workout/** — `ExerciseBlock`, `SetRow`

### Intentional additions
The source inlines these patterns in screens rather than as files; extracted so designs stay consistent:
- `Button`, `TextLink`, `Chip`/`ChipGroup`, `UnderlineInput` — repeated className recipes across every screen/sheet.
- `WeekStrip` (inline in `(tabs)/index.tsx`), `MetricRow` (local fn in `insights.tsx`), `SheetField` (sheet label rows).
- `ActionCard` generalises `CheckInCard` and the inline "Unfinished workout" card.
Not built: legacy `HomeStats`, `WelcomeSection`, `LoadDistributionChart`, `SessionHistoryList` — present in the repo but no longer used by any screen.

## CONTENT FUNDAMENTALS
- **Voice:** a calm, slightly nerdy training buddy. Short, plain sentences. Speaks to **you** ("your usual", "your baseline", "your sets are safe"); the app never says "I" or "we".
- **Casing:** screen titles and headings in Sentence case ("Needs attention", "Strength progression", "Quick check-in"). Labels, buttons, chips and links in UPPERCASE via CSS with wide tracking ("START WORKOUT", "+ ADD EXERCISE", "↓ MINIMIZE"). Body regions and types lowercase in data ("strength", "legs").
- **Encouraging, never alarmist:** empty states motivate — "Every training log starts with one session.", "Log a few sessions and patterns will start appearing here.", "3 sessions logged — nice start." Warnings state a fact against *your own* history: "This week is 42% above your usual." Baseline period: "First weeks — building your baseline."
- **Errors** say what failed + what to do + reassurance: "Couldn't save. Check your connection and try again — your sets are safe." Validation is friendly: 'One more thing: tap a number under "How hard was it?" (1–10).'
- **Terminal flavour, lightly:** login uses prompt lines "> Train smart. Stay happy." / "> Let's log today's work."; footers say "WOT v0.0.0-alpha". Sport-science terms are allowed but tucked away (sRPE, RIR/RPE, ACWR, monotony, strain under "Advanced metrics ▾").
- **Separators:** middle dot " · " joins meta ("Sleep · fatigue · soreness", "3 sessions · moderate"); "/" in session meta ("strength / sRPE: 7"); "×" for weight × reps ("last 80 × 8"); "—" for empty values.
- **No emoji.** Unicode glyphs only (see Iconography). No italics, no exclamation marks except the brand line "Welcome to WOT!".

## VISUAL FOUNDATIONS
- **Vibe:** clean notebook / lab journal. Warm white paper (#faf9f8) with a faint 25px ruled grid, light-weight Space Grotesk headlines, tiny uppercase tracked Inter labels, tabular numbers. Airy, one clear message per screen. References named by the owner: Notion, light Spotify, Evernote.
- **Colour:** primary purple **#673F8A** is reserved for CTAs, selected states, active tab and "on" data (week strip, balance bars). Secondary marine blue **#395F94** is the data/chart colour (load bars, sparklines) and the positive signal (▲). Warning yellow **#E6AF2E** only for the ⚠ glyph. Destructive deep red (hsl 7 79% 25%) for errors and "Tap again to remove". Tertiary terracotta #C05746 is defined but rarely used. Everything else is neutral warm greys. No neon, no gradients except the grid fade.
- **Type:** Space Grotesk **Light 300** for every heading, stat and big number, with negative tracking (40/38 −1.6 titles; 26 −0.8; 24 −0.6; 20 −0.4). Bold 700 uppercase only for the login hero. Inter 400/500/700 for body (13px muted) and labels (8–12px uppercase, 2–3px tracking). `font-variant-numeric: tabular-nums` on all numbers. No italics, no serif.
- **Backgrounds:** ruled grid (1px lines #e4e2e0 @ 0.7 every 25px) on every screen, fading to the surface colour over the top 30% and bottom 6%. No photos, no illustrations, no textures beyond the grid.
- **Layout:** single column, 24px gutters, 20px top padding under a centred 132×40 logo header with gear top-right. Sections separated by 32–40px and 1px rules rather than boxes. Fixed bottom: active-session strip → version stamp → 3-tab bar. Login is 32px gutters.
- **Cards:** few. White 16px-radius ActionCard (no border, no shadow) for prompts; #f4f3f2 16px-radius SignalCards; ledger rows with dividers for history. Charts and data boxes are square-cornered.
- **Corner radii:** pill (chips, rating dots, tab-active pill, round ✓), 16px (CTAs, cards), 24px (sheet top), 12px (inline notices), 0 (DataState, chart bars, outline retry button).
- **Borders:** hairlines only — 0.5px rgba(0,0,0,.08) on bars/footers; 1px #e4e3e2 section rules; 1px rgba(0,0,0,.15) under auth inputs. Inputs are underline-only. Exercise-name inline edit: underline turns primary.
- **Shadows / elevation:** none (`elevation: 0` on the tab bar). Depth comes from tonal surfaces (#fff > #faf9f8 > #f4f3f2 > #e3e2e1) and the 30% black scrim behind sheets.
- **Transparency & blur:** scrim rgba(0,0,0,.3); DataState bg surface/70; disabled CTA primary/40; placeholders rgba(0,0,0,.25–.3). No blur.
- **Motion:** subtle. Sheets slide up (RN Modal `animationType="slide"`); otherwise no decorative animation. Haptic light impacts on tab press, set logged, timer start/stop, SS toggle; medium on long-press delete.
- **Press states:** `active:opacity-80` on CTAs; text links/chips have no hover (touch-first). Selected = fill swaps grey → purple with white text. Two-step destructive ("Remove" → "Tap again to remove" in red, 3s timeout).
- **Imagery:** none in-app beyond the logo. If imagery is ever needed keep it calm, warm, desaturated.

## ICONOGRAPHY
- **Icon set:** only four filled 24×24 glyphs, defined inline as SVG paths in `components/ui/icon-symbol.tsx` (SF Symbol names, Material-style paths): `house.fill`, `clock.arrow.circlepath`, `chart.bar.fill`, `gearshape.fill`. Copied verbatim into `components/core/Icon.jsx`. Used at 20px: tab bar (#9a9793 inactive / primary active) and settings gear (#6b6966).
- **No icon font** — the code comments that vector-icon fonts failed in release APKs. The branding doc says the owner likes Heroicons, but they are not used; if you need more icons, Heroicons (outline, CDN) is the sanctioned direction — flag it as an addition.
- **Unicode as icons (primary approach):** → (go/next), ▶ (active session, start timer), ■ (stop timer), ✓ (log set), ✕ (delete/close), ⚠ (warning, yellow), ▲ (win, blue), ▾ (expand), ⇄ (flip RIR/RPE), ↗ ↘ (trend), ‹ (back), ↓ (minimize), + (add), − (decrement).
- **No emoji, no PNG icons.** Logo: `assets/wot-logo.svg` — italic, glitch-sliced wordmark in near-black (#22272a). Never redraw it; on dark/purple invert to white.
