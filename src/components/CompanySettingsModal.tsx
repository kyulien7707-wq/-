import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Sliders, Building2, Clock, MapPin, X, Check } from 'lucide-react';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAttendance();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [officeAddress, setOfficeAddress] = useState(settings.officeAddress);
  const [standardStartTime, setStandardStartTime] = useState(settings.standardStartTime);
  const [standardEndTime, setStandardEndTime] = useState(settings.standardEndTime);
  const [flexibleMinutes, setFlexibleMinutes] = useState(settings.flexibleMinutes);
  const [lunchBreakMinutes, setLunchBreakMinutes] = useState(settings.lunchBreakMinutes);
  const [overtimeThresholdMinutes, setOvertimeThresholdMinutes] = useState(settings.overtimeThresholdMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      officeAddress,
      standardStartTime,
      standardEndTime,
      flexibleMinutes: Number(flexibleMinutes),
      lunchBreakMinutes: Number(lunchBreakMinutes),
      overtimeThresholdMinutes: Number(overtimeThresholdMinutes),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                公司出勤規則與參數設定
              </h3>
              <p className="text-xs text-slate-500">標準班表、彈性工時與考勤地址設定</p>
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              公司行號名稱：
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              總部辦公室地址 (GPS 打卡基點)：
            </label>
            <input
              type="text"
              required
              value={officeAddress}
              onChange={e => setOfficeAddress(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                標準上班時間：
              </label>
              <input
                type="time"
                value={standardStartTime}
                onChange={e => setStandardStartTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                標準下班時間：
              </label>
              <input
                type="time"
                value={standardEndTime}
                onChange={e => setStandardEndTime(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                彈性緩衝分鐘數 (寬限)：
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={flexibleMinutes}
                onChange={e => setFlexibleMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">例如 15 分鐘，09:15 前不算遲到</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                午休休息扣除 (分鐘)：
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={lunchBreakMinutes}
                onChange={e => setLunchBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">一般為 60 分鐘 (12:00~13:00)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              下班延遲加班自動提醒門檻 (分鐘)：
            </label>
            <input
              type="number"
              min={10}
              max={120}
              value={overtimeThresholdMinutes}
              onChange={e => setOvertimeThresholdMinutes(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              超過此時間簽退將主動彈出加班登記申請
            </span>
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
              更新公司考勤規則
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
