import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AttendanceRecord,
  CompanySettings,
  Employee,
  LeaveApplication,
  LeaveBalance,
  LeaveBalanceTransaction,
  LeaveType,
  OvertimeApplication,
  WorkMode,
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_APPLICATIONS,
  INITIAL_OVERTIME_APPLICATIONS,
  INITIAL_LEAVE_TRANSACTIONS,
  generateInitialAttendanceRecords,
} from '../data/mockData';
import { calculateWorkTimes, calculateOvertimeBreakdown, playPunchSound, LEAVE_TYPE_MAP } from '../utils/attendanceCalculators';

interface AttendanceContextType {
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  attendanceRecords: AttendanceRecord[];
  todayRecord: AttendanceRecord | undefined;
  clockIn: (mode?: WorkMode, note?: string, customLocation?: string) => { success: boolean; message: string };
  clockOut: (mode?: WorkMode, note?: string, customLocation?: string) => { success: boolean; message: string; overtimeHours: number };
  updateAttendanceRecord: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  
  leaveApplications: LeaveApplication[];
  applyLeave: (app: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>) => void;
  reviewLeave: (id: string, status: 'approved' | 'rejected', comment?: string) => void;
  cancelLeave: (id: string, reason?: string) => void;

  leaveTransactions: LeaveBalanceTransaction[];
  configureLeaveEntitlement: (employeeId: string, leaveType: LeaveType, newTotalHours: number, reason: string) => void;
  batchConfigureEntitlements: (employeeId: string, entitlements: Partial<Record<LeaveType, number>>, reason: string) => void;
  
  overtimeApplications: OvertimeApplication[];
  applyOvertime: (app: Omit<OvertimeApplication, 'id' | 'createdAt' | 'status'>) => void;
  reviewOvertime: (id: string, status: 'approved' | 'rejected', comment?: string) => void;
  
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetToMockData: () => void;
  currentDateStr: string;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'workpulse_hr_';

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const currentDateStr = `${year}-${month}-${day}`;

