import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchArticleById,
  selectSelectedArticle,
  selectArticlesLoading,
  selectArticlesError,
  clearSelectedArticle
} from '../../store/slices/articlesSlice'
import { Article } from '../../models/Article'
import { LoadingState } from '../LoadingState/LoadingState'
import { ErrorState } from '../ErrorState/ErrorState'
import { EmptyState } from '../EmptyState/EmptyState'
import { StateContainer } from '../StateContainer/StateContainer'
import './ArticleDetail.css'

export const ArticleDetail = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  /** @type {Article|null} */
  const article = useSelector(selectSelectedArticle)
  const loading = useSelector(selectArticlesLoading)
  const error = useSelector(selectArticlesError)

  useEffect(() => {
    dispatch(fetchArticleById(id))

    return () => {
      dispatch(clearSelectedArticle())
    }
  }, [dispatch, id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US'
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.substring(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index}>{line.substring(3)}</h2>
      }
      if (line.trim() === '') {
        return <br key={index} />
      }
      return <p key={index}>{line}</p>
    })
  }

  if (loading) {
    return (
      <div className="article-detail-container">
        <StateContainer>
          <LoadingState message={t('loading.article')} />
        </StateContainer>
      </div>
    )
  }

  if (error) {
    return (
      <div className="article-detail-container">
        <StateContainer>
          <ErrorState
            title={t('error.loadingArticle')}
            message={error}
            onRetry={() => dispatch(fetchArticleById(id))}
            onBack={() => navigate('/')}
            backLabel={t('article.backToArticles')}
          />
        </StateContainer>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="article-detail-container">
        <StateContainer>
          <EmptyState message={t('article.notFound')} icon="📄" />
        </StateContainer>
      </div>
    )
  }

  // Validate that we received an Article instance
  if (!(article instanceof Article)) {
    console.error('ArticleDetail received invalid article object:', article)
    throw new Error('ArticleDetail expects an Article instance')
  }

  return (
    <div className="article-detail-container">
      <Link to="/" className="back-link">
        ← {t('article.backToArticles')}
      </Link>

      <article className="article-detail">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span className="article-author">{t('article.by')} {article.author}</span>
            <span className="article-date">{formatDate(article.createdAt)}</span>
          </div>
          <div className="article-tags">
            {article.tags.map((tag) => (
              <span key={tag} className="article-tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="article-content">
          {formatContent(article.content)}
        </div>
      </article>
    </div>
  )
}
