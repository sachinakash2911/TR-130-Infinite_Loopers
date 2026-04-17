# SafeSan

SafeSan is a React + Vite web application for tracking, reviewing, and locating sanitation complaints and public toilets. It combines complaint management, hygiene scoring, and interactive map-based search to help users and administrators monitor sanitation issues.

## Key Features

- **User finder page** with searchable Trichy toilet data
- **Map-based navigation** using Leaflet and React Leaflet
- **Color-coded hygiene scoring** for toilets and complaints
- **Admin dashboard** for monitoring complaint trends and managing reviews
- **Internationalization support** powered by i18next
- **TensorFlow.js support** available in utilities for future ML-powered hygiene modeling
- **Responsive UI** built with Tailwind CSS

## Project Structure

- `src/App.jsx` - application entry and route setup
- `src/main.jsx` - React bootstrap file
- `src/pages/` - main screen components
  - `AdminDashboard.jsx`
  - `Dashboard.jsx`
  - `FinderPage.jsx`
  - `LoginPage.jsx`
  - `MapPage.jsx`
  - `ReportPage.jsx`
- `src/components/` - reusable UI components
- `src/context/AppContext.jsx` - global state and complaint management
- `src/utils/` - utilities for complaint handling, maps, categorization, and hygiene modeling

## Built With

- React 18
- Vite 5
- Tailwind CSS
- Leaflet / React Leaflet
- i18next
- TensorFlow.js

## Getting Started

### Prerequisites

- Node.js 24.x

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the local dev server URL shown in the terminal.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Notes

- The app uses `react-router-dom` for page navigation.
- Leaflet map interactions are enabled for user-facing map pages.
- Admin pages focus on complaint analytics and officer review workflows.

## License

This repository is currently private and does not include a public license.
