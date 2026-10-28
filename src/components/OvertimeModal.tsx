import React, { useState, useMemo, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { calculateOvertimeBreakdown } from '../utils/attendanceCalculators';
import { Clock, DollarSign, Calendar, Flame, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledHours?: number;
}

export const OvertimeModal: React.FC<OvertimeModalProps> = ({
  isOpen,
  onClose,
  prefilledHours,
}) => {
  const { currentUser, applyOvertime, currentDateStr } = useAttendance();

  const [date, setDate] = useState(currentDateStr);
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:00');
  const [project, setProject] = useState('');
  const [reason, setReason] = useState('');
  const [compensationType, setCompensationType] = useState<'overtime_pay' | 'comp_time'>('overtime_pay');
  const [isHoliday, setIsHoliday] = useState(false);

  // 若由下班打卡超時自動帶入
  useEffect(() => {
    if (prefilledHours && prefilledHours > 0) {
      const startH = 18;
      const startM = 30;
      const totalMin = startH * 60 + startM + Math.round(prefilledHours * 60);
      const endH = Math.floor(totalMin / 60);
      const endM = totalMin % 60;
      setStartTime('18:30');
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  }, [prefilledHours]);

  // 計算加班時數
  const calculatedHours = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return 0;
    const hrs = diff / 60;
    return Number(hrs.toFixed(1));
  }, [startTime, endTime]);

  // 勞基法法定加班費與各級距計算
  const breakdown = useMemo(() => {
    return calculateOvertimeBreakdown(calculatedHours, currentUser.hourlyWage, isHoliday);
  }, [calculatedHours, currentUser.hourlyWage, isHoliday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedHours <= 0) return;

    applyOvertime({
      employeeId: currentUser.id,
      applicantName: currentUser.name,
      department: currentUser.department,
      date,
      startTime,
      endTime,
      totalHours: calculatedHours,
      reason,
      project: project || '常態營運支援',
      compensationType,
      breakdown,
      estimatedPay: breakdown.estimatedPay,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                加班申請與法定試算單
              </h3>
              <p className="text-xs text-slate-500">
                申請人：{currentUser.name} (時薪 NT$ {currentUser.hourlyWage})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* 加班日期與假日勾選 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                加班日期：
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={e => setIsHoliday(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold">休息日 / 國定假日加班</span>
              </label>
            </div>
          </div>

          {/* 加班起訖時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                開始時間：
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                結束時間：
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* 補償方案選擇 (加班費 vs 補休) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              加班補償方式：
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompensationType('overtime_pay')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  compensationType === 'overtime_pay'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>領取加班費</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  依勞基法規定倍率計入當月薪資發放
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCompensationType('comp_time')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  compensationType === 'comp_time'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>換取補休額度</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  核准後自動存入同仁補休時數帳戶
                </p>
              </button>
            </div>
          </div>

          {/* 勞基法法定級距試算卡片 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white mb-2">
              <span>加班時數與法定試算結果</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 text-base">
                合計 {calculatedHours} 小時
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-2">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">前 2 小時 (x1.34)</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.tier1Hours} 小時
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">第 3-4 小時 (x1.67)</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.tier2Hours} 小時
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block">超過 4h / 假日</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.tier3Hours} 小時
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                {compensationType === 'overtime_pay' ? '預估本次加班費：' : '預估核發補休：'}
              </span>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                {compensationType === 'overtime_pay'
                  ? `NT$ ${breakdown.estimatedPay.toLocaleString()}`
                  : `${calculatedHours} 小時補休`}
              </span>
            </div>
          </div>

          {/* 專案與事由 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              專案/任務名稱：
            </label>
            <input
              type="text"
              required
              placeholder="例如：Core Platform 系統架構升級、雙十行銷檔期"
              value={project}
              onChange={e => setProject(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              具體加班工作事項說明：
            </label>
            <textarea
              rows={2}
              required
              placeholder="請詳細說明加班處理事項與交付成果..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              送出加班申請
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
