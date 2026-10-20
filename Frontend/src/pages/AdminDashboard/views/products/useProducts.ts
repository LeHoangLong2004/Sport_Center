import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ProductItem, ProductFormData, ProductStats } from './types';
import {
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  toggleProductStatusApi,
  deleteProductApi,
  uploadProductImageApi,
} from './productApi';

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchProducts = async () => {
    try {
      const data = await fetchProductsApi(true);
      setProducts(data);
    } catch {
      toast.error('Lỗi khi tải dữ liệu sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const saveProduct = async (formData: ProductFormData, editingId?: string | null) => {
    if (editingId) {
      await updateProductApi(editingId, formData);
      toast.success(`Đã cập nhật sản phẩm "${formData.name}"!`);
    } else {
      await createProductApi(formData);
      toast.success(`Đã thêm sản phẩm "${formData.name}" thành công!`);
    }
    await fetchProducts();
  };

  const toggleProductStatus = async (product: ProductItem) => {
    try {
      await toggleProductStatusApi(product);
      toast.success(
        !product.status
          ? `Đã kích hoạt bán "${product.name}".`
          : `Đã tạm ngưng bán "${product.name}".`
      );
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, status: !item.status } : item))
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái.');
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      await deleteProductApi(id);
      toast.success(`Đã xóa sản phẩm "${name}".`);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa sản phẩm.');
      throw err;
    }
  };

  // KPIs
  const stats: ProductStats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status).length;
    const lowStock = products.filter((p) => p.stockQuantity <= 5).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
    return { total, active, lowStock, totalInventoryValue };
  }, [products]);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? p.status
          : !p.status;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  return {
    products,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    stats,
    categories,
    filteredProducts,
    saveProduct,
    toggleProductStatus,
    deleteProduct,
    uploadProductImage: uploadProductImageApi,
    refreshProducts: fetchProducts,
  };
}
