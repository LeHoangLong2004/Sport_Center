export interface ProductItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  status: boolean;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: number | '';
  stockQuantity: number | '';
  imageUrl: string;
  status: boolean;
}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  totalInventoryValue: number;
}

export const PRESET_CATEGORIES = [
  'Đồ uống',
  'Thực phẩm',
  'Phụ kiện',
  'Thực phẩm bổ sung',
  'Quần áo & Đồ tập',
  'Khác',
];

export const PRESET_IMAGES = [
  { label: 'Nước khoáng', url: '/assets/cf835.png' },
  { label: 'Nước tăng lực', url: '/assets/c5e97.png' },
  { label: 'Bánh năng lượng', url: '/assets/28ab4.png' },
  { label: 'Găng tay tập', url: '/assets/235a3.png' },
];
