# Translation Guide

This project uses **i18next** for internationalization.

## Supported Languages

- **English (en)** - Default
- **Portuguese (pt)**

## How It Works

### 1. Translation Files

Located in `src/i18n/locales/`:

- `en.json` - English translations
- `pt.json` - Portuguese translations

### 2. Using Translations in Components

```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return <h1>{t('header.title')}</h1>
}
```

### 3. Accessing Current Language

```jsx
const { i18n } = useTranslation()
const currentLanguage = i18n.language // 'en' or 'pt'
```

### 4. Changing Language

```jsx
const { i18n } = useTranslation()
i18n.changeLanguage('pt') // Switch to Portuguese
```

## Adding New Translations

### Step 1: Add to Translation Files

**en.json:**
```json
{
  "mySection": {
    "greeting": "Hello"
  }
}
```

**pt.json:**
```json
{
  "mySection": {
    "greeting": "Olá"
  }
}
```

### Step 2: Use in Component

```jsx
const { t } = useTranslation()
return <p>{t('mySection.greeting')}</p>
```

## Translation Structure

```json
{
  "header": {
    "title": "...",
    "subtitle": "..."
  },
  "article": {
    "latestArticles": "...",
    "backToArticles": "...",
    "by": "..."
  },
  "loading": {
    "articles": "...",
    "article": "..."
  },
  "error": {
    "loadingArticles": "...",
    "loadingArticle": "..."
  }
}
```

## Features

- **Auto-detection**: Detects browser language
- **Persistence**: Saves preference to localStorage
- **Fallback**: Falls back to English if translation missing
- **Date localization**: Dates formatted based on language

## What's Translated

✅ **UI Elements:**
- Header title & subtitle
- Navigation text
- Button labels
- Loading messages
- Error messages
- Footer text

❌ **Not Translated:**
- Article titles (AI-generated)
- Article content (AI-generated)
- Author names

## Language Switcher

The `LanguageSwitcher` component in the header allows users to toggle between languages with a simple click on EN or PT buttons.
