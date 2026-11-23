# Accessibility audit

**Audit date:** 2026-11-21  
**Target:** WCAG 2.2 AA  
**Scope:** Rendered Championship Day application

## Method

- Reviewed the rendered schedule, results, and alerts dialog.
- Ran axe-core against the schedule, results, and open-dialog views.
- Tested keyboard interaction for the session filters, view tabs, and alerts dialog.
- Checked the results view at a 375px viewport width.
- The Heat disclosure behavior was also confirmed by the user with a screen reader.

The automated scan found an unnamed button and a mismatch between visible and accessible text. The findings below also include keyboard and semantic issues identified during manual review. Automated checks do not replace testing with multiple screen readers and browsers.

## Findings

### A-1: The favorite button has no accessible name or state

**User impact:** Screen-reader users cannot identify the icon-only button's purpose or tell whether it is selected.

**WCAG:** 4.1.2 Name, Role, Value (A).

**Recommended fix:** Give the button a stable accessible name such as “Favorite” and expose its toggle state with `aria-pressed`.

**Status:** Resolved.

### A-2: The copy-link button is named “Menu”

**User impact:** The button's name suggests it opens a menu, but activating it reports that a link was copied.

**WCAG:** 2.4.6 Headings and Labels (AA).

**Recommended fix:** Give the icon button a name that describes its action, such as “Copy link.”

**Status:** Resolved.

### A-3: The alerts dialog is not fully identified or modal for assistive technology

**User impact:** The dialog has no accessible name. Keyboard focus can move behind its visible overlay; after focus escapes, Escape does not close it. Focus is not returned to the opener when the dialog closes.

**WCAG:** 4.1.2 Name, Role, Value (A); 2.4.3 Focus Order (A); 2.4.11 Focus Not Obscured (Minimum) (AA).

**Recommended fix:** Name the dialog from its visible heading, expose its modal state, keep focus within it while open, support Escape consistently, and restore focus to the opener on close.

**Status:** Resolved.

### A-4: The view tabs do not follow the expected keyboard or panel relationship pattern

**User impact:** All tabs are separate Tab stops, and ArrowRight does not move focus or selection. The tab controls also have no programmatic relationship to their displayed content.

**WCAG:** 1.3.1 Info and Relationships (A). The missing arrow-key interaction is an ARIA tabs-pattern usability issue; activation remains possible with Tab and Enter.

**Recommended fix:** Implement roving focus and arrow-key navigation for the tabs, and associate each tab with its panel. Alternatively, use navigation semantics if these controls are intended to behave as links rather than tabs.

**Status:** Resolved.

### A-5: Results table sorting labels and column relationships are incomplete

**User impact:** The Bib sort button is announced as “Sort by rank,” and the Athlete column has no header. The active sort direction is not programmatically exposed.

**WCAG:** 2.5.3 Label in Name (A); 1.3.1 Info and Relationships (A); 4.1.2 Name, Role, Value (A).

**Recommended fix:** Make the Bib sort button's accessible name match its purpose, add a visible Athlete column header, and expose the active sort direction on the sorted column.

**Status:** Resolved.

### A-6: Course information in the header image is treated as decorative

**User impact:** The SVG includes the unique course information “58 gates, 180 m vertical drop,” but the image has an empty alternative text, so screen-reader users do not receive that information.

**WCAG:** 1.1.1 Non-text Content (A).

**Recommended fix:** Provide concise `alt` text for the unique course details. For this `<img>` usage, an internal SVG `<title>` is not required and does not replace `alt` text. If the values become dynamic, source the alternative from application data rather than hard-coding it in the SVG.

**Status:** Resolved.

### A-7: The alert dialog surface is low contrast in dark theme

**User impact:** The dialog was difficult to distinguish from the dimmed page, especially for low-vision users. In dark theme, the dialog surface had 1.75:1 contrast against the backdrop and its border had 2.51:1.

**WCAG:** 1.4.11 Non-text Contrast (AA).

**Recommended fix:** Increase the dialog surface or boundary contrast against the backdrop to at least 3:1 while preserving text contrast.

**Status:** Not applicable to the light-only application; its active dialog surface and border meet the 3:1 requirement.

### A-8: Semantic theme colors were never activated

**User impact:** Panda emitted the light and dark color tokens under `.light` and `.dark` classes, but the document never applied either class. The body also referenced an undefined background token, so intended surface and text colors could be missing.

**WCAG:** 1.4.3 Contrast (Minimum) (AA) and 1.4.11 Non-text Contrast (AA) risk because the intended color values were not applied.

**Recommended fix:** Apply the light theme class before the app loads, and use a defined surface token for the page background.

**Status:** Resolved.

## Resolved findings

- Heat cards use semantic articles and headings, with named native disclosure buttons, expanded state, controlled hidden content, and keyboard activation. The user confirmed the disclosure works with a screen reader.
- The header image's alternative text exposes the course details that are not repeated elsewhere on the page.
- Session filters use a labeled native radio group. Arrow keys and Space change the selected filter.
- Result standings display “Qualified” or “Eliminated” text rather than relying on background color alone.
- The favorite icon button has the accessible name “Favorite” and exposes its pressed state.
- The copy-link icon button is named for its action.
- The alerts dialog is named from its heading, exposes modal state, contains keyboard focus, supports arrow-key movement between controls, closes with Escape, and restores focus to its opener.
- The view tabs support roving focus, arrow/Home/End navigation, and explicit tab-to-panel relationships.
- The view tabs expose a horizontal or vertical orientation to match their responsive layout and use the corresponding arrow keys.
- The results table labels the Athlete column, matches sort-button names to their columns, and exposes the active sort direction.
- The alert dialog surface and border meet 3:1 contrast against the backdrop in the active light theme; its text and focus indicators retain sufficient contrast.
- The document applies Panda's light tokens before app load, and the body uses a defined surface color. The application does not switch themes based on system preference.

## Additional checks

- The schedule, results, and open dialog had no page-level horizontal overflow at 375px. The dialog also had no overflow at 1440px, and the results table remains within its scroll container.
- The axe-core scan did not report a color-contrast violation in the tested views.
- These checks do not constitute a complete browser/assistive-technology matrix.
