import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAttendance } from '../context/AttendanceContext';
import { WorkMode } from '../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  Home,
  Briefcase,
  Sparkles,
  Calendar,
  Coffee,
  ChevronRight,
  TrendingUp,
  FileEdit,
  Flame,
  Users,
} from 'lucide-react';
import { ATTENDANCE_STATUS_MAP } from '../utils/attendanceCalculators';

interface ClockPunchCardProps {
  onOpenLeaveModal: () => void;
  onOpenOvertimeModal: (prefilledHours?: number) => void;
  onOpenCorrectionModal: () => void;
  onViewReports: () => void;
}

export const ClockPunchCard: React.FC<ClockPunchCardProps> = ({
  onOpenLeaveModal,
  onOpenOvertimeModal,
  onOpenCorrectionModal,
  onViewReports,
}) => {
  const {
    currentUser,
    todayRecord,
    clockIn,
    clockOut,
    settings,
    attendanceRecords,
    employees,
    currentDateStr,
  } = useAttendance();

  // 即時時鐘
  const [time, setTime] = useState<Date>(new Date());
  const [workMode, setWorkMode] = useState<WorkMode>('office');
  const [note, setNote] = useState('');
  const [locating, setLocating] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(true);
  const [gpsLocationText, setGpsLocationText] = useState(settings.officeAddress);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info' | 'warn'; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 當切換工作模式時自動切換預設地點
  useEffect(() => {
    if (workMode === 'office') {
      setGpsLocationText(settings.officeAddress);
      setGpsVerified(true);
    } else if (workMode === 'remote') {
      setGpsLocationText('居家遠端 (台北內湖住處)');
      setGpsVerified(true);
    } else {
      setGpsLocationText('客戶端現場 (台北南港經貿園區)');
      setGpsVerified(true);
    }
  }, [workMode, settings.officeAddress]);

  const handleSimulateGps = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      setGpsVerified(true);
      setAlertMessage({
        type: 'success',
        text: 'GPS 定位校驗成功：誤差 ±8m，符合公司出勤範圍！',
      });
      setTimeout(() => setAlertMessage(null), 4000);
    }, 600);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
    });
  };

  const handleClockIn = () => {
    const result = clockIn(workMode, note, gpsLocationText);
    triggerConfetti();
    setAlertMessage({
      type: 'success',
      text: result.message,
    });
    setNote('');
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleClockOut = () => {
    const result = clockOut(workMode, note, gpsLocationText);
    triggerConfetti();
    setAlertMessage({
      type: 'success',
      text: result.message,
    });
    setNote('');
    setTimeout(() => setAlertMessage(null), 5000);

    // 若有加班時數，自動彈出加班申請詢問
    if (result.overtimeHours > 0) {
      setTimeout(() => {
        onOpenOvertimeModal(result.overtimeHours);
      }, 1200);
    }
  };

  // 即時計算今日進行中工時
  const hasClockedIn = Boolean(todayRecord?.clockInTime);
  const hasClockedOut = Boolean(todayRecord?.clockOutTime);

  let currentWorkingHours = 0;
  if (hasClockedIn && !hasClockedOut && todayRecord?.clockInTime) {
    const [h, m] = todayRecord.clockInTime.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(h, m, 0, 0);
    const diffMs = Math.max(0, time.getTime() - inDate.getTime());
    currentWorkingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  } else if (hasClockedOut) {
    currentWorkingHours = todayRecord?.workHours || 8;
  }

  // 預計正常下班時間
  let expectedClockOut = settings.standardEndTime;
  if (hasClockedIn && todayRecord?.clockInTime) {
    const [inH, inM] = todayRecord.clockInTime.split(':').map(Number);
    const inMinutes = inH * 60 + inM;
    const stdStartMinutes = 9 * 60; // 09:00
    const delay = Math.min(settings.flexibleMinutes, Math.max(0, inMinutes - stdStartMinutes));
    const targetMin = 18 * 60 + delay;
    const expH = Math.floor(targetMin / 60);
    const expM = targetMin % 60;
    expectedClockOut = `${String(expH).padStart(2, '0')}:${String(expM).padStart(2, '0')}`;
  }

  // 今日全公司出勤快照
  const todayRecordsAll = attendanceRecords.filter(r => r.date === currentDateStr);
  const totalEmployeesCount = employees.length;
  const clockedInCount = todayRecordsAll.filter(r => r.clockInTime).length;
  const onLeaveCount = todayRecordsAll.filter(r => r.status === 'on_leave').length;
  const remoteCount = todayRecordsAll.filter(r => r.clockInType === 'remote').length;
  const unrecordedCount = Math.max(0, totalEmployeesCount - clockedInCount - onLeaveCount);

  return (
    <div className="space-y-6">
      
      {/* 提示 Alert */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 transition-all animate-in fade-in slide-in-from-top-2 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{alertMessage.text}</span>
        </div>
      )}

      {/* 主面板網格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左側：大型打卡終端機 (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden">
          
          {/* 背景裝飾光暈 */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* 上方：使用者身分與今日狀態標籤 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">
                    ({currentUser.employeeNo})
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.department} · {currentUser.position}
                </p>
              </div>
            </div>

            {/* 今日狀態 Badge */}
            <div className="flex items-center space-x-2">
              {hasClockedOut ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>今日已打卡簽退</span>
                </span>
              ) : hasClockedIn ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>出勤中 ({todayRecord?.clockInTime?.substring(0, 5)} 簽到)</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>今日尚未簽到</span>
                </span>
              )}
            </div>
          </div>

          {/* 即時大時鐘顯示 */}
          <div className="my-6 text-center py-6 px-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 relative">
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {time.toTimeString().split(' ')[0]}
            </div>
            <div className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                {time.getFullYear()} 年 {time.getMonth() + 1} 月 {time.getDate()} 日
              </span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                標準班表 {currentUser.standardStartTime} ~ {currentUser.standardEndTime} (彈性 {settings.flexibleMinutes} 分鐘)
              </span>
            </div>
          </div>

          {/* 出勤模式選擇 */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              選擇出勤型態：
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'office', label: '台北總部', icon: Building2, desc: '辦公室打卡' },
                { id: 'remote', label: '居家遠端', icon: Home, desc: 'WFH 辦公' },
                { id: 'field', label: '外勤公出', icon: Briefcase, desc: '拜訪客戶' },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = workMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setWorkMode(m.id as WorkMode)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GPS 定位資訊與模擬按鈕 */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    打卡定位地點
                  </span>
                  {gpsVerified && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                      已校驗
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {gpsLocationText}
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulateGps}
              disabled={locating}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex-shrink-0"
            >
              {locating ? '定位中...' : '重新定位'}
            </button>
          </div>

          {/* 備註填寫 (如外勤客戶、請假替代等) */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="打卡備註 (選填，例如：拜訪信義客戶、專案會議簽到)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 雙重主要操作按鈕：上班簽到 / 下班簽退 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 上班簽到按鈕 */}
            <button
              onClick={handleClockIn}
              disabled={hasClockedIn}
              className={`relative overflow-hidden py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                hasClockedIn
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-[0.98]'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>
                {hasClockedIn
                  ? `上班已打卡 (${todayRecord?.clockInTime?.substring(0, 5)})`
                  : '上班簽到 (Clock-In)'}
              </span>
            </button>

            {/* 下班簽退按鈕 */}
            <button
              onClick={handleClockOut}
              disabled={hasClockedOut}
              className={`relative overflow-hidden py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                hasClockedOut
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-600'
                  : hasClockedIn
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25 active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {hasClockedOut
                  ? `下班已簽退 (${todayRecord?.clockOutTime?.substring(0, 5)})`
                  : '下班簽退 (Clock-Out)'}
              </span>
            </button>
          </div>

          {/* 忘記打卡快速補正 */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
            <span>忘記打卡或時間有誤？</span>
            <button
              onClick={onOpenCorrectionModal}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center space-x-1"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>填寫補卡申請</span>
            </button>
          </div>
        </div>

        {/* 右側：今日出勤儀表、加班提醒與捷徑 (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 今日工時追蹤卡片 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>今日出勤追蹤</span>
              </h3>
              <span className="text-xs text-slate-500">
                {currentDateStr}
              </span>
            </div>

            {/* 工時統計格 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  簽到記錄
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {todayRecord?.clockInTime ? todayRecord.clockInTime.substring(0, 5) : '--:--'}
                </div>
                <span className="text-[10px] text-slate-500">
                  {todayRecord?.lateMinutes && todayRecord.lateMinutes > 0
                    ? `遲到 ${todayRecord.lateMinutes} 分鐘`
                    : '標準時間內簽到'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  簽退記錄 / 預計下班
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {todayRecord?.clockOutTime
                    ? todayRecord.clockOutTime.substring(0, 5)
                    : expectedClockOut}
                </div>
                <span className="text-[10px] text-slate-500">
                  {todayRecord?.clockOutTime ? '已簽退' : '預估滿 8 小時'}
                </span>
              </div>
            </div>

            {/* 累積工時進度條 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-400">目前累積工作工時</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {currentWorkingHours} / 8.0 小時
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentWorkingHours / 8) * 100)}%` }}
                ></div>
              </div>

              {/* 超過標準工時提示 */}
              {currentWorkingHours > 8.0 && (
                <div className="mt-3 flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                  <Flame className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-bold">已達延長工時條件：</span>
                    <span>
                      本日已滿 8 小時，超過工時約 {(currentWorkingHours - 8).toFixed(1)} 小時，下班時可一鍵換算加班費或累積補休。
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 快速申請三按鈕 */}
            <div className="mt-4 grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={onOpenLeaveModal}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>線上請假</span>
              </button>
              <button
                onClick={() => onOpenOvertimeModal()}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>加班申請</span>
              </button>
            </div>
          </div>

          {/* 今日全體同仁出勤快照 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>今日全公司出勤快照</span>
              </h3>
              <button
                onClick={onViewReports}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center"
              >
                <span>完整考勤月表</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block">編制同仁</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{totalEmployeesCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 text-emerald-800 dark:text-emerald-300">
                <span className="text-[10px] block">已簽到</span>
                <span className="text-lg font-bold">{clockedInCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 text-blue-800 dark:text-blue-300">
                <span className="text-[10px] block">遠端 WFH</span>
                <span className="text-lg font-bold">{remoteCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 text-amber-800 dark:text-amber-300">
                <span className="text-[10px] block">休假中</span>
                <span className="text-lg font-bold">{onLeaveCount}</span>
              </div>
            </div>

            {/* 快速名單頭像輪播 */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">已簽到同仁即時概況：</span>
              <div className="flex items-center -space-x-2 overflow-hidden py-1">
                {employees.map(emp => {
                  const empToday = todayRecordsAll.find(r => r.employeeId === emp.id);
                  const isPresent = Boolean(empToday?.clockInTime);
                  return (
                    <img
                      key={emp.id}
                      src={emp.avatar}
                      alt={emp.name}
                      title={`${emp.name} (${emp.department}) - ${isPresent ? `已打卡 ${empToday?.clockInTime}` : '尚未簽到'}`}
                      className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover ${
                        isPresent ? 'ring-2 ring-emerald-500 opacity-100' : 'opacity-40 grayscale'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
