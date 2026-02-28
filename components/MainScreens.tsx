'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bell, Clock, Plus, Minus, RefreshCw, Maximize2, Play, Square, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const springVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };
const fadeVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }, exit: { opacity: 0, y: -10, transition: { duration: 0.2 } } };

export const DashboardScreen = () => {
  const { 
    role, telegramUser, setScreen, setActiveTab, setIsNotificationsOpen, 
    designerNotifications, clientNotifications, setDesignerNotifications, setClientNotifications,
    activeProject, setActiveProject, setIsFullscreen, pomodoroMode, pomodoroTime, togglePomodoro,
    progress, pendingProgress, handleUndoProgress, handleProgressUpdate,
    logText, setLogText, handleAddLog, workTimer, isWorkTimerRunning, setIsWorkTimerRunning, showToast, historyLogs
  } = useAppStore();

  const formatWorkTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
      <motion.header variants={springVariants} className="flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setScreen('settings'); setActiveTab('settings'); }}>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#111111]">
            <Image src={telegramUser.photo_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium leading-tight">
              {telegramUser.first_name || 'Пользователь'}
            </span>
            <span className="text-[10px] text-white/40 leading-tight">ID: {telegramUser.id}</span>
          </div>
        </div>
        <button onClick={() => {
          setIsNotificationsOpen(true);
          if (role === 'designer') setDesignerNotifications(prev => prev.map(n => ({...n, unread: false})));
          else setClientNotifications(prev => prev.map(n => ({...n, unread: false})));
        }} className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center relative hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-white/80" />
          <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${(role === 'designer' ? designerNotifications : clientNotifications).some(n => n.unread) ? 'bg-[#D4FF33]' : 'bg-white/20'}`} />
        </button>
      </motion.header>

      <motion.div variants={springVariants} onClick={() => activeProject?.figmaUrl ? window.open(activeProject.figmaUrl, '_blank') : null} className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/5 bg-[#111111] mb-4 cursor-pointer group">
        {activeProject?.thumbnailUrl ? (
          <Image src={activeProject.thumbnailUrl} alt="Project" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-60 group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
        {activeProject && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm z-10">
            <Maximize2 className="w-8 h-8 text-white" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 z-20">
          <Clock className="w-3.5 h-3.5 text-white/80" />
          <span className="text-xs font-medium text-white">{activeProject ? activeProject.deadline : 'Недоступно'}</span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between z-20">
          <div className="flex-1 pr-4 overflow-hidden">
            <h2 className="text-xl font-bold leading-tight mb-2 truncate">{activeProject ? activeProject.name : 'Проект отсутствует'}</h2>
            <p className="text-xs text-white/60 truncate">{activeProject ? activeProject.desc : 'Выберите проект из архива или создайте новый'}</p>
          </div>
          {activeProject && (
            <div className="flex items-center px-3 py-1.5 rounded-full bg-[#D4FF33] backdrop-blur-md shrink-0">
              <span className="text-xs font-bold text-black">{activeProject.price}</span>
            </div>
          )}
        </div>
      </motion.div>

      {role === 'designer' ? (
        <div className="grid gap-4">
          {activeProject && (
            <motion.div variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/50">Прогресс проекта</span>
                <div className="flex items-center gap-4">
                  {pendingProgress !== null && (
                    <button onClick={handleUndoProgress} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Отмена
                    </button>
                  )}
                  <span className="text-sm font-medium text-[#D4FF33]">{pendingProgress ?? progress}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div className="h-full bg-[#D4FF33]" initial={{ width: 0 }} animate={{ width: `${pendingProgress ?? progress}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 75].map(val => (
                  <button key={val} onClick={() => handleProgressUpdate(val)} className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center ${(pendingProgress ?? progress) === val ? 'bg-[#D4FF33] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>{val}%</button>
                ))}
                <button onClick={() => handleProgressUpdate(100)} className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center ${(pendingProgress ?? progress) === 100 ? 'bg-[#D4FF33] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>100%</button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {activeProject && (
              <motion.div variants={springVariants} className="col-span-2 p-5 rounded-3xl bg-[#111111] border border-white/5">
                <span className="text-sm font-medium text-white/50 block mb-3">Что сделано?</span>
                <div className="flex gap-2">
                  <input value={logText} onChange={(e) => setLogText(e.target.value)} placeholder="Опишите апдейт..." className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm focus:outline-none focus:border-white/40 transition-colors" />
                  <button onClick={handleAddLog} className="w-12 h-12 shrink-0 rounded-xl bg-[#D4FF33] text-black flex items-center justify-center hover:bg-[#bce622] active:scale-95 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
            {activeProject && (
              <motion.div variants={springVariants} className="col-span-2 p-5 rounded-3xl bg-[#111111] border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/50">Часы работы</span>
                  <button onClick={() => showToast('info', 'Таймер работы над проектом')} className="text-xs text-white/30 hover:text-white transition-colors">Что это?</button>
                </div>
                <div className="flex flex-col items-center justify-center mt-2 mb-4">
                  <span className="text-xs text-white/40 mb-1">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                  <span className="text-3xl font-bold tracking-wider font-mono">{formatWorkTime(workTimer)}</span>
                </div>
                <button onClick={() => setIsWorkTimerRunning(!isWorkTimerRunning)} className={`w-full h-12 rounded-2xl flex items-center justify-center font-medium text-sm transition-colors ${isWorkTimerRunning ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#D4FF33] text-black hover:bg-[#bce622]'}`}>
                  {isWorkTimerRunning ? 'Остановить таймер' : 'Включить таймер'}
                </button>
              </motion.div>
            )}
            {activeProject && (
              <motion.div variants={springVariants} className="col-span-2">
                <button onClick={() => {
                  navigator.clipboard.writeText(`https://t.me/sdvig_bot?start=${activeProject.id}`);
                  showToast('success', 'Ссылка скопирована');
                }} className="w-full h-12 rounded-2xl bg-[#111111] border border-white/5 text-white font-medium text-sm hover:bg-white/5 transition-all flex items-center justify-center">
                  Пригласить клиента
                </button>
              </motion.div>
            )}
          </div>
          {!activeProject && (
            <motion.div variants={springVariants}>
              <button onClick={() => { setScreen('add_project'); setActiveTab('add_project'); }} className="w-full h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] active:scale-95 transition-all flex items-center justify-center">
                Создать проект
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {!activeProject && (
            <motion.div variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5">
              <span className="text-sm font-medium text-white/50 block mb-3">Пригласительная ссылка</span>
              <div className="flex gap-2">
                <input placeholder="Вставьте ссылку..." className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm focus:outline-none focus:border-white/40 transition-colors" onChange={(e) => {
                  if (e.target.value.includes('start=')) {
                     setActiveProject({
                        id: 999,
                        name: 'Проект от дизайнера',
                        desc: 'Описание проекта',
                        client: telegramUser.first_name || 'Пользователь',
                        price: '100 000 ₽',
                        deadline: 'Не указан',
                        date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                     });
                     showToast('success', 'Доступ получен');
                  }
                }} />
              </div>
            </motion.div>
          )}
          {activeProject ? (
            <>
              <motion.div variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white/50">Прогресс проекта</span>
                  <span className="text-sm font-medium text-[#D4FF33]">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                  <motion.div className="h-full bg-[#D4FF33]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} />
                </div>
                <p className="text-xs text-white/40 text-left mt-4">Ожидаемое завершение: {activeProject.deadline}</p>
              </motion.div>
              {historyLogs.length > 0 && (
                <motion.div variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5">
                  <h3 className="text-sm font-medium text-white/50 mb-3">Последнее действие</h3>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#D4FF33] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-white/90 mb-1">{historyLogs[0].text}</p>
                      <p className="text-xs text-white/40">{historyLogs[0].date}</p>
                    </div>
                  </div>
                  <button onClick={() => { setScreen('history'); setActiveTab('history'); }} className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Перейти к истории проекта <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5 text-center py-10">
              <p className="text-sm text-white/50">Проект еще не начат</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export const HistoryScreen = () => {
  const { historyLogs, role, handleReaction } = useAppStore();
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
      <div className="flex items-center gap-4 mb-8 pt-2">
        <h2 className="text-2xl font-bold">История проекта</h2>
      </div>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
        {historyLogs.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative flex items-start gap-4">
            <div className="absolute left-0 w-5 h-5 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center z-10">
              <span className="w-1 h-1 rounded-full bg-[#D4FF33]" />
            </div>
            <div className="ml-8 flex-1 p-5 rounded-3xl bg-[#111111] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#D4FF33]">{item.progress}% Прогресс</span>
                <span className="text-xs text-white/40">{item.date}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/90 mb-3">{item.text}</p>
              {role === 'client' && (
                <div className="flex gap-2">
                  {['🔥', '🧐', '👍'].map(emoji => (
                    <button key={emoji} onClick={() => handleReaction(item.id, emoji)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${item.reactions.includes(emoji) ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export const ActivityScreen = () => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
    <div className="flex items-center gap-4 mb-8 pt-2"><h2 className="text-2xl font-bold">Активность</h2></div>
    <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 text-center text-white/50">Лента активности</div>
  </motion.div>
);

export const ContactScreen = () => {
  const { showToast } = useAppStore();
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
      <div className="flex items-center gap-4 mb-8 pt-2"><h2 className="text-2xl font-bold">Контакт</h2></div>
      <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 relative">
            <Image src="https://picsum.photos/seed/designer/100/100" alt="Designer Avatar" fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium leading-tight">Alex Designer</h3>
            <p className="text-[10px] text-white/40 leading-tight">ID: 87654321</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-white/50">Дата регистрации</span>
            <span className="text-base font-medium">12 Октября 2025</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-xs text-white/50">Последний проект</span>
            <span className="text-base font-medium">E-commerce App</span>
          </div>
        </div>
        <button onClick={() => showToast('info', 'Открытие диалога...')} className="w-full h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] active:scale-95 transition-all flex items-center justify-center mt-2">
          Перейти в диалог
        </button>
      </div>
    </motion.div>
  );
};
