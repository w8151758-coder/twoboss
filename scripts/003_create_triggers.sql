-- 触发器和函数

-- 自动创建用户档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, contact_name, company_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'contact_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiry_carts_updated_at ON inquiry_carts;
CREATE TRIGGER update_inquiry_carts_updated_at
  BEFORE UPDATE ON inquiry_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 生成询价单号函数
CREATE OR REPLACE FUNCTION generate_inquiry_no()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_no TEXT;
  date_part TEXT;
  seq_part INT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COALESCE(MAX(SUBSTRING(inquiry_no FROM 10)::INT), 0) + 1
  INTO seq_part
  FROM inquiries
  WHERE inquiry_no LIKE 'INQ' || date_part || '%';
  
  new_no := 'INQ' || date_part || LPAD(seq_part::TEXT, 4, '0');
  
  RETURN new_no;
END;
$$;

-- 生成报价单号函数
CREATE OR REPLACE FUNCTION generate_quotation_no()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_no TEXT;
  date_part TEXT;
  seq_part INT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COALESCE(MAX(SUBSTRING(quotation_no FROM 10)::INT), 0) + 1
  INTO seq_part
  FROM quotations
  WHERE quotation_no LIKE 'QUO' || date_part || '%';
  
  new_no := 'QUO' || date_part || LPAD(seq_part::TEXT, 4, '0');
  
  RETURN new_no;
END;
$$;

-- 自动设置询价单号
CREATE OR REPLACE FUNCTION set_inquiry_no()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.inquiry_no IS NULL OR NEW.inquiry_no = '' THEN
    NEW.inquiry_no := generate_inquiry_no();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_inquiry_no_trigger ON inquiries;
CREATE TRIGGER set_inquiry_no_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_inquiry_no();

-- 自动设置报价单号
CREATE OR REPLACE FUNCTION set_quotation_no()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quotation_no IS NULL OR NEW.quotation_no = '' THEN
    NEW.quotation_no := generate_quotation_no();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_quotation_no_trigger ON quotations;
CREATE TRIGGER set_quotation_no_trigger
  BEFORE INSERT ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION set_quotation_no();
