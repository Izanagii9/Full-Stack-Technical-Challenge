# Blog Frontend

React frontend for the Auto-Generated Blog application.

## Architecture

This project follows clean architecture principles with:

- **Redux Toolkit** for state management
- **React Router** for routing
- **i18next** for internationalization (English & Portuguese)
- **Service Layer** for data fetching (currently using mock data)
- **Component-based architecture** with separated concerns

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ArticleCard/    # Article preview card
│   ├── ArticleList/    # List of articles
│   ├── ArticleDetail/  # Full article view
│   └── LanguageSwitcher/ # Language toggle (EN/PT)
├── pages/              # Route pages
│   ├── HomePage.jsx
│   └── ArticlePage.jsx
├── store/              # Redux store configuration
│   ├── store.js
│   └── slices/
│       └── articlesSlice.js
├── services/           # API/data services
│   └── articleService.js
├── data/               # Mock data (temporary)
│   └── mockArticles.js
├── i18n/               # Internationalization
│   ├── config.js       # i18next configuration
│   └── locales/
│       ├── en.json     # English translations
│       └── pt.json     # Portuguese translations
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Features

- View list of articles
- Read full article content
- **Multi-language support (English & Portuguese)**
- Language switcher in header
- Localized dates
- Responsive design
- Loading states
- Error handling

## Next Steps

Currently using mock data. When the backend is ready:

1. Uncomment the API version in `src/services/articleService.js`
2. Set the `VITE_API_URL` environment variable
3. Remove the mock data imports

## Technologies

- React 18
- Redux Toolkit
- React Router 6
- i18next + react-i18next (internationalization)
- Vite
- Axios

## Internationalization

The app supports English and Portuguese languages:

- **Automatic detection**: Uses browser language preference
- **Manual switching**: EN/PT buttons in header
- **Persistent**: Language choice saved in localStorage
- **Localized dates**: Dates formatted based on selected language
- **UI only**: Article content remains in original language (AI-generated)
