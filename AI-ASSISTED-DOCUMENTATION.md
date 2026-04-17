# SafeSan — AI-Assisted Project Documentation

This documentation provides a detailed overview of the SafeSan application, its architecture, data flow, component behavior, and extension points. It is written to help developers quickly understand the system and continue enhancing it.

---

## 1. Project Summary

SafeSan is a React application built with Vite. It tracks sanitation complaints, helps users locate clean toilets, and provides an admin dashboard for monitoring hygiene issues. The app combines user-generated complaint data, a curated dataset of Trichy toilets, and geospatial mapping using Leaflet.

### Core objectives

- Collect and manage sanitation complaints
- Score hygiene and classify locations by risk
- Display interactive maps for users and administrators
- Provide a searchable toilet finder experience
- Use local storage for persistence and lightweight user authentication

---

## 2. Architecture Overview

### Primary layers

- `src/App.jsx`: application entry point and route definitions
- `src/context/AppContext.jsx`: centralized state and business logic
- `src/pages/`: user-facing and admin screens
- `src/components/`: reusable UI elements
- `src/utils/`: utilities for hygiene scoring, mapping, categorization, and email notifications

### Main technologies

- React 18
- Vite 5
- Tailwind CSS
- Leaflet / React Leaflet
- react-router-dom
- i18next
- TensorFlow.js (for hygiene model support)

---

## 3. Route & Role Flow

Routes are defined in `src/App.jsx` and protected using the `ProtectedRoute` wrapper.

- `/login`: login page for all users
- `/user-dashboard`: landing page for regular users
- `/admin-dashboard`: admin overview page
- `/report`: complaint submission page for users
- `/finder`: user toilet search and map page
- `/map`: admin map view of complaints and toilets

### User roles

- `user`: can access dashboard, report page, and finder page
- `admin`: can access admin dashboard and map page

If an unauthenticated user attempts to visit a protected route, they are redirected to `/login`.

---

## 4. State Management and Business Logic

### `src/context/AppContext.jsx`

This module contains the application state and core actions:

- `user`: authenticated user info
- `complaints`: complaint records stored in local storage
- `registeredUsers`: self-registered users
- `toast`: transient notification messages

Key actions:

- `registerUser()`: register a new non-admin user
- `login()`: authenticate admin or existing user
- `logout()`: clear user session
- `submitComplaint()`: create or upvote complaints
- `addUpvote()`: increment complaint upvotes with deduplication
- `updateComplaintReview()`: set field officer review status and trigger notification

### Persistence

Local storage keys:

- `safesan_user`
- `safesan_complaints`
- `safesan_registered_users`
- `upvoted_complaints`

---

## 5. Complaint & Hygiene Utilities

### `src/utils/complaintUtils.js`

This file focuses on hygiene, similarity, and geospatial calculations.

Primary functions:

- `getHygieneScore(imageFile)`: integrates with the TensorFlow hygiene model
- `extractTags(description)`: derives complaint categories such as Sanitization, Water, Lighting, Accessibility
- `detectIssueType(description)`: selects a primary issue type from tags
- `isDuplicate(existing, incoming)`: detects duplicate complaints by location, issue type, and description similarity
- `getDistance(lat1, lon1, lat2, lon2)`: computes Haversine distance in kilometers

### `src/utils/severityUtils.js`

Used to convert hygiene score values into severity labels and color indicators. This supports the admin dashboard status badges.

### `src/utils/toiletCategorizer.js`

Used to classify toilets into hygiene categories for the finder page and map displays.

- `green`: score >= 4
- `orange`: score >= 2.5 and < 4
- `red`: score < 2.5

It also computes display colors and blends complaint data into toilet scores.

---

## 6. Data Sources

### `src/utils/toiletData.js`

Contains a curated dataset of 20 Trichy public toilets with coordinates and hygiene scores.

Example record:

```js
{ lat: 10.7905, lng: 78.7047, name: 'Central Bus Stand Toilet', hygieneScore: 4.2 }
```

### Dynamic data

