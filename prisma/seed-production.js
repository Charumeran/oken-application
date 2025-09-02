const { PrismaClient } = require('@prisma/client');

// TypeScriptファイルをrequireできるようにする
require('ts-node/register');

// seed関数をインポート
const { seedCategories } = require('./seeds/categories');
const { seedWakuMaterials } = require('./seeds/materials-waku');
const { seedSheetMaterials } = require('./seeds/materials-sheet');
const { seedOtherMaterials } = require('./seeds/materials-other');
const { seedKusabiMaterials } = require('./seeds/materials-kusabi');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 本番環境にデータを投入中...\n');
  
  // 既存データはクリアしない（本番環境では安全性を重視）
  console.log('⚠️  注意: 既存データはクリアしません（本番環境用）');
  
  try {
    // 1. カテゴリを作成/更新
    await seedCategories(prisma);
    
    // 2. 枠の資材を投入/更新
    await seedWakuMaterials(prisma);
    
    // 3. シートの資材を投入/更新
    await seedSheetMaterials(prisma);
    
    // 4. その他の資材を投入/更新
    await seedOtherMaterials(prisma);
    
    // 5. くさびの資材を投入/更新
    await seedKusabiMaterials(prisma);
    
    // 最終確認
    const categoryCount = await prisma.category.count();
    const materialCount = await prisma.material.count();
    
    console.log('\n📊 現在のデータベースの状態:');
    console.log(`  - カテゴリ: ${categoryCount}件`);
    console.log(`  - 資材: ${materialCount}件`);
    console.log('\n✨ 本番環境へのデータ投入が完了しました！');
  } catch (error) {
    console.error('❌ seedエラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });