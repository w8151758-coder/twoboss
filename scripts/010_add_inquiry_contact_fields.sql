-- 为 inquiries 表添加联系人字段（支持游客询价）
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_inquiries_contact_email ON inquiries(contact_email);
CREATE INDEX IF NOT EXISTS idx_inquiries_contact_whatsapp ON inquiries(contact_whatsapp);
