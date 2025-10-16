import { PrismaClient } from '@prisma/client'

export async function seedKusabiMaterials(prisma: PrismaClient) {
  console.log('🏗️ くさび足場カテゴリの資材を投入中...')
  
  // くさびカテゴリを取得
  const kusabiCategory = await prisma.category.findUnique({
    where: { name: 'くさび' }
  })

  if (!kusabiCategory) {
    throw new Error('くさびカテゴリが見つかりません')
  }

  const kusabiMaterials = [
    // ===== 支柱 =====
    { materialCode: 'KS-001', name: '支柱　3600', size: '3600', type: '支柱', weightKg: 13.3 },
    { materialCode: 'KS-002', name: '支柱　2700', size: '2700', type: '支柱', weightKg: 10.0 },
    { materialCode: 'KS-003', name: '支柱　1800', size: '1800', type: '支柱', weightKg: 7.0 },
    { materialCode: 'KS-004', name: '支柱　900', size: '900', type: '支柱', weightKg: 3.8 },
    { materialCode: 'KS-005', name: '支柱　450', size: '450', type: '支柱', weightKg: 2.1 },
    { materialCode: 'KS-006', name: '支柱　根がらみ', size: null, type: '支柱', weightKg: 3.4 },
    
    // ===== 手摺（くさび） =====
    { materialCode: 'KS-007', name: '手摺（くさび）　1800', size: '1800', type: '手摺くさび', weightKg: 4.3 },
    { materialCode: 'KS-008', name: '手摺（くさび）　1500', size: '1500', type: '手摺くさび', weightKg: 3.8 },
    { materialCode: 'KS-009', name: '手摺（くさび）　1200', size: '1200', type: '手摺くさび', weightKg: 3.3 },
    { materialCode: 'KS-010', name: '手摺（くさび）　900', size: '900', type: '手摺くさび', weightKg: 2.5 },
    { materialCode: 'KS-011', name: '手摺（くさび）　600', size: '600', type: '手摺くさび', weightKg: 1.7 },
    { materialCode: 'KS-012', name: '手摺（くさび）　300', size: '300', type: '手摺くさび', weightKg: 1.1 },
    { materialCode: 'KS-013', name: '手摺（くさび）　150', size: '150', type: '手摺くさび', weightKg: 0.8 },
    
    // ===== 手摺（次世代） =====
    { materialCode: 'KS-014', name: '手摺（次世代）　1800', size: '1800', type: '手摺次世代', weightKg: 4.9 },
    { materialCode: 'KS-015', name: '手摺（次世代）　1500', size: '1500', type: '手摺次世代', weightKg: 4.3 },
    { materialCode: 'KS-016', name: '手摺（次世代）　1200', size: '1200', type: '手摺次世代', weightKg: 3.6 },
    { materialCode: 'KS-017', name: '手摺（次世代）　900', size: '900', type: '手摺次世代', weightKg: 2.9 },
    { materialCode: 'KS-018', name: '手摺（次世代）　600', size: '600', type: '手摺次世代', weightKg: 2.2 },
    
    // ===== ブラケット（くさび） =====
    { materialCode: 'KS-019', name: 'ブラケット（くさび）　600(大）', size: '600(大)', type: 'ブラケットくさび', weightKg: 2.7 },
    { materialCode: 'KS-020', name: 'ブラケット（くさび）　500', size: '500', type: 'ブラケットくさび', weightKg: 2.4 },
    { materialCode: 'KS-021', name: 'ブラケット（くさび）　350', size: '350', type: 'ブラケットくさび', weightKg: 1.7 },
    { materialCode: 'KS-022', name: 'ブラケット（くさび）　250（小）', size: '250(小)', type: 'ブラケットくさび', weightKg: 1.5 },

    // ===== はねだしブラケット =====
    { materialCode: 'KS-023', name: 'はねだしブラケット　900', size: '900', type: 'はねだしブラケット', weightKg: 5.2 },
    { materialCode: 'KS-024', name: 'はねだしブラケット　600(大）', size: '600(大)', type: 'はねだしブラケット', weightKg: 3.8 },
    { materialCode: 'KS-025', name: 'はねだしブラケット　500', size: '500', type: 'はねだしブラケット', weightKg: 3.5 },
    { materialCode: 'KS-026', name: 'はねだしブラケット　250（小）', size: '250(小)', type: 'はねだしブラケット', weightKg: 2.2 },
    
    // ===== ブラケット（次世代） =====
    { materialCode: 'KS-027', name: 'ブラケット（次世代）　900', size: '900', type: 'ブラケット次世代', weightKg: 3.8 },
    { materialCode: 'KS-028', name: 'ブラケット（次世代）　500', size: '500', type: 'ブラケット次世代', weightKg: 2.6 },
    { materialCode: 'KS-029', name: 'ブラケット（次世代）　250', size: '250', type: 'ブラケット次世代', weightKg: 1.8 },

    
    // ===== ジャッキベース =====
    { materialCode: 'KS-030', name: 'ジャッキベース', size: null, type: 'ジャッキベース', weightKg: 2.8 },
    { materialCode: 'KS-031', name: 'ジャッキベース　自在', size: '自在', type: 'ジャッキベース', weightKg: 3.0 },
    
    // ===== アンダーベース =====
    { materialCode: 'KS-032', name: 'アンダーベース　プラスチック', size: null, type: 'アンダーベース', weightKg: 0.3 },
    { materialCode: 'KS-033', name: 'アンダーベース　スチール', size: null, type: 'アンダーベース', weightKg: 0.7 },
    { materialCode: 'KS-034', name: 'アンダーベース　屋根用', size: null, type: 'アンダーベース', weightKg: 3.0 },
    
    // ===== 階段 =====
    { materialCode: 'KS-035', name: '階段　アルミ', size: null, type: '階段', weightKg: 12.0 },
    { materialCode: 'KS-036', name: '階段　鋼製', size: null, type: '階段', weightKg: 18.0 },
    { materialCode: 'KS-037', name: '階段　ハーフ', size: 'ハーフ', type: '階段', weightKg: 10.2 },
    { materialCode: 'KS-038', name: '階段開口部手摺', size: null, type: '階段', weightKg: 17.3 },
    
    // ===== 布板400（メッシュ） =====
    { materialCode: 'KS-039', name: '布板400（メッシュ）　1800（大）', size: '1800(大)', type: '布板400メッシュ', weightKg: 14.0 },
    { materialCode: 'KS-040', name: '布板400（メッシュ）　1500（大）', size: '1500(大)', type: '布板400メッシュ', weightKg: 12.0 },
    { materialCode: 'KS-041', name: '布板400（メッシュ）　1200（大）', size: '1200(大)', type: '布板400メッシュ', weightKg: 10.1 },
    { materialCode: 'KS-042', name: '布板400（メッシュ）　900（大）', size: '900(大)', type: '布板400メッシュ', weightKg: 7.8 },
    { materialCode: 'KS-043', name: '布板400（メッシュ）　600（大）', size: '600(大)', type: '布板400メッシュ', weightKg: 5.8 },
    
    // ===== 布板250（メッシュ） =====
    { materialCode: 'KS-044', name: '布板250（メッシュ）　1800（小）', size: '1800(小)', type: '布板250メッシュ', weightKg: 10.1 },
    { materialCode: 'KS-045', name: '布板250（メッシュ）　1500（小）', size: '1500(小)', type: '布板250メッシュ', weightKg: 8.7 },
    { materialCode: 'KS-046', name: '布板250（メッシュ）　1200（小）', size: '1200(小)', type: '布板250メッシュ', weightKg: 7.2 },
    { materialCode: 'KS-047', name: '布板250（メッシュ）　900（小）', size: '900(小)', type: '布板250メッシュ', weightKg: 5.6 },
    { materialCode: 'KS-048', name: '布板250（メッシュ）　600（小）', size: '600(小)', type: '布板250メッシュ', weightKg: 4.3 },
    
    // ===== 布板250（パンチング） =====
    { materialCode: 'KS-049', name: '布板250（パンチング）　1800（大）', size: '1800(大)', type: '布板250パンチング', weightKg: 13.7 },
    { materialCode: 'KS-050', name: '布板250（パンチング）　1500（大）', size: '1500(大)', type: '布板250パンチング', weightKg: 11.5 },
    { materialCode: 'KS-051', name: '布板250（パンチング）　1200（大）', size: '1200(大)', type: '布板250パンチング', weightKg: 8.9 },
    { materialCode: 'KS-052', name: '布板250（パンチング）　900（大）', size: '900(大)', type: '布板250パンチング', weightKg: 7.3 },
    { materialCode: 'KS-053', name: '布板250（パンチング）　600（大）', size: '600(大)', type: '布板250パンチング', weightKg: 5.6 },
    { materialCode: 'KS-054', name: '布板250（パンチング）　1800（小）', size: '1800(小)', type: '布板250パンチング', weightKg: 8.1 },
    { materialCode: 'KS-055', name: '布板250（パンチング）　1500（小）', size: '1500(小)', type: '布板250パンチング', weightKg: 7.0 },
    { materialCode: 'KS-056', name: '布板250（パンチング）　1200（小）', size: '1200(小)', type: '布板250パンチング', weightKg: 5.8 },
    { materialCode: 'KS-057', name: '布板250（パンチング）　900（小）', size: '900(小)', type: '布板250パンチング', weightKg: 4.8 },
    { materialCode: 'KS-058', name: '布板250（パンチング）　600（小）', size: '600(小)', type: '布板250パンチング', weightKg: 3.7 },
    
    // ===== 筋交い =====
    { materialCode: 'KS-059', name: '筋交い　1800', size: '1800', type: '筋交い', weightKg: 3.9 },
    { materialCode: 'KS-060', name: '筋交い　1500', size: '1500', type: '筋交い', weightKg: 3.6 },
    { materialCode: 'KS-061', name: '筋交い　1200', size: '1200', type: '筋交い', weightKg: 2.5 },
    { materialCode: 'KS-062', name: '筋交い　900', size: '900', type: '筋交い', weightKg: 2.2 },
    
    // ===== 先行手摺（くさび） =====
    { materialCode: 'KS-063', name: '先行手摺（くさび）　1800', size: '1800', type: '先行手摺くさび', weightKg: 8.0 },
    { materialCode: 'KS-064', name: '先行手摺（くさび）　1500', size: '1500', type: '先行手摺くさび', weightKg: 7.3 },
    { materialCode: 'KS-065', name: '先行手摺（くさび）　1200', size: '1200', type: '先行手摺くさび', weightKg: 6.3 },
    { materialCode: 'KS-066', name: '先行手摺（くさび）　900', size: '900', type: '先行手摺くさび', weightKg: 5.5 },
    { materialCode: 'KS-067', name: '先行手摺（くさび）　600', size: '600', type: '先行手摺くさび', weightKg: 4.8 },
    
    // ===== 先行手摺（次世代） =====
    { materialCode: 'KS-068', name: '先行手摺（次世代）　1800', size: '1800', type: '先行手摺次世代', weightKg: 8.0 },
    { materialCode: 'KS-069', name: '先行手摺（次世代）　1500', size: '1500', type: '先行手摺次世代', weightKg: 7.3 },
    { materialCode: 'KS-070', name: '先行手摺（次世代）　1200', size: '1200', type: '先行手摺次世代', weightKg: 6.3 },
    { materialCode: 'KS-071', name: '先行手摺（次世代）　900', size: '900', type: '先行手摺次世代', weightKg: 5.5 },
    { materialCode: 'KS-072', name: '先行手摺（次世代）　600', size: '600', type: '先行手摺次世代', weightKg: 4.8 },

    // ===== 段差手摺（次世代） =====
    { materialCode: 'KS-073', name: '段差手摺（次世代）　1200', size: '1200', type: '段差手摺次世代', weightKg: 3.3 },
    { materialCode: 'KS-074', name: '段差手摺（次世代）　900', size: '900', type: '段差手摺次世代', weightKg: 2.5 },
    
    // ===== 梁枠 =====
    { materialCode: 'KS-075', name: '梁枠　３スパン', size: '3スパン', type: '梁枠', weightKg: 41.4 },
    { materialCode: 'KS-076', name: '梁枠　２スパン', size: '2スパン', type: '梁枠', weightKg: 27.8 },

    // ===== 梁枠（次世代） =====
    { materialCode: 'KS-077', name: '梁枠（次世代）　３スパン', size: '3スパン', type: '梁枠次世代', weightKg: 42.6 },
    { materialCode: 'KS-078', name: '梁枠（次世代）　２スパン', size: '2スパン', type: '梁枠次世代', weightKg: 29.3 },

    // ===== 仮置きラック =====
    { materialCode: 'KS-079', name: '仮置きラック', size: null, type: '仮置きラック', weightKg: 4.2 },
    
    // ===== 壁あてジャッキ =====
    { materialCode: 'KS-080', name: '壁あてジャッキ', size: null, type: '壁あてジャッキ', weightKg: 2.3 },
  ]

  // データベースに投入
  let successCount = 0
  for (const material of kusabiMaterials) {
    try {
      await prisma.material.upsert({
        where: { materialCode: material.materialCode },
        update: {
          name: material.name,
          categoryId: kusabiCategory.id,
          size: material.size,
          type: material.type,
          weightKg: material.weightKg
        },
        create: {
          ...material,
          categoryId: kusabiCategory.id
        }
      })
      successCount++
    } catch (error) {
      console.log(`  ⚠️ スキップ: ${material.materialCode}`)
    }
  }
  
  console.log(`🏗️ くさび足場カテゴリ: ${successCount}件の資材投入完了\n`)
}