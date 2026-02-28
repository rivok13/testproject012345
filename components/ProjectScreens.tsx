'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Info, ChevronRight, ArrowLeft, Shield, HelpCircle, CreditCard, Key } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

const fadeVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }, exit: { opacity: 0, y: -10, transition: { duration: 0.2 } } };
const springVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export const AddProjectScreen = () => {
  const { archiveList, setArchiveList, showToast, setScreen, setActiveTab, fetchFigmaFile } = useAppStore();
  const [form, setForm] = useState({ project: '', desc: '', cost: '', deadline: '', figmaUrl: '', thumbnailUrl: '' });
  const [errors, setErrors] = useState({ project: false, desc: false, cost: false, deadline: false });
  const [isLoadingFigma, setIsLoadingFigma] = useState(false);

  const handleFigmaUrlChange = async (url: string) => {
    setForm(prev => ({ ...prev, figmaUrl: url }));
    if (url.includes('figma.com')) {
      setIsLoadingFigma(true);
      const fileData = await fetchFigmaFile(url);
      setIsLoadingFigma(false);
      if (fileData) {
        setForm(prev => ({ ...prev, project: fileData.name, thumbnailUrl: fileData.thumbnailUrl || '' }));
        showToast('success', 'Данные проекта загружены из Figma');
      }
    }
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (isNaN(num)) return '';
    if (num < 1000) return num.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleCreate = () => {
    const newErrors = { project: !form.project, desc: !form.desc, cost: !form.cost, deadline: !form.deadline };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      showToast('error', 'Заполните все поля');
      return;
    }
    const newProject = {
      id: Date.now() + Math.random(),
      name: form.project,
      desc: form.desc,
      client: 'Не указан',
      price: formatPrice(form.cost) + ' ₽',
      deadline: form.deadline,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
      figmaUrl: form.figmaUrl,
      thumbnailUrl: form.thumbnailUrl
    };
    setArchiveList([newProject, ...archiveList]);
    showToast('success', 'Проект добавлен в архив');
    setScreen('archive');
    setActiveTab('archive');
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-6 pt-12 pb-32">
      <h2 className="text-2xl font-bold mb-8">Новый проект</h2>
      <div className="space-y-6 mb-auto">
        <div>
          <label className="text-xs text-white/50 mb-3 block">Ссылка на макет Figma</label>
          <input type="text" value={form.figmaUrl} onChange={(e) => handleFigmaUrlChange(e.target.value)} placeholder="https://figma.com/file/..." className="w-full h-12 bg-[#111111] border border-white/10 rounded-2xl px-4 text-white/50 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm" />
          {isLoadingFigma && <span className="text-xs text-[#D4FF33] mt-2 block">Загрузка названия...</span>}
        </div>
        <div>
          <label className="text-xs text-white/50 mb-3 block">Название проекта</label>
          <input type="text" value={form.project} onChange={(e) => setForm({...form, project: e.target.value})} placeholder="Введите название" className={`w-full h-12 bg-[#111111] border ${errors.project ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 text-white/50 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm`} />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-3 block">Описание</label>
          <input type="text" value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value})} placeholder="Введите описание" className={`w-full h-12 bg-[#111111] border ${errors.desc ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 text-white/50 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm`} />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-3 block">Стоимость</label>
          <input type="text" value={form.cost} onChange={(e) => setForm({...form, cost: e.target.value.replace(/\D/g, '')})} placeholder="10 000 ₽" className={`w-full h-12 bg-[#111111] border ${errors.cost ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 text-white/50 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm`} />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-3 block">Дедлайн</label>
          <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className={`w-full h-12 bg-[#111111] border ${errors.deadline ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 text-white/50 placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors text-sm`} />
        </div>
      </div>
      <button onClick={handleCreate} className="w-full h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] active:scale-95 transition-all flex items-center justify-center mt-8">
        Создать проект
      </button>
    </motion.div>
  );
};

