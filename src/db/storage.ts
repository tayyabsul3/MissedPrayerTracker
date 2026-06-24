export interface PrayerCounts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  prayer: keyof PrayerCounts;
  type: 'completed' | 'added' | 'reset'; // completed decreases qaza, added increases qaza
  amount: number;
  dateStr: string; // YYYY-MM-DD
}

export interface DailyTracker {
  dateStr: string; // YYYY-MM-DD
  prayers: {
    fajr: 'prayed' | 'missed' | 'pending';
    dhuhr: 'prayed' | 'missed' | 'pending';
    asr: 'prayed' | 'missed' | 'pending';
    maghrib: 'prayed' | 'missed' | 'pending';
    isha: 'prayed' | 'missed' | 'pending';
    witr: 'prayed' | 'missed' | 'pending';
  };
}

export interface UserProfile {
  name: string;
  joinDate: string;
  trackWitr: boolean;
  dailyReminderTime: string; // "HH:MM"
  notificationsEnabled: boolean;
}

const KEYS = {
  PRAYER_COUNTS: 'qaza_tracker_counts',
  HISTORY: 'qaza_tracker_history',
  DAILY_LOGS: 'qaza_tracker_daily_logs',
  PROFILE: 'qaza_tracker_profile',
};

const DEFAULT_COUNTS: PrayerCounts = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
  witr: 0,
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  joinDate: new Date().toISOString().split('T')[0],
  trackWitr: true,
  dailyReminderTime: '21:00',
  notificationsEnabled: false,
};

export const getPrayerCounts = (): PrayerCounts => {
  const data = localStorage.getItem(KEYS.PRAYER_COUNTS);
  if (!data) return DEFAULT_COUNTS;
  try {
    return { ...DEFAULT_COUNTS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_COUNTS;
  }
};

export const savePrayerCounts = (counts: PrayerCounts): void => {
  localStorage.setItem(KEYS.PRAYER_COUNTS, JSON.stringify(counts));
};

export const getHistoryLog = (): HistoryEntry[] => {
  const data = localStorage.getItem(KEYS.HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const addHistoryEntry = (
  prayer: keyof PrayerCounts,
  type: 'completed' | 'added' | 'reset',
  amount: number
): void => {
  const history = getHistoryLog();
  const entry: HistoryEntry = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: Date.now(),
    prayer,
    type,
    amount,
    dateStr: new Date().toISOString().split('T')[0],
  };
  history.unshift(entry); // Prepend to show newest first
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 500))); // Keep last 500 entries
};

export const getDailyLogs = (): Record<string, DailyTracker> => {
  const data = localStorage.getItem(KEYS.DAILY_LOGS);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

export const getDailyTracker = (dateStr: string): DailyTracker => {
  const logs = getDailyLogs();
  if (logs[dateStr]) return logs[dateStr];
  
  return {
    dateStr,
    prayers: {
      fajr: 'pending',
      dhuhr: 'pending',
      asr: 'pending',
      maghrib: 'pending',
      isha: 'pending',
      witr: 'pending',
    },
  };
};

export const saveDailyTracker = (tracker: DailyTracker): void => {
  const logs = getDailyLogs();
  logs[tracker.dateStr] = tracker;
  localStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(logs));
};

export const getUserProfile = (): UserProfile => {
  const data = localStorage.getItem(KEYS.PROFILE);
  if (!data) return DEFAULT_PROFILE;
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const resetAllData = (): void => {
  localStorage.removeItem(KEYS.PRAYER_COUNTS);
  localStorage.removeItem(KEYS.HISTORY);
  localStorage.removeItem(KEYS.DAILY_LOGS);
  localStorage.removeItem(KEYS.PROFILE);
};

export interface BackupData {
  counts: PrayerCounts;
  history: HistoryEntry[];
  dailyLogs: Record<string, DailyTracker>;
  profile: UserProfile;
  exportedAt: string;
}

export const exportData = (): string => {
  const data: BackupData = {
    counts: getPrayerCounts(),
    history: getHistoryLog(),
    dailyLogs: getDailyLogs(),
    profile: getUserProfile(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as BackupData;
    if (data.counts && data.history && data.dailyLogs && data.profile) {
      localStorage.setItem(KEYS.PRAYER_COUNTS, JSON.stringify(data.counts));
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(data.history));
      localStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(data.dailyLogs));
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
