import React, { useState } from 'react';
import { useProducts } from './products/useProducts';
import { ProductItem } from './products/types';
import { ProductPageHeader } from './products/ProductPageHeader';
import { ProductStatsCards } from './products/ProductStatsCards';
import { ProductFilterBar } from './products/ProductFilterBar';
import { ProductGrid } from './products/ProductGrid';
import { ProductFormModal } from './products/ProductFormModal';
import { ProductDeleteModal } from './products/ProductDeleteModal';

export function ProductsPage() {
  const {
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
    uploadProductImage,
  } = useProducts();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id, deleteTarget.name);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Header & Nút thêm sản phẩm */}
      <ProductPageHeader onAddClick={openCreateModal} />

      {/* 2. Thẻ số liệu thống kê (KPIs) */}
      <ProductStatsCards stats={stats} />

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categories={categories}
        filteredCount={filteredProducts.length}
        totalCount={products.length}
      />

      {/* 4. Danh sách sản phẩm (Grid / Cards) */}
      <ProductGrid
        loading={loading}
        products={filteredProducts}
        onOpenCreateModal={openCreateModal}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        onToggleStatus={toggleProductStatus}
      />

      {/* 5. Modal Thêm / Chỉnh sửa sản phẩm */}
      <ProductFormModal
        isOpen={modalOpen}
        editingProduct={editingProduct}
        onClose={() => setModalOpen(false)}
        onSubmit={saveProduct}
        onUploadImage={uploadProductImage}
      />

      {/* 6. Modal Xác nhận xóa sản phẩm */}
      <ProductDeleteModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
