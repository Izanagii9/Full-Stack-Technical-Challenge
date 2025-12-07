import { useTranslation } from 'react-i18next'
import './ErrorState.css'

export const ErrorState = ({ title, message, onRetry, onBack, backLabel }) => {
  const { t } = useTranslation()

  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">{title || t('error.default')}</h2>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            {t('action.retry')}
          </button>
        )}
        {onBack && (
          <button className="back-button" onClick={onBack}>
            {backLabel || t('action.back')}
          </button>
        )}
      </div>
    </div>
  )
}
