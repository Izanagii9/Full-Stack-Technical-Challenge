import { useTranslation } from 'react-i18next'
import './LoadingState.css'

export const LoadingState = ({ message }) => {
  const { t } = useTranslation()

  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message || t('loading.default')}</p>
    </div>
  )
}