export const ArchiveScreen = () => {
  const { archiveList, activeTariff, setProjectDetailsId, setActiveProject, showToast, setScreen, setActiveTab, setProjectToDelete } = useAppStore();
  let limit = archiveList.length;
  if (activeTariff === 'Базовый' || !activeTariff) limit = 1;
  else if (activeTariff === 'Расширенный') limit = 5;
  const limitedArchive = archiveList.slice(0, limit);

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
      <div className="flex items-center gap-4 mb-8 pt-2"><h2 className="text-2xl font-bold">Архив проектов</h2></div>
      <div className="grid gap-4">
        {limitedArchive.map((item) => (
          <motion.div key={item.id} variants={springVariants} className="p-5 rounded-3xl bg-[#111111] border border-white/5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setProjectDetailsId(item.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Info className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/50">{item.desc}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/40">Дедлайн: {item.deadline || 'Не указан'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setActiveProject(item); showToast('success', 'Проект выбран'); setScreen('dashboard'); setActiveTab('dashboard'); }} className="flex-1 h-10 rounded-xl bg-[#D4FF33] text-black text-sm font-medium hover:bg-[#bce622] transition-colors">Выбрать</button>
              <button onClick={() => setProjectToDelete(item.id)} className="flex-1 h-10 rounded-xl bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors">Удалить</button>
            </div>
          </motion.div>
        ))}
        {archiveList.length === 0 && <div className="text-center py-12 text-white/40 text-sm">Архив пуст</div>}
        {archiveList.length > limit && <div className="text-center py-4 text-white/40 text-xs">Остальные проекты недоступны. Пожалуйста<br/>обновите тарифный план для полноценного доступа</div>}
      </div>
    </motion.div>
  );
};

