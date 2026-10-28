import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Employee, Department } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Building,
  Mail,
  Phone,
  Edit2,
  Trash2,
  LogIn,
  DollarSign,
  Calendar,
  Briefcase,
  Shield,
} from 'lucide-react';
import { EmployeeEditModal } from './EmployeeEditModal';

export const EmployeeDirectoryTab: React.FC = () => {
  const { employees, currentUser, setCurrentUser, deleteEmployee } = useAttendance();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchName = emp.name.toLowerCase().includes(query) || emp.englishName.toLowerCase().includes(query);
        const matchNo = emp.employeeNo.toLowerCase().includes(query);
        const matchPos = emp.position.toLowerCase().includes(query);
        if (!matchName && !matchNo && !matchPos) return false;
      }
      return true;
    });
  }, [employees, selectedDept, search]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setModalOpen(true);
  };

  const handleDelete = (emp: Employee) => {
    if (employees.length <= 1) {
      alert('系統至少需保留一名同仁帳號！');
      return;
    }
    if (confirm(`確定要刪除同仁【${emp.name} (${emp.employeeNo})】的人事檔案與紀錄嗎？`)) {
      deleteEmployee(emp.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 頂部操作與過濾列 */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>企業同仁人事檔案名冊 ({employees.length} 位)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              整合人事基本資料、薪資時薪設定、班表與休假額度管理
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>新增同仁</span>
          </button>
        </div>

        {/* 搜尋與部門快篩 */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 flex-shrink-0">部門分類：</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full sm:w-48"
            >
              <option value="all">全公司部門 (全部)</option>
              <option value="研發工程部">研發工程部</option>
              <option value="產品設計部">產品設計部</option>
              <option value="市場行銷部">市場行銷部</option>
              <option value="業務拓展部">業務拓展部</option>
              <option value="人資與行政部">人資與行政部</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋姓名、英文名、工號、職稱..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
      </div>

      {/* 員工卡片清單網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          const isCurrentActive = emp.id === currentUser.id;
          const remainingAnnual = Math.max(0, emp.leaveBalances.annual - emp.leaveUsed.annual);
          const remainingComp = Math.max(0, emp.leaveBalances.compTime - emp.leaveUsed.compTime);

          return (
            <div
              key={emp.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border transition-all shadow-xs relative flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-blue-500 ring-2 ring-blue-500/10'
                  : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                {/* 頂部：頭像、姓名、工號、角色標籤 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {emp.name}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {emp.englishName}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        {emp.employeeNo}
                      </span>
                    </div>
                  </div>

                  {/* 權限標籤 */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    emp.role === 'hr_admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                      : emp.role === 'manager'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {emp.role === 'hr_admin' ? '人資管理員' : emp.role === 'manager' ? '部門主管' : '一般員工'}
                  </span>
                </div>

                {/* 部門與職務 */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">部門單位：</span>
                    <strong className="text-slate-800 dark:text-slate-200">{emp.department}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">公司職稱：</span>
                    <strong className="text-slate-800 dark:text-slate-200">{emp.position}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">核算時薪：</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">NT$ {emp.hourlyWage} / hr</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">到職日期：</span>
                    <span className="font-mono text-slate-500">{emp.hireDate}</span>
                  </div>
                </div>

                {/* 休假額度概況 */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                  <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 block">特休餘額</span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                      {remainingAnnual} / {emp.leaveBalances.annual}h
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] text-slate-400 block">可用補休</span>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      {remainingComp}h
                    </span>
                  </div>
                </div>

                {/* 聯絡資訊 */}
                <div className="text-[11px] text-slate-500 space-y-0.5 mb-4">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              {/* 卡片底端操作按鈕 */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setCurrentUser(emp)}
                  disabled={isCurrentActive}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrentActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="切換至此同仁操作模擬系統"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isCurrentActive ? '目前操作身分' : '切換身分'}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="編輯同仁資訊與時薪"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="刪除同仁"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* 編輯/新增同仁 Modal */}
      <EmployeeEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeToEdit={editingEmp}
      />

    </div>
  );
};
