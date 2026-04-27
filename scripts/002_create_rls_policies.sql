-- RLS 策略设置
-- 为所有表启用 Row Level Security

-- 辅助函数：检查用户角色
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$;

-- 辅助函数：检查是否为管理员或销售
CREATE OR REPLACE FUNCTION is_admin_or_sales()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'sales')
  );
$$;

-- profiles 表
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles 
  FOR SELECT USING (auth.uid() = id OR is_admin_or_sales());

CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id OR is_admin_or_sales());

-- categories 表 - 所有人可读，仅管理员可写
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON categories 
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON categories 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "categories_update_admin" ON categories 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "categories_delete_admin" ON categories 
  FOR DELETE USING (is_admin_or_sales());

-- products 表 - 活跃产品所有人可读，管理员可写
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_active" ON products 
  FOR SELECT USING (is_active = true OR is_admin_or_sales());

CREATE POLICY "products_insert_admin" ON products 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "products_update_admin" ON products 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "products_delete_admin" ON products 
  FOR DELETE USING (is_admin_or_sales());

-- product_attributes 表
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_attributes_select_all" ON product_attributes 
  FOR SELECT USING (true);

CREATE POLICY "product_attributes_insert_admin" ON product_attributes 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "product_attributes_update_admin" ON product_attributes 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "product_attributes_delete_admin" ON product_attributes 
  FOR DELETE USING (is_admin_or_sales());

-- product_skus 表
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_skus_select_active" ON product_skus 
  FOR SELECT USING (is_active = true OR is_admin_or_sales());

CREATE POLICY "product_skus_insert_admin" ON product_skus 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "product_skus_update_admin" ON product_skus 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "product_skus_delete_admin" ON product_skus 
  FOR DELETE USING (is_admin_or_sales());

-- price_tiers 表
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_tiers_select_all" ON price_tiers 
  FOR SELECT USING (true);

CREATE POLICY "price_tiers_insert_admin" ON price_tiers 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "price_tiers_update_admin" ON price_tiers 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "price_tiers_delete_admin" ON price_tiers 
  FOR DELETE USING (is_admin_or_sales());

-- inquiry_carts 表 - 用户只能操作自己的询价车
ALTER TABLE inquiry_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_carts_select_own" ON inquiry_carts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "inquiry_carts_insert_own" ON inquiry_carts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inquiry_carts_update_own" ON inquiry_carts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "inquiry_carts_delete_own" ON inquiry_carts 
  FOR DELETE USING (auth.uid() = user_id);

-- inquiry_cart_items 表
ALTER TABLE inquiry_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_cart_items_select_own" ON inquiry_cart_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiry_carts WHERE id = cart_id AND user_id = auth.uid())
  );

CREATE POLICY "inquiry_cart_items_insert_own" ON inquiry_cart_items 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM inquiry_carts WHERE id = cart_id AND user_id = auth.uid())
  );

CREATE POLICY "inquiry_cart_items_update_own" ON inquiry_cart_items 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM inquiry_carts WHERE id = cart_id AND user_id = auth.uid())
  );

CREATE POLICY "inquiry_cart_items_delete_own" ON inquiry_cart_items 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM inquiry_carts WHERE id = cart_id AND user_id = auth.uid())
  );

-- inquiries 表 - 用户读自己的，管理员/销售读所有
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiries_select" ON inquiries 
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_sales());

CREATE POLICY "inquiries_insert" ON inquiries 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_or_sales());

CREATE POLICY "inquiries_update" ON inquiries 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_or_sales());

-- inquiry_items 表
ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_items_select" ON inquiry_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM inquiries WHERE id = inquiry_id AND (user_id = auth.uid() OR is_admin_or_sales()))
  );

CREATE POLICY "inquiry_items_insert" ON inquiry_items 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM inquiries WHERE id = inquiry_id AND (user_id = auth.uid() OR is_admin_or_sales()))
  );

-- quotations 表
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotations_select" ON quotations 
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_sales());

CREATE POLICY "quotations_insert" ON quotations 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "quotations_update" ON quotations 
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_or_sales());

-- quotation_items 表
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotation_items_select" ON quotation_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotations WHERE id = quotation_id AND (user_id = auth.uid() OR is_admin_or_sales()))
  );

CREATE POLICY "quotation_items_insert" ON quotation_items 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "quotation_items_update" ON quotation_items 
  FOR UPDATE USING (is_admin_or_sales());

-- customer_followups 表 - 仅管理员/销售可操作
ALTER TABLE customer_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_followups_select" ON customer_followups 
  FOR SELECT USING (is_admin_or_sales());

CREATE POLICY "customer_followups_insert" ON customer_followups 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "customer_followups_update" ON customer_followups 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "customer_followups_delete" ON customer_followups 
  FOR DELETE USING (is_admin_or_sales());

-- campaigns 表 - 活跃营销所有人可读，管理员可写
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select_active" ON campaigns 
  FOR SELECT USING (is_active = true OR is_admin_or_sales());

CREATE POLICY "campaigns_insert_admin" ON campaigns 
  FOR INSERT WITH CHECK (is_admin_or_sales());

CREATE POLICY "campaigns_update_admin" ON campaigns 
  FOR UPDATE USING (is_admin_or_sales());

CREATE POLICY "campaigns_delete_admin" ON campaigns 
  FOR DELETE USING (is_admin_or_sales());
