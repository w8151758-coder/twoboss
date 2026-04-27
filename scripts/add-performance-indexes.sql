-- 性能优化索引脚本
-- 为常用查询字段添加索引以加速数据库查询

-- 产品表索引
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_hot ON products(is_hot) WHERE is_hot = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status_created ON products(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku_search ON products USING gin(sku gin_trgm_ops);

-- 分类表索引
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 产品图片索引
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- 产品颜色索引
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);

-- 产品尺码索引
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);

-- 价格规则索引
CREATE INDEX IF NOT EXISTS idx_price_rules_product_id ON price_rules(product_id);

-- 询价相关索引
CREATE INDEX IF NOT EXISTS idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- 报价相关索引
CREATE INDEX IF NOT EXISTS idx_quotes_inquiry_id ON quotes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- 订单相关索引
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 客户相关索引
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);

-- 博客文章索引
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 启用pg_trgm扩展用于模糊搜索（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 分析所有表以更新统计信息
ANALYZE products;
ANALYZE categories;
ANALYZE product_images;
ANALYZE product_colors;
ANALYZE product_sizes;
ANALYZE price_rules;
ANALYZE inquiries;
ANALYZE quotes;
ANALYZE orders;
ANALYZE customers;
ANALYZE blog_posts;
