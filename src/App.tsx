import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { ClockPunchCard } from './components/ClockPunchCard';
import { LeaveTab } from './components/LeaveTab';
import { LeaveModal } from './components/LeaveModal';
import { OvertimeTab } from './components/OvertimeTab';
import { OvertimeModal } from './components/OvertimeModal';
import { MonthlyReportTab } from './components/MonthlyReportTab';
import { EmployeeDirectoryTab } from './components/EmployeeDirectoryTab';
import { CorrectionModal } from './components/CorrectionModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { AttendanceRecord } from './types';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('punch');

  // 彈窗控制
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
  const [overtimePrefilledHours, setOvertimePrefilledHours] = useState<number | undefined>(undefined);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleOpenOvertime = (hours?: number) => {
    setOvertimePrefilledHours(hours);
    setOvertimeModalOpen(true);
  };

  const handleOpenCorrection = (record?: AttendanceRecord) => {
    setEditingRecord(record);
    setCorrectionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 頂部導航列 */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* 主工作區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'punch' && (
          <ClockPunchCard
            onOpenLeaveModal={() => setLeaveModalOpen(true)}
            onOpenOvertimeModal={handleOpenOvertime}
            onOpenCorrectionModal={() => handleOpenCorrection()}
            onViewReports={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveTab onOpenLeaveModal={() => setLeaveModalOpen(true)} />
        )}

        {activeTab === 'overtime' && (
          <OvertimeTab onOpenOvertimeModal={() => handleOpenOvertime()} />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportTab onOpenCorrectionModal={handleOpenCorrection} />
        )}

        {activeTab === 'personnel' && (
          <EmployeeDirectoryTab />
        )}
      </main>

      {/* 底部簡易版權與快速指引 */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-center text-xs text-slate-400">
        <p>
          WorkPulse 企業出勤與人事工時管理系統 · 支援勞基法法定加班試算 · 報表 CSV 匯出與列印
        </p>
      </footer>

      {/* 全域彈窗 */}
      <LeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
      />

      <OvertimeModal
        isOpen={overtimeModalOpen}
        onClose={() => {
          setOvertimeModalOpen(false);
          setOvertimePrefilledHours(undefined);
        }}
        prefilledHours={overtimePrefilledHours}
      />

      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => {
          setCorrectionModalOpen(false);
          setEditingRecord(undefined);
        }}
        recordToEdit={editingRecord}
      />

      <CompanySettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <MainContent />
    </AttendanceProvider>
  );
}
