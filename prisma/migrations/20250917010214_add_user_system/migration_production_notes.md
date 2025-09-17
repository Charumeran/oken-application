# 本番環境マイグレーション注意事項

## ⚠️ 重要な確認事項

### 1. 既存データの確認
```sql
-- 既存の注文数を確認
SELECT COUNT(*) FROM orders;

-- 注文の所有者情報を確認
SELECT DISTINCT project_name, person_in_charge FROM orders;
```

### 2. マイグレーション実行前のチェックリスト
- [ ] データベースバックアップ完了
- [ ] メンテナンスモード有効化
- [ ] ステージング環境でテスト済み
- [ ] ロールバック手順確認済み

### 3. カスタムマイグレーション（必要に応じて）
既存データが複数会社のものである場合、以下のようなカスタムマイグレーションが必要：

```sql
-- 各会社のユーザーを作成
INSERT INTO users (id, username, password, company_name, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'oken', '[HASHED_PASSWORD]', '櫻建', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'yano', '[HASHED_PASSWORD]', '矢野工業', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  -- 他の会社も同様に追加

-- 注文を適切なユーザーに紐付け
UPDATE orders 
SET user_id = (SELECT id FROM users WHERE company_name = '櫻建')
WHERE project_name LIKE '%櫻建%' OR person_in_charge LIKE '%櫻建%';

UPDATE orders 
SET user_id = (SELECT id FROM users WHERE company_name = '矢野工業')
WHERE project_name LIKE '%矢野%' OR person_in_charge LIKE '%矢野%';

-- デフォルトユーザーに紐付け（マッチしない場合）
UPDATE orders 
SET user_id = (SELECT id FROM users WHERE username = 'oken')
WHERE user_id IS NULL;
```

### 4. ロールバック手順
```sql
-- ロールバックが必要な場合
ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
ALTER TABLE orders DROP COLUMN user_id;
DROP TABLE users;
```