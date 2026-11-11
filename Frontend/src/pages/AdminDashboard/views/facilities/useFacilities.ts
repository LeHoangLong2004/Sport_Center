import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SportItem, FacilityItem } from '../FacilitiesCards';
import {
  fetchSportsApi,
  fetchFacilitiesApi,
  uploadImageFileApi,
  saveSportApi,
  saveFacilityApi,
  deleteSportApi,
  deleteFacilityApi,
} from './facilityApi';

export function useFacilities() {
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

  // Coach assignment modal state
  const [assignmentSport, setAssignmentSport] = useState<SportItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [sData, fData] = await Promise.all([fetchSportsApi(), fetchFacilitiesApi()]);
      setSports(sData);
      setFacilities(fData);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
      toast.error('Không thể tải dữ liệu bộ môn & phòng tập.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const closeModal = () => {
    setActiveType(null);
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
      const url = await uploadImageFileApi(file, activeType === 'sport' ? 'sports' : 'facilities');
      setImageUrl(url);
      toast.success('Đã tải ảnh thành công! Bấm "Lưu thay đổi" (hoặc "Xác nhận thêm") để lưu.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tải ảnh thất bại.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !activeType) return;
    setIsSubmitting(true);
    try {
      const isSport = activeType === 'sport';
      const isEdit = modalMode === 'edit';

      if (isSport) {
        const savedItem = await saveSportApi(name, imageUrl, editingId);
        setSports((prev) =>
          isEdit
            ? prev.map((s) => (s.id.toLowerCase() === editingId?.toLowerCase() ? { ...s, ...savedItem } : s))
            : [...prev, savedItem]
        );
      } else {
        const savedItem = await saveFacilityApi(name, imageUrl, address, editingId);
        setFacilities((prev) =>
          isEdit
            ? prev.map((f) => (f.id.toLowerCase() === editingId?.toLowerCase() ? { ...f, ...savedItem } : f))
            : [...prev, savedItem]
        );
      }

      toast.success(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'sport') {
        await deleteSportApi(deleteTarget.id);
        setSports((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      } else {
        await deleteFacilityApi(deleteTarget.id);
        setFacilities((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      }
      toast.success(`Đã xóa ${deleteTarget.type === 'sport' ? 'bộ môn' : 'phòng tập'} thành công!`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi kết nối khi xóa.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    sports,
    facilities,
    loading,
    activeTab,
    setActiveTab,
    modalMode,
    activeType,
    name,
    setName,
    imageUrl,
    setImageUrl,
    address,
    setAddress,
    isSubmitting,
    isUploading,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    assignmentSport,
    setAssignmentSport,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFileUpload,
    handleSave,
    handleDelete,
  };
}

