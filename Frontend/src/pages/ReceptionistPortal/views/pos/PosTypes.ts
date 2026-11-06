export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  stockQuantity: number;
  qty: number;
}

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  status?: boolean;
}
