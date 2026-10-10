import { useState, useEffect } from "react";
import { Navigate } from "./types";
import { Shell, src } from "./MemberShellV2";

export function Workout({ onNavigate }: { onNavigate: Navigate }) {
  const [homeworks, setHomeworks] = useState<any[]>([])
  
  useEffect(() => {
    import('../../services/api').then(({ MemberAPI }) => {
      MemberAPI.getMyHomework().then((data: any) => {
        setHomeworks(data || [])
      }).catch(console.error)
    })
  }, [])

  return (
    <Shell page="workout" onNavigate={onNavigate}>
      <section className="m2-workout-content">
        {homeworks.length === 0 ? (
          <div className="py-20 text-center text-slate-400">Bạn chưa có bài tập về nhà nào được giao.</div>
        ) : (
          homeworks.map((hw: any) => (
            <div key={hw.id} className="mb-12">
              <div className="m2-workout-hero">
                <div>
                  <span>Trạng thái: {hw.status} • Ngày giao: {new Date(hw.assignedDate).toLocaleDateString('vi-VN')}</span>
                  <strong>{hw.plan?.planName || "Bài tập"}</strong>
                  <small>Thời gian thực hiện: {hw.plan?.durationMinutes || 0} phút | Ghi chú: {hw.notes || "Không có"}</small>
                </div>
                <button type="button" onClick={() => {
                  import('../../services/api').then(({ MemberAPI }) => {
                    MemberAPI.updateHomeworkProgress(hw.id, { status: 'completed', progressPct: 100 })
                      .then(() => alert('Đã cập nhật tiến độ hoàn thành!'))
                      .catch(() => alert('Lỗi cập nhật.'));
                  });
                }}>Đánh dấu hoàn thành</button>
              </div>
              <div className="m2-workout-grid mt-6">
                <div className="m2-workout-left">
                  <div className="m2-coach-review">
                    <div><img src={src("workout", "d88df.png")} alt="" /><span><strong>Mục tiêu giáo án</strong></span></div>
                    <p>{hw.plan?.description || "Không có mô tả chi tiết."}</p>
                    <p><strong>Cấp độ:</strong> {hw.plan?.level}</p>
                    <p><strong>Mục tiêu:</strong> {hw.plan?.goal}</p>
                  </div>
                </div>
                <aside className="m2-exercises">
                  <strong>Giáo án bài tập ({(hw.plan?.exercises || []).length} bài)</strong>
                  <div>
                    {(hw.plan?.exercises || []).map((ex: any) => (
                      <article key={ex.id}>
                        <span><strong>{ex.name}</strong><small>{ex.reps} • Nghỉ {ex.rest}</small></span>
                        <b>{ex.note}</b>
                      </article>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          ))
        )}
      </section>
    </Shell>
  )
}
