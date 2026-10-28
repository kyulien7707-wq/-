import React from 'react';
import { AttendanceRecord, Employee, CompanySettings } from '../types';
import { ATTENDANCE_STATUS_MAP, calculateOvertimeBreakdown } from '../utils/attendanceCalculators';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearMonth: string;
  employee: Employee;
  records: AttendanceRecord[];
  settings: CompanySettings;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  yearMonth,
  employee,
  records,
  settings,
}) => {
  if (!isOpen) return null;

  const empRecords = records
    .filter(r => r.employeeId === employee.id && r.date.startsWith(yearMonth))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalWorkHours = empRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalOtHours = empRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  const otCalc = calculateOvertimeBreakdown(totalOtHours, employee.hourlyWage);
  const presentDays = empRecords.filter(r => r.clockInTime).length;
  const lateCount = empRecords.filter(r => r.lateMinutes > 0).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* 操作列 (列印與關閉) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              出勤簽核證明單預覽
            </span>
            <span className="text-xs text-slate-500">
              (支援直接列印或另存為 PDF)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 列印本文區域 */}
        <div className="print-area font-sans text-slate-900 bg-white p-6 rounded-2xl border border-slate-200">
          
          {/* 公司抬頭 */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {settings.companyName}
            </h1>
            <h2 className="text-base font-semibold text-slate-700 mt-1">
              員工每月出勤工時考核明細與薪資試算證明單
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              考勤週期月份：<strong className="text-slate-800 font-mono text-sm">{yearMonth}</strong> • 產表日期：{new Date().toISOString().split('T')[0]}
            </div>
          </div>

          {/* 員工基本資料 */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">員工姓名：</span>
              <strong className="text-sm">{employee.name} ({employee.englishName})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">員工編號：</span>
              <strong className="font-mono text-sm">{employee.employeeNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">所屬部門 / 職位：</span>
              <strong>{employee.department} · {employee.position}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">審定核算時薪：</span>
              <strong className="font-mono">NT$ {employee.hourlyWage} / hr</strong>
            </div>
          </div>

          {/* 總結核心指標 */}
          <div className="grid grid-cols-5 gap-2 py-3 bg-slate-50 rounded-xl my-3 text-center text-xs">
            <div className="p-1">
              <span className="text-slate-500 block">出勤天數</span>
              <strong className="text-sm">{presentDays} 天</strong>
            </div>
            <div className="p-1">
              <span className="text-slate-500 block">正工總工時</span>
              <strong className="text-sm font-mono">{totalWorkHours.toFixed(1)} 小時</strong>
            </div>
            <div className="p-1">
              <span className="text-slate-500 block">加班總時數</span>
              <strong className="text-sm font-mono text-rose-600">{totalOtHours.toFixed(1)} 小時</strong>
            </div>
            <div className="p-1">
              <span className="text-slate-500 block">預估加班費</span>
              <strong className="text-sm font-mono text-emerald-600">NT$ {otCalc.estimatedPay.toLocaleString()}</strong>
            </div>
            <div className="p-1">
              <span className="text-slate-500 block">遲到 / 早退</span>
              <strong className="text-sm">{lateCount} 次</strong>
            </div>
          </div>

          {/* 明細清單 */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2.5 font-bold">日期</th>
                  <th className="py-2 px-2.5 font-bold">簽到時間</th>
                  <th className="py-2 px-2.5 font-bold">簽退時間</th>
                  <th className="py-2 px-2.5 font-bold">工作時數</th>
                  <th className="py-2 px-2.5 font-bold">加班時數</th>
                  <th className="py-2 px-2.5 font-bold">狀態</th>
                  <th className="py-2 px-2.5 font-bold">事由備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empRecords.map(r => (
                  <tr key={r.id}>
                    <td className="py-1.5 px-2.5 font-mono">{r.date}</td>
                    <td className="py-1.5 px-2.5 font-mono">{r.clockInTime || '--:--'}</td>
                    <td className="py-1.5 px-2.5 font-mono">{r.clockOutTime || '--:--'}</td>
                    <td className="py-1.5 px-2.5 font-mono">{r.workHours || 0}</td>
                    <td className="py-1.5 px-2.5 font-mono">{r.overtimeHours > 0 ? `${r.overtimeHours}h` : '-'}</td>
                    <td className="py-1.5 px-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100">
                        {ATTENDANCE_STATUS_MAP[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-500 text-[11px] truncate max-w-[180px]">
                      {r.note || (r.isManualCorrection ? `[手動校正] ${r.correctionReason || ''}` : '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 簽名核決欄 */}
          <div className="mt-8 pt-4 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-xs text-slate-700">
            <div>
              <p className="font-bold mb-8">員工本人簽認：</p>
              <div className="border-b border-slate-400 w-44"></div>
              <span className="text-[10px] text-slate-400 mt-1 block">簽名日期：____年____月____日</span>
            </div>
            <div>
              <p className="font-bold mb-8">部門主管覆核：</p>
              <div className="border-b border-slate-400 w-44"></div>
              <span className="text-[10px] text-slate-400 mt-1 block">簽名日期：____年____月____日</span>
            </div>
            <div>
              <p className="font-bold mb-8">人資考勤權責覆核：</p>
              <div className="border-b border-slate-400 w-44"></div>
              <span className="text-[10px] text-slate-400 mt-1 block">簽名日期：____年____月____日</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
