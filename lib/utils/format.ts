/**
 * 重量を適切な桁数でフォーマットする関数
 * @param weight 重量（kg）
 * @returns フォーマットされた重量文字列
 */
export const formatWeight = (weight: number): string => {
  if (weight === 0) {
    // 0の場合は特別扱い
    return '0kg'
  } else if (weight < 0.01) {
    // 0.01kg未満は小数点以下4桁まで表示
    return weight.toFixed(4) + 'kg'
  } else if (weight < 0.1) {
    // 0.1kg未満は小数点以下3桁まで表示
    return weight.toFixed(3) + 'kg'
  } else if (weight < 1) {
    // 1kg未満は小数点以下2桁まで表示
    return weight.toFixed(2) + 'kg'
  } else if (weight < 10) {
    // 10kg未満は小数点以下1桁まで表示
    return weight.toFixed(1) + 'kg'
  } else {
    // 10kg以上は整数表示（必要に応じて小数点以下1桁）
    return weight % 1 === 0 ? weight.toFixed(0) + 'kg' : weight.toFixed(1) + 'kg'
  }
}

/**
 * 重量を数値のみでフォーマットする関数（単位なし）
 * @param weight 重量（kg）
 * @returns フォーマットされた重量数値文字列
 */
export const formatWeightNumber = (weight: number): string => {
  if (weight === 0) {
    // 0の場合は特別扱い
    return '0'
  } else if (weight < 0.01) {
    return weight.toFixed(4)
  } else if (weight < 0.1) {
    return weight.toFixed(3)
  } else if (weight < 1) {
    return weight.toFixed(2)
  } else if (weight < 10) {
    return weight.toFixed(1)
  } else {
    return weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)
  }
}