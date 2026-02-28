'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type Screen = 'welcome' | 'role_select' | 'onboarding' | 'dashboard' | 'history' | 'archive' | 'settings' | 'activity' | 'contact' | 'add_project';
export type Role = 'designer' | 'client' | null;
export type ToastType = 'success' | 'error' | 'info' | null;

export interface Project {
  id: number;
  name: string;
  desc: string;
  client: string;
  price: string;
  deadline: string;
  date: string;
  figmaUrl?: string;
  thumbnailUrl?: string;
}

export interface Log {
  id: number;
  date: string;
  text: string;
  progress: number;
  reactions: string[];
}

export interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

interface AppState {
  screen: Screen;
  setScreen: (s: Screen) => void;
  role: Role;
  setRole: (r: Role) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  
  progress: number;
  setProgress: (p: number) => void;
  pendingProgress: number | null;
  setPendingProgress: (p: number | null) => void;
  
  logText: string;
  setLogText: (t: string) => void;
  hours: number;
  setHours: (h: number) => void;
  workTimer: number;
  setWorkTimer: (t: number | ((prev: number) => number)) => void;
  isWorkTimerRunning: boolean;
  setIsWorkTimerRunning: (b: boolean | ((prev: boolean) => boolean)) => void;
  historyLogs: Log[];
  setHistoryLogs: (logs: Log[] | ((prev: Log[]) => Log[])) => void;
  
  token: string;
  setToken: (t: string) => void;
  archiveList: Project[];
  setArchiveList: (list: Project[] | ((prev: Project[]) => Project[])) => void;
  
