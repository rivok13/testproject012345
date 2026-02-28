'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Figma, Star, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const WelcomeScreen = () => {
  const { setScreen } = useAppStore();
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[100dvh] text-center bg-[#000000] px-4">
      <div className="w-[64px] h-[64px] bg-[#D5FF33] rounded-[16px] flex items-center justify-center shadow-[inset_0_1px_5px_1px_rgba(255,255,255,0.3),0_10px_35px_-5px_rgba(213,255,51,0.3)]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 6.5H7V12H17V17.5H7" stroke="black" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
        </svg>
      </div>
      <h1 className="mt-[25px] text-[24px] font-semibold text-white tracking-tight">Сдвиг: Проект и клиент</h1>
      <p className="mt-[15px] text-[15px] leading-[22px] text-[#888888] whitespace-pre-line">
        Взаимодействие с вашими проектами{'\n'}в мобильном приложении Telegram
      </p>
      
      <button 
        onClick={() => setScreen('role_select')} 
        className="mt-[55px] w-full max-w-[320px] h-[56px] rounded-[16px] bg-[#D5FF33] text-black font-semibold text-[16px] hover:shadow-[0_0_55px_0_rgba(213,255,51,0.25)] active:scale-95 transition-all flex items-center justify-center"
      >
        Войти через Telegram
      </button>
    </motion.div>
  );
};

export const RoleSelectScreen = () => {
  const { role, setRole, setScreen, setActiveTab } = useAppStore();
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-6 pt-20">
      <h2 className="text-2xl font-bold mb-2">Кто вы?</h2>
      <p className="text-sm text-white/50 mb-8">Выберите вашу роль в проекте</p>
      
      <div className="flex flex-col gap-4 mb-auto">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setRole('designer')} className={`relative flex flex-col justify-center h-24 rounded-3xl bg-[#111111] border transition-colors w-full px-6 text-left ${role === 'designer' ? 'border-[#D4FF33]/50' : 'border-white/5 hover:border-white/10'}`}>
          <div className={`absolute top-4 right-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${role === 'designer' ? 'border-[#D4FF33] bg-[#D4FF33]/10' : 'border-white/10'}`}>
            <Star className={`w-4 h-4 ${role === 'designer' ? 'text-[#D4FF33] fill-[#D4FF33]' : 'text-white/20'}`} />
          </div>
          <h3 className="text-lg font-bold mb-1">Я – Дизайнер</h3>
          <p className="text-sm text-white/50">Выполняю проект</p>
        </motion.button>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setRole('client')} className={`relative flex flex-col justify-center h-24 rounded-3xl bg-[#111111] border transition-colors w-full px-6 text-left ${role === 'client' ? 'border-[#D4FF33]/50' : 'border-white/5 hover:border-white/10'}`}>
          <div className={`absolute top-4 right-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${role === 'client' ? 'border-[#D4FF33] bg-[#D4FF33]/10' : 'border-white/10'}`}>
            <Star className={`w-4 h-4 ${role === 'client' ? 'text-[#D4FF33] fill-[#D4FF33]' : 'text-white/20'}`} />
          </div>
          <h3 className="text-lg font-bold mb-1">Я – Клиент</h3>
          <p className="text-sm text-white/50">Наблюдаю за проектом</p>
        </motion.button>
      </div>

      <button disabled={!role} onClick={() => {
        if (role === 'designer') setScreen('onboarding');
        else { setScreen('dashboard'); setActiveTab('dashboard'); }
      }} className={`w-full h-12 rounded-2xl font-medium text-sm transition-all flex items-center justify-center mt-8 ${role ? 'bg-[#D4FF33] text-black hover:bg-[#bce622] active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
        Продолжить
      </button>
    </motion.div>
  );
};

export const OnboardingScreen = () => {
  const { token, setToken, handleSyncFigma } = useAppStore();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-6 pt-20">
      <h2 className="text-2xl font-bold mb-2">Подключение</h2>
      <p className="text-sm text-white/50 mb-8">Введите ваш Figma API для синхронизации проектов</p>
      
      <div className="space-y-4 mb-auto">
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="figd_..." className="w-full h-12 bg-[#111111] border border-white/10 rounded-2xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors font-sans text-sm" />
        
        <div className="rounded-2xl bg-[#111111] border border-white/5 overflow-hidden">
          <button onClick={() => setIsAccordionOpen(!isAccordionOpen)} className="w-full h-12 flex items-center justify-between px-4 text-sm font-medium hover:bg-white/5 transition-colors">
            Как получить токен?
            <ChevronDown className={`w-4 h-4 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isAccordionOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 text-xs text-white/50 leading-relaxed">
                  Для получения токена откройте &gt; Settings в Figma, перейдите во вкладку &gt; Security и в разделе &gt; Personal access tokens нажмите Generate new token. Введите название, настройте доступы и обязательно скопируйте созданный код сразу, так как он отображается лишь один раз.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={handleSyncFigma} className="w-full h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] active:scale-95 transition-all flex items-center justify-center mt-8">
        Синхронизировать
      </button>
    </motion.div>
  );
};
