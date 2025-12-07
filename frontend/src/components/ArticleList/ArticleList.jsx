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
        <div className="loading">{t('loading.articles')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="article-list-container">
        <div className="error">{t('error.loadingArticles')}: {error}</div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="article-list-container">
        <div className="empty">{t('empty.noArticles')}</div>
      </div>
    )
  }

  return (
    <div className="article-list-container">
      <h1 className="article-list-title">{t('article.latestArticles')}</h1>
      <div className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
