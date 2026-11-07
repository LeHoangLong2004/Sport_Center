import React, { useState, useEffect, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import StatusBadge from "../components/StatusBadge"
import { UserAvatar } from "../../../components/UserAvatar"

export function MemberAvatar({
  url,
  name,
  size = 28,
  className = "",
}: {
  url?: string
  name?: string
  size?: number
  className?: string
}) {
  const [imgError, setImgError] = useState(false)

  // Compute initials
  const initials = useMemo(() => {
    if (!name || !name.trim()) return "TV"
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }, [name])

  // Normalize URL to prevent broken links on deployed domains
  const normalizedUrl = useMemo(() => {
    if (!url || !url.trim()) return ""
    let clean = url.trim()
    if (clean.startsWith("http://localhost:5000/")) {
      clean = clean.replace("http://localhost:5000", "")
    } else if (clean.startsWith("http://127.0.0.1:5000/")) {
      clean = clean.replace("http://127.0.0.1:5000", "")
    }
    return clean
  }, [url])

  // Reset imgError if url changes
  useEffect(() => {
    setImgError(false)
  }, [normalizedUrl])

  // Deterministic pastel badge color based on name
  const badgeColor = useMemo(() => {
    const colors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-teal-100 text-teal-700 border-teal-200",
    ]
    let hash = 0
    for (let i = 0; i < (name || "").length; i++) {
      hash = (name || "").charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }, [name])

  if (!normalizedUrl || imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] tracking-tight font-['Manrope:Bold'] border select-none ${badgeColor} ${className}`}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={normalizedUrl}
      alt={name || "Avatar"}
      onError={() => setImgError(true)}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover border border-slate-200 ${className}`}
    />
  )
}

