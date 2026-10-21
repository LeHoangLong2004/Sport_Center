import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ProductItem, ProductFormData, PRESET_CATEGORIES } from './types';
import { ProductFormImageUpload } from './ProductFormImageUpload';

interface Props {
  isOpen: boolean;
  editingProduct: ProductItem | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData, editingId?: string | null) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
  onUploadImage,
}: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Đồ uống');
  const [price, setPrice] = useState<number | ''>(25000);
  const [stockQuantity, setStockQuantity] = useState<number | ''>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category || 'Khác');
      setPrice(editingProduct.price);
      setStockQuantity(editingProduct.stockQuantity);
      setImageUrl(editingProduct.imageUrl || '');
      setStatus(editingProduct.status);
    } else {
      setName('');
      setCategory('Đồ uống');
      setPrice(25000);
      setStockQuantity(50);
      setImageUrl('');
      setStatus(true);
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await onUploadImage(file);
      setImageUrl(uploadedUrl);
      toast.success('Tải ảnh sản phẩm thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh thất bại.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (price === '' || price < 0) {
      toast.error('Vui lòng nhập đơn giá hợp lệ (>= 0).');
      return;
    }
    if (stockQuantity === '' || stockQuantity < 0) {
      toast.error('Vui lòng nhập số lượng tồn kho hợp lệ (>= 0).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        { name, category, price, stockQuantity, imageUrl, status },
        editingProduct ? editingProduct.id : null
      );
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
              {editingProduct ? 'Chỉnh sửa mặt hàng' : 'Bổ sung sản phẩm mới'}
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {editingProduct ? `Cập nhật: ${editingProduct.name}` : 'Thêm sản phẩm vào kho'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Tên sản phẩm */}
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Tên sản phẩm <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nước khoáng Aquafina 500ml, Bánh Protein Bar,..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Phân loại & Trạng thái */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Phân loại danh mục:
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Chọn hoặc nhập loại mới"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <datalist id="category-suggestions">
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Trạng thái kinh doanh:
              </label>
              <select
                value={status ? 'active' : 'inactive'}
                onChange={(e) => setStatus(e.target.value === 'active')}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="active">🟢 Đang mở bán</option>
                <option value="inactive">🔴 Tạm ngưng kinh doanh</option>
              </select>
            </div>
          </div>

          {/* Đơn giá & Số lượng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Đơn giá bán niêm yết (VNĐ) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {typeof price === 'number' && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  = {price.toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Số lượng tồn kho <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Ảnh sản phẩm (Đã tách thành component riêng) */}
          <ProductFormImageUpload
            imageUrl={imageUrl}
            onChangeImageUrl={setImageUrl}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
          />

          {/* Ghi chú đồng bộ */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            💡 <strong>Đồng bộ tự động:</strong> Sản phẩm sau khi lưu sẽ lập tức có sẵn trên màn hình bán hàng POS của nhân viên Lễ tân và mục &quot;Cửa hàng&quot; của Hội viên.
          </div>

          {/* Nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold transition shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Đang lưu...'
                : editingProduct
                ? 'Lưu thay đổi'
                : 'Xác nhận thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
