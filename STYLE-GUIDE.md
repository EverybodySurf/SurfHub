# SurfHub GP — Style Guide & Design System

> Generated: 2026-06-16
> Status: Living document — update as the site evolves.

---

## Brand Colors

### Primary Palette

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Cyan | `#06b6d4` | `cyan-500` | Primary accent, active states, icons, headings |
| Teal | `#14b8a6` | `teal-400` | Gradient partner with cyan for buttons |
| Pink | `#ec4899` | `pink-500` | Logo wave icon, collapsed header icon |
| Purple | `#9333ea` | `purple-600` | Gradient partner with pink for clear button borders |

### Gradients

| Name | Classes | Usage |
|------|---------|-------|
| **Teal-Cyan** | `bg-gradient-to-br from-teal-400 to-cyan-500` | Zoom buttons, Filter FAB, detail panel accent bar, spot icon badge |
| **Pink-Purple** | `bg-gradient-to-br from-pink-500 to-purple-600` | "Clear filters" border, "Clear all" border |
| **Teal-Cyan subtle** | `bg-gradient-to-br from-teal-400/5 to-cyan-500/5` | Hover states, parent spot link in amenity detail |

### Dark Mode Overrides

- Cards: `dark:bg-gray-900` for clear buttons
- Gradient borders: `dark:[background:padding-box_hsl(0_0%_10%),_border-box_linear-gradient(135deg,#ec4899,#9333ea)]`
- Wave tooltip: `dark .leaflet-tooltip.tooltip-brand` with custom CSS variables

---

## Typography

| Element | Class | Detail |
|---------|-------|--------|
| Site logo | `font-black text-lg` | "SurfHub" black/pink, "GP" cyan-400 |
| Detail spot name | `text-lg font-bold leading-tight` | With wave emoji in gradient badge |
| Detail amenity name | `text-lg font-bold leading-tight` | With colored icon box |
| Section labels | `text-[10px] uppercase tracking-wider text-muted-foreground` | Card headers in detail panel |
| Card body | `text-sm` | Standard body text |
| Card meta | `text-xs text-muted-foreground` | Secondary info, descriptions |
| Footer hint | `text-[10px]` | "Click for full details" in tooltips |

---

## Corner Radii

| Element | Radius | Class |
|---------|--------|-------|
| Hamburger menu panel | 16px | `rounded-2xl` |
| Filter FAB | Full | `rounded-full` |
| Zoom buttons | 12px | `rounded-xl` |
| Detail info cards | 12px | `rounded-xl` |
| Detail icon badge | 12px | `rounded-xl` |
| Amenity chips | Full | `rounded-full` |

---

## Component Specs

### Header

```
┌─────────────────────────────────────────────────┐
│ [🏄 SurfHub GP]              [≡] [▲]          │  h-16
└─────────────────────────────────────────────────┘
```

- Fixed position, `z-[1200]`
- Logo: `Waves` icon (h-6, pink-500) + "SurfHub" (font-black) + "GP" (cyan-400)
- Hamburger: `Menu`/`X` icons, toggles `menuOpen`
- Hide header: chevron-up SVG, sets `headerHidden`
- Transitions: `-translate-y-full` when hidden, `translate-y-0` when visible
- Background: `bg-background/5 backdrop-blur-sm` when scrolled, `bg-transparent` when not
- Text color: `text-white` on fullscreen pages (home, surf-map) when not scrolled; `text-neutral-600 dark:text-neutral-200` otherwise

### Hamburger Menu Panel

```
┌──────────────────────┐
│  🏄 Home              │
│  📊 Surf Reports      │
│  🗺️ Surf/Amenities Map│
│  📋 Directory         │
│  👥 Forum             │
│  🛍️ Marketplace       │
│  ──────────────────   │
│     [☀/🌙 toggle]     │
│   👤 Login / Sign Up  │
└──────────────────────┘
```

