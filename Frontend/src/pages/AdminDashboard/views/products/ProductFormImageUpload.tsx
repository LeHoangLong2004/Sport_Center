import React from 'react';
import { Upload, X } from 'lucide-react';
import { PRESET_IMAGES } from './types';

interface Props {
  imageUrl: string;
  onChangeImageUrl: (url: string) => void;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductFormImageUpload({
  imageUrl,
  onChangeImageUrl,
  isUploading,
  onFileUpload,
}: Props) {
  return (
    <div>
      <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
        Hình ảnh sản phẩm:
      </label>

      {/* Upload button & link input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onChangeImageUrl(e.target.value)}
          placeholder="Dán link ảnh URL hoặc tải lên từ máy tính..."
          className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition shrink-0">
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Đang tải...' : 'Tải tệp'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Preset suggestions */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-400 font-medium">Ảnh gợi ý nhanh:</span>
        {PRESET_IMAGES.map((img) => (
          <button
            key={img.url}
            type="button"
            onClick={() => onChangeImageUrl(img.url)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
              imageUrl === img.url
                ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {img.label}
          </button>
        ))}
      </div>

      {/* Preview Box */}
      {imageUrl && (
        <div className="mt-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3">
          <img
            src={imageUrl}
            alt="Xem trước"
            className="w-14 h-14 object-contain rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            onError={(e) => {
              (e.target as any).src = '/assets/cf835.png';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              Ảnh xem trước hợp lệ
            </p>
            <p className="text-[10px] text-slate-400 truncate">{imageUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => onChangeImageUrl('')}
            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