export function LookupPage({ onDetail }: { onDetail: (member: any) => void }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Tất cả")
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/users/members-lookup", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          setMembers(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  // Reset to page 1 whenever search query or category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query, filter])

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchQ =
        query === "" ||
        `${m.fullName} ${m.phoneNumber} ${m.memberCode}`
          .toLowerCase()
          .includes(query.toLowerCase())
      const matchF =
        filter === "Tất cả" ||
        (filter === "Premium" && (m.packageName || "").includes("Premium")) ||
        (filter === "Fitness" && (m.packageName || "").includes("Fitness")) ||
        (filter === "Hết hạn" && m.status !== "Đang hoạt động")
      return matchQ && matchF
    })
  }, [members, query, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const page = Math.min(Math.max(1, currentPage), totalPages)

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page, ITEMS_PER_PAGE])

  const fromIndex = filtered.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0
  const toIndex = Math.min(page * ITEMS_PER_PAGE, filtered.length)

  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 p-[32px] w-full">
      {/* Search card */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="bg-[#f1f5f9] flex gap-[12px] items-center p-[14px] rounded-[8px] w-full">
          <Search className="size-[20px] shrink-0 text-[#64748b]" />
          <input
            className="flex-1 bg-transparent font-normal text-[#0f172a] text-[15px] outline-none min-w-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã thẻ..."
          />
          <span className="bg-white border border-[#e2e8f0] font-bold font-semibold px-[6px] py-[2px] rounded-[4px] text-[#64748b] text-[11px] shrink-0">
            F3
          </span>
        </div>
        <div className="flex items-center justify-between shrink-0 w-full">
          <div className="flex gap-[8px] items-start shrink-0">
            {["Tất cả", "Premium", "Fitness", "Hết hạn"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                className={`flex items-start px-[14px] py-[8px] rounded-[6px] shrink-0 transition-colors cursor-pointer ${
                  filter === chip
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-[#f1f5f9] text-[#64748b] font-medium hover:bg-slate-200"
                } text-[13px]`}
              >
                {chip}
              </button>
            ))}
          </div>
          <span className="font-bold font-semibold text-[#64748b] text-[14px]">
            Tổng số kết quả:{" "}
            <span className="font-bold text-[#0f172a]">
              {filtered.length} thành viên
            </span>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full shadow-sm">
        <div className="bg-[#f1f5f9] flex font-extrabold items-center px-[24px] py-[14px] text-[#64748b] text-[13px] w-full">
          <span className="w-[120px] shrink-0">MÃ THÀNH VIÊN</span>
          <span className="flex-1 min-w-0">HỌ VÀ TÊN</span>
          <span className="w-[180px] shrink-0">SỐ ĐIỆN THOẠI</span>
          <span className="w-[200px] shrink-0">GÓI ĐĂNG KÝ</span>
          <span className="w-[160px] shrink-0">HẠN SỬ DỤNG</span>
          <span className="w-[150px] shrink-0">TRẠNG THÁI</span>
          <span className="w-[100px] shrink-0 text-right">THAO TÁC</span>
        </div>
        <div className="flex flex-col items-start w-full min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center w-full py-16 text-[#64748b] text-[14px]">
              Đang tải danh sách thành viên...
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-16 text-[#64748b] text-[14px] gap-2">
              <p>Không tìm thấy thành viên nào phù hợp.</p>
            </div>
          ) : (
            paginatedMembers.map((m) => (
              <div
                key={m.memberCode}
                className="border-[#e2e8f0] border-b border-solid flex items-center px-[24px] py-[12px] shrink-0 w-full hover:bg-slate-50/70 transition-colors"
              >
                <span className="font-bold text-slate-800 text-[13px] w-[120px] shrink-0">
                  {m.memberCode}
                </span>
                <div className="flex flex-1 gap-[10px] items-center min-w-0">
                  <MemberAvatar url={m.avatarUrl} name={m.fullName} size={28} />
                  <span className="font-bold text-[#0f172a] text-[13px] whitespace-nowrap truncate">
                    {m.fullName}
                  </span>
                </div>
                <span className="font-normal text-[#64748b] text-[13px] w-[180px] shrink-0">
                  {m.phoneNumber || "Chưa cập nhật"}
                </span>
                <span className="font-semibold text-[#0f172a] text-[13px] w-[200px] shrink-0 truncate">
                  {m.packageName || "Chưa đăng ký"}
                </span>
                <span className="font-normal text-[#64748b] text-[13px] w-[160px] shrink-0">
                  {m.expiryDate
                    ? new Date(m.expiryDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
                <div className="flex items-start w-[150px] shrink-0">
                  <StatusBadge text={m.status} color={m.statusColor} />
                </div>
                <div className="flex items-start justify-end w-[100px] shrink-0">
                  <button
                    type="button"
                    onClick={() => onDetail(m)}
                    className="border border-[#e2e8f0] border-solid flex items-start px-[12px] py-[6px] rounded-[6px] shrink-0 hover:bg-white hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="font-bold text-[#0f172a] text-[12px]">
                      Chi tiết
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between px-[24px] py-[14px] w-full text-[13px]">
            <span className="text-[#64748b] font-medium">
              Hiển thị{" "}
              <strong className="text-[#0f172a] font-bold">
                {fromIndex} - {toIndex}
              </strong>{" "}
              trên tổng số{" "}
              <strong className="text-[#0f172a] font-bold">
                {filtered.length}
              </strong>{" "}
              thành viên
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`flex items-center justify-center size-8 rounded-[6px] border text-[13px] transition-colors cursor-pointer ${
                    page === 1
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-slate-100"
                  }`}
                  title="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // If lots of pages, only show around current page
                  if (
                    totalPages > 7 &&
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - page) > 1
                  ) {
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span
                          key={p}
                          className="px-1 text-slate-400 text-xs font-bold"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  const isActive = p === page
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`flex items-center justify-center size-8 rounded-[6px] border text-[12px] font-bold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                          : "bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={`flex items-center justify-center size-8 rounded-[6px] border text-[13px] transition-colors cursor-pointer ${
                    page === totalPages
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-slate-100"
                  }`}
                  title="Trang kế tiếp"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
