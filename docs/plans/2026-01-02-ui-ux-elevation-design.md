# UI/UX Elevation Design

World-class polish for the michelle-mayes portfolio. Evolution, not revolution: keep the purple identity and page structure while refining every detail.

## Design Philosophy

- **Motion:** Subtle elegance as baseline, statement moments at hero and project reveals
- **Mobile:** Touch-friendly enhancements without layout restructuring
- **Typography:** Modern serif (Fraunces) paired with Inter
- **Feel:** Professional but confident, polished but personal

---

## 1. Typography System

### Font Stack

| Role | Font | Notes |
|------|------|-------|
| Display/Headers | Fraunces (variable) | Use optical sizing, "wonk" axis at large sizes |
| Body | Inter | Unchanged |
| Monospace | JetBrains Mono | Unchanged |

### New Tokens

```css
/* Typography scale (1.25 ratio) */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;

/* Line heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### New Color Tokens

```css
--accent-200: #DDD6FE;
--accent-300: #C4B5FD;
--bg-subtle: #F5F5F7;
--shadow-colored: 0 4px 20px rgba(139, 92, 246, 0.15);
```

---

## 2. Hero & Stats Integration

### Structure

The hero becomes one cohesive introduction unit with three layers:

1. **Identity:** Avatar (160px desktop, 120px mobile), name, tagline
2. **Stats ribbon:** Four metrics as inline chips below tagline
3. **Background:** Subtle animated gradient responding to scroll

### Avatar

- Glow uses `--shadow-colored` instead of hard gradient border
- Sparkles animate with gentle float (no bounce)
- Hover: scale(1.03), no rotation

### Stats

- Inline chips rather than boxed cards
- Numbers in Fraunces at display weight
- Count-up animation over 600ms on load
- Divider lines between stats

### Entrance Choreography

| Element | Timing |
|---------|--------|
| Avatar fade + scale | 0–300ms |
| Name fade | 200–500ms |
| Tagline slide up | 400–700ms |
| Stats ribbon stagger | 600–1000ms |

### Scroll Behavior

- Hero content has subtle parallax (moves slower than scroll)
- Stats fade as user scrolls past

---

## 3. Timeline Component

### Card Refinement

- Border-radius: 20px → 16px
- Hover: `--shadow-colored` grows, no gradient border overlay
- Background: white with faint purple tint at bottom-right
- Remove decorative blob element
- Tags: 6px 14px padding, softer colors

### Month Headers

- Remove flanking sparkle emojis
- Use Fraunces at larger size
- Add horizontal rule extending from text

### Scroll-Triggered Entrances

- Intersection Observer at 0.1 threshold
- Animation: fade + translateY(20px → 0) + scale(0.97 → 1) over 500ms
- Stagger: 80ms between cards
- Mark with `data-revealed` to prevent re-animation

### Expanded State

- Smoother height transition with proper easing
- Commit graph: softer corners, refined gradient
- Detail items: horizontal list with subtle separators
- Tech tags: outlined style (border only)
- Shimmer on graph bars when section opens

### Markers

- 28px rounded squares (smaller)
- Softer background gradient
- Hover: scale(1.1), no rotation

---

## 4. Blog

### Index (Post List)

- Posts become cards: white background, subtle shadow, 12px radius
- Hover: lift, shadow grows, purple left border appears
- Title in Fraunces, description in Inter
- Tags as small pills below description
- Stagger animation on page load

### Post (Reading Experience)

**Bug fixes:**
- Replace undefined `--card-bg`, `rgb(var(--gray))` with design tokens

**Typography:**
- Max-width: 680px
- Body: 18px, line-height 1.75
- Paragraph spacing: 1.5em
- Headings in Fraunces

**Elements:**
- Code blocks: syntax colors from design system
- Blockquotes: 4px left border, purple-tinted background
- Images: subtle shadow, rounded corners

**Navigation:**
- Larger touch target on back button
- Breadcrumb: "Blog → Post Title"

**Progress indicator (optional):**
- Purple bar at top showing scroll progress
- Fades in after hero, out at end

---

## 5. Mobile Enhancement

### Touch Feedback

- Add `:active` states: scale(0.98) + darken
- `touch-action: manipulation` to remove tap delay
- Manual tap highlight for consistency

### Touch Targets

| Element | Current | Target |
|---------|---------|--------|
| Nav links | ~20px | 44px (via padding) |
| Timeline tags | 4px vert | 8px 16px |
| Expand button | 36px | 44px |
| Blog cards | Title only | Full card |

### Header

- Subtle bottom border appears on scroll (stuck indicator)
- Active link gets background pill

### Particles

- Restore 5–6 particles (reduced from 15)
- Smaller, opacity 0.2

### Stats (Mobile)

- Keep 2×2 grid
- Add subtle card backgrounds
- Larger numbers for readability

---

## 6. Page Transitions

### View Transitions

- Use Astro's View Transitions API
- Default: 300ms cross-fade
- Header persists, content area transitions

### Hero Entrance

- First load only
- Choreographed sequence (see Section 2)
- Respects `prefers-reduced-motion`

### Loading States

- Projects page: skeleton cards matching timeline shape
- Shimmer animation (gradient sweep)
- Cross-fade to real content

### Navigation Feedback

- Link dims on click
- Progress bar at top if transition exceeds 100ms

### Reduced Motion

- All animations become 200ms opacity fades
- No transforms or staggers

---

## 7. Implementation Order

1. **Foundation:** Typography tokens, Fraunces font, color depth
2. **Global mobile:** `:active` states, touch targets
3. **Hero + Stats:** Integration, entrance animation
4. **Timeline:** Visual polish, scroll reveals, expanded state
5. **Blog:** Bug fixes, list polish, reading experience
6. **Transitions:** View Transitions, skeletons, progress indicator

---

## Risk Areas

- **View Transitions:** Safari support was late—include fallback
- **Fraunces:** Variable font ~100KB—subset and optimize loading
- **Scroll animations:** Debounce to prevent jank on fast scroll

---

## What Stays the Same

- Page structure and routes
- Purple brand identity
- Header/Footer design (touch targets only)
- GitHub integration and AI descriptions
- Blog content
