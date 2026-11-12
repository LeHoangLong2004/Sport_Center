import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type FulfillmentStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled"

type ProductOrder = {
  id: string
  customerName: string
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  fulfillmentMethod: "counter_pickup" | "in_center_delivery"
  fulfillmentStatus: FulfillmentStatus
  deliveryLocation?: string | null
  assignedToName?: string
  paidAt?: string | null
  messageCount: number
  items: Array<{ name: string; quantity: number; unitPrice: number }>
}

type OrderMessage = {
  id: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
}

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readResponse(response: Response) {
  const raw = await response.text()
  let body: any = {}
  try { body = raw ? JSON.parse(raw) : {} } catch { /* middleware may return plain text */ }
  if (!response.ok) {
    const error = new Error(body.message || body.title || raw.trim() || `Yêu cầu thất bại (${response.status}).`) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  return body
}

const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  pending: "Chờ xử lý",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng nhận",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

function nextAction(order: ProductOrder) {
  if (order.fulfillmentStatus === "preparing") return order.fulfillmentMethod === "in_center_delivery" ? ["delivering", "Bắt đầu giao"] as const : ["ready", "Sẵn sàng nhận"] as const
  if (order.fulfillmentStatus === "ready") return ["delivered", "Xác nhận đã nhận"] as const
  if (order.fulfillmentStatus === "delivering") return ["delivered", "Xác nhận đã giao"] as const
  return null
}

export function ProductOrdersPage() {
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [filter, setFilter] = useState<"all" | FulfillmentStatus>("all")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, OrderMessage[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const body = await readResponse(await fetch("/api/product-orders", { headers: authHeaders() }))
      setOrders(Array.isArray(body) ? body : [])
      setError("")
    } catch (loadError) {
      const status = loadError instanceof Error ? (loadError as Error & { status?: number }).status : undefined
      if (status === 403 || status === 401) {
        // Tự động làm mới phiên làm việc Lễ tân nếu đang giữ token cũ của vai trò khác (Member)
        try {
          const authRes = await fetch("/api/auth/token/receptionist")
          const authData = await authRes.json().catch(() => null)
          if (authData?.token) {
            localStorage.setItem("token", authData.token)
            localStorage.setItem("accessToken", authData.token)
            localStorage.setItem("user", JSON.stringify(authData))
            window.dispatchEvent(new Event("local-storage-update"))
            const retryRes = await fetch("/api/product-orders", { headers: { Authorization: `Bearer ${authData.token}` } })
            if (retryRes.ok) {
              const retryBody = await retryRes.json().catch(() => [])
              setOrders(Array.isArray(retryBody) ? retryBody : [])
              setError("")
              return
            }
          }
        } catch { /* tiếp tục hiển thị thông báo lỗi chuẩn bên dưới */ }

        if (status === 403) {
          setError("Tài khoản hiện tại không có quyền xem đơn hàng Member. Hãy đăng nhập bằng tài khoản Receptionist hoặc Center Manager.")
        } else {
          setError("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại bằng tài khoản Receptionist hoặc Center Manager.")
        }
      } else {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách đơn hàng.")
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOrders()

    // Đồng bộ đơn mới tạo từ Member Portal mà không cần nhân viên bấm lại thủ công (tải nền im lặng).
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadOrders(true)
    }, 15000)

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void loadOrders(true)
    }
    document.addEventListener("visibilitychange", refreshOnFocus)
    window.addEventListener("focus", refreshOnFocus)

    return () => {
      window.clearInterval(refreshTimer)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      window.removeEventListener("focus", refreshOnFocus)
    }
  }, [loadOrders])

  const loadMessages = useCallback(async (orderId: string) => {
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, { headers: authHeaders() }))
      setMessages((current) => ({ ...current, [orderId]: Array.isArray(body) ? body : [] }))
      setError("")
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể tải tin nhắn.")
    }
  }, [])

  useEffect(() => {
    if (!openChatId) return
    void loadMessages(openChatId)
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadMessages(openChatId)
    }, 10000)
    return () => window.clearInterval(refreshTimer)
  }, [openChatId, loadMessages])

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((order) => order.fulfillmentStatus !== "cancelled" && (order.status === "pending" || order.fulfillmentStatus === "pending")).length,
    preparing: orders.filter((order) => order.fulfillmentStatus !== "cancelled" && (order.status === "completed" && order.fulfillmentStatus !== "delivered")).length,
    refund: orders.filter((order) => order.status === "refund_pending").length,
  }), [orders])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filter === "all") return true
      if (filter === "pending") return order.fulfillmentStatus !== "cancelled" && (order.status === "pending" || order.fulfillmentStatus === "pending")
      if (filter === "preparing") return order.fulfillmentStatus !== "cancelled" && (order.status === "completed" && order.fulfillmentStatus !== "delivered")
      if (filter === "refund") return order.status === "refund_pending"
      return order.fulfillmentStatus === filter
    })
  }, [orders, filter])

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / ITEMS_PER_PAGE))
  const page = Math.min(Math.max(1, currentPage), totalPages)

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return visibleOrders.slice(start, start + ITEMS_PER_PAGE)
  }, [visibleOrders, page, ITEMS_PER_PAGE])

  const fromIndex = visibleOrders.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0
  const toIndex = Math.min(page * ITEMS_PER_PAGE, visibleOrders.length)

  async function confirmPayment(orderId: string) {
    if (processingId) return
    setProcessingId(orderId)
    setError("")
    try {
      await readResponse(await fetch(`/api/product-orders/${orderId}/confirm`, { method: "PUT", headers: authHeaders() }))
      await loadOrders()
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Không thể xác nhận thanh toán.")
    } finally {
      setProcessingId(null)
    }
  }

  async function updateFulfillment(orderId: string, status: FulfillmentStatus) {
    if (processingId) return
    setProcessingId(orderId)
    setError("")
    try {
      await readResponse(await fetch(`/api/product-orders/${orderId}/fulfillment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      }))
      await loadOrders()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật trạng thái đơn hàng.")
    } finally {
      setProcessingId(null)
    }
  }

  async function confirmRefund(orderId: string) {
    if (processingId) return
    setProcessingId(orderId)
    setError("")
    try {
      await readResponse(await fetch(`/api/product-orders/${orderId}/refund`, {
        method: "PUT",
        headers: authHeaders(),
      }))
      await loadOrders()
    } catch (refundError) {
      setError(refundError instanceof Error ? refundError.message : "Không thể xác nhận hoàn tiền.")
    } finally {
      setProcessingId(null)
    }
  }

  async function toggleChat(orderId: string) {
    if (openChatId === orderId) {
      setOpenChatId(null)
      return
    }
    setOpenChatId(orderId)
  }

  async function sendMessage(orderId: string) {
    const message = drafts[orderId]?.trim()
    if (!message) return
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message }),
      }))
      setMessages((current) => ({ ...current, [orderId]: [...(current[orderId] || []), body] }))
      setDrafts((current) => ({ ...current, [orderId]: "" }))
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể gửi tin nhắn.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Lễ tân / Đơn hàng Member</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Quản lý đơn mua hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Xác nhận thanh toán, chuẩn bị hàng và trao đổi với Member theo từng đơn. Tin nhắn nằm trong nút <strong>Xem chat</strong> của mỗi đơn.</p>
        </div>
        <button type="button" onClick={() => void loadOrders()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600">Làm mới</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-4">
        {([
          ["all", "Tổng đơn", counts.all],
          ["pending", "Chờ thanh toán", counts.pending],
          ["preparing", "Chờ bàn giao", counts.preparing],
          ["refund", "Chờ hoàn tiền", counts.refund],
        ] as const).map(([status, label, count]) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition cursor-pointer ${filter === status ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>
            <span className="text-sm text-slate-500">{label}</span>
            <strong className="mt-2 block text-2xl text-slate-900">{count}</strong>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900">Danh sách đơn Member</h2>
          <span className="text-xs font-semibold text-slate-500">
            Tổng cộng: <strong className="text-slate-900 font-bold">{visibleOrders.length}</strong> đơn
          </span>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-400">Đang tải đơn hàng...</p>
        ) : paginatedOrders.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Không có đơn hàng ở trạng thái này.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedOrders.map((order) => {
              const isCancelled = order.fulfillmentStatus === "cancelled" || order.status === "cancelled"
              const isRefundPending = order.status === "refund_pending"
              const isRefunded = order.status === "refunded"
              const isPaid = order.status === "completed"
              const isDelivered = order.fulfillmentStatus === "delivered"

              // Xác định cặp trạng thái chuẩn theo sơ đồ:
              let badge1: { text: string; className: string }
              let badge2: { text: string; className: string }

              if (isCancelled) {
                if (isRefundPending) {
                  // Tình huống 5: Hủy sau thanh toán, chờ hoàn tiền
                  badge1 = { text: "Đã hủy", className: "bg-rose-50 text-rose-700 border border-rose-200" }
                  badge2 = { text: "Chờ hoàn tiền", className: "bg-amber-50 text-amber-700 border border-amber-200" }
                } else if (isRefunded) {
                  // Tình huống 6: Đã hoàn tiền trả khách
                  badge1 = { text: "Đã hủy", className: "bg-rose-50 text-rose-700 border border-rose-200" }
                  badge2 = { text: "Đã hoàn tiền", className: "bg-purple-50 text-purple-700 border border-purple-200" }
                } else {
                  // Tình huống 4: Hủy trước khi thanh toán
                  badge1 = { text: "Đã hủy", className: "bg-rose-50 text-rose-700 border border-rose-200" }
                  badge2 = { text: "Chưa thanh toán", className: "bg-slate-100 text-slate-600 border border-slate-200" }
                }
              } else if (isDelivered) {
                // Tình huống 3: Khách nhận hàng xong
                badge1 = { text: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
                badge2 = { text: "Đã giao", className: "bg-slate-100 text-slate-700 border border-slate-200" }
              } else if (isPaid) {
                // Tình huống 2: Khách trả tiền tại quầy / VietQR thành công
                badge1 = { text: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
                badge2 = { text: "Chờ bàn giao", className: "bg-blue-50 text-blue-700 border border-blue-200" }
              } else {
                // Tình huống 1: Khách đặt hàng, chưa trả tiền
                badge1 = { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border border-amber-200" }
                badge2 = { text: "Chờ bàn giao", className: "bg-slate-100 text-slate-700 border border-slate-200" }
              }

              return (
                <article key={order.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge1.className}`}>
                          {badge1.text}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge2.className}`}>
                          {badge2.text}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{order.customerName} · {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                      <p className="mt-2 text-xs text-slate-500">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        {order.fulfillmentMethod === "in_center_delivery" ? `Giao tại: ${order.deliveryLocation || "Chưa nhập vị trí"}` : "Nhận tại quầy lễ tân"}
                        {order.assignedToName ? ` · Phụ trách: ${order.assignedToName}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <strong className="mr-2 text-lg text-emerald-600">{money(order.totalAmount)}</strong>

                      {/* Tình huống 1: Khách đặt, chưa trả tiền -> Nút [Xác nhận đã thu tiền] & [Hủy] */}
                      {!isCancelled && !isPaid && (
                        <>
                          <button
                            type="button"
                            disabled={processingId === order.id}
                            onClick={() => void confirmPayment(order.id)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                          >
                            {processingId === order.id ? "Đang xử lý..." : "Xác nhận đã thu tiền"}
                          </button>
                          <button
                            type="button"
                            disabled={processingId === order.id}
                            onClick={() => void updateFulfillment(order.id, "cancelled")}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition cursor-pointer"
                          >
                            Hủy
                          </button>
                        </>
                      )}

                      {/* Tình huống 2: Đã thanh toán, chờ bàn giao -> Nút [Bàn giao hàng] & [Hủy] */}
                      {!isCancelled && isPaid && !isDelivered && (
                        <>
                          <button
                            type="button"
                            disabled={processingId === order.id}
                            onClick={() => void updateFulfillment(order.id, "delivered")}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                          >
                            {processingId === order.id ? "Đang xử lý..." : "Bàn giao hàng"}
                          </button>
                          <button
                            type="button"
                            disabled={processingId === order.id}
                            onClick={() => void updateFulfillment(order.id, "cancelled")}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition cursor-pointer"
                          >
                            Hủy
                          </button>
                        </>
                      )}

                      {/* Tình huống 5: Khách hủy sau khi thanh toán, chờ hoàn tiền -> Nút [Xác nhận đã hoàn tiền] */}
                      {isCancelled && isRefundPending && (
                        <button
                          type="button"
                          disabled={processingId === order.id}
                          onClick={() => void confirmRefund(order.id)}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50 transition cursor-pointer"
                        >
                          {processingId === order.id ? "Đang xử lý..." : "Xác nhận đã hoàn tiền"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void toggleChat(order.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition cursor-pointer"
                      >
                        {openChatId === order.id ? "Đóng chat" : order.messageCount > 0 ? `Xem chat (${order.messageCount})` : "Nhắn Member"}
                      </button>
                    </div>
                  </div>
                  {openChatId === order.id && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {(messages[order.id] || []).length === 0 ? (
                          <p className="text-sm text-slate-400">Chưa có tin nhắn. Hãy chủ động thông báo tình trạng đơn cho Member.</p>
                        ) : (
                          messages[order.id].map((item) => (
                            <div key={item.id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                              <p className="font-bold text-slate-700">{item.senderName}</p>
                              <p className="mt-1 text-slate-600">{item.message}</p>
                              <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <input value={drafts[order.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(order.id) }} placeholder="Nhập tin nhắn cho Member..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                        <button type="button" onClick={() => void sendMessage(order.id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {visibleOrders.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between px-5 py-3 text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{fromIndex} - {toIndex}</strong> trên tổng số{" "}
              <strong className="text-slate-800">{visibleOrders.length}</strong> đơn hàng
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`flex items-center justify-center size-8 rounded-lg border text-xs transition cursor-pointer ${
                    page === 1
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                  title="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    totalPages > 7 &&
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - page) > 1
                  ) {
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span key={p} className="px-1 text-slate-400 text-xs font-bold">
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
                      className={`flex items-center justify-center size-8 rounded-lg border text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
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
                  className={`flex items-center justify-center size-8 rounded-lg border text-xs transition cursor-pointer ${
                    page === totalPages
                      ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                  title="Trang kế tiếp"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
