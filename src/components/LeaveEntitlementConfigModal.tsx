import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Employee, LeaveType } from '../types';
import { LEAVE_TYPE_MAP } from '../utils/attendanceCalculators';
import { Sliders, Sparkles, X, ShieldAlert, Check } from 'lucide-react';

interface LeaveEntitlementConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployeeId?: string;
}

export const LeaveEntitlementConfigModal: React.FC<LeaveEntitlementConfigModalProps> = ({
  isOpen,
  onClose,
  targetEmployeeId,
}) => {
  const { employees, batchConfigureEntitlements, currentUser } = useAttendance();

  const [selectedEmpId, setSelectedEmpId] = useState(targetEmployeeId || employees[0]?.id || '');
  const [entitlements, setEntitlements] = useState<Record<LeaveType, number>>({
    annual: 80,
    personal: 56,
    sick: 240,
    compTime: 0,
    marriage: 64,
    bereavement: 48,
    maternity: 64,
    menstrual: 24,
  });
  const [reason, setReason] = useState('2026 年度期初休假額度配置');

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  useEffect(() => {
    if (targetEmployeeId) {
      setSelectedEmpId(targetEmployeeId);
    }
  }, [targetEmployeeId]);

  useEffect(() => {
    if (selectedEmployee) {
      setEntitlements({
        annual: selectedEmployee.leaveBalances.annual || 0,
        personal: selectedEmployee.leaveBalances.personal || 0,
        sick: selectedEmployee.leaveBalances.sick || 0,
        compTime: selectedEmployee.leaveBalances.compTime || 0,
        marriage: selectedEmployee.leaveBalances.marriage || 0,
        bereavement: selectedEmployee.leaveBalances.bereavement || 0,
        maternity: selectedEmployee.leaveBalances.maternity || 0,
        menstrual: selectedEmployee.leaveBalances.menstrual || 0,
      });
    }
  }, [selectedEmpId, selectedEmployee]);

  // 勞基法年資預設計算
  const applyLaborLawSeniority = (years: number) => {
    let annualDays = 0;
    if (years >= 10) annualDays = 15 + Math.min(15, Math.floor((years - 10)));
    else if (years >= 5) annualDays = 15;
    else if (years >= 3) annualDays = 14;
    else if (years >= 2) annualDays = 10;
    else if (years >= 1) annualDays = 7;
    else if (years >= 0.5) annualDays = 3;

    setEntitlements(prev => ({
      ...prev,
      annual: annualDays * 8,
    }));
    setReason(`依勞基法年資基準配置 (年資 ${years} 年，特休 ${annualDays} 天 / ${annualDays * 8} 小時)`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    batchConfigureEntitlements(selectedEmployee.id, entitlements, reason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                員工休假初始額度與配額配置
              </h3>
              <p className="text-xs text-slate-500">
                可單獨或批量設定各假別額度，系統將自動依核准請假扣抵
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
          
          {/* 選擇員工 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              配置目標員工：
            </label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeNo} · {e.department} · 到職日: {e.hireDate})
                </option>
              ))}
            </select>
          </div>

          {/* 勞基法年資快速套用工具 */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 mr-1" />
              <span>快速套用台灣勞基法特休基準：</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '滿半年 (3天/24h)', years: 0.5 },
                { label: '滿1年 (7天/56h)', years: 1 },
                { label: '滿2年 (10天/80h)', years: 2 },
                { label: '滿3年 (14天/112h)', years: 3 },
                { label: '滿5年 (15天/120h)', years: 5 },
              ].map(opt => (
                <button
                  key={opt.years}
                  type="button"
                  onClick={() => applyLaborLawSeniority(opt.years)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 各項假別額度輸入網格 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              各假別初始給假額度 (小時 / 天數換算)：
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
              {(Object.keys(LEAVE_TYPE_MAP) as LeaveType[]).map(type => {
                const meta = LEAVE_TYPE_MAP[type];
                const hours = entitlements[type] || 0;
                const days = (hours / 8).toFixed(1);

                return (
                  <div
                    key={type}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        約 {days} 天
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={hours}
                        onChange={e => setEntitlements({
                          ...entitlements,
                          [type]: Number(e.target.value),
                        })}
                        className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <span className="text-[11px] text-slate-400">小時</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 配置原因說明 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              異動或給假原因備註：
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="例如：2026 年度年度特休發放、新進員工年資核算..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              儲存休假額度配置
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
