import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  Flame,
  Clock,
  Plus,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  Coins,
} from 'lucide-react';

interface OvertimeTabProps {
  onOpenOvertimeModal: () => void;
}

export const OvertimeTab: React.FC<OvertimeTabProps> = ({ onOpenOvertimeModal }) => {
  const { currentUser, overtimeApplications, reviewOvertime } = useAttendance();
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'approvals'>('my');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewComment, setReviewComment] = useState<{ [id: string]: string }>({});

  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'hr_admin';

  const myApplications = overtimeApplications.filter(a => a.employeeId === currentUser.id);
  const pendingApprovals = overtimeApplications.filter(a => a.status === 'pending');

  const displayList = (activeSubTab === 'my' ? myApplications : overtimeApplications).filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  // 統計數據
  const totalMyOtHours = myApplications
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + a.totalHours, 0);

  const totalMyOtPay = myApplications
    .filter(a => a.status === 'approved' && a.compensationType === 'overtime_pay')
    .reduce((sum, a) => sum + a.estimatedPay, 0);

  const totalMyCompHours = myApplications
    .filter(a => a.status === 'approved' && a.compensationType === 'comp_time')
    .reduce((sum, a) => sum + a.totalHours, 0);

  const handleApprove = (id: string) => {
    reviewOvertime(id, 'approved', reviewComment[id] || '主管確認加班事實，准予核銷');
  };

  const handleReject = (id: string) => {
    reviewOvertime(id, 'rejected', reviewComment[id] || '非緊急業務情事駁回');
  };

  return (
    <div className="space-y-6">
      
      {/* 頂部數據卡與法規指南 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* 個人累計核准加班時數 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">本月核准加班工時</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {totalMyOtHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">小時</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            包含加班費與換補休時數
          </span>
        </div>

        {/* 預估加班費核發 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">核發加班費累計</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            NT$ {totalMyOtPay.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            以時薪 NT$ {currentUser.hourlyWage} 階梯倍率計
          </span>
        </div>

        {/* 累積換補休 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">加班轉換補休餘額</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {currentUser.leaveBalances.compTime - currentUser.leaveUsed.compTime} <span className="text-xs font-normal text-slate-400">小時可用</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            累計核定 {currentUser.leaveBalances.compTime}h / 已休 {currentUser.leaveUsed.compTime}h
          </span>
        </div>

        {/* 申請加班按鈕卡 */}
        <div className="bg-gradient-to-br from-rose-600 to-pink-600 p-5 rounded-3xl text-white shadow-md shadow-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold opacity-90">延長工時申請</div>
            <div className="text-sm font-bold mt-1">登記今日或專案加班</div>
          </div>
          <button
            onClick={onOpenOvertimeModal}
            className="mt-4 w-full py-2 bg-white text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors shadow-xs flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>申請加班</span>
          </button>
        </div>

      </div>

      {/* 法規試算規範說明條 */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-800 dark:text-amber-300">勞動基準法第 24 條延長工作時間工資給付標準：</span>
          平日工作時間在 2 小時以內者，按平日每小時工資額加給 1/3 (約 1.34 倍)；再延長工作時間在 2 小時以內者，加給 2/3 (約 1.67 倍)。本系統自動精確切分階梯級距，同仁可自由選擇領取加班費或 1:1 轉換為補休額度。
        </div>
      </div>

      {/* 列表與審批分頁 */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('my')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSubTab === 'my'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              我的加班紀錄 ({myApplications.length})
            </button>
            
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveSubTab('approvals')}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  activeSubTab === 'approvals'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>加班審批中心</span>
                {pendingApprovals.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* 狀態過濾 */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">狀態篩選：</span>
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
        </div>

        {/* 加班清單 */}
        {displayList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            目前無任何加班紀錄。
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {displayList.map(app => {
              const isPending = app.status === 'pending';
              const isApproved = app.status === 'approved';
              const isRejected = app.status === 'rejected';

              return (
                <div key={app.id} className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* 左側資訊 */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5">
                      <Flame className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.applicantName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({app.department})
                        </span>
                        <span className="text-xs font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded">
                          {app.totalHours} 小時
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          app.compensationType === 'overtime_pay'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          {app.compensationType === 'overtime_pay'
                            ? `發加班費 (NT$ ${app.estimatedPay.toLocaleString()})`
                            : '換取補休 (存入額度)'}
                        </span>
                      </div>

                      <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center text-slate-500">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {app.date} {app.startTime} ~ {app.endTime}
                        </span>
                        <span className="text-slate-500">
                          專案：<strong className="text-slate-700 dark:text-slate-200">{app.project}</strong>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          (1.34x: {app.breakdown.tier1Hours}h, 1.67x: {app.breakdown.tier2Hours}h)
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-500">加班事由：</span>
                        {app.reason}
                      </p>

                      {app.reviewedAt && (
                        <div className="mt-1 text-[11px] text-slate-500">
                          審核人：{app.reviewerName} • 時間：{app.reviewedAt} • 意見：{app.reviewComment}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右側：狀態或審批操作 */}
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
                        已核准
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        已駁回
                      </span>
                    )}

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
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                        >
                          核准
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                        >
                          駁回
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
