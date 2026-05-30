---
target: src/pages/ExamesLaboratoriais.tsx
total_score: 30
p0_count: 1
p1_count: 2
timestamp: 2026-05-30T04-10-07Z
slug: src-pages-exameslaboratoriais-tsx
---
# Design Critique: Exames Laboratoriais

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | System status is clear, but state transitions could be smoother. |
| 2 | Match System / Real World | 4 | Medical terms, CPF, and agreements match the real-world domain. |
| 3 | User Control and Freedom | 3 | Easy to clear selections, but paste panel results and manual grid feel isolated. |
| 4 | Consistency and Standards | 2 | Violates the Color Function Rule (uses violet/indigo in paste panel) and the Flat Rest Rule (uses shadows and rounded-2xl). |
| 5 | Error Prevention | 3 | Duplicated "Queixa" inputs on the same screen cause user confusion. |
| 6 | Recognition Rather Than Recall | 3 | Large stacked lists require visual scanning; selected chips can take up too much vertical space. |
| 7 | Flexibility and Efficiency | 3 | Keyboard shortcut is excellent, but vertical scrolling slows down clinic operations. |
| 8 | Aesthetic and Minimalist Design | 2 | Visual noise from violet gradients, multiple border styles, and tall scrolling cards. |
| 9 | Error Recovery | 4 | In-line editing of IA exam results is simple and robust. |
| 10 | Help and Documentation | 3 | Keyboard shortcuts and example placeholders are clear. |
| **Total** | | **30/40** | **Needs Alignment & Ergonomic Polishing** |

## Anti-Patterns Verdict

- **LLM Assessment**: The interface has a generic SaaS/AI-slop look due to standard vertical card stacking, unnecessary violet/indigo gradient backgrounds in `ExamPastePanel` that clash with the primary blue clinical theme, and default drop shadows (`shadow-sm`) that violate the "Clinical Slate" flat design aesthetic.
- **Deterministic Scan**: n/a (automated detector not found).
- **Visual Overlays**: n/a (script injection skipped).

## Overall Impression

The screen offers excellent clinical utility (IA parsing, fast presets, recent patient history), but suffers from poor visual ergonomics. The layout is extremely long on desktop, forcing doctors to scroll repeatedly. Visual stylings conflict with the project's own design principles (Flat Rest and Color Function rules). Reorganizing the layout into a two-column desktop grid and unifying the color/border styles will significantly reduce cognitive load.

## What's Working

- The quick clinical panels are a high-value accelerator for selecting common groupings of exams.
- The in-line renaming and manual correction of IA-organized exams is very intuitive.
- Recent patients bar allows fast switching during busy hours.

## Priority Issues

### [P0] Duplicated "Queixa / Contexto Clínico" Inputs
- **Why it matters**: Confuses the doctor as to where context should be typed, duplicates state inputs on the same page, and consumes valuable vertical screen space.
- **Fix**: Remove the "Queixa" input from `ExamPastePanel` completely, relying on the unified synchronized "Queixa" input in `JustificativaPanel`.
- **Suggested command**: `impeccable layout`

### [P1] Tall Vertical Scrolling Layout
- **Why it matters**: Stacking Patient Form, Justification Assistant, Paste Panel, and Catalog grid forces extensive vertical scrolling to perform basic selections.
- **Fix**: Implement a 2-column layout on desktop (`grid grid-cols-1 md:grid-cols-12 gap-6`) where the left column houses the patient details, justification context, and paste widget, while the right column houses the search bar, active chips, and categories catalog. Widening the container to `max-w-7xl` or `max-w-6xl` provides ample room.
- **Suggested command**: `impeccable layout`

### [P1] Color Function Rule Violation in Paste Panel
- **Why it matters**: The paste panel introduces violet/indigo gradients and badges, which violates the strict color function rule stating that laboratory exams should only use Surgical Blue and slate neutrals.
- **Fix**: Recolor all violet and indigo elements in `ExamPastePanel` to Surgical Blue (#2563eb) and slate neutral tones.
- **Suggested command**: `impeccable colorize`

### [P2] Inconsistent Rounding and Shadows (Flat Rest Rule Violation)
- **Why it matters**: Elements use arbitrary `rounded-2xl` borders and default rest shadows (`shadow-sm`), violating "The Flat Rest Rule" (which mandates flat containers with 8px `rounded-lg` borders and shadows reserved only for active hover states).
- **Fix**: Standardize all containers to `rounded-lg` and flat `border-neutral-border`, adding a subtle hover effect for interactive items only.
- **Suggested command**: `impeccable polish`

### [P3] Selected Chips Overflow
- **Why it matters**: When a doctor selects many exams, the blue chips wrap and push the category lists further down the page.
- **Fix**: Constrain the max-height of the selected chips container in the exam selector and make it scrollable (`max-h-24 overflow-y-auto`).
- **Suggested command**: `impeccable layout`

## Persona Red Flags

- **Dr. Arthur (Busy Physician)**: Arthur wants to paste text and select catalog items rapidly. Having to scroll down to view category lists after pasting text, and dealing with conflicting input fields, slows down his patient interactions.
- **Dr. Sandra (Geriatrician)**: Sandra values visual calm. The violet accents and gradient banners distract from the patient data and make the interface look inconsistent with the blue theme of the rest of the application.

## Minor Observations

- The clear button ("Limpar Exames") could be more prominently placed or visually aligned with print/export actions.
- Quick panels section could be initially expanded or made more obvious.

## Questions to Consider

- What if the Patient Form, Justification, and Paste panels were combined into a unified "clinical context" column on the left?
- Could we make the categories section grid use less padding to increase information density?
