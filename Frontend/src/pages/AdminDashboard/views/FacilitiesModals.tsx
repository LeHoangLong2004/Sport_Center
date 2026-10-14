import React from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';

export interface FormModalProps {
  activeType: 'sport' | 'facility';
  modalMode: 'create' | 'edit';
  name: string;
  setName: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSave: () => void;
}

export function FacilityFormModal({
  activeType,
  modalMode,
  name,
  setName,
  imageUrl,
  setImageUrl,
  address,
  setAddress,
  isSubmitting,
  isUploading,
  onFileUpload,
  onClose,
  onSave,
}: FormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800">
            {modalMode === 'create' ? 'Thêm mới' : 'Chỉnh sửa'} {activeType === 'sport' ? 'bộ môn' : 'phòng tập'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {modalMode === 'create' ? 'Điền thông tin để tạo mới trong hệ thống.' : 'Cập nhật lại các trường thông tin bên dưới.'}
        </p>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên {activeType === 'sport' ? 'bộ môn' : 'phòng tập'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={activeType === 'sport' ? 'VD: Bơi lội, Yoga, Boxing' : 'VD: Phòng Gym Tầng 1, Yoga Studio'}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {activeType === 'sport' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hình ảnh bộ môn</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Dán link ảnh hoặc tải tệp lên"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1">
                  <Upload className="size-3.5" />
                  <span>{isUploading ? 'Đang tải...' : 'Tải lên'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onFileUpload} disabled={isUploading} />
                </label>
              </div>
              {imageUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLElement).nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div
                    style={{ display: 'none' }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-100 text-slate-500 text-xs"
                  >
                    <span className="font-semibold text-slate-600">Đã chọn ảnh thành công</span>
                    <span className="text-[11px] text-slate-400 mt-1 truncate max-w-full px-2 font-mono">{imageUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-rose-600 transition-colors cursor-pointer z-10"
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí / Địa chỉ (tùy chọn)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Tầng 2, Tòa nhà A"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={!name.trim() || isSubmitting || isUploading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Đang lưu...' : modalMode === 'edit' ? 'Lưu thay đổi' : 'Xác nhận thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface DeleteModalProps {
  deleteTarget: { type: 'sport' | 'facility'; id: string; name: string };
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FacilityDeleteModal({ deleteTarget, isDeleting, onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100">
        <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="size-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 text-center">
          Xác nhận xóa {deleteTarget.type === 'sport' ? 'bộ môn' : 'phòng tập'}?
        </h3>
        <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
          Bạn có chắc chắn muốn xóa <span className="font-semibold text-slate-700">"{deleteTarget.name}"</span>? 
          Hành động này sẽ không thể khôi phục.
        </p>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    </div>
  );
}