- Floating panel: `w-80`, `absolute right-4 top-16`, `rounded-2xl`
- Z-index management: backdrop `z-[1150]` appears when menu open, click to close
- Nav items: `justify-center md:justify-start`, icon (cyan-400) + label
- Active state: `bg-cyan-500/10 text-cyan-500`
- Theme toggle `z-[1300]` (above menu panel)
- Border-radius, shadow, backdrop-blur match site aesthetics

### Collapsed Header Pill

```
     [🏄 ▼]
  (appears at top when header hidden)
```

- Shows when `headerHidden === true`
- Position: `fixed top-0 left-1/2 -translate-x-1/2`
- Content: pink `Waves` icon (h-4, `text-pink-500/70`) + pink `ChevronDown` (h-3)
- No background, no padding — just floats
- Clicking restores the full header

### Map UI Elements

#### Zoom Controls
```
   [+]
   [−]
```
- Position: `absolute top-24 sm:top-16 right-4`, stacked vertically
- Size: `h-9 w-9`
- Gradient: `bg-gradient-to-br from-teal-400 to-cyan-500`
- States: `hover:from-teal-500 hover:to-cyan-600 active:from-teal-600 active:to-cyan-700`

#### Filter FAB
```
                     [Clear filters] [≡/✕]
```
- Position: `fixed bottom-6 right-4`, horizontal row (`flex-row items-center`)
- Filter button: `h-14 w-14 rounded-full`, teal-cyan gradient, `shadow-xl`
- Clear filters badge: white bg, pink-purple gradient border wrapper (`p-[1.5px]`)
  - Only shows when filters are active (`viewMode !== 'all' || selectedTypes.size > 0 || searchQuery`)

### Filter Sheet

Bottom sheet overlay, slides up from bottom:
- Backdrop: `bg-black/40 backdrop-blur-sm`
- Sheet: `bg-card rounded-t-2xl`, `max-h-[70vh] overflow-y-auto`
- Swipe-to-close: touch handler with vibrate feedback at 80px threshold
- View mode toggle: 3 segments (All | 🏄 Spots | 🗺️ Amenities) in a pill
  - Active: `bg-cyan-500/10 text-cyan-500 font-semibold`
- Amenity filter chips: `rounded-full`, multi-select
  - "All/None" toggle button — when active (`selectedTypes.size === 0`), highlights blue. Tap again selects all types so individual chips can be deselected.
  - Individual chips highlight when selected
  - Available in ALL view modes (including Spots mode)

### Detail Panel

Slides in from right when a marker is clicked:

```
┌─────────────────────┐
│█ (teal-cyan accent) │
│ [🏄] Spot Name       │
│      Beach Name      │
│                     │
│ [beginner] [reef] ..│
│                     │
│ ┌─────────────────┐ │
│ │ Description of   │ │
│ │ the surf spot    │ │
│ └─────────────────┘ │
│                     │
│ ┌────────┬────────┐ │
│ │WAVE TYPE│DIFFICULT││
│ │ beach   │advanced ││
│ └────────┴────────┘ │
│ ┌────────┬────────┐ │
│ │BEST SEA│SWELL DIR││
│ │Nov-Apr │ N, NW   ││
│ └────────┴────────┘ │
│                     │
│── Nearby Amenities ─│
│ [☕] Cafe Name       │
│ [🍽️] Restaurant Name│
└─────────────────────┘
```

- Slides from right: `fixed right-0 top-16 bottom-0 z-[1060] w-full sm:w-96`
- Background: `bg-card/95 backdrop-blur-lg`
- Gradient accent bar: `h-1 bg-gradient-to-r from-teal-400 to-cyan-500`
- Info cards: `p-3 rounded-xl bg-muted/80` (description) / `bg-muted/70` (grid items)
  - **No borders** on cards
  - Labels: `text-[10px] uppercase tracking-wider text-muted-foreground`
  - Values: `font-semibold`
- Difficulty tags: fluorescent Tailwind classes
- Nearby amenities: rounded-xl cards with `hover:border-teal-400/30` effect
- Z-index: `z-[1060]` (above zoom controls at z-[1000])

---

## Map Tiles

