import { PrismaClient } from '@prisma/client'

export async function seedSheetMaterials(prisma: PrismaClient) {
  console.log('🎭 シートカテゴリの資材を投入中...')
  
  // シートカテゴリを取得
  const sheetCategory = await prisma.category.findUnique({
    where: { name: 'シート' }
  })

  if (!sheetCategory) {
    throw new Error('シートカテゴリが見つかりません')
  }

  const sheetMaterials = [
    // ===== メッシュシート　　Ⅰ類（メーターサイズ） =====
    { materialCode: 'SH-001', name: 'メッシュシート　　Ⅰ類　1.8×5.1　メーターサイズ', size: '1.8×5.1', type: 'Ⅰ類メーター', weightKg: 5.0 },
    { materialCode: 'SH-002', name: 'メッシュシート　　Ⅰ類　1.5×5.1　メーターサイズ', size: '1.5×5.1', type: 'Ⅰ類メーター', weightKg: 4.1 },
    { materialCode: 'SH-003', name: 'メッシュシート　　Ⅰ類　1.2×5.1　メーターサイズ', size: '1.2×5.1', type: 'Ⅰ類メーター', weightKg: 3.4 },
    { materialCode: 'SH-004', name: 'メッシュシート　　Ⅰ類　0.9×5.1　メーターサイズ', size: '0.9×5.1', type: 'Ⅰ類メーター', weightKg: 2.7 },
    { materialCode: 'SH-005', name: 'メッシュシート　　Ⅰ類　0.6×5.1　メーターサイズ', size: '0.6×5.1', type: 'Ⅰ類メーター', weightKg: 2.0 },
    
    // ===== メッシュシート　　Ⅰ類（インチーサイズ） =====
    { materialCode: 'SH-006', name: 'メッシュシート　　Ⅰ類　1.829×5.1　インチーサイズ', size: '1.829×5.1', type: 'Ⅰ類インチー', weightKg: 5.5 },
    { materialCode: 'SH-007', name: 'メッシュシート　　Ⅰ類　1.524×5.1　インチーサイズ', size: '1.524×5.1', type: 'Ⅰ類インチー', weightKg: 4.6 },
    { materialCode: 'SH-008', name: 'メッシュシート　　Ⅰ類　1.219×5.1　インチーサイズ', size: '1.219×5.1', type: 'Ⅰ類インチー', weightKg: 3.7 },
    { materialCode: 'SH-009', name: 'メッシュシート　　Ⅰ類　0.914×5.1　インチーサイズ', size: '0.914×5.1', type: 'Ⅰ類インチー', weightKg: 3.0 },
    { materialCode: 'SH-010', name: 'メッシュシート　　Ⅰ類　0.610×5.1　インチーサイズ', size: '0.610×5.1', type: 'Ⅰ類インチー', weightKg: 2.3 },
    
    // ===== メッシュシート　　Ⅱ類（5.1mサイズ） =====
    { materialCode: 'SH-011', name: 'メッシュシート　　Ⅱ類　1.8×5.1　メーターサイズ', size: '1.8×5.1', type: 'Ⅱ類5.1m', weightKg: 1.5 },
    { materialCode: 'SH-012', name: 'メッシュシート　　Ⅱ類　1.5×5.1　メーターサイズ', size: '1.5×5.1', type: 'Ⅱ類5.1m', weightKg: 1.3 },
    { materialCode: 'SH-013', name: 'メッシュシート　　Ⅱ類　1.2×5.1　メーターサイズ', size: '1.2×5.1', type: 'Ⅱ類5.1m', weightKg: 1.1 },
    { materialCode: 'SH-014', name: 'メッシュシート　　Ⅱ類　0.9×5.1　メーターサイズ', size: '0.9×5.1', type: 'Ⅱ類5.1m', weightKg: 0.9 },
    { materialCode: 'SH-015', name: 'メッシュシート　　Ⅱ類　0.6×5.1　メーターサイズ', size: '0.6×5.1', type: 'Ⅱ類5.1m', weightKg: 0.7 },
    
    // ===== メッシュシート　　Ⅱ類（7.2mサイズ） =====
    { materialCode: 'SH-016', name: 'メッシュシート　　Ⅱ類　1.8×7.2　メーターサイズ', size: '1.8×7.2', type: 'Ⅱ類7.2m', weightKg: 1.83 },
    { materialCode: 'SH-017', name: 'メッシュシート　　Ⅱ類　1.5×7.2　メーターサイズ', size: '1.5×7.2', type: 'Ⅱ類7.2m', weightKg: 1.53 },
    { materialCode: 'SH-018', name: 'メッシュシート　　Ⅱ類　1.2×7.2　メーターサイズ', size: '1.2×7.2', type: 'Ⅱ類7.2m', weightKg: 1.44 },
    { materialCode: 'SH-019', name: 'メッシュシート　　Ⅱ類　0.9×7.2　メーターサイズ', size: '0.9×7.2', type: 'Ⅱ類7.2m', weightKg: 1.19 },
    { materialCode: 'SH-020', name: 'メッシュシート　　Ⅱ類　0.6×7.2　メーターサイズ', size: '0.6×7.2', type: 'Ⅱ類7.2m', weightKg: 0.95 },
    
    // ===== 番号21は欠番 =====
    
    // ===== 防音シート =====
    { materialCode: 'SH-022', name: '防音シート　1.5×3.4', size: '1.5×3.4', type: '防音', weightKg: 8.33 },
    { materialCode: 'SH-023', name: '防音シート　0.9×3.4', size: '0.9×3.4', type: '防音', weightKg: 5.0 },
    { materialCode: 'SH-024', name: '防音シート　1.8×3.4', size: '1.8×3.4', type: '防音', weightKg: 10.0 },
    { materialCode: 'SH-025', name: '防音シート　1.2×3.4', size: '1.2×3.4', type: '防音', weightKg: 6.66 },
    { materialCode: 'SH-026', name: '防音シート　0.6×3.4', size: '0.6×3.4', type: '防音', weightKg: 3.33 },
    
    // ===== 白シート =====
    { materialCode: 'SH-027', name: '白シート　1.8×5.1', size: '1.8×5.1', type: '白', weightKg: 4.0 },
    { materialCode: 'SH-028', name: '白シート　1.5×5.1', size: '1.5×5.1', type: '白', weightKg: 3.3 },
    { materialCode: 'SH-029', name: '白シート　1.2×5.1', size: '1.2×5.1', type: '白', weightKg: 2.7 },
    { materialCode: 'SH-030', name: '白シート　0.9×5.1', size: '0.9×5.1', type: '白', weightKg: 2.0 },
    { materialCode: 'SH-031', name: '白シート　0.6×5.1', size: '0.6×5.1', type: '白', weightKg: 1.3 },
    
    // ===== メッシュシート　　Ⅰ類　内張り用（メーターサイズ） =====
    { materialCode: 'SH-032', name: 'メッシュシート　　Ⅰ類　内張り用　1.8×5.1　メーターサイズ', size: '1.8×5.1', type: 'Ⅰ類内張りメーター', weightKg: 4.37 },
    { materialCode: 'SH-033', name: 'メッシュシート　　Ⅰ類　内張り用　1.5×5.1　メーターサイズ', size: '1.5×5.1', type: 'Ⅰ類内張りメーター', weightKg: 3.65 },
    { materialCode: 'SH-034', name: 'メッシュシート　　Ⅰ類　内張り用　1.2×5.1　メーターサイズ', size: '1.2×5.1', type: 'Ⅰ類内張りメーター', weightKg: 2.92 },
    { materialCode: 'SH-035', name: 'メッシュシート　　Ⅰ類　内張り用　0.9×5.1　メーターサイズ', size: '0.9×5.1', type: 'Ⅰ類内張りメーター', weightKg: 2.4 },
    { materialCode: 'SH-036', name: 'メッシュシート　　Ⅰ類　内張り用　0.6×5.1　メーターサイズ', size: '0.6×5.1', type: 'Ⅰ類内張りメーター', weightKg: 1.8 },
    
    // ===== メッシュシート　　Ⅰ類　内張り用（インチーサイズ） =====
    { materialCode: 'SH-037', name: 'メッシュシート　　Ⅰ類　内張り用　1.829×5.1　インチーサイズ', size: '1.829×5.1', type: 'Ⅰ類内張りインチー', weightKg: 4.1 },
    { materialCode: 'SH-038', name: 'メッシュシート　　Ⅰ類　内張り用　1.524×5.1　インチーサイズ', size: '1.524×5.1', type: 'Ⅰ類内張りインチー', weightKg: 3.6 },
    { materialCode: 'SH-039', name: 'メッシュシート　　Ⅰ類　内張り用　1.219×5.1　インチーサイズ', size: '1.219×5.1', type: 'Ⅰ類内張りインチー', weightKg: 2.9 },
    { materialCode: 'SH-040', name: 'メッシュシート　　Ⅰ類　内張り用　0.914×5.1　インチーサイズ', size: '0.914×5.1', type: 'Ⅰ類内張りインチー', weightKg: 2.3 },
    { materialCode: 'SH-041', name: 'メッシュシート　　Ⅰ類　内張り用　0.610×5.1　インチーサイズ', size: '0.610×5.1', type: 'Ⅰ類内張りインチー', weightKg: 1.7 },
    
    // ===== 垂直ネット =====
    { materialCode: 'SH-042', name: '垂直ネット　15ｍｍマス　グリーン　6ｍ×8ｍ', size: '6ｍ×8ｍ', type: '垂直ネット', weightKg: 9.6 },
    { materialCode: 'SH-043', name: '垂直ネット　15ｍｍマス　グレー　6ｍ×8ｍ', size: '6ｍ×8ｍ', type: '垂直ネット', weightKg: 9.6 },
    
    // ===== シート付属品 =====
    { materialCode: 'SH-044', name: 'シートクランプ', size: null, type: '付属品', weightKg: 0.4 },
    { materialCode: 'SH-045', name: 'シート紐', size: null, type: '付属品', weightKg: 0.0017 },
  ]

  // データベースに投入
  let successCount = 0
  for (const material of sheetMaterials) {
    try {
      await prisma.material.upsert({
        where: { materialCode: material.materialCode },
        update: {
          name: material.name,
          categoryId: sheetCategory.id,
          size: material.size,
          type: material.type,
          weightKg: material.weightKg
        },
        create: {
          ...material,
          categoryId: sheetCategory.id
        }
      })
      successCount++
    } catch (error) {
      console.log(`  ⚠️ スキップ: ${material.materialCode}`)
    }
  }
  
  console.log(`🎭 シートカテゴリ: ${successCount}件の資材投入完了\n`)
}