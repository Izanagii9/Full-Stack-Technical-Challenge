import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { ArticlePage } from './pages/ArticlePage'
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher'
import './App.css'

function App() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('page.title')
  }, [t, i18n.language])

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="header-top">
              <div className="header-spacer"></div>
              <div className="header-text">
                <h1 className="site-title">{t('header.title')}</h1>
                <p className="site-subtitle">{t('header.subtitle')}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>{t('footer.copyright')}</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
