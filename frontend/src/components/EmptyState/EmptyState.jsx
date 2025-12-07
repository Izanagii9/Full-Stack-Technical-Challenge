import { useTranslation } from 'react-i18next'
import './EmptyState.css'

export const EmptyState = ({ message, icon }) => {
  const { t } = useTranslation()

  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <p className="empty-message">{message || t('empty.default')}</p>
    </div>
  )
}
