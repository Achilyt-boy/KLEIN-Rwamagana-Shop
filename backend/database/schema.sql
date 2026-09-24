-- ============================================================
--  KLEIN E-COMMERCE — MySQL Database Schema
--  Location: Rwamagana, Rwanda
--  Apply with:  npm run db:setup   (from the backend folder)
--  or manually: mysql -u root < database/schema.sql
--
--  NOTE: the DROP at the top is there so re-running the script
--  always gives a clean database. It only wipes the KLEIN db.
-- ============================================================

DROP DATABASE IF EXISTS klein_ecommerce;
CREATE DATABASE IF NOT EXISTS klein_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE klein_ecommerce;

-- ------------------------------------------------------------
-- Users: anyone who registers on the shop
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(190)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Categories: the six product families KLEIN carries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(80) NOT NULL,
  slug  VARCHAR(80) NOT NULL UNIQUE,
  emoji VARCHAR(8)  NOT NULL DEFAULT '🛍️'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Products
--   price is stored in Rwandan Francs (RWF), whole numbers
--   image_url is optional — the UI falls back to the
--   category emoji on a gradient tile when it is NULL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name        VARCHAR(150)   NOT NULL,
  description TEXT           NOT NULL,
  price       DECIMAL(10,2)  NOT NULL,
  stock       INT            NOT NULL DEFAULT 0,
  image_url   VARCHAR(500)   NULL,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_product_category (category_id),
  INDEX idx_product_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Orders + order items
--   status drives the live tracking timeline on the frontend
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  status           ENUM('pending','processing','shipped','delivered','cancelled')
                   NOT NULL DEFAULT 'pending',
  total_amount     DECIMAL(10,2) NOT NULL,
  shipping_name    VARCHAR(120) NOT NULL,
  shipping_phone   VARCHAR(30)  NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity     INT NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_order   FOREIGN KEY (order_id)
    REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_product FOREIGN KEY (product_id)
    REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================================
--  Seed data
-- ============================================================
INSERT INTO categories (name, slug, emoji) VALUES
  ('Clothes',            'clothes',    '👕'),
  ('Shoes',              'shoes',      '👟'),
  ('Bags',               'bags',       '👜'),
  ('Household equipment','household',  '🏠'),
  ('Jewellery',          'jewellery',  '💍'),
  ('Cosmetics',          'cosmetics',  '💄')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
-- Clothes (1)
(1, 'Classic Denim Jacket',   'Washed blue denim jacket with a regular fit. Works with almost anything in your wardrobe.', 28000, 24, NULL),
(1, 'Ankara Print Dress',     'Bright Ankara print dress, sewn locally in Rwamagana. Light fabric, full lining.',            22000, 18, NULL),
(1, 'Cotton T-Shirt',         'Plain black 100% cotton t-shirt. Soft collar, pre-shrunk.',                                  9500, 60, NULL),
(1, 'Chino Trousers',         'Slim chino trousers in khaki. Stretch cotton for everyday comfort.',                         18000, 30, NULL),
-- Shoes (2)
(2, 'White Sneakers',         'Clean white low-top sneakers with a rubber sole. Easy to match, easy to clean.',            35000, 22, NULL),
(2, 'Leather Loafers',        'Brown genuine leather loafers. Smart enough for office, light enough for long days.',        42000, 14, NULL),
(2, 'Running Trainers',       'Breathable mesh trainers with cushioned heel. Built for morning runs.',                     48000, 16, NULL),
(2, 'Everyday Sandals',       'Durable rubber sandals with adjustable straps. Perfect for wet season.',                    15000, 45, NULL),
-- Bags (3)
(3, 'Canvas Backpack',        '25L canvas backpack with padded laptop sleeve and water bottle pocket.',                     25000, 26, NULL),
(3, 'Leather Handbag',        'Structured leather handbag with detachable strap and inner zip pocket.',                     38000, 12, NULL),
(3, 'Travel Duffel',          'Weekend duffel bag, 40L. Fits cabin luggage limits.',                                        45000, 10, NULL),
(3, 'Crossbody Sling Bag',    'Small sling bag for phone, keys and wallet. Adjustable strap.',                             17500, 33, NULL),
-- Household equipment (4)
(4, 'Non-stick Frying Pan',   '28cm non-stick frying pan with heat-resistant handle. Works on gas and electric.',          21000, 20, NULL),
(4, 'Ceramic Dinner Set',     '12-piece ceramic set: 4 plates, 4 bowls, 4 mugs. Dishwasher safe.',                         55000,  8, NULL),
(4, 'Electric Kettle',        '1.7L stainless steel kettle with auto shut-off. Boils in about 5 minutes.',                19500, 25, NULL),
(4, 'Memory Foam Pillow',     'Orthopaedic memory foam pillow with washable cover. Firm but comfortable.',                14000, 35, NULL),
-- Jewellery (5)
(5, 'Gold-plated Hoops',      'Lightweight gold-plated hoop earrings. Nickel free, safe for sensitive skin.',             12500, 40, NULL),
(5, 'Beaded Necklace',        'Handmade beaded necklace woven by local artisans. One of a kind.',                          8000, 28, NULL),
(5, 'Silver Chain',           '925 sterling silver chain, 45cm. Tarnish resistant.',                                      26000, 15, NULL),
(5, 'Stone Ring',             'Adjustable ring with natural stone setting.',                                              15500, 21, NULL),
-- Cosmetics (6)
(6, 'Shea Butter Cream',      'Raw shea butter moisturiser. No perfume, no parabens. 250ml jar.',                           7500, 50, NULL),
(6, 'Lipstick Set',           'Set of 3 matte lipsticks: nude, red and berry.',                                           13000, 30, NULL),
(6, 'Vitamin C Serum',        'Brightening vitamin C serum, 30ml. Use in the morning before sunscreen.',                   24000, 19, NULL),
(6, 'Perfume — 50ml',         'Fresh floral eau de parfum. Lasts 6 to 8 hours on skin.',                                  32000, 17, NULL);
