import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setIsOpen(false)
  }

  const currentLanguage = i18n.language

  const getLanguageLabel = (lang) => {
    return lang === 'pt' ? 'Português' : 'English'
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <svg
          className="globe-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="current-lang">{currentLanguage.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          <button
            className={`lang-option ${currentLanguage === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            <span className="lang-code">EN</span>
            <span className="lang-name">{getLanguageLabel('en')}</span>
          </button>
          <button
            className={`lang-option ${currentLanguage === 'pt' ? 'active' : ''}`}
            onClick={() => changeLanguage('pt')}
          >
            <span className="lang-code">PT</span>
            <span className="lang-name">{getLanguageLabel('pt')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
