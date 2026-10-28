import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  Clock,
  UserCheck,
  Building2,
  Bell,
  RefreshCw,
  Sliders,
  ChevronDown,
  Briefcase,
  Shield,
  FileCheck2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const {
    currentUser,
    setCurrentUser,
    employees,
    leaveApplications,
    overtimeApplications,
    resetToMockData,
    settings,
  } = useAttendance();

  // 即時時鐘
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingLeaves = leaveApplications.filter(a => a.status === 'pending').length;
  const pendingOvertimes = overtimeApplications.filter(a => a.status === 'pending').length;
  const totalPending = pendingLeaves + pendingOvertimes;

  // 格式化繁體中文即時時間
  const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const formattedDate = `${currentTime.getFullYear()}年${currentTime.getMonth() + 1}月${currentTime.getDate()}日 (${weekdays[currentTime.getDay()]})`;
  const formattedTime = currentTime.toTimeString().split(' ')[0];

  const navItems = [
    { id: 'punch', label: '出勤打卡', icon: Clock },
    { id: 'leave', label: '請假審批', icon: FileCheck2, badge: pendingLeaves },
    { id: 'overtime', label: '加班管理', icon: UserCheck, badge: pendingOvertimes },
    { id: 'reports', label: '工時統計與報表', icon: Briefcase },
    { id: 'personnel', label: '人事檔案名冊', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & 系統品牌 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  WorkPulse
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  出勤與人事系統
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-[220px]">
                {settings.companyName}
              </p>
            </div>
          </div>

          {/* 導航分頁 (中大螢幕) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 右側操作區：即時時間、角色切換器、系統設定 */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 即時時間小卡 (桌面端) */}
            <div className="hidden xl:flex flex-col items-end px-3 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-right">
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                {formattedTime}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {formattedDate}
              </span>
            </div>

            {/* 待審批通知快捷 (若有) */}
            {totalPending > 0 && (
              <button
                onClick={() => setActiveTab(pendingLeaves > 0 ? 'leave' : 'overtime')}
                title={`有 ${totalPending} 筆待審批案件`}
                className="relative p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              </button>
            )}

            {/* 角色/人員切換器 (方便體驗員工、主管、人資不同視角) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 transition-all text-left shadow-xs"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {currentUser.name}
                    </span>
                    {currentUser.role === 'hr_admin' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-1 rounded font-medium">
                        人資
                      </span>
                    )}
                    {currentUser.role === 'manager' && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1 rounded font-medium">
                        主管
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">
                    {currentUser.position}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* 切換人員下拉選單 */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      切換目前登入角色 / 員工視角
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setCurrentUser(emp);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          emp.id === currentUser.id ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {emp.department}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {emp.position} · {emp.role === 'hr_admin' ? '人資管理員' : emp.role === 'manager' ? '部門主管' : '一般同仁'}
                          </p>
                        </div>
                        {emp.id === currentUser.id && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700/60 p-2">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center justify-center space-x-2 text-xs py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>考勤規則設定</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 系統重設與設定按鈕 */}
            <button
              onClick={() => setResetConfirmOpen(true)}
              title="重設展示範例資料"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 手機板底部導覽 */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 重設資料確認 Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white mb-2">
              重設出勤與人事展示資料？
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              此操作將恢復預設的 8 位同仁檔案、本月出勤紀錄、待審批請假與加班案件，方便重新體驗完整流程。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2 px-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                取消
              </button>
              <button
                onClick={() => {
                  resetToMockData();
                  setResetConfirmOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                確定重設
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
