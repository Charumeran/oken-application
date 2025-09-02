/**
 * 重量を適切な桁数でフォーマットする関数
 * @param weight 重量（kg）
 * @returns フォーマットされた重量文字列
 */
export const formatWeight = (weight: number): string => {
  if (weight === 0) {
    return '0kg'
  }
  
  // 浮動小数点演算の精度問題を回避してから表示
  const rounded = Math.round(weight * 10000) / 10000
  
  // 科学記法を避けるため、適切な桁数で固定してから不要な0を除去
  const formatted = rounded.toFixed(4).replace(/\.?0+$/, '')
  return formatted + 'kg'
}

/**
 * 合計重量を最小単位重量に基づいて桁数を決定してフォーマットする関数
 * @param totalWeight 合計重量（kg）
 * @param unitWeights 使用されている単位重量の配列（kg）
 * @returns フォーマットされた合計重量文字列
 */
export const formatTotalWeight = (totalWeight: number): string => {
  if (totalWeight === 0) return '0kg'
  
  // 浮動小数点演算の精度問題を回避してから表示
  const rounded = Math.round(totalWeight * 10000) / 10000
  const formatted = rounded.toFixed(4).replace(/\.?0+$/, '')
  return formatted + 'kg'
}

/**
 * 重量を数値のみでフォーマットする関数（単位なし）
 * @param weight 重量（kg）
 * @returns フォーマットされた重量数値文字列
 */
export const formatWeightNumber = (weight: number): string => {
  if (weight === 0) {
    return '0'
  }
  
  // 浮動小数点演算の精度問題を回避してから表示
  const rounded = Math.round(weight * 10000) / 10000
  const formatted = rounded.toFixed(4).replace(/\.?0+$/, '')
  return formatted
}