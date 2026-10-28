import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { LeaveType } from '../types';
import { LEAVE_TYPE_MAP } from '../utils/attendanceCalculators';
import { Calendar, Clock, User, FileText, AlertTriangle, X } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, employees, applyLeave } = useAttendance();

  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [endTime, setEndTime] = useState('18:00');
  const [substituteId, setSubstituteId] = useState(
    employees.find(e => e.id !== currentUser.id && e.department === currentUser.department)?.id || ''
  );
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // 自動計算請假時數
  const calculatedHours = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (end <= start) return 0;

    // 單日簡單計算
    if (startDate === endDate) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      // 跨過中午 12:00 ~ 13:00 扣 1 小時
      if (sh < 13 && eh > 12) {
        diff = Math.max(0, diff - 60);
      }
      return Math.max(1, Math.round(diff / 60));
    } else {
      // 跨日計算工作天
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return days * 8;
    }
  }, [startDate, startTime, endDate, endTime]);

  // 目前餘額
  const currentQuota = currentUser.leaveBalances[leaveType] || 0;
  const currentUsed = currentUser.leaveUsed[leaveType] || 0;
  const remainingQuota = Math.max(0, currentQuota - currentUsed);
  const isExceeding = calculatedHours > remainingQuota;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedHours <= 0) return;

    const substitute = employees.find(e => e.id === substituteId);

    applyLeave({
      employeeId: currentUser.id,
      applicantName: currentUser.name,
      department: currentUser.department,
      leaveType,
      startDate,
      startTime,
      endDate,
      endTime,
      totalHours: calculatedHours,
      reason,
      substituteId,
      substituteName: substitute?.name || '無指定',
      attachmentName: attachmentName || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              線上請假申請單
            </h3>
            <p className="text-xs text-slate-500">
              申請人：{currentUser.name} ({currentUser.department})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* 假別選擇 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              請假類別：
            </label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(LEAVE_TYPE_MAP) as LeaveType[]).map(type => (
                <option key={type} value={type}>
                  {LEAVE_TYPE_MAP[type].label} (剩餘額度：{Math.max(0, (currentUser.leaveBalances[type] || 0) - (currentUser.leaveUsed[type] || 0))} 小時)
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>年度核定：{currentQuota} 小時</span>
              <span>已休累計：{currentUsed} 小時</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">可用餘額：{remainingQuota} 小時</span>
            </div>
          </div>

          {/* 請假起訖時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                開始日期與時間
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="w-full mt-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                結束日期與時間
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                className="w-full mt-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* 自動計算時數卡片 */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-900 dark:text-blue-200 font-medium">合計請假時數：</span>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">
                {calculatedHours} 小時 (約 {(calculatedHours / 8).toFixed(1)} 工作天)
              </div>
            </div>
            {isExceeding && (
              <div className="flex items-center text-rose-600 text-[11px] font-bold">
                <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>時數已超過可用餘額</span>
              </div>
            )}
          </div>

          {/* 職務代理人 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              職務代理人：
            </label>
            <select
              value={substituteId}
              onChange={e => setSubstituteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="">-- 請選擇職務代理人 --</option>
              {employees
                .filter(e => e.id !== currentUser.id)
                .map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - {e.position})
                  </option>
                ))}
            </select>
          </div>

          {/* 請假原因 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              請假事由說明：
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="請簡述請假事由或交辦事項代理說明..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 附件模擬 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              檢附證明文件 (如病假診斷證明/就醫收據)：
            </label>
            <input
              type="text"
              placeholder="例如：診斷收據證明_202610.pdf (選填)"
              value={attachmentName}
              onChange={e => setAttachmentName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* 按鈕 */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={calculatedHours <= 0}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              送出請假申請
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
