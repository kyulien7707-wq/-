import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Employee, Department, EmployeeRole } from '../types';
import { User, DollarSign, Calendar, Mail, Phone, Briefcase, X } from 'lucide-react';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
}) => {
  const { addEmployee, updateEmployee, employees } = useAttendance();

  const isEditing = Boolean(employeeToEdit);

  const [name, setName] = useState(employeeToEdit?.name || '');
  const [englishName, setEnglishName] = useState(employeeToEdit?.englishName || '');
  const [employeeNo, setEmployeeNo] = useState(employeeToEdit?.employeeNo || `EMP-${1000 + employees.length + 1}`);
  const [department, setDepartment] = useState<Department>(employeeToEdit?.department || '研發工程部');
  const [position, setPosition] = useState(employeeToEdit?.position || '軟體工程師');
  const [role, setRole] = useState<EmployeeRole>(employeeToEdit?.role || 'employee');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [phone, setPhone] = useState(employeeToEdit?.phone || '0912-000-111');
  const [avatar, setAvatar] = useState(employeeToEdit?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [hireDate, setHireDate] = useState(employeeToEdit?.hireDate || '2024-01-01');
  const [hourlyWage, setHourlyWage] = useState(employeeToEdit?.hourlyWage || 350);
  const [annualLeave, setAnnualLeave] = useState(employeeToEdit?.leaveBalances.annual || 80);
  const [sickLeave, setSickLeave] = useState(employeeToEdit?.leaveBalances.sick || 240);
  const [personalLeave, setPersonalLeave] = useState(employeeToEdit?.leaveBalances.personal || 56);
  const [compTime, setCompTime] = useState(employeeToEdit?.leaveBalances.compTime || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        name,
        englishName,
        employeeNo,
        department,
        position,
        role,
        email,
        phone,
        avatar,
        hireDate,
        hourlyWage: Number(hourlyWage),
        leaveBalances: {
          ...employeeToEdit.leaveBalances,
          annual: Number(annualLeave),
          sick: Number(sickLeave),
          personal: Number(personalLeave),
          compTime: Number(compTime),
        },
      });
    } else {
      addEmployee({
        name,
        englishName,
        employeeNo,
        department,
        position,
        role,
        email: email || `${name.toLowerCase()}@nexacorp.tw`,
        phone,
        avatar,
        hireDate,
        hourlyWage: Number(hourlyWage),
        leaveBalances: {
          annual: Number(annualLeave),
          personal: Number(personalLeave),
          sick: Number(sickLeave),
          compTime: Number(compTime),
          marriage: 64,
          bereavement: 48,
          maternity: 0,
          menstrual: 24,
        },
        leaveUsed: {
          annual: 0,
          personal: 0,
          sick: 0,
          compTime: 0,
          marriage: 0,
          bereavement: 0,
          maternity: 0,
          menstrual: 0,
        },
        status: 'active',
        standardStartTime: '09:00',
        standardEndTime: '18:00',
        flexibleMinutes: 15,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? '編輯同仁人事檔案' : '新增企業同仁檔案'}
              </h3>
              <p className="text-xs text-slate-500">人事資料與考勤薪資參數設定</p>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                員工姓名：
              </label>
              <input
                type="text"
                required
                placeholder="例如：張宇翔"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                英文姓名：
              </label>
              <input
                type="text"
                placeholder="Sean Chang"
                value={englishName}
                onChange={e => setEnglishName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                員工工號：
              </label>
              <input
                type="text"
                required
                value={employeeNo}
                onChange={e => setEmployeeNo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                系統角色權限：
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as EmployeeRole)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="employee">一般同仁 (打卡、請假、加班)</option>
                <option value="manager">部門主管 (具審批權)</option>
                <option value="hr_admin">人資管理員 (全系統權限)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                所屬部門：
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="研發工程部">研發工程部</option>
                <option value="產品設計部">產品設計部</option>
                <option value="市場行銷部">市場行銷部</option>
                <option value="業務拓展部">業務拓展部</option>
                <option value="人資與行政部">人資與行政部</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                公司職稱：
              </label>
              <input
                type="text"
                required
                placeholder="例如：資深全端工程師"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* 時薪設定 (影響自動計算加班費) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>時薪設定 (供加班費法規試算依據)：</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                NT$ {hourlyWage} / hr
              </span>
            </div>
            <input
              type="number"
              min={183} // 台灣現行法定最低時薪基準
              step={10}
              required
              value={hourlyWage}
              onChange={e => setHourlyWage(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              加班費將按此時薪依前 2 小時 1.34 倍、第 3-4 小時 1.67 倍自動產出月報表
            </p>
          </div>

          {/* 休假額度調整 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                特休給假 (小時)：
              </label>
              <input
                type="number"
                min={0}
                value={annualLeave}
                onChange={e => setAnnualLeave(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                補休初始 (小時)：
              </label>
              <input
                type="number"
                min={0}
                value={compTime}
                onChange={e => setCompTime(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                傷病假額度 (小時，預設 240h/30天)：
              </label>
              <input
                type="number"
                min={0}
                value={sickLeave}
                onChange={e => setSickLeave(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                事假額度 (小時，預設 56h/14天)：
              </label>
              <input
                type="number"
                min={0}
                value={personalLeave}
                onChange={e => setPersonalLeave(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                公司 Email：
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@nexacorp.tw"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                聯絡電話：
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912-345-678"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
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
              {isEditing ? '儲存變更' : '建立同仁檔案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
