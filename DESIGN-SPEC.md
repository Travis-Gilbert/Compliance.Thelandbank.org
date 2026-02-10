# GCLBA Compliance Portal — Design Spec (Travis's Vision)

## Goal
Upgrade the UI design of the GCLBA Compliance Portal prototype to a modern civic tech look with a slightly matte, subtly wireframed background + low contrast grid + light noise. Keep it credible for a public sector organization: calm, readable, accessible.

## Visual Direction
- **Style**: Enterprise SaaS dashboard + civic tech, but with matte surfaces instead of glass.
- Keep the grid subtle, low contrast, and only in the page background — should feel like quiet drafting paper, not a sci-fi interface.
- Add a subtle technical wireframe background (grid or dot grid), very low contrast.
- Add a very faint noise/grain layer to avoid flatness, also very subtle.
- **No heavy gradients, no neon, some skeuomorphism is okay, no neumorphism.**

## Reference Principles
- Keep spacing consistent with an **8px scale**.
- Keep contrast and clarity as top priorities — avoid using color or patterns that reduce legibility.

## Typography and Spacing
- Use **Inter** (or similar modern UI font).
- Base text **16–18px** with comfortable line height.
- Normalize padding and gaps using an **8px scale** across pages.

## Matte Card and Surface Styling
Cards should feel matte and sturdy, not glossy:
- Subtle shadow, subtle border
- Slightly warm off-white surfaces
- Avoid translucent blur
- Use consistent corner radius and shadow tokens.

## Subtle Wireframe Background Implementation
Implement the background pattern using **CSS gradients**, not images, so it stays lightweight and scalable:
- Use a low contrast grid made with `repeating-linear-gradient()` or a dot grid pattern.
- Keep opacity extremely low — like **2–6% equivalent**.
- Ensure it does not interfere with content readability.

CSS primitives to use:
- `repeating-linear-gradient()` for grid lines
- Optional noise overlay technique (SVG filter) for grain

## Layout Upgrades
- Add consistent **page header pattern**: title, context line (date), optional "Prototype" chip.
- Improve alignment and rhythm across dashboard and buyer submission pages.

## Status and Timeline Visuals
Add two UI patterns:
1. **Status chips**: Compliant, Watch, At Risk, Default.
2. **Property timeline**: closing date, month markers, last update, deadline, days overdue.

## Deliverables
1. Implement design updates in code across all pages:
   - Dashboard
   - Buyer submission form
   - Properties list table
   - Property detail page with timeline
2. Create reusable components:
   - `Card`, `StatCard`, `StatusChip`, `Timeline`
3. Provide a short before/after summary and list exact files changed.

## Constraints
- Keep copy aligned with the v1 compliance language.
- Maintain accessibility: focus states, labels, readable contrast.
