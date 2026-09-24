const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/categories — feeds the filter sidebar
router.get('/categories', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, emoji FROM categories ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/products', async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const where = [];
    const params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }
    if (minPrice !== undefined && minPrice !== '') {
      where.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      where.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const orderSql =
      sort === 'price_asc'  ? 'ORDER BY p.price ASC' :
      sort === 'price_desc' ? 'ORDER BY p.price DESC' :
      sort === 'newest'     ? 'ORDER BY p.created_at DESC' :
                              'ORDER BY p.id ASC';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
              c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug, c.emoji AS categoryEmoji
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereSql}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );

    res.json({
      products: rows,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — detail page
router.get('/products/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
              c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug, c.emoji AS categoryEmoji
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
