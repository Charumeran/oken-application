# Prisma データベース管理ガイド

## 📋 概要
このガイドでは、ローカル環境と本番環境でのPrismaコマンドの使い方を説明します。

## 🔧 ローカル環境でのコマンド

### 1. データベースのマイグレーション作成
```bash
# 新しいマイグレーションを作成（スキーマ変更時）
npx prisma migrate dev --name マイグレーション名

# 例：ユーザーテーブル追加
npx prisma migrate dev --name add_user_table
```

### 2. データベースのリセット
```bash
# データベースを完全にリセットして再作成
npx prisma migrate reset
```

### 3. Prisma Clientの生成
```bash
# Prisma Clientを再生成（スキーマ変更後）
npx prisma generate
```

### 4. データベースの確認
```bash
# Prisma Studioでデータベースを視覚的に確認
npx prisma studio
```

### 5. シードデータの投入
```bash
# seed.tsを実行してテストデータを投入
npx prisma db seed
```

## 🚀 本番環境でのコマンド

### 1. マイグレーションの適用
```bash
# 本番環境にマイグレーションを適用
npx prisma migrate deploy
```

### 2. Prisma Clientの生成
```bash
# ビルド前にPrisma Clientを生成
npx prisma generate
```

### 3. データベースの状態確認
```bash
# 適用済みマイグレーションの確認
npx prisma migrate status
```

## 📝 ユーザーデータのシード方法

### 1. シードファイルの作成
`prisma/seeds/users.ts`ファイルを作成：

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 ユーザーデータを投入中...')
  
  const users = [
    { username: 'oken', password: 'Oken1234', companyName: '櫻建' },
    { username: 'yano', password: 'Yano1234', companyName: '矢野工業' },
    { username: 'tensho', password: 'Tensho1234', companyName: '天昇興業' },
    { username: 'naruki', password: 'Naruki1234', companyName: '成起' },
    { username: 'kamino', password: 'Kamino1234', companyName: '神ノ興業' },
    { username: 'hokuto', password: 'Hokuto1234', companyName: '北都' },
    { username: 'shindo', password: 'Shindo1234', companyName: '新導技建' },
    { username: 'token', password: 'Token1234', companyName: '桃建' },
    { username: 'other', password: 'Other1234', companyName: 'その他1' },
    { username: 'others', password: 'Others1234', companyName: 'その他2' },
  ]
  
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        password: hashedPassword,
        companyName: user.companyName,
        isActive: true
      }
    })
    
    console.log(`  ✅ ${user.companyName} (${user.username}) を作成しました`)
  }
  
  console.log('✅ ユーザーデータの投入完了')
}
```

### 2. seed.tsに追加
`prisma/seed.ts`を更新：

```typescript
import { seedUsers } from './seeds/users'

async function main() {
  // ... 既存のコード ...
  
  // ユーザーデータを投入
  await seedUsers(prisma)
  
  // ... 既存のコード ...
}
```

### 3. シード実行
```bash
npx prisma db seed
```

## ⚠️ 注意事項

### ローカル環境
- `migrate dev`は開発時のみ使用
- データベースの破壊的変更が可能
- 自動的にPrisma Clientを再生成

### 本番環境
- `migrate deploy`のみ使用
- マイグレーションファイルは事前にローカルで作成
- デプロイ前に必ず`prisma generate`を実行

## 🔄 一般的なワークフロー

### 開発時
1. `prisma/schema.prisma`を編集
2. `npx prisma migrate dev --name 変更内容`
3. `npx prisma generate`（自動実行される）
4. 必要に応じて`npx prisma db seed`

### デプロイ時
1. ローカルでマイグレーション作成済みを確認
2. `npx prisma generate`
3. `npm run build`
4. デプロイ後、`npx prisma migrate deploy`

## 🔍 トラブルシューティング

### マイグレーションエラー
```bash
# マイグレーション履歴の確認
npx prisma migrate status

# 強制的にマイグレーションを解決済みとマーク
npx prisma migrate resolve --applied マイグレーション名
```

### スキーマ同期エラー
```bash
# データベーススキーマとPrismaスキーマの差分確認
npx prisma db pull

# Prismaスキーマをデータベースに強制適用（開発のみ）
npx prisma db push
```