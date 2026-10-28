import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRecord } from '../types';
import { calculateWorkTimes } from '../utils/attendanceCalculators';
import { Clock, FileEdit, X, CheckCircle } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: AttendanceRecord;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const {
    currentUser,
    employees,
    attendanceRecords,
    updateAttendanceRecord,
    addAttendanceRecord,
    settings,
    currentDateStr,
  } = useAttendance();

  const [employeeId, setEmployeeId] = useState(recordToEdit?.employeeId || currentUser.id);
  const [date, setDate] = useState(recordToEdit?.date || currentDateStr);
  const [clockInTime, setClockInTime] = useState(recordToEdit?.clockInTime || '09:00:00');
  const [clockOutTime, setClockOutTime] = useState(recordToEdit?.clockOutTime || '18:00:00');
  const [reason, setReason] = useState(recordToEdit?.correctionReason || '忘記攜帶門禁卡 / 拜訪客戶直接出差');

  const selectedEmp = employees.find(e => e.id === employeeId) || currentUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const times = calculateWorkTimes(
      clockInTime,
      clockOutTime,
      selectedEmp.standardStartTime || settings.standardStartTime,
      selectedEmp.standardEndTime || settings.standardEndTime,
      selectedEmp.flexibleMinutes ?? settings.flexibleMinutes,
      settings.lunchBreakMinutes
    );

    if (recordToEdit) {
      updateAttendanceRecord(recordToEdit.id, {
        clockInTime,
        clockOutTime,
        status: times.status,
        lateMinutes: times.lateMinutes,
        earlyLeaveMinutes: times.earlyLeaveMinutes,
        workHours: times.workHours,
        overtimeHours: times.overtimeHours,
        isManualCorrection: true,
        correctionReason: reason,
      });
    } else {
      const existing = attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
      if (existing) {
        updateAttendanceRecord(existing.id, {
          clockInTime,
          clockOutTime,
          status: times.status,
          lateMinutes: times.lateMinutes,
          earlyLeaveMinutes: times.earlyLeaveMinutes,
          workHours: times.workHours,
          overtimeHours: times.overtimeHours,
          isManualCorrection: true,
          correctionReason: reason,
        });
      } else {
        addAttendanceRecord({
          id: `rec-${employeeId}-${date}`,
          employeeId,
          date,
          clockInTime,
          clockInLocation: '校正補卡登記',
          clockInType: 'office',
          clockOutTime,
          clockOutLocation: '校正補卡登記',
          clockOutType: 'office',
          status: times.status,
          lateMinutes: times.lateMinutes,
          earlyLeaveMinutes: times.earlyLeaveMinutes,
          workHours: times.workHours,
          overtimeHours: times.overtimeHours,
          isManualCorrection: true,
          correctionReason: reason,
        });
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                出勤打卡校正 / 補卡申請
              </h3>
              <p className="text-xs text-slate-500">忘記打卡或時間異常修正</p>
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
          
          {/* 申請員工 (若是人資/主管可幫忙校正) */}
          {(currentUser.role === 'hr_admin' || currentUser.role === 'manager') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                校正對象員工：
              </label>
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-semibold"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.employeeNo} - {e.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              補卡日期：
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                校正簽到時間：
              </label>
              <input
                type="text"
                placeholder="09:00:00"
                value={clockInTime}
                onChange={e => setClockInTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                校正簽退時間：
              </label>
              <input
                type="text"
                placeholder="18:00:00"
                value={clockOutTime}
                onChange={e => setClockOutTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              補卡事由說明：
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="請說明忘記打卡或時間校正原因..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              確認校正存檔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
