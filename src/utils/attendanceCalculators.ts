import { AttendanceRecord, Department, Employee, LeaveType } from '../types';

/**
 * 勞基法標準加班費試算
 * 平日加班：
 * - 延長工時前 2 小時內：平日每小時工資額 x 4/3 (約 1.34)
 * - 延長工時第 3-4 小時：平日每小時工資額 x 5/3 (約 1.67)
 * - 國定休假日/例假日：依勞基法規定倍率計算 (平日每小時工資額 x 2)
 */
export function calculateOvertimeBreakdown(hours: number, hourlyWage: number, isHoliday: boolean = false) {
  if (hours <= 0) {
    return {
      tier1Hours: 0,
      tier2Hours: 0,
      tier3Hours: 0,
      estimatedPay: 0,
    };
  }

  if (isHoliday) {
    // 假日加班前 8 小時加倍發給
    const pay = Math.round(hours * hourlyWage * 2);
    return {
      tier1Hours: Math.min(hours, 2),
      tier2Hours: Math.max(0, Math.min(hours - 2, 2)),
      tier3Hours: Math.max(0, hours - 4),
      estimatedPay: pay,
    };
  }

  const tier1Hours = Math.min(hours, 2);
  const tier2Hours = Math.max(0, Math.min(hours - 2, 2));
  const tier3Hours = Math.max(0, hours - 4);

  // 1.34 與 1.67
  const payTier1 = tier1Hours * hourlyWage * (4 / 3);
  const payTier2 = tier2Hours * hourlyWage * (5 / 3);
  const payTier3 = tier3Hours * hourlyWage * 2.0;

  const estimatedPay = Math.round(payTier1 + payTier2 + payTier3);

  return {
    tier1Hours: Number(tier1Hours.toFixed(1)),
    tier2Hours: Number(tier2Hours.toFixed(1)),
    tier3Hours: Number(tier3Hours.toFixed(1)),
    estimatedPay,
  };
}

/**
 * 計算打卡出勤狀態與工時
 * @param clockIn HH:mm:ss 或 HH:mm
 * @param clockOut HH:mm:ss 或 HH:mm
 * @param standardStart 如 "09:00"
 * @param standardEnd 如 "18:00"
 * @param flexibleMinutes 如 15 (09:15 前不算遲到)
 * @param lunchBreakMinutes 午休分鐘數 (預設 60 分鐘)
 */
export function calculateWorkTimes(
  clockIn?: string,
  clockOut?: string,
  standardStart: string = '09:00',
  standardEnd: string = '18:00',
  flexibleMinutes: number = 15,
  lunchBreakMinutes: number = 60
) {
  if (!clockIn) {
    return {
      status: 'unrecorded' as const,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      workHours: 0,
      overtimeHours: 0,
    };
  }

  const [inH, inM] = clockIn.split(':').map(Number);
  const inMinutes = inH * 60 + inM;

  const [stdStartH, stdStartM] = standardStart.split(':').map(Number);
  const stdStartMinutes = stdStartH * 60 + stdStartM;
  const bufferStartMinutes = stdStartMinutes + flexibleMinutes;

  const lateMinutes = Math.max(0, inMinutes - bufferStartMinutes);

  if (!clockOut) {
    return {
      status: lateMinutes > 0 ? ('late' as const) : ('normal' as const),
      lateMinutes,
      earlyLeaveMinutes: 0,
      workHours: 0,
      overtimeHours: 0,
    };
  }

  const [outH, outM] = clockOut.split(':').map(Number);
  const outMinutes = outH * 60 + outM;

  const [stdEndH, stdEndM] = standardEnd.split(':').map(Number);
  // 若彈性上班，例如 09:15 打卡，下班時間相應順延至 18:15
  const actualTargetEndMinutes = stdEndH * 60 + stdEndM + Math.min(flexibleMinutes, Math.max(0, inMinutes - stdStartMinutes));

  const earlyLeaveMinutes = Math.max(0, actualTargetEndMinutes - outMinutes);

  // 總工時計算 (扣除午休 60 分鐘)
  let totalMinutes = outMinutes - inMinutes;
  if (totalMinutes > 240) {
    // 超過 4 小時扣除午休
    totalMinutes = Math.max(0, totalMinutes - lunchBreakMinutes);
  }

  const totalRawHours = totalMinutes / 60;
  const regularWorkHours = Math.min(8, Math.max(0, totalRawHours));
  
  // 加班時數計算 (超過標準 8 小時且下班超過目標時間 15 分鐘以上才列入)
  let overtimeHours = 0;
  if (outMinutes > actualTargetEndMinutes + 15) {
    overtimeHours = (outMinutes - actualTargetEndMinutes) / 60;
    // 取小數點一位，例如 1.5 小時
    overtimeHours = Math.round(overtimeHours * 2) / 2;
  }

  let status: 'normal' | 'late' | 'early_leave' | 'late_and_early' = 'normal';
  if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
    status = 'late_and_early';
  } else if (lateMinutes > 0) {
    status = 'late';
  } else if (earlyLeaveMinutes > 0) {
    status = 'early_leave';
  }

  return {
    status,
    lateMinutes,
    earlyLeaveMinutes,
    workHours: Number(regularWorkHours.toFixed(1)),
    overtimeHours: Number(Math.max(0, overtimeHours).toFixed(1)),
  };
}

