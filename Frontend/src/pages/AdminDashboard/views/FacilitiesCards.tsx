import React from 'react';
import { Plus, Pencil, Trash2, Dumbbell, Building2 } from 'lucide-react';

export interface SportItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  imageUrl?: string;
  address?: string;
}

interface SportsTableCardProps {
  sports: SportItem[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: SportItem) => void;
  onOpenDelete: (item: SportItem) => void;
}

export function SportsTableCard({
  sports,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}: SportsTableCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-5 text-rose-500" />
          <h2 className="font-bold text-base lg:text-lg text-[#0f172a] dark:text-white">Bộ môn (Sports)</h2>
          <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
            {sports.length}
          </span>
        </div>
        <button
          onClick={onOpenCreate}
          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 flex gap-1.5 items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="size-3.5 text-slate-600" />
          <span>Thêm bộ môn</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 flex items-center px-4 py-2.5 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
          <div className="w-12">Ảnh</div>
          <div className="flex-1">Tên bộ môn</div>
          <div className="w-24 text-right">Thao tác</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
        ) : sports.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Chưa có bộ môn nào.</div>
        ) : (
          sports.map((s) => (
            <div
              key={s.id}
              className="flex items-center px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors gap-3"
            >
              <div className="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative flex items-center justify-center">
                {s.imageUrl ? (
                  <>
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling;
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div
                      style={{ display: 'none' }}
                      className="size-full items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100"
                    >
                      GYM
                    </div>
                  </>
                ) : (
                  <div className="size-full flex items-center justify-center text-[10px] text-slate-400 font-bold">GYM</div>
                )}
              </div>
              <div className="flex-1 font-semibold text-sm text-slate-800">{s.name}</div>
              <div className="w-24 flex items-center justify-end gap-1">
                <button
                  onClick={() => onOpenEdit(s)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  title="Chỉnh sửa bộ môn"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => onOpenDelete(s)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Xóa bộ môn"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface FacilitiesTableCardProps {
  facilities: FacilityItem[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: FacilityItem) => void;
  onOpenDelete: (item: FacilityItem) => void;
}

export function FacilitiesTableCard({
  facilities,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}: FacilitiesTableCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-blue-500" />
          <h2 className="font-bold text-base lg:text-lg text-[#0f172a] dark:text-white">Phòng tập (Facilities)</h2>
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
            {facilities.length}
          </span>
        </div>
        <button
          onClick={onOpenCreate}
          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 flex gap-1.5 items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="size-3.5 text-slate-600" />
          <span>Thêm phòng tập</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 flex items-center px-4 py-2.5 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
          <div className="w-12">Ảnh</div>
          <div className="flex-1">Tên phòng / Khu vực</div>
          <div className="w-24 text-right">Thao tác</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
        ) : facilities.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Chưa có phòng tập nào.</div>
        ) : (
          facilities.map((f) => (
            <div
              key={f.id}
              className="flex items-center px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors gap-3"
            >
              <div className="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative flex items-center justify-center">
                {f.imageUrl ? (
                  <>
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling;
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div
                      style={{ display: 'none' }}
                      className="size-full items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100"
                    >
                      ROOM
                    </div>
                  </>
                ) : (
                  <div className="size-full flex items-center justify-center text-[10px] text-slate-400 font-bold">ROOM</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800">{f.name}</p>
                {f.address && f.address !== 'Chưa cập nhật' && (
                  <p className="text-xs text-slate-400 mt-0.5">{f.address}</p>
                )}
              </div>
              <div className="w-24 flex items-center justify-end gap-1">
                <button
                  onClick={() => onOpenEdit(f)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  title="Chỉnh sửa phòng tập"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => onOpenDelete(f)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Xóa phòng tập"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
