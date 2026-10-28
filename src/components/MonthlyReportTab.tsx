import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRecord, Department, Employee } from '../types';
import {
  exportAttendanceToCSV,
  exportEmployeeSummaryCSV,
  calculateOvertimeBreakdown,
  ATTENDANCE_STATUS_MAP,
} from '../utils/attendanceCalculators';
import {
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  Search,
  Building,
} from 'lucide-react';
import { PrintReportModal } from './PrintReportModal';

interface MonthlyReportTabProps {
  onOpenCorrectionModal: (record?: AttendanceRecord) => void;
}

export const MonthlyReportTab: React.FC<MonthlyReportTabProps> = ({ onOpenCorrectionModal }) => {
  const { attendanceRecords, employees, settings, currentUser } = useAttendance();

  // 年月選擇器
  const [selectedYearMonth, setSelectedYearMonth] = useState('2026-10');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeView, setActiveView] = useState<'daily' | 'summary'>('daily');

  // 列印預覽彈窗狀態
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTargetEmployee, setPrintTargetEmployee] = useState<Employee>(currentUser);

  // 篩選本月紀錄
  const monthRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date.startsWith(selectedYearMonth));
  }, [attendanceRecords, selectedYearMonth]);

  // 篩選員工
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
      if (selectedEmployeeId !== 'all' && emp.id !== selectedEmployeeId) return false;
      if (searchKeyword) {
        const matchName = emp.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchNo = emp.employeeNo.toLowerCase().includes(searchKeyword.toLowerCase());
        if (!matchName && !matchNo) return false;
      }
      return true;
    });
  }, [employees, selectedDept, selectedEmployeeId, searchKeyword]);

  const filteredEmpIds = useMemo(() => new Set(filteredEmployees.map(e => e.id)), [filteredEmployees]);

  // 篩選考勤流水
  const filteredRecords = useMemo(() => {
    return monthRecords
      .filter(r => {
        if (!filteredEmpIds.has(r.employeeId)) return false;
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'overtime') {
            if (r.overtimeHours <= 0) return false;
          } else if (r.status !== selectedStatus) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthRecords, filteredEmpIds, selectedStatus]);

  // 每月核心 KPI 統計
  const summaryKpis = useMemo(() => {
    const presentRecords = monthRecords.filter(r => r.clockInTime);
    const totalNormalHours = monthRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const totalOvertimeHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const lateCount = monthRecords.filter(r => r.lateMinutes > 0).length;
    const earlyCount = monthRecords.filter(r => r.earlyLeaveMinutes > 0).length;

    // 總預估加班費
    const empMap = new Map(employees.map(e => [e.id, e]));
    let totalEstimatedOtPay = 0;
    monthRecords.forEach(r => {
      const emp = empMap.get(r.employeeId);
      if (emp && r.overtimeHours > 0) {
        const { estimatedPay } = calculateOvertimeBreakdown(r.overtimeHours, emp.hourlyWage);
        totalEstimatedOtPay += estimatedPay;
      }
    });

    const standardTotalWorkDays = 22 * employees.length; // 預估基準
    const attendanceRate = Math.min(100, Math.round((presentRecords.length / standardTotalWorkDays) * 100));

    return {
      presentDays: presentRecords.length,
      totalNormalHours: Number(totalNormalHours.toFixed(1)),
      totalOvertimeHours: Number(totalOvertimeHours.toFixed(1)),
      totalEstimatedOtPay,
      lateCount,
      earlyCount,
      attendanceRate,
    };
  }, [monthRecords, employees]);

  // 下載明細 CSV
  const handleExportDailyCSV = () => {
    exportAttendanceToCSV(filteredRecords, employees, selectedYearMonth);
  };

  // 下載月彙總結算 CSV
  const handleExportSummaryCSV = () => {
    exportEmployeeSummaryCSV(filteredEmployees, monthRecords, selectedYearMonth);
  };

  const handleOpenPrint = (emp: Employee) => {
    setPrintTargetEmployee(emp);
    setPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 頂部操作與篩選工具列 */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* 左側：月份與檢視切換 */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">選擇考勤月份：</span>
              <input
                type="month"
                value={selectedYearMonth}
                onChange={e => setSelectedYearMonth(e.target.value)}
                className="bg-transparent text-xs font-bold font-mono text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>

            {/* 視圖切換 */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'daily'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                每日考勤流水
              </button>
              <button
                onClick={() => setActiveView('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'summary'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                員工月工時彙總
              </button>
            </div>
          </div>

          {/* 右側：匯出報表按鈕群 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportDailyCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="匯出符合 Excel 格式的每日出勤 UTF-8 BOM CSV"
            >
              <Download className="w-4 h-4" />
              <span>匯出流水 CSV</span>
            </button>

            <button
              onClick={handleExportSummaryCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="匯出員工每人工時結算薪資報表 CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>匯出月彙總 CSV</span>
            </button>

            <button
              onClick={() => handleOpenPrint(currentUser)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              title="列印或轉存為正式考勤簽核 PDF"
            >
              <Printer className="w-4 h-4" />
              <span>列印考勤單</span>
            </button>
          </div>

        </div>

        {/* 篩選條件過濾列 */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 部門篩選 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">部門篩選：</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">全部部門 (5 個部門)</option>
              <option value="研發工程部">研發工程部</option>
              <option value="產品設計部">產品設計部</option>
              <option value="市場行銷部">市場行銷部</option>
              <option value="業務拓展部">業務拓展部</option>
              <option value="人資與行政部">人資與行政部</option>
            </select>
          </div>

          {/* 員工篩選 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">特定同仁：</label>
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">全體同仁 ({employees.length} 位)</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeNo} - {e.department})
                </option>
              ))}
            </select>
          </div>

          {/* 出勤狀態篩選 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">出勤狀態：</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">全部狀態</option>
              <option value="normal">正常出勤</option>
              <option value="late">遲到</option>
              <option value="early_leave">早退</option>
              <option value="on_leave">請假</option>
              <option value="overtime">延長加班 (&gt; 0h)</option>
            </select>
          </div>

          {/* 搜尋關鍵字 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">快速搜尋：</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="搜尋姓名或工號..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 每月考勤核心 KPI 指標卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">實際出勤人次</span>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {summaryKpis.presentDays} <span className="text-xs font-normal text-slate-400">人天</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            出勤率 {summaryKpis.attendanceRate}%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">正常總工時</span>
          <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
            {summaryKpis.totalNormalHours} <span className="text-xs font-normal text-slate-400">小時</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">扣除午休 60 分鐘</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">加班總工時</span>
          <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {summaryKpis.totalOvertimeHours} <span className="text-xs font-normal text-slate-400">小時</span>
          </div>
          <span className="text-[10px] text-rose-500 mt-1 block">超過標準下班時間</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">預估加班費總支出</span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            NT$ {summaryKpis.totalEstimatedOtPay.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">依勞基法階梯倍率</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">遲到次數</span>
          <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {summaryKpis.lateCount} <span className="text-xs font-normal text-slate-400">次</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">超過彈性 {settings.flexibleMinutes} 分鐘</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">早退次數</span>
          <div className="text-xl font-black font-mono text-orange-600 dark:text-orange-400 mt-1">
            {summaryKpis.earlyCount} <span className="text-xs font-normal text-slate-400">次</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">未達標準工時提前離開</span>
        </div>

      </div>

      {/* 主體資料檢視表格 */}
      {activeView === 'daily' ? (
        /* 每日考勤流水明細檢視 */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                考勤打卡流水明細表 ({filteredRecords.length} 筆紀錄)
              </h3>
              <p className="text-xs text-slate-500">
                可點擊右側「校正」進行手動補卡或時間補登
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3 font-bold">出勤日期</th>
                  <th className="py-3 px-3 font-bold">工號/姓名</th>
                  <th className="py-3 px-3 font-bold">部門</th>
                  <th className="py-3 px-3 font-bold">簽到時間 / 方式</th>
                  <th className="py-3 px-3 font-bold">簽退時間</th>
                  <th className="py-3 px-3 font-bold">工作時數</th>
                  <th className="py-3 px-3 font-bold">加班時數 / 費用</th>
                  <th className="py-3 px-3 font-bold">出勤狀態</th>
                  <th className="py-3 px-3 font-bold">備註說明</th>
                  <th className="py-3 px-3 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      查無符合篩選條件的出勤紀錄。
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => {
                    const emp = employees.find(e => e.id === rec.employeeId);
                    const statusMeta = ATTENDANCE_STATUS_MAP[rec.status] || ATTENDANCE_STATUS_MAP.normal;
                    const otCalc = emp ? calculateOvertimeBreakdown(rec.overtimeHours, emp.hourlyWage) : { estimatedPay: 0 };

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {rec.date}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            {emp && (
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {emp?.name || '未知員工'}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {emp?.employeeNo}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {emp?.department}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {rec.clockInTime || '--:--'}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {rec.clockInType === 'remote' ? '🏠 遠端 WFH' : rec.clockInType === 'field' ? '🚗 外出公出' : '🏢 總部辦公室'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800 dark:text-slate-200">
                          {rec.clockOutTime || '--:--'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {rec.workHours}h
                        </td>
                        <td className="py-3 px-3">
                          {rec.overtimeHours > 0 ? (
                            <div>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                +{rec.overtimeHours}h
                              </span>
                              <span className="text-[10px] text-emerald-600 block font-mono">
                                NT$ {otCalc.estimatedPay.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusMeta.bg} ${statusMeta.text}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 max-w-[160px] truncate">
                          {rec.isManualCorrection ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              [已校正] {rec.correctionReason}
                            </span>
                          ) : (
                            rec.note || '-'
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenCorrectionModal(rec)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="手動校正或補卡"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 員工月結算統計報表檢視 (薪資結算準備) */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                員工月工時彙總結算清單 ({filteredEmployees.length} 位同仁)
              </h3>
              <p className="text-xs text-slate-500">
                每月工時結算、出勤率考核與加班費發放依據
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3 font-bold">員工工號/姓名</th>
                  <th className="py-3 px-3 font-bold">部門 / 職位</th>
                  <th className="py-3 px-3 font-bold">核算時薪</th>
                  <th className="py-3 px-3 font-bold">實際出勤天數</th>
                  <th className="py-3 px-3 font-bold">正工總時數</th>
                  <th className="py-3 px-3 font-bold">加班總時數</th>
                  <th className="py-3 px-3 font-bold">預估加班費</th>
                  <th className="py-3 px-3 font-bold">遲到 / 早退</th>
                  <th className="py-3 px-3 font-bold">出勤率</th>
                  <th className="py-3 px-3 font-bold text-right">出勤證明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredEmployees.map(emp => {
                  const empRecords = monthRecords.filter(r => r.employeeId === emp.id);
                  const presentDays = empRecords.filter(r => r.clockInTime).length;
                  const totalWorkHours = empRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
                  const totalOtHours = empRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
                  const lateCount = empRecords.filter(r => r.lateMinutes > 0).length;
                  const earlyCount = empRecords.filter(r => r.earlyLeaveMinutes > 0).length;
                  const otCalc = calculateOvertimeBreakdown(totalOtHours, emp.hourlyWage);
                  const attendanceRate = Math.min(100, Math.round((presentDays / 22) * 100));

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {emp.employeeNo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 dark:text-slate-200">{emp.department}</span>
                        <span className="text-[10px] text-slate-400 block">{emp.position}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        NT$ {emp.hourlyWage}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {presentDays} / 22 天
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {totalWorkHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {totalOtHours > 0 ? `${totalOtHours.toFixed(1)}h` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        NT$ {otCalc.estimatedPay.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {lateCount > 0 || earlyCount > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            遲 {lateCount} / 早 {earlyCount}
                          </span>
                        ) : (
                          <span className="text-emerald-600">全勤無異常</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono font-bold">{attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenPrint(emp)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
                        >
                          簽核單
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 考勤證明列印彈窗 */}
      <PrintReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        yearMonth={selectedYearMonth}
        employee={printTargetEmployee}
        records={monthRecords}
        settings={settings}
      />

    </div>
  );
};