export const SettingsScreen = () => {
  const { telegramUser, setTelegramUser, role, subscription, token, setToken, showToast, activeTariff, setActiveTariff, setSubscription, setRole, setScreen } = useAppStore();
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [expandedTariff, setExpandedTariff] = useState<string | null>(null);

  const renderSubPage = () => {
    switch (activeSubPage) {
      case 'token':
        return (
          <motion.div key="token" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
            <div className="flex items-center gap-4 mb-8 pt-2">
              <button onClick={() => setActiveSubPage(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold flex-1 text-center pr-8">Figma API Token</h2>
            </div>
            <div className="space-y-4">
              <div className="relative w-full h-12 bg-[#111111] border border-white/10 rounded-2xl flex items-center overflow-hidden focus-within:border-white/40 transition-colors">
                <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="figd_..." className="flex-1 h-full bg-transparent px-4 text-sm focus:outline-none font-sans transition-all" />
              </div>
              <button onClick={() => { setToken(''); showToast('info', 'Токен сброшен'); }} className="w-full h-12 rounded-2xl bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 active:bg-red-500/20 active:text-red-500 transition-colors">Сбросить токен</button>
            </div>
          </motion.div>
        );
      case 'tariff':
        return (
          <motion.div key="tariff" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
            <div className="flex items-center gap-4 mb-8 pt-2">
              <button onClick={() => setActiveSubPage(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold flex-1 text-center pr-8">Тарифный план</h2>
            </div>
            <div className="grid gap-3 mb-4">
              {[
                { name: 'Базовый', price: '0 ₽ / мес', desc: 'Базовый тариф', details: 'Доступны базовые функции сервиса, не более одного активного проекта.' },
                { name: 'Расширенный', price: '250 ₽ / мес', desc: 'Расширенный тариф', details: 'Доступны базовые функции сервиса, не более пяти активных проектов, аналитика' },
                { name: 'Безлимитный', price: '450 ₽ / мес', desc: 'Безлимитный тариф', details: 'Доступны все функции сервиса, безлимитное количество активных проектов, аналитика, приоритетная поддержка' }
              ].map(t => (
                <div key={t.name} onClick={() => setActiveTariff(t.name)} className={`p-4 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-colors ${activeTariff === t.name ? 'bg-[#D4FF33]/10 border-[#D4FF33]/30' : 'bg-[#111111] border-white/5 hover:border-white/10'}`}>
                  <div className="flex items-center justify-between"><h4 className="font-medium text-sm">{t.name}</h4><span className={`font-medium text-sm ${activeTariff === t.name ? 'text-[#D4FF33]' : 'text-white'}`}>{t.price}</span></div>
                  <div className="flex items-center justify-between mt-1"><p className="text-xs text-white/50">{t.desc}</p><button onClick={(e) => { e.stopPropagation(); setExpandedTariff(expandedTariff === t.name ? null : t.name); }} className="text-[10px] font-medium text-white/40 hover:text-white uppercase tracking-wider">Подробнее</button></div>
                  <AnimatePresence>
                    {expandedTariff === t.name && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="text-xs text-white/60 pt-3 mt-2 border-t border-white/5 leading-relaxed">{t.details}</p></motion.div>}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {activeTariff !== 'Базовый' && (
              <button onClick={() => {
                if (!activeTariff) { showToast('error', 'Выберите тарифный план'); return; }
                showToast('info', 'Переход к оплате...');
                setTimeout(() => { showToast('success', 'Оплата успешна'); setSubscription({ plan: activeTariff, daysLeft: 30 }); }, 2000);
              }} className="w-full h-12 rounded-2xl bg-[#D4FF33] text-black font-medium text-sm hover:bg-[#bce622] active:scale-95 transition-all flex items-center justify-center mt-4">Оплатить</button>
            )}
          </motion.div>
        );
      case 'legal':
        return (
          <motion.div key="legal" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
            <div className="flex items-center gap-4 mb-8 pt-2">
              <button onClick={() => setActiveSubPage(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold flex-1 text-center pr-8">Юридическая информация</h2>
            </div>
            <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 text-sm text-white/70 leading-relaxed">
              <p className="mb-4">Политика конфиденциальности и условия использования сервиса.</p>
              <p>Все права защищены. Использование данного приложения подразумевает согласие с правилами обработки персональных данных.</p>
            </div>
          </motion.div>
        );
      case 'faq':
        return (
          <motion.div key="faq" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
            <div className="flex items-center gap-4 mb-8 pt-2">
              <button onClick={() => setActiveSubPage(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold flex-1 text-center pr-8">Ответы на вопросы</h2>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-[#111111] border border-white/5">
                <h4 className="font-bold mb-2">Как добавить проект?</h4>
                <p className="text-sm text-white/60">Перейдите на вкладку добавления проекта, вставьте ссылку на Figma и заполните остальные поля.</p>
              </div>
              <div className="p-5 rounded-3xl bg-[#111111] border border-white/5">
                <h4 className="font-bold mb-2">Как пригласить клиента?</h4>
                <p className="text-sm text-white/60">На главном экране нажмите кнопку &quot;Пригласить клиента&quot; и отправьте скопированную ссылку.</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {activeSubPage ? (
        renderSubPage()
      ) : (
        <motion.div key="main" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col min-h-screen p-4 pb-32">
          <div className="flex items-center gap-4 mb-8 pt-2"><h2 className="text-2xl font-bold">Настройки</h2></div>
          <div className="space-y-6">
            <section>
              <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 relative group cursor-pointer">
                    <Image src={telegramUser.photo_url} alt="Avatar" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[10px] font-medium">Изменить</span></div>
                  </div>
                  <div className="flex-1">
                    <input type="text" value={telegramUser.first_name} onChange={(e) => setTelegramUser({ ...telegramUser, first_name: e.target.value })} className="w-full bg-transparent text-base font-bold focus:outline-none focus:border-b focus:border-white/20 mb-2" />
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white/40">ID: {telegramUser.id}</p><span className="text-xs text-white/40">|</span><p className="text-xs text-white/40">{role === 'designer' ? 'Дизайнер' : 'Клиент'}</p>
                    </div>
                    {role === 'designer' && <p className="text-xs mt-3"><span className="text-[#D4FF33]">Подписка: {subscription.plan}</span><span className="text-white/40"> | Дней: {subscription.daysLeft}</span></p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
              {role === 'designer' && (
                <button onClick={() => setActiveSubPage('token')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Key className="w-4 h-4 text-white/70" /></div>
                    <span className="text-sm font-medium">Figma API Token</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </button>
              )}
              {role === 'designer' && (
                <button onClick={() => setActiveSubPage('tariff')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><CreditCard className="w-4 h-4 text-white/70" /></div>
                    <span className="text-sm font-medium">Тарифный план</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </button>
              )}
              <button onClick={() => setActiveSubPage('legal')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Shield className="w-4 h-4 text-white/70" /></div>
                  <span className="text-sm font-medium">Юридическая информация</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
              <button onClick={() => setActiveSubPage('faq')} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><HelpCircle className="w-4 h-4 text-white/70" /></div>
                  <span className="text-sm font-medium">Ответы на ваши вопросы</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
            </section>

            <button onClick={() => { setRole(null); setScreen('welcome'); }} className="w-full h-12 rounded-2xl border border-[#D4FF33]/30 text-[#D4FF33] font-medium text-sm hover:bg-[#D4FF33] hover:text-black active:scale-95 transition-all flex items-center justify-center mt-8">Выход</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
