require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check so the frontend (and us) can confirm the API is alive
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'klein-api' }));

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 for anything else under /api
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

// Central error handler — keeps stack traces out of responses
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`KLEIN API running on http://localhost:${PORT}`);
});
