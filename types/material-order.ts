export type Material = {
  id: string;
  name: string;
  unit: string;
  weightPerUnit: number;
};

export type MaterialOrderItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  weightPerUnit: number;
  totalWeight: number;
};

export type OrderDocument = {
  ordererName: string;
  siteName?: string;
  orderDate: string; // ISO8601形式
  note?: string;
  items: MaterialOrderItem[];
  totalWeight: number;
};

export const materialsByCategory: Record<string, Material[]> = {
  "楔足場": [
    { id: "1", name: "支柱 1.8m", unit: "本", weightPerUnit: 8.5 },
    { id: "2", name: "支柱 3.0m", unit: "本", weightPerUnit: 14.0 },
    { id: "3", name: "支柱 3.6m", unit: "本", weightPerUnit: 16.8 },
    { id: "4", name: "手摺 1.2m", unit: "本", weightPerUnit: 5.0 },
    { id: "5", name: "手摺 1.8m", unit: "本", weightPerUnit: 7.5 },
    { id: "6", name: "踏板 1.8m", unit: "枚", weightPerUnit: 10.0 },
    { id: "7", name: "ブラケット", unit: "個", weightPerUnit: 2.5 },
    { id: "8", name: "先行手摺", unit: "本", weightPerUnit: 6.0 },
  ],
  "枠組み足場": [
    { id: "9", name: "ジャッキベース", unit: "個", weightPerUnit: 3.2 },
    { id: "10", name: "建枠 900×1700", unit: "枚", weightPerUnit: 19.0 },
    { id: "11", name: "建枠 600×1700", unit: "枚", weightPerUnit: 15.0 },
    { id: "12", name: "筋交い", unit: "本", weightPerUnit: 4.5 },
    { id: "13", name: "鋼製布板", unit: "枚", weightPerUnit: 11.0 },
    { id: "14", name: "アームロック", unit: "個", weightPerUnit: 0.6 },
  ],
  "単管足場": [
    { id: "15", name: "単管パイプ 2.0m", unit: "本", weightPerUnit: 5.4 },
    { id: "16", name: "単管パイプ 3.0m", unit: "本", weightPerUnit: 8.1 },
    { id: "17", name: "単管パイプ 4.0m", unit: "本", weightPerUnit: 10.8 },
    { id: "18", name: "直交クランプ", unit: "個", weightPerUnit: 0.7 },
    { id: "19", name: "自在クランプ", unit: "個", weightPerUnit: 0.9 },
    { id: "20", name: "足場板 4.0m", unit: "枚", weightPerUnit: 15.0 },
  ],
};