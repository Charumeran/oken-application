export type MaterialOrderItem = {
  id: string;
  name: string;
  categoryName: string;
  quantity: number;
  weightPerUnit: number;
  totalWeight: number;
};

export type OrderDocument = {
  ordererName: string;
  siteName?: string;
  contactInfo?: string;
  loadingDate?: string;
  orderDate: string; // ISO8601形式
  // note?: string; // コメントアウト
  items: MaterialOrderItem[];
  totalWeight: number;
};