| Mode | Provider | URL | Features |
|------|----------|-----|----------|
| Light | OpenStreetMap | `{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Standard |
| Dark | CartoDB + Hillshading + Labels | `{s}.basemaps.cartocdn.com/dark_all` + `tiles.wmflabs.org/hillshading` + `{s}.basemaps.cartocdn.com/dark_only_labels` | Roads, terrain shading, labels |

Dark mode uses a 3-layer composite:
1. Base: CartoDB `dark_all`
2. Terrain: Wikimedia hillshading overlay at 30% opacity
3. Labels: CartoDB `dark_only_labels` on top

---

## Map Markers

### Surf Spot Markers
- Colored circle (28px): difficulty-based
  - Beginner: `#39ff14` (fluorescent green)
  - Intermediate: `#ffea00` (fluorescent yellow)
  - Advanced: `#ff5e00` (fluorescent orange)
  - Expert: `#ff0040` (fluorescent red)
- White border (3px selected, 2px default)
- Emoji: 🏄
- Click: opens detail panel

### Amenity Markers
- Smaller colored circle (20px, 26px selected)
- Colors by type (cafe=orange, restaurant=red, surf-shop=blue, etc.)
- Emoji icons per type
- Click: opens amenity detail panel

### Tooltips (Hover)
- Custom class: `.leaflet-tooltip.tooltip-brand`
- Card style: `rounded-2xl`, `box-shadow: 0 10px 25px rgba(0,0,0,0.15)`
- Content: name, meta info, "Click for full details" footer
- Dark mode supported via CSS variables
- `sticky: true`, offset: `[0, -10]`

---

## Difficulty Scale

| Level | Map Marker | Tag Classes (Detail Panel) |
|-------|-----------|---------------------------|
| Beginner | `#39ff14` | `bg-lime-200 text-lime-900 border-lime-300` |
| Intermediate | `#ffea00` | `bg-yellow-200 text-yellow-900 border-yellow-300` |
| Advanced | `#ff5e00` | `bg-orange-200 text-orange-900 border-orange-300` |
| Expert | `#ff0040` | `bg-rose-200 text-rose-900 border-rose-300` |

---

## Surf Spot Data (Guadeloupe)

Difficulty corrections applied 2026-06-16:

| Spot | Old Level | New Level |
|------|-----------|-----------|
| Plombier | Advanced | **Expert** |
| Le Moule (Damencourt) | Expert | **Advanced** |
| Port de St-François | Beginner | **Intermediate** |
| La Perle | Intermediate | **Advanced** |
| Bananier | Intermediate | **Beginner** (updated description) |

---

## Amenity Type Labels

| Type | Display Label | Icon Marker |
|------|---------------|-------------|
| cafe | ☕ Cafe | ☕ |
| restaurant | 🍽️ Restaurants/Bars | 🍽️ |
| surf-shop | 🏄 Surf Shop | 🏄 |
| board-rental | 🛹 Board Rental | 🛹 |
| grocery | 🛒 Grocery | 🛒 |
| gas-station | ⛽ Gas Station | ⛽ |
| parking | 🅿️ Parking | 🅿️ |
| lodging | 🏠 Lodging | 🏠 |

---

## Z-Index Stack

| Element | Value |
|---------|-------|
| Detail panel backdrop | `z-[1050]` |
| Detail panel | `z-[1060]` |
| Theme toggle dropdown | `z-[1300]` |
| Header | `z-[1200]` |
| Menu backdrop | `z-[1150]` |
| Filter sheet backdrop | `z-[1100]` |
| Zoom controls | `z-[1000]` |
| Filter FAB | `z-50` |

---

## Spacing & Layout

- Header height: `h-16` (64px)
- Detail panel top: `top-16` (below header)
- Main content: `flex-1` (fills remaining viewport)
- Dropdown panel: `w-80` (320px)
- Max content width: `max-w-screen-2xl` (1536px)

---

## Future Improvements (On Radar)

- Image generator integration for detail panel backgrounds
- Left/right-handed setting for zoom button placement
- Curriculum progress tracker for English coaching
