import { Plus, CheckCircle2, Trash2 } from "lucide-react";

interface Props {
  certsList: string[];
  newCertInput: string;
  setNewCertInput: (val: string) => void;
  onAddCert: () => void;
  onRemoveCert: (index: number) => void;
}

export default function CertsEditSection({
  certsList,
  newCertInput,
  setNewCertInput,
  onAddCert,
  onRemoveCert,
}: Props) {
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          Danh sách bằng cấp & chứng chỉ ({certsList.length})
        </span>
        <button
          type="button"
          onClick={onAddCert}
          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Thêm chứng chỉ
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Nhập tên chứng chỉ mới rồi bấm 'Thêm chứng chỉ'..."
          value={newCertInput}
          onChange={(e) => setNewCertInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCert();
            }
          }}
          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
        />
      </div>

      <div className="flex flex-col gap-2">
        {certsList.map((c, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200">{c}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveCert(idx)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
              title="Xóa chứng chỉ này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