  // 1. 員工名冊
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}employees`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_EMPLOYEES;
  });

  // 2. 當前登入/模擬角色
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}currentUserId`) || 'emp-7';
  });

  const currentUser = useMemo(() => {
    return employees.find(e => e.id === currentUserId) || employees[0] || INITIAL_EMPLOYEES[0];
  }, [employees, currentUserId]);

  const handleSetCurrentUser = (emp: Employee) => {
    setCurrentUserId(emp.id);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentUserId`, emp.id);
  };

  // 3. 設定
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  // 4. 出勤紀錄
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}attendance`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return generateInitialAttendanceRecords();
  });

  // 5. 請假紀錄
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}leaves`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_LEAVE_APPLICATIONS;
  });

  // 6. 加班紀錄
  const [overtimeApplications, setOvertimeApplications] = useState<OvertimeApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}overtimes`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_OVERTIME_APPLICATIONS;
  });

  // 7. 休假額度異動紀錄 (Transaction Ledger)
  const [leaveTransactions, setLeaveTransactions] = useState<LeaveBalanceTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}leave_txs`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_LEAVE_TRANSACTIONS;
  });

  // 同步存檔
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}leaves`, JSON.stringify(leaveApplications));
  }, [leaveApplications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}overtimes`, JSON.stringify(overtimeApplications));
  }, [overtimeApplications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}leave_txs`, JSON.stringify(leaveTransactions));
  }, [leaveTransactions]);

  // 今日打卡紀錄
  const todayRecord = useMemo(() => {
    return attendanceRecords.find(r => r.employeeId === currentUser.id && r.date === currentDateStr);
  }, [attendanceRecords, currentUser.id, currentDateStr]);

  // 上班打卡
  const clockIn = (mode: WorkMode = 'office', note: string = '', customLocation?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const locationName = customLocation || (
      mode === 'office'
        ? settings.officeAddress
        : mode === 'remote'
        ? '居家遠端 (台北內湖)'
        : '外出公出 (客戶端現場)'
    );

    const calculated = calculateWorkTimes(
      timeStr,
      undefined,
      currentUser.standardStartTime || settings.standardStartTime,
      currentUser.standardEndTime || settings.standardEndTime,
      currentUser.flexibleMinutes ?? settings.flexibleMinutes,
      settings.lunchBreakMinutes
    );

    let updatedRecords: AttendanceRecord[];
    if (todayRecord) {
      updatedRecords = attendanceRecords.map(r => {
        if (r.id === todayRecord.id) {
          return {
            ...r,
            clockInTime: timeStr,
            clockInLocation: locationName,
            clockInType: mode,
            clockInNote: note,
            status: calculated.status,
            lateMinutes: calculated.lateMinutes,
          };
        }
        return r;
      });
    } else {
      const newRec: AttendanceRecord = {
        id: `rec-${currentUser.id}-${currentDateStr}`,
        employeeId: currentUser.id,
        date: currentDateStr,
        clockInTime: timeStr,
        clockInLocation: locationName,
        clockInType: mode,
        clockInNote: note,
        status: calculated.status,
        lateMinutes: calculated.lateMinutes,
        earlyLeaveMinutes: 0,
        workHours: 0,
        overtimeHours: 0,
      };
      updatedRecords = [newRec, ...attendanceRecords];
    }

    setAttendanceRecords(updatedRecords);
    playPunchSound('success');

    const msg = calculated.lateMinutes > 0
      ? `上班簽到成功！提醒您已超過彈性工時 ${calculated.lateMinutes} 分鐘。`
      : '上班簽到成功！祝您今天工作順心！';

    return { success: true, message: msg };
  };

  // 下班打卡
  const clockOut = (mode: WorkMode = 'office', note: string = '', customLocation?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const locationName = customLocation || (
      mode === 'office'
        ? settings.officeAddress
        : mode === 'remote'
        ? '居家遠端 (台北內湖)'
        : '外出公出 (客戶端現場)'
    );

    const inTime = todayRecord?.clockInTime || '09:00:00';
    const calculated = calculateWorkTimes(
      inTime,
      timeStr,
      currentUser.standardStartTime || settings.standardStartTime,
      currentUser.standardEndTime || settings.standardEndTime,
      currentUser.flexibleMinutes ?? settings.flexibleMinutes,
      settings.lunchBreakMinutes
    );

    let updatedRecords: AttendanceRecord[];
    if (todayRecord) {
      updatedRecords = attendanceRecords.map(r => {
        if (r.id === todayRecord.id) {
          return {
            ...r,
            clockOutTime: timeStr,
            clockOutLocation: locationName,
            clockOutType: mode,
            clockOutNote: note,
            status: calculated.status,
            lateMinutes: calculated.lateMinutes,
            earlyLeaveMinutes: calculated.earlyLeaveMinutes,
            workHours: calculated.workHours,
            overtimeHours: calculated.overtimeHours,
          };
        }
        return r;
      });
    } else {
      const newRec: AttendanceRecord = {
        id: `rec-${currentUser.id}-${currentDateStr}`,
        employeeId: currentUser.id,
        date: currentDateStr,
        clockInTime: undefined,
        clockOutTime: timeStr,
        clockOutLocation: locationName,
        clockOutType: mode,
        clockOutNote: note,
        status: 'normal',
        lateMinutes: 0,
        earlyLeaveMinutes: calculated.earlyLeaveMinutes,
        workHours: 8,
        overtimeHours: calculated.overtimeHours,
      };
      updatedRecords = [newRec, ...attendanceRecords];
    }

    setAttendanceRecords(updatedRecords);
    playPunchSound('success');

    let msg = `下班簽退成功！本日正常工時約 ${calculated.workHours} 小時。辛苦了！`;
    if (calculated.overtimeHours > 0) {
      msg += ` 偵測到延長加班 ${calculated.overtimeHours} 小時，已為您準備加班申請！`;
    }

    return {
      success: true,
      message: msg,
      overtimeHours: calculated.overtimeHours,
    };
  };

  const updateAttendanceRecord = (recordId: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...updates } : r));
  };

  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
  };

  // 申請請假
  const applyLeave = (app: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>) => {
    const newApp: LeaveApplication = {
      ...app,
      id: `leave-app-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setLeaveApplications(prev => [newApp, ...prev]);
  };

  // 請假審批 (自動扣除休假額度並建立異動流水帳)
  const reviewLeave = (id: string, status: 'approved' | 'rejected', comment?: string) => {
    const target = leaveApplications.find(a => a.id === id);
    if (!target) return;

    const previousStatus = target.status;

    setLeaveApplications(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewerName: currentUser.name,
          reviewComment: comment || (status === 'approved' ? '核准准假' : '主管未核可'),
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      }
      return a;
    }));

    // 若從未核准轉為核准 -> 自動扣除時數並記錄
    if (status === 'approved' && previousStatus !== 'approved') {
      const emp = employees.find(e => e.id === target.employeeId);
      if (emp) {
        const leaveType = target.leaveType;
        const currentQuota = emp.leaveBalances[leaveType] || 0;
        const previousUsed = emp.leaveUsed[leaveType] || 0;
        const newUsed = previousUsed + target.totalHours;
        const balanceAfter = Math.max(0, currentQuota - newUsed);

        // 更新員工已用額度
        setEmployees(prev => prev.map(e => {
          if (e.id === target.employeeId) {
            return {
              ...e,
              leaveUsed: {
                ...e.leaveUsed,
                [leaveType]: newUsed,
              },
            };
          }
          return e;
        }));

        // 新增扣除紀錄
        const newTx: LeaveBalanceTransaction = {
          id: `tx-${Date.now()}`,
          employeeId: target.employeeId,
          employeeName: target.applicantName,
          department: target.department,
          leaveType,
          actionType: 'leave_deduction',
          amountHours: -target.totalHours,
          balanceAfterHours: balanceAfter,
          reason: `請假單審批核准：${target.reason} (${target.startDate} ~ ${target.endDate})`,
          referenceId: target.id,
          operatorName: currentUser.name,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setLeaveTransactions(prev => [newTx, ...prev]);

        // 同步更新考勤表記錄為請假狀態
        setAttendanceRecords(prev => {
          const recDate = target.startDate;
          const existing = prev.find(r => r.employeeId === target.employeeId && r.date === recDate);
          const typeName = LEAVE_TYPE_MAP[leaveType]?.label || leaveType;
          if (existing) {
            return prev.map(r => r.id === existing.id ? {
              ...r,
              status: 'on_leave',
              note: `[核准請假] ${typeName} ${target.totalHours}小時`,
            } : r);
          } else {
            return [{
              id: `rec-${target.employeeId}-${recDate}`,
              employeeId: target.employeeId,
              date: recDate,
              status: 'on_leave',
              lateMinutes: 0,
              earlyLeaveMinutes: 0,
              workHours: 0,
              overtimeHours: 0,
              note: `[核准請假] ${typeName} ${target.totalHours}小時`,
            }, ...prev];
          }
        });
      }
    }
  };

  // 銷假 / 撤銷請假 (若原先已核准，自動返還扣除的額度)
  const cancelLeave = (id: string, reason: string = '同仁主動申請銷假') => {
    const target = leaveApplications.find(a => a.id === id);
    if (!target) return;

    const wasApproved = target.status === 'approved';

    setLeaveApplications(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'cancelled',
          reviewComment: `已註銷：${reason}`,
        };
      }
      return a;
    }));

    if (wasApproved) {
      const emp = employees.find(e => e.id === target.employeeId);
      if (emp) {
        const leaveType = target.leaveType;
        const currentQuota = emp.leaveBalances[leaveType] || 0;
        const currentUsed = emp.leaveUsed[leaveType] || 0;
        const newUsed = Math.max(0, currentUsed - target.totalHours);
        const balanceAfter = Math.max(0, currentQuota - newUsed);

        // 返還額度
        setEmployees(prev => prev.map(e => {
          if (e.id === target.employeeId) {
            return {
              ...e,
              leaveUsed: {
                ...e.leaveUsed,
                [leaveType]: newUsed,
              },
            };
          }
          return e;
        }));

        // 新增返還紀錄
        const newTx: LeaveBalanceTransaction = {
          id: `tx-${Date.now()}`,
          employeeId: target.employeeId,
          employeeName: target.applicantName,
          department: target.department,
          leaveType,
          actionType: 'leave_refund',
          amountHours: target.totalHours,
          balanceAfterHours: balanceAfter,
          reason: `請假單註銷返還：${reason}`,
          referenceId: target.id,
          operatorName: currentUser.name,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setLeaveTransactions(prev => [newTx, ...prev]);
      }
    }
  };

  // 個別假別額度配置 (Initial entitlement configuration or manual adjustment)
  const configureLeaveEntitlement = (
    employeeId: string,
    leaveType: LeaveType,
    newTotalHours: number,
    reason: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const oldTotal = emp.leaveBalances[leaveType] || 0;
    const diff = newTotalHours - oldTotal;
    const used = emp.leaveUsed[leaveType] || 0;
    const balanceAfter = Math.max(0, newTotalHours - used);

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          leaveBalances: {
            ...e.leaveBalances,
            [leaveType]: newTotalHours,
          },
        };
      }
      return e;
    }));

    const newTx: LeaveBalanceTransaction = {
      id: `tx-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      department: emp.department,
      leaveType,
      actionType: diff > 0 ? 'annual_accrual' : 'manual_adjustment',
      amountHours: diff,
      balanceAfterHours: balanceAfter,
      reason: reason || '人資設定/調整休假年度配額',
      operatorName: currentUser.name,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setLeaveTransactions(prev => [newTx, ...prev]);
  };

  // 批量配置同仁全部假別初始額度 (Initial Entitlements Setup)
  const batchConfigureEntitlements = (
    employeeId: string,
    entitlements: Partial<Record<LeaveType, number>>,
    reason: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          leaveBalances: {
            ...e.leaveBalances,
            ...entitlements,
          },
        };
      }
      return e;
    }));

    // 建立變更紀錄
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTxs: LeaveBalanceTransaction[] = (Object.keys(entitlements) as LeaveType[]).map((lt, idx) => {
      const newAmt = entitlements[lt] || 0;
      const oldAmt = emp.leaveBalances[lt] || 0;
      const diff = newAmt - oldAmt;
      const used = emp.leaveUsed[lt] || 0;
      return {
        id: `tx-${Date.now()}-${idx}`,
        employeeId,
        employeeName: emp.name,
        department: emp.department,
        leaveType: lt,
        actionType: 'initial_grant',
        amountHours: diff,
        balanceAfterHours: Math.max(0, newAmt - used),
        reason: reason || '期初休假額度完整配置更新',
        operatorName: currentUser.name,
        createdAt: nowStr,
      };
    });

    setLeaveTransactions(prev => [...newTxs, ...prev]);
  };

  // 申請加班
  const applyOvertime = (app: Omit<OvertimeApplication, 'id' | 'createdAt' | 'status'>) => {
    const newApp: OvertimeApplication = {
      ...app,
      id: `ot-app-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setOvertimeApplications(prev => [newApp, ...prev]);
  };

  // 加班審核 (若換取補休，自動將加班時數存入補休額度並寫入流水帳)
  const reviewOvertime = (id: string, status: 'approved' | 'rejected', comment?: string) => {
    const target = overtimeApplications.find(a => a.id === id);
    if (!target) return;

    setOvertimeApplications(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewerName: currentUser.name,
          reviewComment: comment || (status === 'approved' ? '核准加班' : '未達加班標準駁回'),
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      }
      return a;
    }));

    if (status === 'approved' && target.compensationType === 'comp_time') {
      const emp = employees.find(e => e.id === target.employeeId);
      if (emp) {
        const newCompTotal = emp.leaveBalances.compTime + target.totalHours;
        const compUsed = emp.leaveUsed.compTime || 0;
        const balanceAfter = Math.max(0, newCompTotal - compUsed);

        setEmployees(prev => prev.map(e => {
          if (e.id === target.employeeId) {
            return {
              ...e,
              leaveBalances: {
                ...e.leaveBalances,
                compTime: newCompTotal,
              },
            };
          }
          return e;
        }));

        const newTx: LeaveBalanceTransaction = {
          id: `tx-${Date.now()}`,
          employeeId: target.employeeId,
          employeeName: target.applicantName,
          department: target.department,
          leaveType: 'compTime',
          actionType: 'overtime_accrual',
          amountHours: target.totalHours,
          balanceAfterHours: balanceAfter,
          reason: `加班單 (${target.project}) 核准換取補休`,
          referenceId: target.id,
          operatorName: currentUser.name,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setLeaveTransactions(prev => [newTx, ...prev]);
      }
    }
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...empData,
      id: newId,
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToMockData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}employees`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}attendance`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}leaves`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}overtimes`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}leave_txs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}settings`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentUserId`);

    setEmployees(INITIAL_EMPLOYEES);
    setAttendanceRecords(generateInitialAttendanceRecords());
    setLeaveApplications(INITIAL_LEAVE_APPLICATIONS);
    setOvertimeApplications(INITIAL_OVERTIME_APPLICATIONS);
    setLeaveTransactions(INITIAL_LEAVE_TRANSACTIONS);
    setSettings(INITIAL_COMPANY_SETTINGS);
    setCurrentUserId('emp-7');
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendanceRecords,
        todayRecord,
        clockIn,
        clockOut,
        updateAttendanceRecord,
        addAttendanceRecord,
        leaveApplications,
        applyLeave,
        reviewLeave,
        cancelLeave,
        leaveTransactions,
        configureLeaveEntitlement,
        batchConfigureEntitlements,
        overtimeApplications,
        applyOvertime,
        reviewOvertime,
        settings,
        updateSettings,
        resetToMockData,
        currentDateStr,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
