import { ProductItem, ProductFormData } from './types';

const getAuthToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('auth_token') ||
  '';

const getHeaders = (hasBody: boolean = false) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// 1. Tải danh sách sản phẩm
export async function fetchProductsApi(includeInactive: boolean = true): Promise<ProductItem[]> {
  const res = await fetch(`/api/products?includeInactive=${includeInactive}`);
  if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm.');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// 2. Thêm mới sản phẩm
export async function createProductApi(formData: ProductFormData): Promise<ProductItem> {
  const payload = {
    name: formData.name.trim(),
    category: formData.category.trim() || 'Khác',
    price: Number(formData.price),
    stockQuantity: Number(formData.stockQuantity),
    imageUrl: formData.imageUrl.trim() || null,
    status: Boolean(formData.status),
  };

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Thêm sản phẩm thất bại.');
  }

  return await res.json();
}

// 3. Cập nhật sản phẩm
export async function updateProductApi(id: string, formData: ProductFormData): Promise<ProductItem> {
  const payload = {
    name: formData.name.trim(),
    category: formData.category.trim() || 'Khác',
    price: Number(formData.price),
    stockQuantity: Number(formData.stockQuantity),
    imageUrl: formData.imageUrl.trim() || null,
    status: Boolean(formData.status),
  };

  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Cập nhật sản phẩm thất bại.');
  }

  return await res.json();
}

// 4. Bật / Tắt trạng thái kinh doanh
export async function toggleProductStatusApi(product: ProductItem): Promise<ProductItem> {
  const res = await fetch(`/api/products/${product.id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({
      ...product,
      status: !product.status,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Không thể đổi trạng thái sản phẩm.');
  }

  return await res.json();
}

// 5. Xóa sản phẩm
export async function deleteProductApi(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Xóa sản phẩm thất bại.');
  }
}

// 6. Upload ảnh sản phẩm lên server
export async function uploadProductImageApi(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Kích thước ảnh tối đa 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'products');

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: getHeaders(false),
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (res.ok && data?.url) {
    return data.url;
  }
  throw new Error(data?.message || 'Tải ảnh thất bại.');
}
