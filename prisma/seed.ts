import { PrismaClient } from '@prisma/client'
import { seedCategories } from './seeds/categories'
import { seedWakuMaterials } from './seeds/materials-waku'
import { seedSheetMaterials } from './seeds/materials-sheet'
import { seedOtherMaterials } from './seeds/materials-other'
import { seedKusabiMaterials } from './seeds/materials-kusabi'
// import { seedPipeMaterials } from './seeds/materials-pipe'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースに初期データを投入中...\n')
  
  // 0. 既存データをクリア
  console.log('🧹 既存データをクリア中...')
  await prisma.material.deleteMany()
  await prisma.category.deleteMany()
  console.log('✅ 既存データのクリア完了\n')
  
  // 1. カテゴリを作成
  await seedCategories(prisma)
  
  // 2. 枠の資材を投入
  await seedWakuMaterials(prisma)
  
  // 3. シートの資材を投入
  await seedSheetMaterials(prisma)
  
  // 4. その他の資材を投入
  await seedOtherMaterials(prisma)
  
  // 5. くさびの資材を投入
  await seedKusabiMaterials(prisma)
  
  // 3. 将来的に他のカテゴリも追加
  // await seedKusabiMaterials(prisma)
  // await seedPipeMaterials(prisma)
  
  // 最終確認
  const categoryCount = await prisma.category.count()
  const materialCount = await prisma.material.count()
  
  console.log('\n📊 最終的なデータベースの状態:')
  console.log(`  - カテゴリ: ${categoryCount}件`)
  console.log(`  - 資材: ${materialCount}件`)
  console.log('\n✨ すべての初期データ投入が完了しました！')
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })