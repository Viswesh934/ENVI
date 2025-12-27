
# 🌱 ENVI — Full Project Plan (Page‑Wise Architecture)

**Project:** ENVI (Environment Intelligence App)  
**Goal:** Turn environmental data into clear, personalized, and actionable insights using strong visual analytics and AI.


# 📄 FRONTEND PAGES

---

## 1️⃣ Homepage (`/`) — ENV Overview Dashboard

### What this page consists of
- Overall ENV Score (0–100)
- AQI summary
- Tree Index
- Heat Index (Feels like)
- UV Index
- Humidity
- AI Today Insight
- Best activity suggestion (time-based)

### Visual Analytics
- Animated score ring
- Color‑coded metric cards
- Trend arrows
- Risk badges
- Mini timelines

### Frontend Development
- Dashboard grid
- ScoreRing component
- MetricCard components
- InsightStrip (AI)
- Location selector
- Skeleton loaders

### Backend Development
- `GET /api/today`
- ENV score calculation
- Time‑based recommendation logic
- Gemini short summary

### Dependencies & Reusability
- Depends on all data services
- Feeds Activity, Compare, Patterns pages
- Reuses ScoreRing, MetricCard, InsightStrip

---

## 2️⃣ AQI Page (`/aqi`, `/aqi/:city`) — Air Quality Intelligence

### What this page consists of
- AQI score & category
- Pollutant breakdown
- Health impact explanation
- City comparison
- AQI trends

### Visual Analytics
- Pollutant bar charts
- AQI scale bands
- Trend sparklines

### Frontend Development
- AQI hero card
- Pollutant charts
- City selector
- Compare toggle

### Backend Development
- `GET /api/aqi`
- `GET /api/aqi/forecast`
- Gemini explain & compare

### Dependencies & Reusability
- Used by Homepage & Activity page
- Shares location & time logic

---

## 3️⃣ Activity Page (`/activity`) — Time‑Window Action Planner

### What this page consists of
- Activity selector (Walk / Run / Cycle)
- Time window selector
- Safety score
- AI recommendation
- Explanation of risk

### Visual Analytics
- Safety gauge
- Time comparison bars
- Risk overlays

### Frontend Development
- Activity & time selectors
- Safety indicator
- Recommendation card
- Timeline view

### Backend Development
- `GET /api/activity-recommendation`
- Gemini personalized advice

### Dependencies & Reusability
- Depends on Today + Account data
- Shared with Homepage & Patterns

---

## 4️⃣ Tree Index Page (`/tree`) — Green Cover Intelligence

### What this page consists of
- Tree density score
- Green cover map
- Cooling & AQI benefits
- AI explanation

### Visual Analytics
- Map overlays
- Density heatmaps
- Comparison visuals

### Frontend Development
- Tree index card
- Map view
- Benefit explanation UI

### Backend Development
- `GET /api/tree-index`
- Normalization & scoring
- Gemini explain

### Dependencies & Reusability
- Used in ENV score & Activity safety
- Shares map components

---

## 5️⃣ Compare Page (`/compare`) — Place & Time Comparison

### What this page consists of
- Location vs location OR time vs time
- Side‑by‑side ENV metrics
- AI comparison summary

### Visual Analytics
- Split score rings
- Delta bars
- Color diff indicators

### Frontend Development
- Comparison layout
- Selectors
- Diff components

### Backend Development
- `GET /api/compare`
- Gemini comparison insights

### Dependencies & Reusability
- Uses Today endpoint
- Reuses all metric components

---

## 6️⃣ Patterns Page (`/patterns`) — Behavior & Environment Trends

### What this page consists of
- Historical trends
- User activity patterns
- Best time/location insights
- Predictive hints

### Visual Analytics
- Line charts
- Heatmaps
- Frequency graphs

### Frontend Development
- Charts & filters
- Pattern cards
- Insight summaries

### Backend Development
- `GET /api/patterns`
- Aggregation logic
- Gemini pattern analysis

### Dependencies & Reusability
- Uses historical data
- Feeds Activity & Homepage insights

---

## 7️⃣ Account Page (`/account`) — Personal Context Engine

### What this page consists of
- Profile overview
- Health sensitivity
- Activity preferences
- Risk thresholds
- Notification rules
- Data & privacy

### Visual Analytics
- Sensitivity sliders with color bands
- Risk tolerance gauges
- Recommendation preview card

### Frontend Development
- Account layout
- Sliders & toggles
- Preference cards
- Preview insight panel
- Local persistence

### Backend Development
- `GET /api/account`
- `POST /api/account`
- Preference injection into Gemini prompts

### Dependencies & Reusability
- Used by Activity, Homepage, Compare, Patterns
- Single source of personalization truth

---

## 8️⃣ Settings Page (`/settings`) — App Behavior Controls

### What this page consists of
- Theme
- Units
- Language
- UI preferences

### Frontend Development
- Toggles & selectors
- Persist UI settings

### Backend Development
- Optional sync endpoint

### Dependencies
- No logic dependency
- Pure UI behavior

---

# 🔁 SHARED SYSTEMS

## Shared Frontend Components
- ScoreRing
- MetricCard
- InsightStrip
- TimeWindow selector
- Location selector
- Chart primitives

## Shared Backend Systems
- Location & geocoding
- Time window engine
- Risk classification
- ENV score formula
- Gemini prompt templates

---

# 🎯 VISUAL ANALYTICS PRINCIPLES

- Color semantics (green → red)
- Explainability over raw data
- Progressive disclosure
- Mobile‑first clarity
- Animation for cognition, not decoration

---

# 🚀 PHASE 2 (Mobile App)

- React Native + Expo
- Shared logic & APIs
- Push notifications
- Background refresh
- Account sync

---