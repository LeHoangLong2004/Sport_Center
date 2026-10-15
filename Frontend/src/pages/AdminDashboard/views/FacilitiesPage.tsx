import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Dumbbell } from 'lucide-react';
import { SportsTableCard, FacilitiesTableCard, SportItem, FacilityItem } from './FacilitiesCards';
import { FacilityFormModal, FacilityDeleteModal } from './FacilitiesModals';

export function FacilitiesPage() {
  const [sports, setSports] = useState<SportItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sport' | 'facility'>('sport');

  // Form modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeType, setActiveType] = useState<'sport' | 'facility' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sport' | 'facility'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/sports'), fetch('/api/facilities')])
      .then(async ([sRes, fRes]) => {
        if (sRes.ok) setSports(await sRes.json());
        if (fRes.ok) setFacilities(await fRes.json());
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách:', err);
        toast.error('Không thể tải dữ liệu bộ môn & phòng tập.');
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreateModal = (type: 'sport' | 'facility') => {
    setActiveType(type);
    setModalMode('create');
    setEditingId(null);
    setName('');
    setImageUrl('');
    setAddress('');
  };

  const openEditModal = (type: 'sport' | 'facility', item: SportItem | FacilityItem) => {
    setActiveType(type);
    setModalMode('edit');
    setEditingId(item.id);
    setName(item.name);
    setImageUrl((item as SportItem).imageUrl || '');
    setAddress((item as FacilityItem).address || '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP,...).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        setImageUrl(data.url);
        toast.success('Đã tải ảnh thành công! Bấm "Lưu thay đổi" (hoặc "Xác nhận thêm") để lưu.');
      } else {
        toast.error(data?.message || 'Tải ảnh thất bại.');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên server.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !activeType) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const isSport = activeType === 'sport';
      const isEdit = modalMode === 'edit';
      const endpoint = isSport ? `/api/sports${isEdit ? `/${editingId}` : ''}` : `/api/facilities${isEdit ? `/${editingId}` : ''}`;
      const method = isEdit ? 'PUT' : 'POST';

      const body = isSport
        ? { name: name.trim(), imageUrl: imageUrl.trim() }
        : { name: name.trim(), address: address.trim() };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (isSport) {
          setSports((prev) =>
            isEdit
              ? prev.map((s) => (s.id.toLowerCase() === editingId?.toLowerCase() ? { ...s, ...savedItem } : s))
              : [...prev, savedItem]
          );
        } else {
          setFacilities((prev) =>
            isEdit
              ? prev.map((f) => (f.id.toLowerCase() === editingId?.toLowerCase() ? { ...f, ...savedItem } : f))
              : [...prev, savedItem]
          );
        }
        toast.success(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setActiveType(null);
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.message || 'Thao tác thất bại.');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = deleteTarget.type === 'sport' ? `/api/sports/${deleteTarget.id}` : `/api/facilities/${deleteTarget.id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (deleteTarget.type === 'sport') {
          setSports((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        } else {
          setFacilities((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        }
        toast.success(`Đã xóa ${deleteTarget.type === 'sport' ? 'bộ môn' : 'phòng tập'} thành công!`);
        setDeleteTarget(null);
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.message || 'Không thể xóa mục này.');
      }
    } catch {
      toast.error('Lỗi kết nối khi xóa.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <h1 className="font-bold text-[#0f172a] dark:text-white text-2xl lg:text-3xl">Bộ môn & Phòng tập</h1>
        <p className="text-[#64748b] text-sm mt-1">Quản lý danh mục thể thao và phòng tập của trung tâm thể thao.</p>
      </div>

      <div className="mt-2 flex flex-col gap-5">
        <div className="inline-flex w-full max-w-xl rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('sport')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'sport'
                ? 'bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="size-4" />
            Bộ môn
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">{sports.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facility')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'facility'
                ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Building2 className="size-4" />
            Phòng tập
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{facilities.length}</span>
          </button>
        </div>

        <div className="w-full">
          {activeTab === 'sport' ? (
            <SportsTableCard
              sports={sports}
              loading={loading}
              onOpenCreate={() => openCreateModal('sport')}
              onOpenEdit={(s) => openEditModal('sport', s)}
              onOpenDelete={(s) => setDeleteTarget({ type: 'sport', id: s.id, name: s.name })}
            />
          ) : (
            <FacilitiesTableCard
              facilities={facilities}
              loading={loading}
              onOpenCreate={() => openCreateModal('facility')}
              onOpenEdit={(f) => openEditModal('facility', f)}
              onOpenDelete={(f) => setDeleteTarget({ type: 'facility', id: f.id, name: f.name })}
            />
          )}
        </div>
      </div>

      {activeType && (
        <FacilityFormModal
          activeType={activeType}
          modalMode={modalMode}
          name={name}
          setName={setName}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          address={address}
          setAddress={setAddress}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          onFileUpload={handleFileUpload}
          onClose={() => setActiveType(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <FacilityDeleteModal
          deleteTarget={deleteTarget}
          isDeleting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
