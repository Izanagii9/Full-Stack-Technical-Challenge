import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  fetchArticles,
  selectAllArticles,
  selectArticlesLoading,
  selectArticlesError
} from '../../store/slices/articlesSlice'
import { ArticleCard } from '../ArticleCard/ArticleCard'
import { LoadingState } from '../LoadingState/LoadingState'
import { ErrorState } from '../ErrorState/ErrorState'
import { EmptyState } from '../EmptyState/EmptyState'
import { StateContainer } from '../StateContainer/StateContainer'
import './ArticleList.css'

export const ArticleList = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const articles = useSelector(selectAllArticles)
  const loading = useSelector(selectArticlesLoading)
  const error = useSelector(selectArticlesError)

  useEffect(() => {
    dispatch(fetchArticles())
  }, [dispatch])

  if (loading) {
    return (
      <div className="article-list-container">
        <StateContainer>
          <LoadingState message={t('loading.articles')} />
        </StateContainer>
      </div>
    )
  }

  if (error) {
    return (
      <div className="article-list-container">
        <StateContainer>
          <ErrorState
            title={t('error.loadingArticles')}
            message={error}
            onRetry={() => dispatch(fetchArticles())}
          />
        </StateContainer>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="article-list-container">
        <StateContainer>
          <EmptyState message={t('empty.noArticles')} icon="📭" />
        </StateContainer>
      </div>
    )
  }

  // TODO: Replace manual refresh with WebSockets for real-time updates
  const handleRefresh = () => {
    dispatch(fetchArticles())
  }

  return (
    <div className="article-list-container">
      <div className="article-list-header">
        <h1 className="article-list-title">{t('article.latestArticles')}</h1>
        <button className="refresh-button" onClick={handleRefresh} title={t('article.refresh')}>
          <span className="icon">🔄</span>
          {t('article.refresh')}
        </button>
      </div>
      <div className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
