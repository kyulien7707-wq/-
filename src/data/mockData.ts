import { AttendanceRecord, CompanySettings, Employee, LeaveApplication, OvertimeApplication } from '../types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: '智聯數碼科技股份有限公司 (NexaCorp Taiwan)',
  officeAddress: '台北市信義區信義路五段7號 (台北101辦公大樓 36F)',
  allowedRadiusMeters: 200,
  standardStartTime: '09:00',
  standardEndTime: '18:00',
  flexibleMinutes: 15,
  lunchBreakMinutes: 60,
  autoOvertimePrompt: true,
  overtimeThresholdMinutes: 30,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeNo: 'EMP-1001',
    name: '林志遠',
    englishName: 'Kevin Lin',
    department: '研發工程部',
    position: '工程研發總監',
    role: 'manager',
    email: 'kevin.lin@nexacorp.tw',
    phone: '0912-345-678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hireDate: '2021-03-15',
    hourlyWage: 520,
    leaveBalances: { annual: 120, personal: 56, sick: 240, compTime: 16, marriage: 64, bereavement: 48, maternity: 0, menstrual: 0 },
    leaveUsed: { annual: 24, personal: 8, sick: 0, compTime: 4, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-2',
    employeeNo: 'EMP-1002',
    name: '陳韋廷',
    englishName: 'David Chen',
    department: '研發工程部',
    position: '資深前端工程師',
    role: 'employee',
    email: 'david.chen@nexacorp.tw',
    phone: '0922-888-123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hireDate: '2022-06-01',
    hourlyWage: 420,
    leaveBalances: { annual: 80, personal: 56, sick: 240, compTime: 8, marriage: 64, bereavement: 48, maternity: 0, menstrual: 0 },
    leaveUsed: { annual: 16, personal: 0, sick: 8, compTime: 0, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-3',
    employeeNo: 'EMP-1003',
    name: '黃柏翰',
    englishName: 'Brian Huang',
    department: '研發工程部',
    position: '雲端後端工程師',
    role: 'employee',
    email: 'brian.huang@nexacorp.tw',
    phone: '0933-456-789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-02-10',
    hourlyWage: 380,
    leaveBalances: { annual: 56, personal: 56, sick: 240, compTime: 12, marriage: 64, bereavement: 48, maternity: 0, menstrual: 0 },
    leaveUsed: { annual: 8, personal: 4, sick: 0, compTime: 0, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-4',
    employeeNo: 'EMP-1004',
    name: '許雅婷',
    englishName: 'Emily Hsu',
    department: '產品設計部',
    position: '資深 UI/UX 設計師',
    role: 'employee',
    email: 'emily.hsu@nexacorp.tw',
    phone: '0955-123-987',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    hireDate: '2022-09-15',
    hourlyWage: 390,
    leaveBalances: { annual: 80, personal: 56, sick: 240, compTime: 6, marriage: 64, bereavement: 48, maternity: 0, menstrual: 24 },
    leaveUsed: { annual: 32, personal: 8, sick: 8, compTime: 0, marriage: 0, bereavement: 0, maternity: 0, menstrual: 8 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-5',
    employeeNo: 'EMP-1005',
    name: '張家瑋',
    englishName: 'Leo Chang',
    department: '市場行銷部',
    position: '行銷總監',
    role: 'manager',
    email: 'leo.chang@nexacorp.tw',
    phone: '0966-234-567',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    hireDate: '2021-11-01',
    hourlyWage: 480,
    leaveBalances: { annual: 104, personal: 56, sick: 240, compTime: 14, marriage: 64, bereavement: 48, maternity: 0, menstrual: 0 },
    leaveUsed: { annual: 40, personal: 0, sick: 0, compTime: 6, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-6',
    employeeNo: 'EMP-1006',
    name: '謝欣儀',
    englishName: 'Cindy Hsieh',
    department: '業務拓展部',
    position: '企業客戶經理',
    role: 'employee',
    email: 'cindy.hsieh@nexacorp.tw',
    phone: '0977-890-123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-05-18',
    hourlyWage: 360,
    leaveBalances: { annual: 56, personal: 56, sick: 240, compTime: 4, marriage: 64, bereavement: 48, maternity: 0, menstrual: 24 },
    leaveUsed: { annual: 8, personal: 8, sick: 0, compTime: 0, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-7',
    employeeNo: 'EMP-1007',
    name: '趙敏伶',
    englishName: 'Jessica Chao',
    department: '人資與行政部',
    position: '人資考勤專員',
    role: 'hr_admin',
    email: 'jessica.chao@nexacorp.tw',
    phone: '0988-345-671',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    hireDate: '2021-08-01',
    hourlyWage: 390,
    leaveBalances: { annual: 104, personal: 56, sick: 240, compTime: 10, marriage: 64, bereavement: 48, maternity: 0, menstrual: 24 },
    leaveUsed: { annual: 16, personal: 0, sick: 4, compTime: 2, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
  {
    id: 'emp-8',
    employeeNo: 'EMP-1008',
    name: '郭建宏',
    englishName: 'Michael Kuo',
    department: '人資與行政部',
    position: '營運副總裁 / COO',
    role: 'hr_admin',
    email: 'michael.kuo@nexacorp.tw',
    phone: '0910-999-000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    hireDate: '2020-01-02',
    hourlyWage: 680,
    leaveBalances: { annual: 160, personal: 56, sick: 240, compTime: 20, marriage: 64, bereavement: 48, maternity: 0, menstrual: 0 },
    leaveUsed: { annual: 48, personal: 0, sick: 0, compTime: 0, marriage: 0, bereavement: 0, maternity: 0, menstrual: 0 },
    status: 'active',
    standardStartTime: '09:00',
    standardEndTime: '18:00',
    flexibleMinutes: 15,
  },
];

// 生成十月份完整擬真考勤記錄 (2026-10-01 ~ 2026-10-27)
export function generateInitialAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const employees = INITIAL_EMPLOYEES;
  const currentYear = 2026;
  const currentMonth = 10; // 10 月

  // 10 月各工作天
  for (let day = 1; day <= 27; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${currentYear}-${currentMonth}-${dayStr}`;
    const dateObj = new Date(currentYear, currentMonth - 1, day);
    const dayOfWeek = dateObj.getDay();

    // 週六 (6) 與週日 (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    employees.forEach((emp, empIdx) => {
      // 模擬不同情境 (大部分正常，少數加班、遲到、請假、遠端)
      const seed = (day * 7 + empIdx * 13) % 100;
      let status: AttendanceRecord['status'] = 'normal';
      let inTime = '08:52:10';
      let outTime = '18:05:40';
      let workHours = 8.0;
      let overtimeHours = 0;
      let lateMinutes = 0;
      let earlyLeaveMinutes = 0;
      let note = '';
      let clockInType: AttendanceRecord['clockInType'] = 'office';
      let clockOutType: AttendanceRecord['clockOutType'] = 'office';

      if (seed < 8) {
        // 遠端工作
        clockInType = 'remote';
        clockOutType = 'remote';
        inTime = '08:58:12';
        outTime = '18:02:45';
        note = '核准居家遠端 WFH';
      } else if (seed < 15) {
        // 遲到 (超過 09:15)
        inTime = '09:28:15';
        outTime = '18:30:10';
        lateMinutes = 13;
        status = 'late';
        note = '市府轉運站交通壅塞';
      } else if (seed < 28) {
        // 加班 (例如 19:30 or 20:30)
        inTime = '08:50:33';
        if (seed % 2 === 0) {
          outTime = '20:15:20';
          overtimeHours = 2.0;
          note = 'Q4 企業專案版本發布上線';
        } else {
          outTime = '21:35:10';
          overtimeHours = 3.5;
          note = '系統負載調校與雙十行銷促銷備援';
        }
      } else if (seed === 42 && empIdx === 1) {
        // 請假
        status = 'on_leave';
        inTime = '';
        outTime = '';
        workHours = 0;
        note = '特別休假 (已核准)';
      } else {
        // 正常出勤，微幅浮動
        const inMin = 45 + ((day + empIdx) % 20);
        inTime = `08:${inMin < 10 ? '0' + inMin : inMin}:24`;
        outTime = '18:08:15';
      }

      records.push({
        id: `rec-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        clockInTime: inTime || undefined,
        clockInLocation: clockInType === 'remote' ? '居家遠端 (台北內湖)' : '台北總部辦公室 (101大樓 36F)',
        clockInType,
        clockOutTime: outTime || undefined,
        clockOutLocation: clockOutType === 'remote' ? '居家遠端 (台北內湖)' : '台北總部辦公室 (101大樓 36F)',
        clockOutType,
        status,
        lateMinutes,
        earlyLeaveMinutes,
        workHours,
        overtimeHours,
        note,
      });
    });
  }

  return records;
}

export const INITIAL_LEAVE_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'leave-app-1',
    employeeId: 'emp-2',
    applicantName: '陳韋廷',
    department: '研發工程部',
    leaveType: 'annual',
    startDate: '2026-10-30',
    startTime: '09:00',
    endDate: '2026-10-30',
    endTime: '18:00',
    totalHours: 8,
    reason: '處理個人房屋修繕事宜，已委請同仁黃柏翰協助代理急單',
    substituteId: 'emp-3',
    substituteName: '黃柏翰',
    status: 'pending',
    createdAt: '2026-10-26 14:20:00',
  },
  {
    id: 'leave-app-2',
    employeeId: 'emp-4',
    applicantName: '許雅婷',
    department: '產品設計部',
    leaveType: 'sick',
    startDate: '2026-10-21',
    startTime: '09:00',
    endDate: '2026-10-21',
    endTime: '18:00',
    totalHours: 8,
    reason: '流感發燒就醫，檢附國泰醫院就診收據',
    substituteId: 'emp-5',
    substituteName: '張家瑋',
    attachmentName: '診斷證明_20261021.pdf',
    status: 'approved',
    reviewerName: '郭建宏',
    reviewComment: '准假，請多保重身體！',
    reviewedAt: '2026-10-21 10:15:00',
    createdAt: '2026-10-21 08:30:00',
  },
  {
    id: 'leave-app-3',
    employeeId: 'emp-6',
    applicantName: '謝欣儀',
    department: '業務拓展部',
    leaveType: 'personal',
    startDate: '2026-11-04',
    startTime: '14:00',
    endDate: '2026-11-04',
    endTime: '18:00',
    totalHours: 4,
    reason: '前往銀行辦理法人業務換鑑印鑑手續',
    substituteId: 'emp-5',
    substituteName: '張家瑋',
    status: 'pending',
    createdAt: '2026-10-27 11:00:00',
  },
  {
    id: 'leave-app-4',
    employeeId: 'emp-3',
    applicantName: '黃柏翰',
    department: '研發工程部',
    leaveType: 'compTime',
    startDate: '2026-10-16',
    startTime: '13:00',
    endDate: '2026-10-16',
    endTime: '18:00',
    totalHours: 5,
    reason: '使用 10/11 假日機房維護之累積補休假',
    substituteId: 'emp-2',
    substituteName: '陳韋廷',
    status: 'approved',
    reviewerName: '林志遠',
    reviewComment: '辛苦了，核准補休。',
    reviewedAt: '2026-10-15 17:30:00',
    createdAt: '2026-10-15 15:10:00',
  },
];

