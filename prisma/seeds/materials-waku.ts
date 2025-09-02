import { PrismaClient } from '@prisma/client'

export async function seedWakuMaterials(prisma: PrismaClient) {
  console.log('🔨 枠カテゴリの資材を投入中...')
  
  // 枠カテゴリを取得
  const wakuCategory = await prisma.category.findUnique({
    where: { name: '枠' }
  })

  if (!wakuCategory) {
    throw new Error('枠カテゴリが見つかりません')
  }

  const wakuMaterials = [
    // ===== 枠本体 =====
    { materialCode: 'WK-001', name: '枠　1200', size: '1200', type: '標準', weightKg: 15.6 },
    { materialCode: 'WK-002', name: '枠　1200　ロングピン', size: '1200', type: 'ロングピン', weightKg: 16.0 },
    { materialCode: 'WK-003', name: '枠　900', size: '900', type: '標準', weightKg: 14.6 },
    { materialCode: 'WK-004', name: '枠　900　ロングピン', size: '900', type: 'ロングピン', weightKg: 15.0 },
    { materialCode: 'WK-005', name: '枠　600', size: '600', type: '標準', weightKg: 12.6 },
    { materialCode: 'WK-006', name: '枠　600　ロングピン', size: '600', type: 'ロングピン', weightKg: 13.0 },
    
    // ===== 階段 =====
    { materialCode: 'WK-007', name: '階段', size: null, type: '標準', weightKg: 20.0 },
    { materialCode: 'WK-008', name: '階段　ロングピン', size: null, type: 'ロングピン', weightKg: 20.9 },
    { materialCode: 'WK-009', name: '階段開口部', size: null, type: '開口部', weightKg: 13.5 },
    { materialCode: 'WK-010', name: '階段手摺', size: null, type: '手摺', weightKg: 4.0 },
    
    // ===== ジャッキベース =====
    { materialCode: 'WK-011', name: 'ジャッキベース', size: null, type: '標準', weightKg: 3.7 },
    { materialCode: 'WK-012', name: 'ロングジャッキベース', size: null, type: 'ロング', weightKg: 5.0 },
    
    // ===== 筋違 L×H 1700 =====
    { materialCode: 'WK-013', name: '筋違　L1829H1700　　A-14', size: '1829x1700', type: '筋違', weightKg: 4.2 },
    { materialCode: 'WK-014', name: '筋違　L1524H1700　　A-11', size: '1524x1700', type: '筋違', weightKg: 3.7 },
    { materialCode: 'WK-015', name: '筋違　L1219H1700　　A-13', size: '1219x1700', type: '筋違', weightKg: 3.3 },
    { materialCode: 'WK-016', name: '筋違　L914H1700　　  A-012', size: '914x1700', type: '筋違', weightKg: 2.9 },
    { materialCode: 'WK-017', name: '筋違　L610H1700      A-12', size: '610x1700', type: '筋違', weightKg: 2.6 },
    
    // ===== 筋違 L×H 1219 =====
    { materialCode: 'WK-018', name: '筋違　L1829H1219　　A-19', size: '1829x1219', type: '筋違', weightKg: 3.9 },
    { materialCode: 'WK-019', name: '筋違　L1524H1219　　A-18', size: '1524x1219', type: '筋違', weightKg: 3.4 },
    { materialCode: 'WK-020', name: '筋違　L1219H1219　　A-012', size: '1219x1219', type: '筋違', weightKg: 2.9 },
    { materialCode: 'WK-021', name: '筋違　L914H1219　　  A-07', size: '914x1219', type: '筋違', weightKg: 2.4 },
    { materialCode: 'WK-022', name: '筋違　L610H1219      A-09', size: '610x1219', type: '筋違', weightKg: 2.1 },
    
    // ===== 筋違 L×H 914 (1回目) =====
    { materialCode: 'WK-023', name: '筋違　L1829H914　　A-08', size: '1829x914', type: '筋違', weightKg: 3.7 },
    { materialCode: 'WK-024', name: '筋違　L1524H914　　A-9', size: '1524x914', type: '筋違', weightKg: 3.1 },
    { materialCode: 'WK-025', name: '筋違　L1219H914　　A-12', size: '1219x914', type: '筋違', weightKg: 2.6 },
    { materialCode: 'WK-026', name: '筋違　L914H914　　  A-09', size: '914x914', type: '筋違', weightKg: 2.1 },
    { materialCode: 'WK-027', name: '筋違　L610H914       A-06', size: '610x914', type: '筋違', weightKg: 1.7 },
    
    // ===== 筋違 L×H 914 (2回目 - 重複) =====
    { materialCode: 'WK-028', name: '筋違　L1829H914　　A-08', size: '1829x914', type: '筋違', weightKg: 3.7 },
    { materialCode: 'WK-029', name: '筋違　L1524H914　　A-9', size: '1524x914', type: '筋違', weightKg: 3.1 },
    { materialCode: 'WK-030', name: '筋違　L1219H914　　A-12', size: '1219x914', type: '筋違', weightKg: 2.6 },
    { materialCode: 'WK-031', name: '筋違　L914H914　　  A-09', size: '914x914', type: '筋違', weightKg: 2.1 },
    { materialCode: 'WK-032', name: '筋違　L610H914       A-06', size: '610x914', type: '筋違', weightKg: 1.7 },
    
    // ===== 筋違 L×H 490 =====
    { materialCode: 'WK-033', name: '筋違　L1829H490　　A-16S', size: '1829x490', type: '筋違', weightKg: 3.5 },
    { materialCode: 'WK-034', name: '筋違　L1524H490　　A-16', size: '1524x490', type: '筋違', weightKg: 3.0 },
    { materialCode: 'WK-035', name: '筋違　L1219H490　　A-05', size: '1219x490', type: '筋違', weightKg: 2.5 },
    { materialCode: 'WK-036', name: '筋違　L914H490　　  A-04', size: '914x490', type: '筋違', weightKg: 1.9 },
    { materialCode: 'WK-037', name: '筋違　L610H490       A-03', size: '610x490', type: '筋違', weightKg: 1.4 },
    
    // ===== 調整枠 H×W 1219 =====
    { materialCode: 'WK-038', name: '調整枠　H1524×W1219', size: '1524x1219', type: '調整枠', weightKg: 15.0 },
    { materialCode: 'WK-039', name: '調整枠　H1219×W1219', size: '1219x1219', type: '調整枠', weightKg: 13.0 },
    { materialCode: 'WK-040', name: '調整枠　H914×W1219', size: '914x1219', type: '調整枠', weightKg: 11.0 },
    { materialCode: 'WK-041', name: '調整枠　H490×W1219', size: '490x1219', type: '調整枠', weightKg: 9.1 },
    
    // ===== 調整枠 H×W 914 =====
    { materialCode: 'WK-042', name: '調整枠　H1524×W914', size: '1524x914', type: '調整枠', weightKg: 13.2 },
    { materialCode: 'WK-043', name: '調整枠　H1219×W914', size: '1219x914', type: '調整枠', weightKg: 11.0 },
    { materialCode: 'WK-044', name: '調整枠　H914×W914', size: '914x914', type: '調整枠', weightKg: 9.2 },
    { materialCode: 'WK-045', name: '調整枠　H490×W914', size: '490x914', type: '調整枠', weightKg: 8.2 },
    
    // ===== 調整枠 H×W 610 =====
    { materialCode: 'WK-046', name: '調整枠　H1524×W610', size: '1524x610', type: '調整枠', weightKg: 10.5 },
    { materialCode: 'WK-047', name: '調整枠　H1219×W610', size: '1219x610', type: '調整枠', weightKg: 10.2 },
    { materialCode: 'WK-048', name: '調整枠　H914×W610', size: '914x610', type: '調整枠', weightKg: 8.2 },
    { materialCode: 'WK-049', name: '調整枠　H490×W610', size: '490x610', type: '調整枠', weightKg: 7.2 },

    // ===== 番号50-53は欠番 =====
    
    // ===== 布板（500mm幅） =====
    { materialCode: 'WK-050', name: '布板（500）　1800', size: '1800', type: '500mm幅', weightKg: 14.3 },
    { materialCode: 'WK-051', name: '布板（500）　1500', size: '1500', type: '500mm幅', weightKg: 11.9 },
    { materialCode: 'WK-052', name: '布板（500）　1200', size: '1200', type: '500mm幅', weightKg: 10.3 },
    { materialCode: 'WK-053', name: '布板（500）　900', size: '900', type: '500mm幅', weightKg: 7.8 },
    { materialCode: 'WK-054', name: '布板（500）　600', size: '600', type: '500mm幅', weightKg: 5.3 },
    
    { materialCode: 'WK-055', name: '布板（500）　1500', size: '1500', type: '500mm幅', weightKg: 11.9 },
    { materialCode: 'WK-056', name: '布板（500）　1200', size: '1200', type: '500mm幅', weightKg: 10.3 },
    { materialCode: 'WK-057', name: '布板（500）　900', size: '900', type: '500mm幅', weightKg: 7.8 },
    { materialCode: 'WK-058', name: '布板（500）　600', size: '600', type: '500mm幅', weightKg: 5.3 },
    
    // ===== 布板（240mm幅） =====
    { materialCode: 'WK-059', name: '布板（240）　1800', size: '1800', type: '240mm幅', weightKg: 10.2 },
    { materialCode: 'WK-060', name: '布板（240）　1500', size: '1500', type: '240mm幅', weightKg: 6.7 },
    { materialCode: 'WK-061', name: '布板（240）　1200', size: '1200', type: '240mm幅', weightKg: 6.0 },
    { materialCode: 'WK-062', name: '布板（240）　900', size: '900', type: '240mm幅', weightKg: 4.6 },
    { materialCode: 'WK-063', name: '布板（240）　600', size: '600', type: '240mm幅', weightKg: 3.8 },
    
    // ===== 連結部材 =====
    { materialCode: 'WK-064', name: 'エンドストッパー', size: null, type: '標準', weightKg: 2.5 },
    { materialCode: 'WK-065', name: '連結ピン', size: null, type: '標準', weightKg: 0.6 },
    { materialCode: 'WK-066', name: '手摺柱', size: null, type: '手摺', weightKg: 2.4 },
    
    // ===== ブラケット =====
    { materialCode: 'WK-067', name: '伸縮ブラケット　350-500', size: '350-500', type: '伸縮', weightKg: 4.0 },
    { materialCode: 'WK-068', name: '伸縮ブラケット　500-750', size: '500-750', type: '伸縮', weightKg: 4.6 },
    { materialCode: 'WK-069', name: '伸縮ブラケット　750-1100', size: '750-1100', type: '伸縮', weightKg: 5.8 },
    { materialCode: 'WK-070', name: 'ホリーブラケット　500', size: '500', type: 'ホリー', weightKg: 2.3 },
    { materialCode: 'WK-071', name: 'ホリーブラケット　600', size: '600', type: 'ホリー', weightKg: 2.6 },
    
    // ===== 下さん =====
    { materialCode: 'WK-072', name: '下さん　1800', size: '1800', type: '下さん', weightKg: 1.8 },
    { materialCode: 'WK-073', name: '下さん　1500', size: '1500', type: '下さん', weightKg: 1.5 },
    { materialCode: 'WK-074', name: '下さん　1200', size: '1200', type: '下さん', weightKg: 1.2 },
    { materialCode: 'WK-075', name: '下さん　900', size: '900', type: '下さん', weightKg: 0.9 },

    // ===== 梁枠・梁渡し =====
    { materialCode: 'WK-076', name: '梁枠２スパーン', size: '2スパン', type: '梁枠', weightKg: 28.3 },
    { materialCode: 'WK-077', name: '梁枠３スパーン', size: '3スパン', type: '梁枠', weightKg: 38.8 },
    { materialCode: 'WK-078', name: '梁渡し914', size: '914', type: '梁渡し', weightKg: 5.4 },
    { materialCode: 'WK-079', name: '梁渡し1219', size: '1219', type: '梁渡し', weightKg: 8.8 },

    // ===== 方杖・隅梁受 =====
    { materialCode: 'WK-080', name: '方杖3スパーン', size: '3スパン', type: '方杖', weightKg: 6.2 },
    { materialCode: 'WK-081', name: '方杖2スパーン', size: '2スパン', type: '方杖', weightKg: 4.8 },
    { materialCode: 'WK-082', name: '隅梁受', size: null, type: '隅梁受', weightKg: 2.8 },
    
    // ===== コーナーステップ・コンビステップ =====
    { materialCode: 'WK-083', name: 'コーナーステップ　500', size: '500', type: 'コーナー', weightKg: 6.6 },
    { materialCode: 'WK-084', name: 'コーナーステップ　240', size: '240', type: 'コーナー', weightKg: 3.4 },
    { materialCode: 'WK-085', name: 'コンビステップ　600', size: '600', type: 'コンビ', weightKg: 5.7 },
    { materialCode: 'WK-086', name: 'コンビステップ　900', size: '900', type: 'コンビ', weightKg: 4.4 },
    
    // ===== 手摺先行（据置き） =====
    { materialCode: 'WK-087', name: '手摺先行（据置き）　1800', size: '1800', type: '据置き', weightKg: 13.0 },
    { materialCode: 'WK-088', name: '手摺先行（据置き）　1500', size: '1500', type: '据置き', weightKg: 12.2 },
    { materialCode: 'WK-089', name: '手摺先行（据置き）　1200', size: '1200', type: '据置き', weightKg: 10.4 },
    { materialCode: 'WK-090', name: '手摺先行（据置き）　900', size: '900', type: '据置き', weightKg: 9.4 },
    { materialCode: 'WK-091', name: '手摺先行（据置き）　600', size: '600', type: '据置き', weightKg: 7.6 },
    
    // ===== 手摺先行（ネチス） =====
    { materialCode: 'WK-092', name: '手摺先行（ネチス）　1800', size: '1800', type: 'ネチス', weightKg: 10.0 },
    { materialCode: 'WK-093', name: '手摺先行（ネチス）　1500', size: '1500', type: 'ネチス', weightKg: 9.0 },
    { materialCode: 'WK-094', name: '手摺先行（ネチス）　1200', size: '1200', type: 'ネチス', weightKg: 8.0 },
    { materialCode: 'WK-095', name: '手摺先行（ネチス）　900', size: '900', type: 'ネチス', weightKg: 6.3 },
    { materialCode: 'WK-096', name: '手摺先行（ネチス）　600', size: '600', type: 'ネチス', weightKg: 5.5 },
    
    // ===== 手摺先行（先送り） =====
    { materialCode: 'WK-097', name: '手摺先行（先送り）　1800', size: '1800', type: '先送り', weightKg: 8.1 },
    { materialCode: 'WK-098', name: '手摺先行（先送り）　1500', size: '1500', type: '先送り', weightKg: 7.4 },
    { materialCode: 'WK-099', name: '手摺先行（先送り）　1200', size: '1200', type: '先送り', weightKg: 6.7 },
    { materialCode: 'WK-100', name: '手摺先行（先送り）　900', size: '900', type: '先送り', weightKg: 6.0 },
  ]

  // データベースに投入
  let successCount = 0
  for (const material of wakuMaterials) {
    try {
      await prisma.material.upsert({
        where: { materialCode: material.materialCode },
        update: {
          name: material.name,
          categoryId: wakuCategory.id,
          size: material.size,
          type: material.type,
          weightKg: material.weightKg
        },
        create: {
          ...material,
          categoryId: wakuCategory.id
        }
      })
      successCount++
    } catch (error) {
      console.log(`  ⚠️ スキップ: ${material.materialCode}`)
    }
  }
  
  console.log(`🔨 枠カテゴリ: ${successCount}件の資材投入完了\n`)
}