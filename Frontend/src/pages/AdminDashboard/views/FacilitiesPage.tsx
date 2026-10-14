import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SportsTableCard, FacilitiesTableCard, SportItem, FacilityItem } from './FacilitiesCards';
import { FacilityFormModal, FacilityDeleteModal } from './FacilitiesModals';

export function FacilitiesPage() {
  const [sports, setSports] = useState<SportItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error(err);
        toast.error('Không thể tải dữ liệu danh mục.');
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreateModal = (type: 'sport' | 'facility') => {
    setModalMode('create');
    setActiveType(type);
    setEditingId(null);
    setName('');
    setImageUrl('');
    setAddress('');
  };

  const openEditModal = (type: 'sport' | 'facility', item: any) => {
    setModalMode('edit');
    setActiveType(type);
    setEditingId(item.id);
    setName(item.name || '');
    setImageUrl(item.imageUrl || '');
    setAddress(item.address || '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        toast.success('Đã tải ảnh thành công! Bấm "Lưu thay đổi" (hoặc "Xác nhận thêm") để lưu.');
      } else {
        toast.error('Tải ảnh thất bại.');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên server.');
    } finally {
      setIsUploading(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <SportsTableCard
          sports={sports}
          loading={loading}
          onOpenCreate={() => openCreateModal('sport')}
          onOpenEdit={(s) => openEditModal('sport', s)}
          onOpenDelete={(s) => setDeleteTarget({ type: 'sport', id: s.id, name: s.name })}
        />

        <FacilitiesTableCard
          facilities={facilities}
          loading={loading}
          onOpenCreate={() => openCreateModal('facility')}
          onOpenEdit={(f) => openEditModal('facility', f)}
          onOpenDelete={(f) => setDeleteTarget({ type: 'facility', id: f.id, name: f.name })}
        />
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