  clientNotifications: Notification[];
  setClientNotifications: (n: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  designerNotifications: Notification[];
  setDesignerNotifications: (n: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  
  approvedProgress: number;
  setApprovedProgress: (p: number) => void;
  projectToDelete: number | null;
  setProjectToDelete: (id: number | null) => void;
  
  activeTariff: string | null;
  setActiveTariff: (t: string | null) => void;
  subscription: { plan: string; daysLeft: number };
  setSubscription: (s: { plan: string; daysLeft: number }) => void;
  
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  projectDetailsId: number | null;
  setProjectDetailsId: (id: number | null) => void;
  
  telegramUser: { id: number; first_name: string; photo_url: string };
  setTelegramUser: (user: { id: number; first_name: string; photo_url: string } | ((prev: { id: number; first_name: string; photo_url: string }) => { id: number; first_name: string; photo_url: string })) => void;
  
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (b: boolean) => void;
  toast: { isOpen: boolean; type: ToastType; message: string };
  showToast: (type: ToastType, message: string) => void;
  isApproveModalOpen: boolean;
  setIsApproveModalOpen: (b: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (b: boolean) => void;
  
  pomodoroMode: 'idle' | 'work' | 'rest';
  setPomodoroMode: (m: 'idle' | 'work' | 'rest') => void;
  pomodoroTime: number;
  setPomodoroTime: (t: number | ((prev: number) => number)) => void;
  togglePomodoro: () => void;
  
  handleProgressUpdate: (newVal: number) => void;
  handleUndoProgress: () => void;
  handleAddLog: () => void;
  handleReaction: (logId: number, reaction: string) => void;
  handleApprove: () => void;
  handleSyncFigma: () => Promise<void>;
  fetchFigmaFile: (url: string) => Promise<any>;
}

const AppContext = createContext<AppState | null>(null);

const initialHistory: Log[] = [];

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // State initialization with localStorage fallback
  const loadState = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return defaultValue; }
    }
    return defaultValue;
  };

  const [screen, setScreen] = useState<Screen>('welcome');
  const [role, setRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [progress, setProgress] = useState(() => loadState('sdvig_progress', 25));
  const [pendingProgress, setPendingProgress] = useState<number | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [logText, setLogText] = useState('');
  const [hours, setHours] = useState(() => loadState('sdvig_hours', 12));
  const [workTimer, setWorkTimer] = useState(() => loadState('sdvig_work_timer', 0));
  const [isWorkTimerRunning, setIsWorkTimerRunning] = useState(false);
  const [lastTimerDate, setLastTimerDate] = useState(() => loadState('sdvig_last_timer_date', new Date().toDateString()));
  const [historyLogs, setHistoryLogs] = useState<Log[]>(() => loadState('sdvig_history', initialHistory));
  
  const [token, setToken] = useState(() => loadState('sdvig_token', ''));
  const [archiveList, setArchiveList] = useState<Project[]>(() => loadState('sdvig_archive', []));
  
  const [clientNotifications, setClientNotifications] = useState<Notification[]>(() => loadState('sdvig_c_notif', []));
  const [designerNotifications, setDesignerNotifications] = useState<Notification[]>(() => loadState('sdvig_d_notif', []));
  
  const [approvedProgress, setApprovedProgress] = useState(() => loadState('sdvig_approved', 0));
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [activeTariff, setActiveTariff] = useState<string | null>(() => loadState('sdvig_tariff', null));
  const [subscription, setSubscription] = useState(() => loadState('sdvig_sub', { plan: 'Базовый', daysLeft: 15 }));
  const [activeProject, setActiveProject] = useState<Project | null>(() => loadState('sdvig_active_proj', null));
  const [projectDetailsId, setProjectDetailsId] = useState<number | null>(null);
  
  const [telegramUser, setTelegramUser] = useState(() => loadState('sdvig_user', {
    id: Math.floor(10000000 + Math.random() * 90000000),
    first_name: 'Alex Designer',
    photo_url: 'https://picsum.photos/seed/avatar3/100/100'
  }));

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean; type: ToastType; message: string }>({ isOpen: false, type: null, message: '' });
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [pomodoroMode, setPomodoroMode] = useState<'idle' | 'work' | 'rest'>('idle');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sdvig_progress', JSON.stringify(progress));
      localStorage.setItem('sdvig_hours', JSON.stringify(hours));
      localStorage.setItem('sdvig_work_timer', JSON.stringify(workTimer));
      localStorage.setItem('sdvig_last_timer_date', JSON.stringify(lastTimerDate));
      localStorage.setItem('sdvig_history', JSON.stringify(historyLogs));
      localStorage.setItem('sdvig_token', JSON.stringify(token));
      localStorage.setItem('sdvig_archive', JSON.stringify(archiveList));
      localStorage.setItem('sdvig_c_notif', JSON.stringify(clientNotifications));
      localStorage.setItem('sdvig_d_notif', JSON.stringify(designerNotifications));
      localStorage.setItem('sdvig_approved', JSON.stringify(approvedProgress));
      localStorage.setItem('sdvig_tariff', JSON.stringify(activeTariff));
      localStorage.setItem('sdvig_sub', JSON.stringify(subscription));
      localStorage.setItem('sdvig_active_proj', JSON.stringify(activeProject));
      localStorage.setItem('sdvig_user', JSON.stringify(telegramUser));
    }
  }, [progress, hours, workTimer, lastTimerDate, historyLogs, token, archiveList, clientNotifications, designerNotifications, approvedProgress, activeTariff, subscription, activeProject, telegramUser]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastTimerDate !== today) {
      setWorkTimer(0);
      setLastTimerDate(today);
    }
  }, [lastTimerDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkTimerRunning) {
      interval = setInterval(() => {
        setWorkTimer((prev: number) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkTimerRunning]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      if (tg.initDataUnsafe?.user) {
        setTelegramUser({
          id: tg.initDataUnsafe.user.id || Math.floor(10000000 + Math.random() * 90000000),
          first_name: tg.initDataUnsafe.user.first_name || 'User',
          photo_url: tg.initDataUnsafe.user.photo_url || 'https://picsum.photos/seed/avatar3/100/100'
        });
      }
    }
  }, []);

  const showToast = (type: ToastType, message: string) => {
    setToast({ isOpen: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 1500);
  };

  const handleSyncFigma = async () => {
    if (!token) {
      showToast('error', 'Введите токен');
      return;
    }
    showToast('info', 'Синхронизация с Figma...');
    try {
      const res = await fetch('https://api.figma.com/v1/me', {
        headers: { 'X-Figma-Token': token }
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();
      showToast('success', `Успешно! Привет, ${data.handle}`);
      setTimeout(() => {
        setScreen('dashboard');
        setActiveTab('dashboard');
      }, 1500);
    } catch (err) {
      showToast('error', 'Неверный токен Figma');
    }
  };

  const fetchFigmaFile = async (url: string) => {
    if (!token) {
      showToast('error', 'Figma API Token не указан в настройках');
      return null;
    }
    try {
      // Extract file key from url: figma.com/file/KEY/name or figma.com/design/KEY/name
      const match = url.match(/figma\.com\/(?:file|design|board)\/([a-zA-Z0-9]+)/);
      if (!match) throw new Error('Invalid URL');
      const key = match[1];
      
      const res = await fetch(`https://api.figma.com/v1/files/${key}`, {
        headers: { 'X-Figma-Token': token }
      });
      if (!res.ok) throw new Error('Failed to fetch file');
      const data = await res.json();
      return { name: data.name, thumbnailUrl: data.thumbnailUrl };
    } catch (err) {
      console.error(err);
      showToast('error', 'Ошибка загрузки файла Figma');
      return null;
    }
  };

  const handleProgressUpdate = (newVal: number) => {
    setPendingProgress(newVal);
    showToast('info', 'Синхронизация...');
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    undoTimeoutRef.current = setTimeout(() => {
      setProgress(newVal);
      setPendingProgress(null);
      showToast('success', 'Прогресс обновлен');
      setClientNotifications(prev => [{
        id: Date.now() + Math.random(),
        text: `Проект завершен на ${newVal}%`,
        time: 'Только что',
        unread: true
      }, ...prev]);
    }, 3000);
  };

  const handleUndoProgress = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      setPendingProgress(null);
      showToast('info', 'Отменено');
    }
  };

  const handleAddLog = () => {
    if (!logText.trim()) return;
    const newLog = {
      id: Date.now() + Math.random(),
      date: 'Только что',
      text: logText,
      progress: progress,
      reactions: []
    };
    setHistoryLogs(prev => [newLog, ...prev]);
    setLogText('');
    showToast('success', 'Успех');
  };

  const handleReaction = (logId: number, reaction: string) => {
    setHistoryLogs(logs => logs.map(log => {
      if (log.id === logId) {
        const hasReaction = log.reactions.includes(reaction);
        if (!hasReaction && role === 'client') {
          setDesignerNotifications(prev => [{
            id: Date.now() + Math.random(),
            text: `Клиент отреагировал ${reaction} на: "${log.text}"`,
            time: 'Только что',
            unread: true
          }, ...prev]);
        }
        return {
          ...log,
          reactions: hasReaction ? log.reactions.filter(r => r !== reaction) : [...log.reactions, reaction]
        };
      }
      return log;
    }));
  };

  const handleApprove = () => {
    if (role === 'client') {
      if (progress > approvedProgress) {
        setIsApproveModalOpen(true);
      } else {
        showToast('info', 'Нет новых этапов для подтверждения');
      }
    } else {
      setScreen('add_project');
      setActiveTab('add_project');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroMode !== 'idle' && pomodoroTime > 0) {
      interval = setInterval(() => setPomodoroTime(prev => prev - 1), 1000);
    } else if (pomodoroTime === 0 && pomodoroMode !== 'idle') {
      setTimeout(() => {
        if (pomodoroMode === 'work') {
          setPomodoroMode('rest');
          setPomodoroTime(5 * 60);
          showToast('success', 'Отличная работа! Время отдыха.');
        } else if (pomodoroMode === 'rest') {
          setPomodoroMode('idle');
          setPomodoroTime(25 * 60);
          showToast('info', 'Записать 25 мин?');
        }
      }, 0);
    }
    return () => clearInterval(interval);
  }, [pomodoroMode, pomodoroTime]);

  const togglePomodoro = () => {
    if (pomodoroMode === 'idle') {
      setPomodoroMode('work');
      setPomodoroTime(25 * 60);
    } else {
      setPomodoroMode('idle');
      setPomodoroTime(25 * 60);
    }
  };

  return (
    <AppContext.Provider value={{
      screen, setScreen, role, setRole, activeTab, setActiveTab,
      progress, setProgress, pendingProgress, setPendingProgress,
      logText, setLogText, hours, setHours, workTimer, setWorkTimer, isWorkTimerRunning, setIsWorkTimerRunning, historyLogs, setHistoryLogs,
      token, setToken, archiveList, setArchiveList,
      clientNotifications, setClientNotifications, designerNotifications, setDesignerNotifications,
      approvedProgress, setApprovedProgress, projectToDelete, setProjectToDelete,
      activeTariff, setActiveTariff, subscription, setSubscription,
      activeProject, setActiveProject, projectDetailsId, setProjectDetailsId,
      telegramUser, setTelegramUser, isNotificationsOpen, setIsNotificationsOpen,
      toast, showToast, isApproveModalOpen, setIsApproveModalOpen,
      isFullscreen, setIsFullscreen, pomodoroMode, setPomodoroMode,
      pomodoroTime, setPomodoroTime, togglePomodoro,
      handleProgressUpdate, handleUndoProgress, handleAddLog, handleReaction, handleApprove,
      handleSyncFigma, fetchFigmaFile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
