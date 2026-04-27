-- 测试数据

-- 插入产品分类
INSERT INTO categories (id, name, sort_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', '电子元器件', 1, true),
  ('22222222-2222-2222-2222-222222222222', '机械配件', 2, true),
  ('33333333-3333-3333-3333-333333333333', '包装材料', 3, true),
  ('44444444-4444-4444-4444-444444444444', '办公用品', 4, true)
ON CONFLICT (id) DO NOTHING;

-- 插入子分类
INSERT INTO categories (id, name, parent_id, sort_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111112', '电阻', '11111111-1111-1111-1111-111111111111', 1, true),
  ('11111111-1111-1111-1111-111111111113', '电容', '11111111-1111-1111-1111-111111111111', 2, true),
  ('11111111-1111-1111-1111-111111111114', '芯片', '11111111-1111-1111-1111-111111111111', 3, true),
  ('22222222-2222-2222-2222-222222222223', '轴承', '22222222-2222-2222-2222-222222222222', 1, true),
  ('22222222-2222-2222-2222-222222222224', '齿轮', '22222222-2222-2222-2222-222222222222', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 插入产品
INSERT INTO products (id, name, description, category_id, base_price, unit, min_order_qty, images, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '贴片电阻 0603', '高精度贴片电阻，0603封装，精度1%', '11111111-1111-1111-1111-111111111112', 0.05, '个', 100, ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'], true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '贴片电容 0805', '高品质贴片电容，0805封装', '11111111-1111-1111-1111-111111111113', 0.08, '个', 100, ARRAY['https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400'], true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'STM32F103C8T6', 'ARM Cortex-M3 微控制器', '11111111-1111-1111-1111-111111111114', 12.50, '片', 10, ARRAY['https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'], true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '深沟球轴承 6205', '标准深沟球轴承，内径25mm', '22222222-2222-2222-2222-222222222223', 8.00, '个', 10, ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'], true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '直齿圆柱齿轮', '模数2，齿数20，45号钢', '22222222-2222-2222-2222-222222222224', 15.00, '个', 5, ARRAY['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400'], true)
ON CONFLICT (id) DO NOTHING;

-- 插入产品属性
INSERT INTO product_attributes (id, product_id, name, values, sort_order) VALUES
  ('attr1111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '阻值', ARRAY['10Ω', '100Ω', '1KΩ', '10KΩ', '100KΩ'], 1),
  ('attr2222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '功率', ARRAY['1/16W', '1/10W', '1/8W'], 2),
  ('attr3333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '容值', ARRAY['10pF', '100pF', '1nF', '10nF', '100nF'], 1),
  ('attr4444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '耐压', ARRAY['16V', '25V', '50V'], 2),
  ('attr5555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '精度等级', ARRAY['P0', 'P6', 'P5'], 1)
ON CONFLICT (id) DO NOTHING;

-- 插入产品SKU
INSERT INTO product_skus (id, product_id, sku_code, attributes, price, stock, is_active) VALUES
  ('sku11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'R0603-10R-1/16W', '{"阻值": "10Ω", "功率": "1/16W"}', 0.05, 10000, true),
  ('sku11111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'R0603-100R-1/16W', '{"阻值": "100Ω", "功率": "1/16W"}', 0.05, 10000, true),
  ('sku11111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'R0603-1K-1/16W', '{"阻值": "1KΩ", "功率": "1/16W"}', 0.05, 10000, true),
  ('sku11111-1111-1111-1111-111111111114', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'R0603-10K-1/8W', '{"阻值": "10KΩ", "功率": "1/8W"}', 0.06, 8000, true),
  ('sku22222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'C0805-100pF-50V', '{"容值": "100pF", "耐压": "50V"}', 0.08, 5000, true),
  ('sku22222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'C0805-100nF-25V', '{"容值": "100nF", "耐压": "25V"}', 0.10, 5000, true),
  ('sku33333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'STM32F103C8T6', '{}', 12.50, 500, true),
  ('sku44444-4444-4444-4444-444444444441', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '6205-P0', '{"精度等级": "P0"}', 8.00, 200, true),
  ('sku44444-4444-4444-4444-444444444442', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '6205-P6', '{"精度等级": "P6"}', 12.00, 100, true),
  ('sku55555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'GEAR-M2-Z20', '{}', 15.00, 100, true)
ON CONFLICT (id) DO NOTHING;

-- 插入阶梯价格
INSERT INTO price_tiers (product_id, sku_id, min_qty, max_qty, price) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sku11111-1111-1111-1111-111111111111', 100, 999, 0.05),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sku11111-1111-1111-1111-111111111111', 1000, 4999, 0.04),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sku11111-1111-1111-1111-111111111111', 5000, 9999, 0.035),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sku11111-1111-1111-1111-111111111111', 10000, NULL, 0.03),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'sku33333-3333-3333-3333-333333333331', 10, 49, 12.50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'sku33333-3333-3333-3333-333333333331', 50, 99, 11.00),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'sku33333-3333-3333-3333-333333333331', 100, NULL, 10.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'sku44444-4444-4444-4444-444444444441', 10, 49, 8.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'sku44444-4444-4444-4444-444444444441', 50, 99, 7.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'sku44444-4444-4444-4444-444444444441', 100, NULL, 6.00)
ON CONFLICT DO NOTHING;

-- 插入营销活动
INSERT INTO campaigns (id, name, type, description, content, start_date, end_date, is_active) VALUES
  ('camp1111-1111-1111-1111-111111111111', '新客户专享优惠', 'promotion', '新注册客户首单满1000减100', '新客户专属福利，首次下单满1000元立减100元，机会难得！', NOW(), NOW() + INTERVAL '30 days', true),
  ('camp2222-2222-2222-2222-222222222222', '电子元器件促销季', 'discount', '全场电子元器件8折起', '电子元器件大促销，贴片电阻电容低至8折，量大更优惠！', NOW(), NOW() + INTERVAL '15 days', true),
  ('camp3333-3333-3333-3333-333333333333', '春季采购节', 'notice', '春季采购节即将开始', '2025年春季采购节即将到来，敬请期待更多优惠活动！', NOW() + INTERVAL '30 days', NOW() + INTERVAL '60 days', true)
ON CONFLICT (id) DO NOTHING;
