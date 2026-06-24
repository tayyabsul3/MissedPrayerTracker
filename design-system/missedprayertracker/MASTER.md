# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** MissedPrayerTracker
**Generated:** 2026-06-24 20:45:42
**Category:** Islamic Devotional & Utility App

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary/Bg | `#022C22` | `--color-emerald-dark` (Background) |
| Card Bg | `#044E3D` | `--color-emerald-card` (Card background) |
| Active Accent | `#10B981` | `--color-emerald-active` (Active states) |
| Gold Accent | `#D4AF37` | `--color-gold` (Glows, borders, highlights) |
| Warm Amber | `#F59E0B` | `--color-amber` (Warnings, pending states) |
| Soft Text | `#E2E8F0` | `--color-text-light` (Main readable text) |
| Muted Text | `#94A3B8` | `--color-text-muted` (Muted labels) |

**Color Notes:** Deep rich Islamic emerald dark background, glassmorphic cards with thin gold/emerald borders, and premium gold accents.

### Typography

- **Heading Font:** Outfit, Amiri (for Arabic text)
- **Body Font:** Inter, Noto Sans Arabic
- **Mood:** spiritual, serene, premium, traditional, elegant, highly readable
- **Google Fonts:** [Amiri (Arabic) + Outfit (English)](https://fonts.google.com/share?selection.family=Amiri:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |

### Shadow & Glow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-glow` | `0 0 15px rgba(212, 175, 55, 0.15)` | Gold glow for active items |
| `--shadow-card` | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` | Glassmorphic cards |
| `--border-glow` | `inset 0 0 0 1px rgba(212, 175, 55, 0.2)` | Inset gold highlight |

---

## Component Specs

### Buttons

```css
/* Gold Accent Button */
.btn-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #B89020 100%);
  color: #022C22;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-gold:hover {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
}

/* Glass/Emerald Button */
.btn-emerald-glass {
  background: rgba(4, 78, 61, 0.5);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #E2E8F0;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  transition: all 250ms ease;
  cursor: pointer;
}

.btn-emerald-glass:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.6);
  transform: translateY(-1px);
}
```

### Cards (Glassmorphism)

```css
.glass-card {
  background: rgba(4, 78, 61, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: var(--shadow-card), var(--shadow-glow);
  transform: translateY(-3px);
}
```

### Inputs

```css
.input-glass {
  background: rgba(2, 44, 34, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  color: #E2E8F0;
  font-size: 16px;
  transition: all 250ms ease;
}

.input-glass:focus {
  border-color: #D4AF37;
  outline: none;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.25);
}
```

---

## Anti-Patterns (Do NOT Use)

- ❌ **Bright light mode** — The app is primarily designed as a spiritual night/day companion with deep emerald tones.
- ❌ **Standard generic colors (pure red, blue, yellow)** — Use emerald, gold, amber, and deep forest hues.
- ❌ **Emojis as main icons** — Use premium SVG outlines (Lucide-React) styled in gold or mint.
- ❌ **Instant/choppy tabs** — Use smooth slide or fade animations when switching screens.
- ❌ **No visual feedback** — Buttons and increments/decrements must feel responsive and tactile.

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [x] Emerald dark theme set as default background.
- [x] No emojis used as main navigation or dashboard icons (use Lucide SVG instead).
- [x] `cursor-pointer` applied to all clickable elements.
- [x] Tap actions have visual tactile response (scale-95 on active, scale-100 on release).
- [x] Naskh/Amiri font used for Arabic Hadiths, Outfit for numbers and English headings.
- [x] Mobile viewport is completely self-contained (no horizontal overflow, persistent bottom tab bar, scrollable containers).
- [x] Import/Export database works seamlessly.

