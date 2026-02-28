'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Zap, Plus, Archive, Settings, AppWindow, Clock, Check, MessageCircle, X, Trash2, Bell } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

export const Navigation = () => {
  const { screen, role, activeTab, setActiveTab, setScreen, handleApprove, activeProject, archiveList, setArchiveList, projectToDelete, setProjectToDelete, showToast } = useAppStore();
  if (screen === 'welcome' || screen === 'role_select' || screen === 'onboarding') return null;

  const designerTabs = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Дашборд' },
    { id: 'activity', icon: Zap, label: 'Активность' },
    { id: 'add_project', icon: Plus, label: 'Добавить', isCenter: true },
    { id: 'archive', icon: Archive, label: 'Архив' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  const clientTabs = [
    { id: 'dashboard', icon: AppWindow, label: 'Проект' },
    { id: 'history', icon: Clock, label: 'История' },
    { id: 'approve', icon: Check, label: 'Approve', isCenter: true },
    { id: 'settings', icon: Settings, label: 'Настройки' },
    { id: 'contact', icon: MessageCircle, label: 'Контакт' },
  ];

  const tabs = role === 'designer' ? designerTabs : clientTabs;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
      <div className="flex items-center justify-around px-2 h-14 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          if (tab.isCenter) {
            return (
              <button key={tab.id} onClick={() => {
                if (role === 'designer') { setScreen('add_project'); setActiveTab('add_project'); }
                else { handleApprove(); }
              }} className="w-12 h-12 rounded-full bg-[#D4FF33] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,255,51,0.3)] hover:scale-105 active:scale-95 transition-all -translate-y-4">
                <Icon className="w-6 h-6 stroke-[3]" />
              </button>
            );
          }
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setScreen(tab.id as any); }} className="relative w-12 h-12 flex items-center justify-center">
              {isActive && <motion.div layoutId="nav-pill" className="absolute inset-1 bg-white/10 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-white/40'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Toast = () => {
  const { toast } = useAppStore();
  return (
    <AnimatePresence>
      {toast.isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full backdrop-blur-md border shadow-2xl whitespace-nowrap" style={{
            backgroundColor: toast.type === 'success' ? 'rgba(212, 255, 51, 0.1)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: toast.type === 'success' ? 'rgba(212, 255, 51, 0.2)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: toast.type === 'success' ? '#D4FF33' : toast.type === 'error' ? '#EF4444' : '#FFFFFF'
          }}>
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const Modals = () => {
  const { 
    isNotificationsOpen, setIsNotificationsOpen, role, designerNotifications, clientNotifications, setDesignerNotifications, setClientNotifications,
    isApproveModalOpen, setIsApproveModalOpen, progress, setApprovedProgress, showToast, activeProject, setActiveProject, setProgress, setArchiveList,
    projectToDelete, setProjectToDelete, archiveList,
    projectDetailsId, setProjectDetailsId,
    isFullscreen, setIsFullscreen
  } = useAppStore();

  const currentNotifications = role === 'designer' ? designerNotifications : clientNotifications;

  return (
    <>
      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNotificationsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-[#111111] rounded-t-3xl border-t border-white/10 p-6 z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Уведомления</h3>
                <button onClick={() => setIsNotificationsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              {currentNotifications.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {currentNotifications.map(notif => (
                    <div key={notif.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                      {notif.unread && <div className="w-2 h-2 rounded-full bg-[#D4FF33] mt-1.5 shrink-0" />}
                      <div><p className="text-sm font-medium mb-1">{notif.text}</p><p className="text-xs text-white/40">{notif.time}</p></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center"><Bell className="w-12 h-12 text-white/20 mx-auto mb-4" /><p className="text-white/50">Уведомлений нет</p></div>
              )}
              {currentNotifications.length > 0 && (
                <button onClick={() => { if (role === 'designer') setDesignerNotifications([]); else setClientNotifications([]); }} className="w-full h-12 rounded-2xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Очистить список
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {isApproveModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsApproveModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-[#111111] rounded-3xl border border-white/10 p-6 z-50">
              <div className="w-16 h-16 rounded-full bg-[#D4FF33]/10 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-[#D4FF33]" /></div>
              <h3 className="text-xl font-bold mb-2 text-center">{progress === 100 ? 'Подтвердить проект' : 'Подтвердить этап'}</h3>
              <p className="text-sm text-white/50 text-center mb-6">Вы уверены, что хотите подтвердить {progress === 100 ? 'завершение проекта' : `текущий этап (${progress}%)`}?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsApproveModalOpen(false)} className="flex-1 h-12 rounded-2xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all">Отменить</button>
                <button onClick={() => {
                  setIsApproveModalOpen(false); setApprovedProgress(progress); showToast('success', progress === 100 ? 'Проект подтвержден' : 'Этап подтвержден');
                  setDesignerNotifications(prev => [{ id: Date.now() + Math.random(), text: progress === 100 ? 'Клиент подтвердил завершение проекта!' : `Клиент подтвердил этап ${progress}%`, time: 'Только что', unread: true }, ...prev]);
                  if (progress === 100) {
                    const completedProject = { id: Date.now() + Math.random(), name: activeProject?.name || 'Текущий проект', desc: activeProject?.desc || 'Завершенный проект', client: activeProject?.client || 'Клиент', price: activeProject?.price || '120 000 ₽', deadline: 'Завершен', date: activeProject?.date || new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) };
                    setArchiveList(prev => [completedProject, ...prev]); setActiveProject(null); setProgress(0);
                  }
                }} className="flex-1 h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] transition-all">Подтвердить</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {projectToDelete !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setProjectToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#111111] border border-white/10 rounded-3xl p-6 z-50">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Archive className="w-8 h-8 text-red-500" /></div>
              <h3 className="text-xl font-bold mb-2 text-center">Готовы ли вы удалить?</h3>
              <p className="text-sm text-white/50 text-center mb-6">Проект будет полностью удален</p>
              <div className="flex gap-3">
                <button onClick={() => setProjectToDelete(null)} className="flex-1 h-12 rounded-2xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all">Отменить</button>
                <button onClick={() => { 
                  const newList = archiveList.filter(p => p.id !== projectToDelete);
                  setArchiveList(newList); 
                  if (activeProject?.id === projectToDelete || newList.length === 0) setActiveProject(null);
                  setProjectToDelete(null); 
                  showToast('success', 'Проект удален'); 
                }} className="flex-1 h-12 rounded-2xl bg-red-500/10 text-red-500 font-medium text-sm hover:bg-red-500/20 transition-all">Подтвердить</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {projectDetailsId !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setProjectDetailsId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#111111] border border-white/10 rounded-3xl p-6 z-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Детали проекта</h3>
                <button onClick={() => setProjectDetailsId(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              {archiveList.find(p => p.id === projectDetailsId) && (
                <div className="space-y-4 mb-6">
                  <div className="pb-4 border-b border-white/10"><span className="text-xs text-white/50 block mb-1">Имя проекта</span><p className="text-sm font-medium">{archiveList.find(p => p.id === projectDetailsId)?.name}</p></div>
                  <div className="pb-4 border-b border-white/10"><span className="text-xs text-white/50 block mb-1">Описание</span><p className="text-sm font-medium">{archiveList.find(p => p.id === projectDetailsId)?.desc}</p></div>
                  <div className="pb-4 border-b border-white/10"><span className="text-xs text-white/50 block mb-1">Клиент</span><p className="text-sm font-medium">{archiveList.find(p => p.id === projectDetailsId)?.client || 'Не указан'}</p></div>
                  <div className="pb-4 border-b border-white/10"><span className="text-xs text-white/50 block mb-1">Дедлайн</span><p className="text-sm font-medium">{archiveList.find(p => p.id === projectDetailsId)?.deadline || 'Не указан'}</p></div>
                  <div className="pb-4 border-b border-white/10"><span className="text-xs text-white/50 block mb-1">Стоимость</span><p className="text-sm font-bold text-[#D4FF33]">{archiveList.find(p => p.id === projectDetailsId)?.price}</p></div>
                  {archiveList.find(p => p.id === projectDetailsId)?.figmaUrl && (
                    <div className="pb-4"><span className="text-xs text-white/50 block mb-1">Figma URL</span><a href={archiveList.find(p => p.id === projectDetailsId)?.figmaUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#D4FF33] underline break-all">{archiveList.find(p => p.id === projectDetailsId)?.figmaUrl}</a></div>
                  )}
                </div>
              )}
              <button onClick={() => setProjectDetailsId(null)} className="w-full h-12 rounded-2xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all">Закрыть</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Presentation Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="absolute top-6 right-6 z-10">
              <button onClick={() => setIsFullscreen(false)} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10"><X className="w-6 h-6 text-white" /></button>
            </div>
            <div className="relative flex-1 w-full h-full">
              <Image src="https://picsum.photos/seed/darkui2/1920/1080" alt="Presentation" fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
