const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Everything below needs a logged-in user.
router.use(requireAuth);

const ALLOWED_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// POST /api/orders — checkout. Body: { items:[{productId, quantity}], shipping:{...} }
router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { items, shipping } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }
    if (!shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return res.status(400).json({ message: 'Name, phone and address are required for delivery.' });
    }

    await conn.beginTransaction();

    let total = 0;
    const lines = [];

    for (const line of items) {
      const qty = Math.floor(Number(line.quantity));
      if (!line.productId || !Number.isFinite(qty) || qty < 1) {
        await conn.rollback();
        return res.status(400).json({ message: 'Cart contains an invalid quantity.' });
      }

      const [rows] = await conn.query(
        'SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE',
        [line.productId]
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `A product in your cart no longer exists.` });
      }

      const product = rows[0];
      if (product.stock < qty) {
        await conn.rollback();
        return res.status(409).json({
          message: `Only ${product.stock} left of "${product.name}". Please reduce the quantity.`
        });
      }

      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product.id]);
      total += Number(product.price) * qty;
      lines.push({ product, qty });
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_phone, shipping_address)
       VALUES (?, 'pending', ?, ?, ?, ?)`,
      [req.user.id, total, shipping.name, shipping.phone, shipping.address]
    );
    const orderId = orderResult.insertId;

    for (const { product, qty } of lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, product.id, product.name, qty, product.price]
      );
    }

    await conn.commit();
    res.status(201).json({ orderId, total, status: 'pending' });
  } catch (err) {
    await conn.rollback().catch(() => {});
    next(err);
  } finally {
    conn.release();
  }
});

// GET /api/orders — history for the logged-in user (newest first)
router.get('/', async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, status, total_amount AS total, shipping_name, shipping_phone,
              shipping_address, created_at, updated_at
       FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [req.user.id]
    );

    if (orders.length === 0) return res.json([]);

    const ids = orders.map((o) => o.id);
    const [items] = await pool.query(
      `SELECT order_id AS orderId, product_id, product_name, quantity, unit_price AS unitPrice
       FROM order_items WHERE order_id IN (?)`,
      [ids]
    );

    const grouped = orders.map((o) => ({
      ...o,
      items: items.filter((it) => it.orderId === o.id)
    }));

    res.json(grouped);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — single order; the frontend polls this for live status
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status, total_amount AS total, shipping_name, shipping_phone,
              shipping_address, created_at, updated_at
       FROM orders WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found.' });

    const [items] = await pool.query(
      `SELECT product_id, product_name, quantity, unit_price AS unitPrice
       FROM order_items WHERE order_id = ?`,
      [req.params.id]
    );

    res.json({ ...rows[0], items });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — moves an order along the timeline.
// Owner-only so a customer can demo tracking; in production this
// would sit behind a separate staff/admin role.
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found.' });

    const [rows] = await pool.query(
      'SELECT id, status, updated_at FROM orders WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
