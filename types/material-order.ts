export type MaterialOrderItem = {
  id: string;
  name: string;
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

