-- Seed Data for Customers-Orders System
-- Sample data for testing and development

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
('ACME Corporation', 'ops@acme.com', '+1-555-0100'),
('Tech Solutions Inc', 'contact@techsolutions.com', '+1-555-0200'),
('Global Imports Ltd', 'orders@globalimports.com', '+1-555-0300'),
('Digital Services Co', 'info@digitalservices.com', '+1-555-0400'),
('Enterprise Systems', 'admin@enterprise.com', '+1-555-0500');

-- Insert sample products
INSERT INTO products (sku, name, price_cents, stock) VALUES
('LAPTOP-XPS-15', 'Dell XPS 15 Laptop', 149900, 25),
('MONITOR-4K-27', 'LG 27" 4K Monitor', 129900, 50),
('KEYBOARD-MX', 'Logitech MX Keys Keyboard', 9900, 100),
('MOUSE-MX', 'Logitech MX Master 3 Mouse', 7900, 150),
('WEBCAM-HD', 'Logitech HD Pro Webcam', 12900, 75),
('HEADSET-PRO', 'Sony WH-1000XM4 Headset', 34900, 60),
('DOCK-TB3', 'CalDigit TS3 Plus Dock', 29900, 30),
('SSD-1TB', 'Samsung 970 EVO 1TB SSD', 15900, 200),
('RAM-32GB', 'Corsair Vengeance 32GB RAM', 11900, 80),
('CHARGER-USB-C', 'Anker 100W USB-C Charger', 5900, 120);

-- Insert a sample order (CREATED status)
INSERT INTO orders (customer_id, status, total_cents) VALUES
(1, 'CREATED', 269700);

-- Insert order items for the sample order
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(1, 2, 1, 129900, 129900),
(1, 3, 2, 9900, 19800),
(1, 4, 1, 7900, 7900),
(1, 5, 1, 12900, 12900),
(1, 8, 2, 15900, 31800),
(1, 9, 1, 11900, 11900),
(1, 10, 9, 5900, 53100);

-- Insert another order (CONFIRMED status)
INSERT INTO orders (customer_id, status, total_cents, confirmed_at) VALUES
(2, 'CONFIRMED', 187700, CURRENT_TIMESTAMP);

-- Insert order items for the confirmed order
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(2, 1, 1, 149900, 149900),
(2, 6, 1, 34900, 34900),
(2, 10, 1, 5900, 5900);

-- Insert a sample idempotency key (already used)
INSERT INTO idempotency_keys (`key`, target_type, target_id, status, response_body, expires_at) VALUES
('test-key-12345', 'order_confirm', 2, 'completed', '{"success": true, "orderId": 2}', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR));

-- Display summary
SELECT 'Seed data inserted successfully!' as message;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;
