import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './ArticleCard.css'

export const ArticleCard = ({ article }) => {
  const { t, i18n } = useTranslation()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US'
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <article className="article-card">
      <Link to={`/article/${article.id}`} className="article-card-link">
        <h2 className="article-card-title">{article.title}</h2>
        <p className="article-card-excerpt">{article.excerpt}</p>
        <div className="article-card-meta">
          <span className="article-card-author">{t('article.by')} {article.author}</span>
          <span className="article-card-date">{formatDate(article.createdAt)}</span>
        </div>
        <div className="article-card-tags">
          {article.tags.map((tag) => (
            <span key={tag} className="article-tag">
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  )
}
