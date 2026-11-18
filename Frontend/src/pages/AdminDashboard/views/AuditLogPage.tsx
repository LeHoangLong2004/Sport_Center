import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Filter,
  User,
  CreditCard
} from 'lucide-react';
import { useApiResource } from '../../../hooks/useApiResource';
import { type InvoiceResponse } from '../../../hooks/flow3Api';
import { formatVnd } from '../../../hooks/apiClient';
import { toast } from 'sonner';

interface AuditLogPageProps {
  onBack?: () => void;
}

export function AuditLogPage({ onBack }: AuditLogPageProps) {
  const payments = useApiResource<InvoiceResponse[]>('/api/payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const rawInvoices = payments.data ?? [];

  // Transform raw invoices into audit log entries
  const allLogs = useMemo(() => {
    return rawInvoices.map((inv) => {
      const isCompleted = inv.status === 'completed';
      const isPending = inv.status === 'pending';
      const eventTime = inv.paidAt || inv.createdAt;

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        memberName: inv.memberName || 'Hội viên vãng lai',
        userId: inv.userId,
        amount: inv.totalAmount,
        action: `Thanh toán hóa đơn ${inv.invoiceNumber}`,
        actionType: 'payment',
        paymentMethod: inv.paymentMethodName || inv.paymentMethod || 'Chuyển khoản',
        status: inv.status,
        statusLabel: inv.statusName || (isCompleted ? 'Hoàn tất' : isPending ? 'Chờ thu' : 'Đã hủy'),
        timestamp: eventTime,
        formattedTime: eventTime
          ? new Date(eventTime).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--',
      };
    });
  }, [rawInvoices]);

  // Distinct payment methods for filter dropdown
  const methodOptions = useMemo(() => {
    const set = new Set<string>();
    allLogs.forEach((l) => {
      if (l.paymentMethod) set.add(l.paymentMethod);
    });
    return Array.from(set);
  }, [allLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        log.memberName.toLowerCase().includes(search) ||
        log.invoiceNumber.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search);

      // Status
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && log.status === 'completed') ||
        (statusFilter === 'pending' && log.status === 'pending') ||
        (statusFilter === 'other' && log.status !== 'completed' && log.status !== 'pending');

      // Method
      const matchMethod = methodFilter === 'all' || log.paymentMethod === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [allLogs, searchTerm, statusFilter, methodFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleRefresh = () => {
    payments.reload();
    toast.success('Đã làm mới dữ liệu nhật ký giao dịch!');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Quay lại Tổng quan"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Nhật ký giao dịch & thanh toán
                </h1>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Toàn bộ lịch sử giao dịch, biến động dòng tiền và nhật ký thanh toán thực tế của trung tâm.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${payments.loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Làm mới</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold">
            {filteredLogs.length} giao dịch
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên hội viên, mã hóa đơn..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Lọc:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn tất / Đã thanh toán</option>
            <option value="pending">Chờ thanh toán / Chờ thu</option>
            <option value="other">Trạng thái khác (Hủy/Hoàn tiền)</option>
          </select>

          {methodOptions.length > 0 && (
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả phương thức</option>
              {methodOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-left w-[14%]">Thời gian</th>
                <th className="py-3.5 px-4 text-left w-[18%]">Người thực hiện / Hội viên</th>
                <th className="py-3.5 px-4 text-left w-[33%]">Hành động / Hóa đơn</th>
                <th className="py-3.5 pl-8 pr-4 text-left w-[13%]">Số tiền</th>
                <th className="py-3.5 px-4 text-left w-[11%]">Phương thức</th>
                <th className="py-3.5 px-4 text-left w-[11%]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {payments.loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-500 mb-2"></div>
                    <p>Đang tải nhật ký giao dịch...</p>
                  </td>
                </tr>
              ) : pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      Không tìm thấy bản ghi giao dịch phù hợp
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Thử thay đổi từ khóa hoặc bộ lọc trạng thái để xem thêm kết quả.
                    </p>
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => {
                  const isCompleted = log.status === 'completed';
                  const isPending = log.status === 'pending';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Thời gian */}
                      <td className="py-3.5 px-4 text-left text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {log.formattedTime}
                      </td>

                      {/* Người thực hiện / Hội viên */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {log.memberName ? log.memberName.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {log.memberName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {log.userId ? log.userId.slice(0, 8) : '--'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hành động / Hóa đơn */}
                      <td className="py-3.5 px-4 text-left">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {log.action}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td className="py-3.5 pl-8 pr-4 text-left whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                          {formatVnd(log.amount)}
                        </span>
                      </td>

                      {/* Phương thức */}
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          ) : isPending ? (
                            <Clock className="w-3 h-3 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3 h-3 shrink-0" />
                          )}
                          <span>{log.statusLabel}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {currentPage} / {totalPages} (Tổng cộng {filteredLogs.length} dòng)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer font-medium"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

