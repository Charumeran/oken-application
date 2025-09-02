import { PrismaClient } from '@prisma/client'

export async function seedCategories(prisma: PrismaClient) {
  console.log('📂 カテゴリデータを投入中...')
  
  const categories = [
    { name: '枠', displayOrder: 1 },
    { name: 'くさび', displayOrder: 2 },
    { name: 'パイプ', displayOrder: 3 },
    { name: 'シート', displayOrder: 4 },
    { name: 'その他', displayOrder: 5 },
  ]

  for (const category of categories) {
    await prisma.category.create({
      data: category
    })
    console.log(`  ✓ ${category.name} カテゴリを作成`)
  }
  
  console.log('✅ カテゴリデータの投入完了\n')
}