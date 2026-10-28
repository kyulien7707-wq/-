/**
 * Data types and interfaces for WorkPulse Corporate Attendance & HR Management System
 */

export type EmployeeRole = 'employee' | 'manager' | 'hr_admin';

export type Department = 
  | '研發工程部'
  | '產品設計部'
  | '市場行銷部'
  | '業務拓展部'
  | '人資與行政部';

export type WorkMode = 'office' | 'remote' | 'field';

export type AttendanceStatus = 
  | 'normal'        // 正常出勤
  | 'late'          // 遲到
  | 'early_leave'   // 早退
  | 'late_and_early'// 遲到且早退
  | 'absent'        // 缺勤
  | 'on_leave'      // 請假
  | 'holiday'       // 國定假日/休息日
  | 'unrecorded';   // 尚未打卡

export type LeaveType = 
  | 'annual'        // 特休假
  | 'personal'      // 事假
  | 'sick'          // 普通傷病假
  | 'compTime'      // 補休假
  | 'marriage'      // 婚假
  | 'bereavement'   // 喪假
  | 'maternity'     // 產假/陪產檢及陪產假
  | 'menstrual';    // 生理假

export interface LeaveBalance {
  annual: number;      // 特休額度 (小時)
  personal: number;    // 事假 (天或小時)
  sick: number;        // 病假
  compTime: number;    // 補休
  marriage: number;    // 婚假
  bereavement: number; // 喪假
  maternity: number;   // 產假/陪產檢及陪產假
  menstrual: number;   // 生理假
  [key: string]: number;
}

export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  englishName: string;
  department: Department;
  position: string;
  role: EmployeeRole;
  email: string;
  phone: string;
  avatar: string;
  hireDate: string;
  hourlyWage: number; // 時薪 (供加班費計算)
  leaveBalances: LeaveBalance;
  leaveUsed: LeaveBalance;
  status: 'active' | 'leave_of_absence' | 'resigned';
  standardStartTime: string; // 預設 09:00
  standardEndTime: string;   // 預設 18:00
  flexibleMinutes: number;   // 彈性緩衝分鐘數 (如 15 分鐘)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockInTime?: string; // HH:mm:ss
  clockInLocation?: string;
  clockInType?: WorkMode;
  clockInNote?: string;
  clockOutTime?: string; // HH:mm:ss
  clockOutLocation?: string;
  clockOutType?: WorkMode;
  clockOutNote?: string;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workHours: number;      // 正常工作時數 (排除午休，上限通常為 8)
  overtimeHours: number;  // 加班時數
  note?: string;          // 綜合備註說明
  isManualCorrection?: boolean; // 補卡/主管調整
  correctionReason?: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  applicantName: string;
  department: Department;
  leaveType: LeaveType;
  startDate: string;     // YYYY-MM-DD
  startTime: string;     // HH:mm
  endDate: string;       // YYYY-MM-DD
  endTime: string;       // HH:mm
  totalHours: number;
  reason: string;
  substituteId?: string;
  substituteName?: string;
  attachmentName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface OvertimeApplication {
  id: string;
  employeeId: string;
  applicantName: string;
  department: Department;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  totalHours: number;
  reason: string;
  project: string;
  compensationType: 'overtime_pay' | 'comp_time'; // 加班費 vs 換補休
  breakdown: {
    tier1Hours: number;  // 前 2 小時 (平日 x1.34)
    tier2Hours: number;  // 第 3-4 小時 (平日 x1.67)
    tier3Hours: number;  // 超過 4 小時或休假日 (x2.0 / x2.67)
  };
  estimatedPay: number; // 預估加班費
  status: 'pending' | 'approved' | 'rejected';
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ClockCorrectionApplication {
  id: string;
  employeeId: string;
  applicantName: string;
  department: Department;
  date: string;
  target: 'clock_in' | 'clock_out' | 'both';
  correctedClockInTime?: string;
  correctedClockOutTime?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerName?: string;
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  officeAddress: string;
  allowedRadiusMeters: number;
  standardStartTime: string; // "09:00"
  standardEndTime: string;   // "18:00"
  flexibleMinutes: number;   // 15
  lunchBreakMinutes: number; // 60
  autoOvertimePrompt: boolean;
  overtimeThresholdMinutes: number; // 超過 30 分鐘自動觸發加班計算
}

export type TransactionActionType = 
  | 'initial_grant'       // 期初給假 / 額度初始配置
  | 'annual_accrual'      // 年資晉升特休撥發
  | 'leave_deduction'     // 請假核准扣抵 (自動扣除)
  | 'leave_refund'        // 請假註銷/駁回返還
  | 'overtime_accrual'    // 加班換補休轉入
  | 'manual_adjustment';  // 人資手動校正調整

export interface LeaveBalanceTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: LeaveType;
  actionType: TransactionActionType;
  amountHours: number; // 正數為增加，負數為扣除 (例如 -8 或 +8)
  balanceAfterHours: number;
  reason: string;
  referenceId?: string; // 關聯之請假單或加班單 ID
  operatorName: string;
  createdAt: string;
}