export const INITIAL_OVERTIME_APPLICATIONS: OvertimeApplication[] = [
  {
    id: 'ot-app-1',
    employeeId: 'emp-3',
    applicantName: '黃柏翰',
    department: '研發工程部',
    date: '2026-10-27',
    startTime: '18:30',
    endTime: '21:30',
    totalHours: 3.0,
    reason: '雙十購物節後台流量擴容與資料庫分片索引最佳化',
    project: 'Core Platform v4.2',
    compensationType: 'overtime_pay',
    breakdown: {
      tier1Hours: 2.0,
      tier2Hours: 1.0,
      tier3Hours: 0,
    },
    estimatedPay: 1647,
    status: 'pending',
    createdAt: '2026-10-27 18:15:00',
  },
  {
    id: 'ot-app-2',
    employeeId: 'emp-1',
    applicantName: '林志遠',
    department: '研發工程部',
    date: '2026-10-22',
    startTime: '18:30',
    endTime: '21:00',
    totalHours: 2.5,
    reason: '金融客戶端 SSO SAML 協定緊急資安更新修補',
    project: 'Enterprise Security Patch',
    compensationType: 'comp_time',
    breakdown: {
      tier1Hours: 2.0,
      tier2Hours: 0.5,
      tier3Hours: 0,
    },
    estimatedPay: 1820,
    status: 'approved',
    reviewerName: '郭建宏',
    reviewComment: '確認為緊急資安情事，已核發補休時數。',
    reviewedAt: '2026-10-23 09:30:00',
    createdAt: '2026-10-22 21:05:00',
  },
];

