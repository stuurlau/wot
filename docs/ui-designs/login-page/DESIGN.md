```markdown
# Design System Specification: The Kinetic Manuscript

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Manuscript."** 

This aesthetic bridges the gap between a high-performance laboratory report and a premium, analog athlete’s journal. We are moving away from the "app-as-a-tool" commodity look toward "app-as-a-document." The goal is to make the user feel like they are documenting a scientific endeavor. 

We achieve this through **intentional asymmetry** (heavy left-aligned headers with wide right margins), **high-contrast typography scales**, and **hyper-utilitarian data visualization**. The interface should feel "empty" in a way that implies focus, utilizing generous whitespace to allow the data (the workout) to breathe. We reject the "boxed-in" UI of 2010; we are building a fluid, layered canvas.

---

## 2. Colors & Surface Logic

### The Palette
The color logic is rooted in a warm, organic base to prevent the "scientific" nature from feeling clinical or cold.
- **Primary (`#154212` / `#2D5A27`):** Use for "Action" and "Growth." This is the color of the work being done.
- **Secondary (`#395F94`):** Use for "Analysis." This is the color of the data, the trends, and the history.
- **Tertiary (`#6E1A0F` / `#C05746`):** Use for "Intensity." Reserved for PRs (Personal Records), high-heart-rate zones, or focus sets.
- **Warning (`#E6AF2E`):** Specifically for injury risk or "approaching failure" alerts. Use sparingly to maintain its signal strength.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Boundaries must be defined through background color shifts or whitespace. 
- Use `surface-container-low` (`#f4f3f2`) to define a section against the `surface` (`#faf9f8`) background. 
- If a visual break is needed, use a change in typographic weight or a 4px vertical "accent bar" of a primary color on the left edge of a block, rather than a full box.

### Surface Hierarchy & Nesting
Treat the UI as a stack of fine paper. 
1. **Base Layer:** `surface` (#faf9f8) - The "desk" everything sits on.
2. **Mid Layer:** `surface-container-low` (#f4f3f2) - Large groupings or secondary content areas.
3. **Top Layer:** `surface-container-highest` (#e3e2e1) - Active interactive elements or high-priority cards.

### Signature Textures
To add professional polish, main Action Buttons (CTAs) should utilize a subtle linear gradient from `primary` (#154212) to `primary_container` (#2d5a27) at a 135-degree angle. This provides a "milled" look that flat colors lack.

---

## 3. Typography
The typography is the core of the "Manuscript" feel. We pair a technical, wide-set display face with a highly legible, tight geometric sans.

- **Display & Headlines (Space Grotesk):** This is our "Technical" voice. Use `display-lg` through `headline-sm` for page titles and major stats. Always use **tightened tracking (-2% to -4%)** on headlines to give them an editorial, "ink-pressed" feel.
- **Body & Titles (Inter):** Our "Instructional" voice. Use for all descriptions and labels. 
- **The Tabular Rule:** All numerical data (weights, reps, timers) **must** use tabular/monospace settings. Numbers must align vertically in lists to allow for "at-a-glance" scanning of progress.

---

## 4. Elevation & Depth

### Tonal Layering
Forget shadows for standard cards. To lift a "Set Tracker" from the background, place a `surface-container-lowest` (#ffffff) card on top of a `surface-container-low` (#f4f3f2) section. The contrast is barely perceptible but feels "high-end" and intentional.

### Glassmorphism & Ambient Light
For floating elements (like a "Start Timer" FAB or a navigation bar), use:
- **Backdrop Blur:** 12px to 20px.
- **Fill:** `surface` (#faf9f8) at 85% opacity.
- **Shadow:** An "Ambient Shadow"—`on-surface` color at 4% opacity, with a 30px blur and 10px Y-offset. This mimics natural light diffusion in a bright room.

### The "Ghost Border"
If accessibility requires a container boundary, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (Primary to Primary Container), white text, `xl` (0.75rem) corner radius. No shadow.
- **Secondary:** `surface-container-high` background, `on-surface` text. 
- **Tertiary:** No background. `primary` text weight 600. Underlined with a 2px offset.

### Workout Lists & Exercise Cards
- **No Dividers:** Use `32px` of vertical whitespace to separate exercises. 
- **Active State:** When an exercise is "In Progress," the entire background of that section shifts to `surface-container-low`.
- **Numbers:** Display reps and weights in `title-lg` using Inter, set to **Bold** and **Tabular Numbers**.

### Input Fields (The "Log")
- **Style:** Minimalist. No bounding box. A simple `outline-variant` bottom-border (2px).
- **Focus State:** The bottom-border transitions to `primary` (#2D5A27) and the label shifts to a `label-sm` technical font above the input.

### Chips (Filters/Muscle Groups)
- **Unselected:** `surface-container-high` background, `on-surface-variant` text.
- **Selected:** `primary` background, `on-primary` text. Use `full` (9999px) roundedness.

---

## 6. Do's and Don'ts

### Do:
- **Embrace the Margin:** Use 24px or 32px side margins. The "white space" is a feature, not a bug.
- **Align to the Grid:** Since we lack borders, typographic alignment is the only thing holding the UI together. Be surgical with your x-height alignments.
- **Use Color as Data:** Only use Forest Green, Slate Blue, or Terracotta when it conveys specific meaning (e.g., Progress, Analysis, or Intensity).

### Don't:
- **Don't use Card Borders:** Never put a 1px solid line around a card.
- **Don't use Italics:** We are technical and authoritative. Italics feel too "expressive" for this system.
- **Don't use Pure Black:** Always use Charcoal (`#1A1A1A`) for text to maintain the "paper and ink" warmth.
- **Don't use standard Material Shadows:** Default 1dp/2dp shadows will break the clean, notebook aesthetic. Stick to tonal layering.