-- 直播排期表
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  shop_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  live_date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  estimated_gmv DECIMAL(10,2) NOT NULL,
  is_big_shop BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_schedules_live_date ON schedules(live_date);
CREATE INDEX IF NOT EXISTS idx_schedules_shop_name ON schedules(shop_name);
CREATE INDEX IF NOT EXISTS idx_schedules_created_at ON schedules(created_at DESC);

-- RLS 策略
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- 允许匿名插入（商家提交）
CREATE POLICY "Allow anonymous insert" ON schedules
  FOR INSERT
  WITH CHECK (true);

-- 允许 service role 读取所有数据
CREATE POLICY "Allow service role read" ON schedules
  FOR SELECT
  USING (true);

-- 允许 service role 删除
CREATE POLICY "Allow service role delete" ON schedules
  FOR DELETE
  USING (true);