export const INITIAL_LEAVE_TRANSACTIONS: import('../types').LeaveBalanceTransaction[] = [
  {
    id: 'tx-1',
    employeeId: 'emp-4',
    employeeName: '許雅婷',
    department: '產品設計部',
    leaveType: 'sick',
    actionType: 'leave_deduction',
    amountHours: -8,
    balanceAfterHours: 232,
    reason: '請假單 (leave-app-2) 主管核准：流感發燒就醫，檢附診斷收據',
    referenceId: 'leave-app-2',
    operatorName: '郭建宏 (COO)',
    createdAt: '2026-10-21 10:15:00',
  },
  {
    id: 'tx-2',
    employeeId: 'emp-1',
    employeeName: '林志遠',
    department: '研發工程部',
    leaveType: 'compTime',
    actionType: 'overtime_accrual',
    amountHours: 2.5,
    balanceAfterHours: 16,
    reason: '加班單 (ot-app-2) 核准換補休：金融客戶端緊急資安修補',
    referenceId: 'ot-app-2',
    operatorName: '郭建宏 (COO)',
    createdAt: '2026-10-23 09:30:00',
  },
  {
    id: 'tx-3',
    employeeId: 'emp-3',
    employeeName: '黃柏翰',
    department: '研發工程部',
    leaveType: 'compTime',
    actionType: 'leave_deduction',
    amountHours: -5,
    balanceAfterHours: 12,
    reason: '請假單 (leave-app-4) 核准補休假：使用機房維護之累積補休',
    referenceId: 'leave-app-4',
    operatorName: '林志遠 (研發總監)',
    createdAt: '2026-10-15 17:30:00',
  },
  {
    id: 'tx-4',
    employeeId: 'emp-2',
    employeeName: '陳韋廷',
    department: '研發工程部',
    leaveType: 'annual',
    actionType: 'annual_accrual',
    amountHours: 80,
    balanceAfterHours: 80,
    reason: '2026 年度員工年資特休配發 (滿 2 年年資給予 10 天特休)',
    operatorName: '趙敏伶 (人資專員)',
    createdAt: '2026-01-01 09:00:00',
  },
  {
    id: 'tx-5',
    employeeId: 'emp-1',
    employeeName: '林志遠',
    department: '研發工程部',
    leaveType: 'annual',
    actionType: 'annual_accrual',
    amountHours: 120,
    balanceAfterHours: 120,
    reason: '2026 年度員工年資特休配發 (滿 5 年年資給予 15 天特休)',
    operatorName: '趙敏伶 (人資專員)',
    createdAt: '2026-01-01 09:00:00',
  },
];