- OSM toilets are fetched from `src/utils/overpass.js`
- Complaint reports are submitted by users via the report page

---

## 7. User Pages

### `FinderPage.jsx`

This is the main user-facing search and map experience.

Features:

- Detect user location via Geolocation API
- Fetch nearby OSM toilets
- Combine curated Trichy toilets, user complaint data, and OSM results
- Provide search suggestions and distance-sorted results
- Highlight a "best option" using a combined hygiene-and-distance utility score
- Render a Leaflet map with color-coded markers

Filtering logic:

- `cleanToilets`: merges toilets with hygiene score >= 3.5
- `filteredToilets`: sorts by distance when location is available
- `bestOption`: selects the best nearby toilet based on score and proximity

### `MapPage.jsx`

Admin map visualization of complaint locations and Trichy toilets.

Features:

- Leaflet map initialization and OpenStreetMap tile layer
- Color-coded complaint markers
- Hygiene score popup content
- Optional user location marker when enabled

---

## 8. Admin Pages

### `AdminDashboard.jsx`

Admin overview and review interface.

Key functionality:

- Complaint count, average hygiene score, total upvotes
- Priority alert cards
- Trending complaints list
- Complaint detail overlay with officer review dropdown
- Status badges using hygiene score color categories

### `Dashboard.jsx`

This page is the user dashboard, and typically surfaces user-specific metrics and actions. (Review code for exact current content.)

---

## 9. UI Components

### `src/components/Navbar.jsx`

Navigation bar with authenticated route links and logout controls.

### `src/components/Toast.jsx`

Global toast component that displays messages emitted by `AppContext`.

### `src/components/ComplaintCard.jsx`

Reusable UI card for complaint summary display.

---

## 10. Localization

### `src/i18n.js`

Initializes `i18next` for translation support.

The Finder page uses translation hooks, so labels can be localized.

---

## 11. AI / ML Integration

### TensorFlow hygiene model

The project includes TensorFlow.js dependencies and lazy-loads a hygiene model from `src/utils/hygieneModel.js`.

- `App.jsx` calls `preloadHygieneModel()` at startup
- `complaintUtils.getHygieneScore()` wraps `predictHygiene()`

This design allows future automation of image-based hygiene scoring.

---

## 12. Development & Deployment

### Local setup

```bash
npm install
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

### Notes

- The app is currently configured for Node 24.x in `package.json`
- Vite automatically bundles React and Tailwind styles
- The build includes dynamic imports for the hygiene model

---

## 13. Extension Points

### Add new toilet regions

- Extend `src/utils/toiletData.js` with new location objects
- Adjust `FinderPage.jsx` to include more region-specific filtering

### Improve complaint matching

- Enhance `isDuplicate()` in `complaintUtils.js`
- Add fuzzy string matching or address normalization

### Add real backend persistence

- Replace local storage logic in `AppContext.jsx`
- Add API calls for complaint CRUD operations and user auth

### Expand AI scoring

- Use a stronger TensorFlow image model in `src/utils/hygieneModel.js`
- Introduce classification for restroom cleanliness categories

---

## 14. Recommended Reading

- React Context API for global state management
- Leaflet / React Leaflet map integration patterns
- i18next for application localization
- TensorFlow.js model deployment in the browser

---

## 15. File Reference

- `src/App.jsx`
- `src/main.jsx`
- `src/context/AppContext.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/ReportPage.jsx`
- `src/pages/MapPage.jsx`
- `src/pages/FinderPage.jsx`
- `src/components/Navbar.jsx`
- `src/components/Toast.jsx`
- `src/components/ComplaintCard.jsx`
- `src/utils/complaintUtils.js`
- `src/utils/severityUtils.js`
- `src/utils/toiletCategorizer.js`
- `src/utils/toiletData.js`
- `src/utils/overpass.js`
- `src/utils/brevoUtils.js`
- `src/utils/hygieneModel.js`
- `src/i18n.js`

---

## 16. Contact

This documentation is generated to assist developers working on SafeSan. Use it as a reference for feature enhancements, debugging, and onboarding new contributors.
