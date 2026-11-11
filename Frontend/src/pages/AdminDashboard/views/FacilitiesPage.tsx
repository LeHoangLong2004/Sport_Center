import React from 'react';
import { Building2, Dumbbell } from 'lucide-react';
import { SportsTableCard, FacilitiesTableCard } from './FacilitiesCards';
import { FacilityFormModal, FacilityDeleteModal } from './FacilitiesModals';
import { CoachSportAssignmentModal } from './CoachSportAssignmentModal';
import { useFacilities } from './facilities/useFacilities';

/**
 * Trang quản lý Bộ môn thể thao (Sports) & Cơ sở vật chất / Phòng tập (Facilities).
 * Đã tách hook quản lý nghiệp vụ và API client vào thư mục `facilities/`.
 */
export function FacilitiesPage() {
  const {
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
  } = useFacilities();

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
                ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="size-4" />
            Bộ môn
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">{sports.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facility')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'facility'
                ? 'bg-slate-50 text-slate-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Building2 className="size-4" />
            Phòng tập
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600">{facilities.length}</span>
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
              onOpenManageCoaches={(s) => setAssignmentSport(s)}
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
          onClose={closeModal}
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

      {assignmentSport && (
        <CoachSportAssignmentModal sport={assignmentSport} onClose={() => setAssignmentSport(null)} />
      )}
    </div>
  );
}
