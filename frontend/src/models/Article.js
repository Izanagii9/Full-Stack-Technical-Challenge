/**
 * @typedef {Object} ArticleData
 * @property {number} id - Article ID
 * @property {string} title - Article title
 * @property {string} excerpt - Short description
 * @property {string} content - Full article content
 * @property {string} author - Author name
 * @property {string} createdAt - Creation date (ISO string)
 * @property {string[]} [tags] - Article tags
 */

/**
 * Article Entity Model (Frontend)
 * Represents the structure of an article in the system
 * Must match backend Article model structure
 */
export class Article {
  /**
   * @param {ArticleData} data - Article data
   */
  constructor(data) {
    /** @type {number} */
    this.id = data.id;
    /** @type {string} */
    this.title = data.title;
    /** @type {string} */
    this.excerpt = data.excerpt;
    /** @type {string} */
    this.content = data.content;
    /** @type {string} */
    this.author = data.author;
    /** @type {string} */
    this.createdAt = data.createdAt;
    /** @type {string[]} */
    this.tags = data.tags || [];
  }

  /**
   * Create Article from API response
   * @param {ArticleData} apiData - Data from API response
   * @returns {Article}
   */
  static fromAPI(apiData) {
    return new Article({
      id: apiData.id,
      title: apiData.title,
      excerpt: apiData.excerpt,
      content: apiData.content,
      author: apiData.author,
      createdAt: apiData.createdAt,
      tags: apiData.tags || []
    });
  }

  /**
   * Get formatted date for display
   * @returns {string}
   */
  getFormattedDate() {
    return new Date(this.createdAt).toLocaleDateString();
  }

  /**
   * Get formatted date and time for display
   * @returns {string}
   */
  getFormattedDateTime() {
    return new Date(this.createdAt).toLocaleString();
  }

  /**
   * Validate article data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.excerpt || this.excerpt.trim().length === 0) {
      errors.push('Excerpt is required');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!this.author || this.author.trim().length === 0) {
      errors.push('Author is required');
    }

    if (!Array.isArray(this.tags)) {
      errors.push('Tags must be an array');
    }

    if (!this.createdAt) {
      errors.push('CreatedAt is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
