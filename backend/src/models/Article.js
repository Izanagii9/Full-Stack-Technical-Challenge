/**
 * @typedef {Object} ArticleData
 * @property {number} [id] - Article ID
 * @property {string} title - Article title
 * @property {string} excerpt - Short description
 * @property {string} content - Full article content
 * @property {string} author - Author name
 * @property {string|Date} [createdAt] - Creation date
 * @property {string|Date} [created_at] - Creation date (DB format)
 * @property {string[]} [tags] - Article tags
 */

/**
 * Article Entity Model
 * Represents the structure of an article in the system
 */
export class Article {
  /**
   * @param {ArticleData} data - Article data
   */
  constructor(data) {
    /** @type {number|undefined} */
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
    this.createdAt = data.createdAt || data.created_at;
    /** @type {string[]} */
    this.tags = data.tags || [];
  }

  /**
   * Convert database row to Article entity
   * @param {ArticleData} row - Database row with snake_case fields
   * @returns {Article}
   */
  static fromDatabase(row) {
    return new Article({
      id: row.id,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      author: row.author,
      createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
      tags: row.tags || []
    });
  }

  /**
   * Convert Article entity to database format for INSERT operations
   * @returns {Object} Object with values array and fields for SQL query
   */
  toDb() {
    return {
      values: [
        this.title,
        this.excerpt,
        this.content,
        this.author,
        this.tags
      ],
      fields: ['title', 'excerpt', 'content', 'author', 'tags']
    };
  }

  /**
   * Convert Article entity to JSON-safe object for API response
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      excerpt: this.excerpt,
      content: this.content,
      author: this.author,
      createdAt: this.createdAt,
      tags: this.tags
    };
  }

  /**
   * Validate article data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 255) {
      errors.push('Title must be less than 255 characters');
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

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
