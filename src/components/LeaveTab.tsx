import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { LeaveType } from '../types';
import { LEAVE_TYPE_MAP } from '../utils/attendanceCalculators';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  User,
  ShieldCheck,
  AlertCircle,
  Search,
  Sliders,
  History,
  RotateCcw,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { LeaveEntitlementConfigModal } from './LeaveEntitlementConfigModal';

interface LeaveTabProps {
  onOpenLeaveModal: () => void;
}

export const LeaveTab: React.FC<LeaveTabProps> = ({ onOpenLeaveModal }) => {
  const {
    currentUser,
    leaveApplications,
    reviewLeave,
    cancelLeave,
    leaveTransactions,
    employees,
  } = useAttendance();

  const [activeSubTab, setActiveSubTab] = useState<'my' | 'approvals' | 'balances' | 'ledger'>('my');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewComment, setReviewComment] = useState<{ [id: string]: string }>({});
  const [unitMode, setUnitMode] = useState<'hours' | 'days'>('hours');
  const [balanceSearch, setBalanceSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  // 額度配置 Modal 狀態
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configTargetEmpId, setConfigTargetEmpId] = useState<string | undefined>(undefined);

  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'hr_admin';

  // 待審核案件
  const pendingApprovals = leaveApplications.filter(a => a.status === 'pending');
  // 個人請假紀錄
  const myApplications = leaveApplications.filter(a => a.employeeId === currentUser.id);

  const displayList = (activeSubTab === 'my' ? myApplications : leaveApplications).filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const handleApprove = (id: string) => {
    reviewLeave(id, 'approved', reviewComment[id] || '主管核准准假 (系統已自動扣抵額度)');
  };

  const handleReject = (id: string) => {
    reviewLeave(id, 'rejected', reviewComment[id] || '因專案時程緊湊暫不克准假');
  };

  const handleCancel = (id: string) => {
    if (confirm('確定要註銷此筆請假申請嗎？若先前已核准扣抵，系統將自動返還扣除的休假額度。')) {
      cancelLeave(id, '同仁線上主動申請註銷銷假');
    }
  };

  const handleOpenConfigForEmp = (empId: string) => {
    setConfigTargetEmpId(empId);
    setConfigModalOpen(true);
  };

  // 篩選額度總表員工
  const filteredEmployeesForBalance = employees.filter(emp => {
    if (selectedDeptFilter !== 'all' && emp.department !== selectedDeptFilter) return false;
    if (balanceSearch) {
      const q = balanceSearch.toLowerCase();
      if (!emp.name.toLowerCase().includes(q) && !emp.employeeNo.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 頂部：個人假別額度卡片橫列 */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {currentUser.name} 的休假額度概況
            </h2>
            <span className="text-xs text-slate-500 font-normal">
              (審批核准時自動扣除對應假別天數)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isManagerOrAdmin && (
              <button
                onClick={() => handleOpenConfigForEmp(currentUser.id)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                title="配置或調整休假額度"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>配置額度</span>
              </button>
            )}

            <button
              onClick={onOpenLeaveModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>申請請假</span>
            </button>
          </div>
        </div>

        {/* 額度卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {(['annual', 'compTime', 'sick', 'personal', 'menstrual', 'marriage'] as LeaveType[]).map(type => {
            const quota = currentUser.leaveBalances[type] || 0;
            const used = currentUser.leaveUsed[type] || 0;
            const remain = Math.max(0, quota - used);
            const meta = LEAVE_TYPE_MAP[type];

            return (
              <div
                key={type}
                className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {meta.label}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${meta.badgeBg} ${meta.color}`}>
                    可休
                  </span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {remain} <span className="text-xs font-normal text-slate-400">小時</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>已扣除: {used}h</span>
                  <span>初始額度: {quota}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 核心分頁切換：我的請假紀錄 / 待審批中心 / 員工休假額度總表 / 額度異動流水帳 */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('my')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSubTab === 'my'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              我的請假紀錄 ({myApplications.length})
            </button>
            
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveSubTab('approvals')}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  activeSubTab === 'approvals'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>待審批中心</span>
                {pendingApprovals.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}

            {/* 休假額度總表分頁 */}
            <button
              onClick={() => setActiveSubTab('balances')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'balances'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>休假額度總表</span>
            </button>

            {/* 額度異動流水帳 (Audit Log) */}
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'ledger'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>額度異動與扣除歷程 ({leaveTransactions.length})</span>
            </button>
          </div>

          {/* 狀態過濾器 (只在請假列表時顯示) */}
          {(activeSubTab === 'my' || activeSubTab === 'approvals') && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">狀態：</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'all' ? '全部' : st === 'pending' ? '待審批' : st === 'approved' ? '已核准' : '已駁回'}
                </button>
              ))}
            </div>
          )}

          {/* 額度總表切換單位 (小時 vs 天) */}
          {activeSubTab === 'balances' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">顯示單位：</span>
              <div className="bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg flex items-center">
                <button
                  onClick={() => setUnitMode('hours')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    unitMode === 'hours'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  小時 (hr)
                </button>
                <button
                  onClick={() => setUnitMode('days')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    unitMode === 'days'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  天數 (8h = 1天)
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 檢視 1 & 2: 請假清單列表 */}
        {(activeSubTab === 'my' || activeSubTab === 'approvals') && (
          <div>
            {displayList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                無符合條件之請假申請紀錄。
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {displayList.map(app => {
                  const meta = LEAVE_TYPE_MAP[app.leaveType] || { label: app.leaveType, badgeBg: 'bg-slate-100', color: 'text-slate-700' };
                  const isPending = app.status === 'pending';
                  const isApproved = app.status === 'approved';
                  const isRejected = app.status === 'rejected';
                  const isCancelled = app.status === 'cancelled';

                  return (
                    <div key={app.id} className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                          <Calendar className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {app.applicantName}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({app.department})
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${meta.badgeBg} ${meta.color}`}>
                              {meta.label}
                            </span>
                            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                              {app.totalHours} 小時 (約 {(app.totalHours / 8).toFixed(1)} 天)
                            </span>
                            {isApproved && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                ✓ 已自額度自動扣抵
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center text-slate-500">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {app.startDate} {app.startTime} ~ {app.endDate} {app.endTime}
                            </span>
                            {app.substituteName && (
                              <span className="flex items-center text-slate-500">
                                <User className="w-3.5 h-3.5 mr-1" />
                                職務代理人：{app.substituteName}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-500">事由：</span>
                            {app.reason}
                            {app.attachmentName && (
                              <span className="ml-2 text-[11px] text-blue-600 dark:text-blue-400 underline">
                                📎 {app.attachmentName}
                              </span>
                            )}
                          </p>

                          {app.reviewedAt && (
                            <div className="mt-1 text-[11px] text-slate-500">
                              審核人：{app.reviewerName} • 時間：{app.reviewedAt} • 意見：{app.reviewComment}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 右側操作與狀態 */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                        {isPending && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            待主管審批
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            已核准扣假
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            已駁回
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 flex items-center">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            已註銷 (額度已歸還)
                          </span>
                        )}

                        {/* 主管審核操作 */}
                        {isManagerOrAdmin && isPending && (
                          <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                            <input
                              type="text"
                              placeholder="審核備註"
                              value={reviewComment[app.id] || ''}
                              onChange={e => setReviewComment({ ...reviewComment, [app.id]: e.target.value })}
                              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-32"
                            />
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              准假扣抵
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              駁回
                            </button>
                          </div>
                        )}

                        {/* 撤銷 / 銷假按鈕 */}
                        {(isPending || isApproved) && (app.employeeId === currentUser.id || isManagerOrAdmin) && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="申請銷假並歸還扣除之休假額度"
                          >
                            註銷銷假
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 檢視 3: 員工休假額度總表 (Employee Leave Balances & Entitlements) */}
        {activeSubTab === 'balances' && (
          <div className="space-y-4">
            
            {/* 搜尋與部門快篩 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">部門：</span>
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="all">全公司部門</option>
                  <option value="研發工程部">研發工程部</option>
                  <option value="產品設計部">產品設計部</option>
                  <option value="市場行銷部">市場行銷部</option>
                  <option value="業務拓展部">業務拓展部</option>
                  <option value="人資與行政部">人資與行政部</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="搜尋同仁姓名或工號..."
                  value={balanceSearch}
                  onChange={e => setBalanceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* 總表 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-3 font-bold">工號/姓名</th>
                    <th className="py-3 px-3 font-bold">部門單位</th>
                    <th className="py-3 px-3 font-bold text-center">
                      <span className="text-blue-600 dark:text-blue-400">特別休假 (特休)</span>
                      <span className="text-[10px] text-slate-400 block font-normal">初始 / 已休 / 剩餘</span>
                    </th>
                    <th className="py-3 px-3 font-bold text-center">
                      <span className="text-emerald-600 dark:text-emerald-400">加班補休</span>
                      <span className="text-[10px] text-slate-400 block font-normal">核給 / 已扣 / 剩餘</span>
                    </th>
                    <th className="py-3 px-3 font-bold text-center">
                      <span className="text-rose-600 dark:text-rose-400">普通傷病假</span>
                      <span className="text-[10px] text-slate-400 block font-normal">額度 / 已休 / 剩餘</span>
                    </th>
                    <th className="py-3 px-3 font-bold text-center">
                      <span className="text-amber-600 dark:text-amber-400">事假</span>
                      <span className="text-[10px] text-slate-400 block font-normal">額度 / 已休 / 剩餘</span>
                    </th>
                    <th className="py-3 px-3 font-bold text-center">其他假別餘額</th>
                    <th className="py-3 px-3 font-bold text-right">額度管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredEmployeesForBalance.map(emp => {
                    const toVal = (hrs: number) => unitMode === 'days' ? (hrs / 8).toFixed(1) : hrs;
                    const unitSuffix = unitMode === 'days' ? '天' : 'h';

                    const annualRem = Math.max(0, emp.leaveBalances.annual - emp.leaveUsed.annual);
                    const compRem = Math.max(0, emp.leaveBalances.compTime - emp.leaveUsed.compTime);
                    const sickRem = Math.max(0, emp.leaveBalances.sick - emp.leaveUsed.sick);
                    const persRem = Math.max(0, emp.leaveBalances.personal - emp.leaveUsed.personal);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
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
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {emp.department}
                        </td>

                        {/* 特休 */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-xs">
                            <span className="text-slate-400">{toVal(emp.leaveBalances.annual)}</span> /{' '}
                            <span className="text-rose-500 font-semibold">{toVal(emp.leaveUsed.annual)}</span> /{' '}
                            <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {toVal(annualRem)} {unitSuffix}
                            </strong>
                          </div>
                        </td>

                        {/* 補休 */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-xs">
                            <span className="text-slate-400">{toVal(emp.leaveBalances.compTime)}</span> /{' '}
                            <span className="text-rose-500 font-semibold">{toVal(emp.leaveUsed.compTime)}</span> /{' '}
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                              {toVal(compRem)} {unitSuffix}
                            </strong>
                          </div>
                        </td>

                        {/* 病假 */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-xs">
                            <span className="text-slate-400">{toVal(emp.leaveBalances.sick)}</span> /{' '}
                            <span className="text-rose-500">{toVal(emp.leaveUsed.sick)}</span> /{' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {toVal(sickRem)} {unitSuffix}
                            </strong>
                          </div>
                        </td>

                        {/* 事假 */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-xs">
                            <span className="text-slate-400">{toVal(emp.leaveBalances.personal)}</span> /{' '}
                            <span className="text-rose-500">{toVal(emp.leaveUsed.personal)}</span> /{' '}
                            <strong className="text-slate-700 dark:text-slate-200">
                              {toVal(persRem)} {unitSuffix}
                            </strong>
                          </div>
                        </td>

                        {/* 其他假別 */}
                        <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                          生理 {toVal(emp.leaveBalances.menstrual - emp.leaveUsed.menstrual)}h · 婚 {toVal(emp.leaveBalances.marriage - emp.leaveUsed.marriage)}h
                        </td>

                        {/* 操作配置按鈕 */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenConfigForEmp(emp.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            配置額度
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

        {/* 檢視 4: 休假額度異動流水帳 (Audit Log & Transaction Ledger) */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <p>
                記錄每一筆核准請假自動扣抵、銷假歸還、期初額度配發與加班換補休之完整審計紀錄
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-3 font-bold">異動時間</th>
                    <th className="py-3 px-3 font-bold">同仁姓名/工號</th>
                    <th className="py-3 px-3 font-bold">假別</th>
                    <th className="py-3 px-3 font-bold">異動類型</th>
                    <th className="py-3 px-3 font-bold">異動時數</th>
                    <th className="py-3 px-3 font-bold">異動後可用餘額</th>
                    <th className="py-3 px-3 font-bold">異動事由說明</th>
                    <th className="py-3 px-3 font-bold">經辦審核人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {leaveTransactions.map(tx => {
                    const meta = LEAVE_TYPE_MAP[tx.leaveType] || { label: tx.leaveType, badgeBg: 'bg-slate-100', color: 'text-slate-700' };
                    const isDeduction = tx.amountHours < 0;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {tx.createdAt}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {tx.employeeName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.badgeBg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {tx.actionType === 'leave_deduction' && (
                            <span className="text-rose-600 font-semibold flex items-center">
                              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                              核准扣抵
                            </span>
                          )}
                          {tx.actionType === 'leave_refund' && (
                            <span className="text-emerald-600 font-semibold flex items-center">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              銷假返還
                            </span>
                          )}
                          {tx.actionType === 'overtime_accrual' && (
                            <span className="text-indigo-600 font-semibold flex items-center">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              加班補休轉入
                            </span>
                          )}
                          {tx.actionType === 'annual_accrual' && (
                            <span className="text-blue-600 font-semibold flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-0.5" />
                              年資特休發放
                            </span>
                          )}
                          {tx.actionType === 'initial_grant' && (
                            <span className="text-purple-600 font-semibold">
                              期初額度配置
                            </span>
                          )}
                          {tx.actionType === 'manual_adjustment' && (
                            <span className="text-slate-600 font-semibold">
                              手動調整
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          <span className={isDeduction ? 'text-rose-600' : 'text-emerald-600'}>
                            {tx.amountHours > 0 ? `+${tx.amountHours}` : tx.amountHours} 小時
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tx.balanceAfterHours} 小時
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-[240px] truncate" title={tx.reason}>
                          {tx.reason}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {tx.operatorName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* 休假額度配置 Modal */}
      <LeaveEntitlementConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        targetEmployeeId={configTargetEmpId}
      />

    </div>
  );
};