/**
 * 假別中文標籤與樣式映射
 */
export const LEAVE_TYPE_MAP: Record<LeaveType, { label: string; color: string; badgeBg: string }> = {
  annual: { label: '特別休假', color: 'text-blue-700 dark:text-blue-300', badgeBg: 'bg-blue-100 dark:bg-blue-900/40 border-blue-200' },
  personal: { label: '事假', color: 'text-amber-700 dark:text-amber-300', badgeBg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200' },
  sick: { label: '普通傷病假', color: 'text-rose-700 dark:text-rose-300', badgeBg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200' },
  compTime: { label: '補休假', color: 'text-emerald-700 dark:text-emerald-300', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200' },
  marriage: { label: '婚假', color: 'text-pink-700 dark:text-pink-300', badgeBg: 'bg-pink-100 dark:bg-pink-900/40 border-pink-200' },
  bereavement: { label: '喪假', color: 'text-slate-700 dark:text-slate-300', badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300' },
  maternity: { label: '產假/陪產檢假', color: 'text-purple-700 dark:text-purple-300', badgeBg: 'bg-purple-100 dark:bg-purple-900/40 border-purple-200' },
  menstrual: { label: '生理假', color: 'text-violet-700 dark:text-violet-300', badgeBg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200' },
};

/**
 * 出勤狀態中文標籤
 */
export const ATTENDANCE_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  normal: { label: '正常', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400' },
  late: { label: '遲到', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400' },
  early_leave: { label: '早退', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-400' },
  late_and_early: { label: '遲到早退', bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400' },
  absent: { label: '曠職/未到', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400' },
  on_leave: { label: '請假', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400' },
  holiday: { label: '國定假日/例假', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400' },
  unrecorded: { label: '未打卡', bg: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700', text: 'text-gray-500 dark:text-gray-400' },
};

/**
 * 匯出出勤資料為 CSV 格式 (附帶 UTF-8 BOM，在 Microsoft Excel 打開保證無中文亂碼)
 */
export function exportAttendanceToCSV(
  records: AttendanceRecord[],
  employees: Employee[],
  yearMonth: string
) {
  const empMap = new Map(employees.map(e => [e.id, e]));

  // CSV 標頭
  const headers = [
    '紀錄日期',
    '員工編號',
    '姓名',
    '所屬部門',
    '職稱',
    '簽到時間',
    '簽到地點/方式',
    '簽退時間',
    '簽退地點/方式',
    '出勤狀態',
    '遲到分鐘',
    '早退分鐘',
    '正工工時(小時)',
    '加班工時(小時)',
    '時薪試算',
    '預估加班費(NT$)',
    '備註/補卡原因',
  ];

  const rows = records.map(rec => {
    const emp = empMap.get(rec.employeeId);
    const otCalculation = emp ? calculateOvertimeBreakdown(rec.overtimeHours, emp.hourlyWage) : { estimatedPay: 0 };
    const statusLabel = ATTENDANCE_STATUS_MAP[rec.status]?.label || rec.status;

    return [
      `"${rec.date}"`,
      `"${emp?.employeeNo || ''}"`,
      `"${emp?.name || '未知員工'}"`,
      `"${emp?.department || ''}"`,
      `"${emp?.position || ''}"`,
      `"${rec.clockInTime || '--:--'}"`,
      `"${rec.clockInLocation || (rec.clockInType === 'remote' ? '居家遠端' : '辦公室')}"`,
      `"${rec.clockOutTime || '--:--'}"`,
      `"${rec.clockOutLocation || (rec.clockOutType === 'remote' ? '居家遠端' : '辦公室')}"`,
      `"${statusLabel}"`,
      rec.lateMinutes || 0,
      rec.earlyLeaveMinutes || 0,
      rec.workHours || 0,
      rec.overtimeHours || 0,
      emp?.hourlyWage || 0,
      otCalculation.estimatedPay,
      `"${(rec.note || (rec.isManualCorrection ? `[已校正補卡] ${rec.correctionReason || ''}` : '')).replace(/"/g, '""')}"`,
    ].join(',');
  });

  // 加入 BOM (\uFEFF) 確保 Excel 正確辨識 UTF-8
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `WorkPulse_出勤統計月報表_${yearMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 匯出員工個人每月工時統計總表 CSV
 */
export function exportEmployeeSummaryCSV(
  employees: Employee[],
  records: AttendanceRecord[],
  yearMonth: string
) {
  const headers = [
    '員工編號',
    '姓名',
    '部門',
    '職稱',
    '時薪(NT$)',
    '應出勤天數',
    '實際出勤天數',
    '遲到次數',
    '早退次數',
    '請假時數(h)',
    '正常總工時(h)',
    '總加班時數(h)',
    '預估加班費(NT$)',
    '出勤率(%)',
  ];

  const rows = employees.map(emp => {
    const empRecords = records.filter(r => r.employeeId === emp.id);
    const presentRecords = empRecords.filter(r => r.clockInTime);
    const lateCount = empRecords.filter(r => r.lateMinutes > 0).length;
    const earlyCount = empRecords.filter(r => r.earlyLeaveMinutes > 0).length;
    const totalWorkHours = empRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const totalOtHours = empRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const otCalculation = calculateOvertimeBreakdown(totalOtHours, emp.hourlyWage);

    const targetDays = 22; // 預設每月工作日 22 天
    const actualDays = presentRecords.length;
    const attendanceRate = Math.min(100, Math.round((actualDays / targetDays) * 100));

    return [
      `"${emp.employeeNo}"`,
      `"${emp.name}"`,
      `"${emp.department}"`,
      `"${emp.position}"`,
      emp.hourlyWage,
      targetDays,
      actualDays,
      lateCount,
      earlyCount,
      emp.leaveUsed.annual + emp.leaveUsed.personal + emp.leaveUsed.sick,
      totalWorkHours.toFixed(1),
      totalOtHours.toFixed(1),
      otCalculation.estimatedPay,
      `${attendanceRate}%`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `WorkPulse_員工月工時彙總報表_${yearMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 網頁音效生成器 (無須外部音檔，使用 Web Audio API 合成清脆簽到成功提示音)
 */
export function playPunchSound(type: 'success' | 'alert' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      // 雙音階悅耳鈴聲 (C6 -> E6)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.setValueAtTime(1318.5, now + 0.12); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.5);
    } else {
      // 警示音
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // 忽略不支援環境錯誤
  }
}
