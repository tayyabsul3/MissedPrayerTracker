import React, { useState, useEffect } from 'react';
import { User, Bell, ShieldAlert, Download, Upload, RefreshCw, Info, Heart, Copy, Check } from 'lucide-react';
import { 
  getUserProfile, 
  saveUserProfile, 
  resetAllData, 
  exportData, 
  importData 
} from '../db/storage';
import type { UserProfile } from '../db/storage';


interface SettingsProps {
  onProfileChange: (profile: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onProfileChange }) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [nameInput, setNameInput] = useState(profile.name);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [showSupport, setShowSupport] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>('500');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('03145116290');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setNameInput(profile.name);
  }, [profile]);

  const handleProfileSave = (updated: UserProfile) => {
    saveUserProfile(updated);
    setProfile(updated);
    onProfileChange(updated);
  };

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...profile, name: nameInput.trim() };
    handleProfileSave(updated);
    alert('Name updated successfully!');
  };

  const handleWitrToggle = () => {
    const updated = { ...profile, trackWitr: !profile.trackWitr };
    handleProfileSave(updated);
  };

  const requestNotificationPermission = async (enable: boolean) => {
    if (enable) {
      if (!('Notification' in window)) {
        alert('This browser does not support notifications.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const updated = { ...profile, notificationsEnabled: true };
        handleProfileSave(updated);
        
        new Notification('Qaza Tracker Reminders Enabled', {
          body: `We will send daily reminders at ${profile.dailyReminderTime}.`,
          icon: '/favicon.ico',
        });
      } else {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        const updated = { ...profile, notificationsEnabled: false };
        handleProfileSave(updated);
      }
    } else {
      const updated = { ...profile, notificationsEnabled: false };
      handleProfileSave(updated);
    }
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...profile, dailyReminderTime: e.target.value };
    handleProfileSave(updated);
  };

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qaza_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export backup file.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const success = importData(content);
      if (success) {
        setImportStatus({ type: 'success', message: 'Data imported successfully! Reloading page...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setImportStatus({ type: 'error', message: 'Invalid backup file. Please verify and try again.' });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('WARNING: Are you sure you want to delete all tracker records, logs, and settings? This action CANNOT be undone.')) {
      if (window.confirm('Double confirming: Do you really want to clear your data?')) {
        resetAllData();
        alert('All data has been reset.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center">
          <User className="h-4.5 w-4.5 mr-2 text-[#D4AF37]" />
          User Profile
        </h3>
        
        <form onSubmit={handleNameChange} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase text-[#94A3B8] font-bold mb-1.5">Your Name</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 min-w-0 bg-emerald-950/60 border border-emerald-900/40 rounded-xl px-4 py-2 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37] placeholder-emerald-800"
              />
              <button
                type="submit"
                className="bg-[#D4AF37] text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#D4AF37]/90 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tracker Settings */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center">
          <Info className="h-4.5 w-4.5 mr-2 text-[#D4AF37]" />
          Tracker Settings
        </h3>

        <div className="flex justify-between items-center py-2 border-b border-emerald-900/20">
          <div className="pr-4">
            <div className="text-xs font-bold text-white">Track Witr Prayer</div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">Include Witr in missed prayer calculations (Hanafi school)</div>
          </div>
          
          <button
            onClick={handleWitrToggle}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer shrink-0 ${
              profile.trackWitr ? 'bg-[#10B981]' : 'bg-emerald-950/80 border border-emerald-900/40'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#022C22] transition-transform duration-300 ${
                profile.trackWitr ? 'transform translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center">
          <Bell className="h-4.5 w-4.5 mr-2 text-[#D4AF37]" />
          Reminders & Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-emerald-900/20">
            <div className="pr-4">
              <div className="text-xs font-bold text-white">Friendly Reminders</div>
              <div className="text-[10px] text-[#94A3B8] mt-0.5">Enable local notification alerts to prompt daily logs</div>
            </div>
            
            <button
              onClick={() => requestNotificationPermission(!profile.notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer shrink-0 ${
                profile.notificationsEnabled ? 'bg-[#10B981]' : 'bg-emerald-950/80 border border-emerald-900/40'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#022C22] transition-transform duration-300 ${
                  profile.notificationsEnabled ? 'transform translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {profile.notificationsEnabled && (
            <div className="flex justify-between items-center py-1">
              <div>
                <div className="text-xs font-bold text-white">Daily Reminder Time</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">When should we send the reminder notification?</div>
              </div>
              <input
                type="time"
                value={profile.dailyReminderTime}
                onChange={handleReminderTimeChange}
                className="bg-emerald-950/60 border border-emerald-900/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Database Backup Section */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center">
          <Download className="h-4.5 w-4.5 mr-2 text-[#D4AF37]" />
          Data Backup & Restore
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-800/30 bg-emerald-950/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 active:scale-95 transition-all text-center cursor-pointer space-y-2"
          >
            <Download className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">Export Backup</span>
            <span className="text-[9px] text-[#94A3B8]">Save tracker data to JSON</span>
          </button>

          <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-800/30 bg-emerald-950/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 active:scale-95 transition-all text-center cursor-pointer space-y-2">
            <Upload className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">Import Backup</span>
            <span className="text-[9px] text-[#94A3B8]">Restore from JSON file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {importStatus.type && (
          <div className={`mt-3 p-2.5 rounded-lg text-center text-xs font-semibold ${
            importStatus.type === 'success' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-red-500/15 text-red-400'
          }`}>
            {importStatus.type === 'success' && <RefreshCw className="h-3.5 w-3.5 inline animate-spin mr-1.5" />}
            {importStatus.message}
          </div>
        )}
      </div>

      {/* Support Developer Section */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-transparent">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center">
          <Heart className="h-4.5 w-4.5 mr-2 text-rose-500 fill-rose-500/20" />
          Support the Developer
        </h3>
        <p className="text-[10px] text-[#94A3B8] mb-4">
          This app is built to serve the Ummah, 100% free of ads. Consider supporting developer work as Sadaqah Jariyah.
        </p>

        {!showSupport ? (
          <button
            onClick={() => setShowSupport(true)}
            className="w-full py-2.5 bg-emerald-950/60 border border-emerald-900/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 active:scale-95 transition-all text-[#D4AF37] rounded-xl text-xs font-bold cursor-pointer"
          >
            Become a Supporter
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase text-[#94A3B8] font-bold">Select Donation Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {['100', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDonationAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      donationAmount === amt && !customAmount
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-emerald-950 shadow-md shadow-[#D4AF37]/25'
                        : 'bg-emerald-950/60 border-emerald-900/40 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Rs. {amt}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Other"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setDonationAmount('');
                  }}
                  className={`w-full text-center text-xs font-bold bg-emerald-950/60 border rounded-xl p-2 text-white focus:outline-none focus:border-[#D4AF37] placeholder-emerald-800 ${
                    customAmount ? 'border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]' : 'border-emerald-900/40'
                  }`}
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-950/80 border border-emerald-900/50 rounded-xl space-y-3">
              <div className="text-center pb-2 border-b border-emerald-900/20">
                <span className="text-[10px] uppercase text-[#94A3B8] font-bold block">Support Value</span>
                <span className="text-lg font-bold text-white font-outfit">
                  Rs. {customAmount || donationAmount || '0'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Bank Name:</span>
                  <span className="font-bold text-white">NayaPay</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Account Number:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white font-outfit">03145116290</span>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded bg-emerald-900/40 hover:bg-emerald-900 text-[#D4AF37] transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Copy Account Number"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSupport(false)}
              className="w-full py-2 text-center text-[10px] text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
            >
              Close Support Panel
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="glass-panel rounded-2xl p-5 border border-red-900/30 bg-red-950/5">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center">
          <ShieldAlert className="h-4.5 w-4.5 mr-2 text-red-400" />
          Danger Zone
        </h3>
        <p className="text-[10px] text-[#94A3B8] mb-4">
          Resetting will clear all your data including profile settings, missed prayer history, and total qaza counts. This action is final.
        </p>
        
        <button
          onClick={handleReset}
          className="w-full py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all text-red-400 rounded-xl text-xs font-bold active:scale-98 cursor-pointer"
        >
          Reset All Application Data
        </button>
      </div>
    </div>
  );
};
