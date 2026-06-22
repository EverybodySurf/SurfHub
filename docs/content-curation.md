# SurfHub Content Curation System

## Overview

The curation system filters and approves content before it appears in SurfHub feeds. It combines **automated scoring** with **manual review** to ensure quality.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   SOURCES   │────▶│    QUEUE     │────▶│   REVIEW    │
│ (Instagram, │     │ (pending)    │     │ (Admin UI)  │
│  YouTube,   │     │              │     │             │
│  TikTok)    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   CRITERIA   │     │   APPROVED  │
                    │   ENGINE     │     │   FEEDS     │
                    │ (auto-score) │     │             │
                    └──────────────┘     └─────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/curate/criteria.ts` | **Approval criteria + scoring engine** |
| `src/lib/curate/sources.ts` | **Source configurations (who to fetch from)** |
| `data/queue.json` | **Storage: pending, approved, rejected arrays** |
| `src/app/api/curate/queue/route.ts` | GET/POST queue API |
| `src/app/api/curate/approve/route.ts` | POST approve API |
| `src/app/api/curate/reject/route.ts` | POST reject API |
| `src/app/admin/curate/page.tsx` | **Admin UI** (review + manual submit) |
| `scripts/auto-fetch.ts` | Auto-fetch runner |

---

## Accessing the System

### Admin UI
```
http://localhost:3001/admin/curate
```

Features:
- View pending items (sorted by score)
- Approve or reject items
- Manual submission form
- Queue stats (pending/approved/rejected counts)

### API Endpoints

```bash
# Get pending queue
GET /api/curate/queue

# Add item manually
POST /api/curate/queue
{
  "source": "instagram",
  "url": "https://instagram.com/reel/ABC123",
  "title": "Sunrise Session",
  "content": "Perfect glassy waves...",
  "feed": "local",
  "type": "reel",
  "creator": "@gwadashots",
  "location": "Guadeloupe"
}

# Approve item
POST /api/curate/approve
{ "itemId": "queue-001", "reviewer": "admin" }

# Reject item
POST /api/curate/reject
{ "itemId": "queue-001", "reason": "Not suitable", "reviewer": "admin" }
```

---

## Criteria Configuration

### File: `src/lib/curate/criteria.ts`

The criteria engine uses three feed-specific rule sets:

#### 1. Feelgood Feed
```typescript
feelgood: {
  keywords: [
    'surf', 'ocean', 'waves', 'peaceful', 'calm', 'nature',
    'magic', 'soul', 'beauty', 'sunrise', 'sunset', 'glassy', 'serene'
  ],
  excludeKeywords: [
    'competition', 'fight', 'aggressive', 'negative', 'contest', 'battle'
  ],
  sentimentScore: 0.7,    // Minimum sentiment threshold
  requireCredit: true,    // Must credit creator
}
```

**What gets approved:**
- Peaceful, inspiring surf content
- Quotes about surfing/ocean
- Positive vibes only
- Must credit the source

**What gets rejected:**
- Competition/contest content
- Aggressive or negative tone
- No creator credit

---

#### 2. Local Feed (Guadeloupe)
```typescript
local: {
  keywords: [
    'guadeloupe', 'gwada', 'caravelle', 'le moule', 'sainte-anne',
    'saint-françois', 'port-louis', 'grande anse', 'pointe des châteaux',
    'bois malot', 'anse bertrand', 'petite anse'
  ],
  requireLocation: true,  // Must have location
}
```

**What gets approved:**
- Content about Guadeloupe surf spots
- Local creators (@gwadashots, @romain_alexis_surf)
- Location tag required

**What gets rejected:**
- No location mentioned
- Not about Guadeloupe

---

#### 3. Global Feed
```typescript
global: {
  keywords: [
    'surf', 'wsl', 'world', 'championship', 'travel', 'indonesia',
    'bali', 'hawaii', 'australia', 'portugal', 'france', 'tahiti',
    'mentawai', 'teahupo', 'pipeline', 'gold coast', 'noosa'
  ],
  sentimentScore: 0.3,    // Lower threshold (news allowed)
}
```

**What gets approved:**
- International surf news
- WSL/world tour content
- Travel destinations
- Lower threshold (allows news/contests)

---

## Scoring System

Each item receives an **auto-score** (0.0 - 1.0) based on:

1. **Keyword match** (+0.1 per matching keyword)
2. **Exclude keyword penalty** (-0.15 per exclude match)
3. **Sentiment analysis** (positive tone bonus)
4. **Credit/location checks** (+0.2 if satisfied)

### Score Thresholds

| Score | Status |
|-------|--------|
| > 0.7 | High confidence → auto-approve candidate |
| 0.4 - 0.7 | Medium → manual review recommended |
| 0.3 - 0.4 | Low → likely filtered |
| < 0.3 | Auto-filtered (won't enter queue) |

---

## Adjusting Criteria

### To add keywords:

```typescript
// In src/lib/curate/criteria.ts
feelgood: {
  keywords: [
    // Add new keywords here
    'meditation', 'flow', 'mindfulness',
  ],
}
```

### To change thresholds:

```typescript
// Increase sentiment requirement
feelgood: {
  sentimentScore: 0.8,  // Was 0.7
}

// Lower local location requirement
local: {
  requireLocation: false,  // Was true
}
```

### To add new sources:

```typescript
// In src/lib/curate/sources.ts
{
  platform: 'instagram',
  handle: '@new_surf_creator',
  feed: 'local',
  priority: 4,
  active: true,
  fetchInterval: 60,  // minutes
}
```

---

## Manual Submission Form

Located at `/admin/curate` — click **"+ Add New Content"**

Required fields:
- **URL** — Content link
- **Title** — Display title
- **Content** — Description
- **Feed** — feelgood / local / global
- **Type** — photo / video / reel / quote / spot / event / news

Optional fields:
- **Creator** — @username
- **Location** — For local feed
- **Image URL** — Thumbnail
- **Video URL** — Auto-detected if same as main URL

---

## Auto-Fetch

### Run manually:
```bash
cd apps/surfhub
npx tsx scripts/auto-fetch.ts
```

### Set up cron (future):
```bash
# Check every hour
0 * * * * cd /path/to/surfhub && npx tsx scripts/auto-fetch.ts
```

### Current limitations:
- Instagram/YouTube/TikTok/Twitter fetch functions are **placeholders**
- Need API keys or Firecrawl integration for real fetching
- Manual submission works now

---

## Storage Format

### `data/queue.json`:

```json
{
  "pending": [
    {
      "id": "queue-001",
      "source": "instagram",
      "url": "https://instagram.com/reel/ABC123",
      "title": "Sunrise Session",
      "content": "Perfect glassy waves...",
      "creator": "@gwadashots",
      "feed": "local",
      "type": "reel",
      "autoScore": 0.85,
      "status": "pending",
      "submittedAt": "2026-05-07T19:00:00Z"
    }
  ],
  "approved": [],
  "rejected": []
}
```

---

## Quick Reference

| Task | How |
|------|-----|
| View pending items | `/admin/curate` |
| Approve/Reject | Click buttons in Admin UI |
| Submit manually | Click "+ Add New Content" |
| Change keywords | Edit `criteria.ts` → `keywords` array |
| Change thresholds | Edit `criteria.ts` → `sentimentScore` |
| Add new source | Edit `sources.ts` → `SOURCES` array |
| Run auto-fetch | `npx tsx scripts/auto-fetch.ts` |

---

*Last updated: 2026-05-07*