'use client';

import React from 'react';
import { AnimatePresence } from 'motion/react';
import { AppProvider, useAppStore } from '@/lib/store';
import { WelcomeScreen, RoleSelectScreen, OnboardingScreen } from '@/components/AuthScreens';
import { DashboardScreen, HistoryScreen, ActivityScreen, ContactScreen } from '@/components/MainScreens';
import { AddProjectScreen, ArchiveScreen, SettingsScreen } from '@/components/ProjectScreens';
import { Navigation, Toast, Modals } from '@/components/SharedUI';

const AppContent = () => {
  const { screen } = useAppStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#D4FF33]/30" />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#D4FF33]/30">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && <WelcomeScreen key="welcome" />}
        {screen === 'role_select' && <RoleSelectScreen key="role_select" />}
        {screen === 'onboarding' && <OnboardingScreen key="onboarding" />}
        {screen === 'dashboard' && <DashboardScreen key="dashboard" />}
        {screen === 'add_project' && <AddProjectScreen key="add_project" />}
        {screen === 'history' && <HistoryScreen key="history" />}
        {screen === 'archive' && <ArchiveScreen key="archive" />}
        {screen === 'settings' && <SettingsScreen key="settings" />}
        {screen === 'activity' && <ActivityScreen key="activity" />}
        {screen === 'contact' && <ContactScreen key="contact" />}
      </AnimatePresence>
      <Navigation />
      <Modals />
      <Toast />
    </div>
  );
};

export default function SdvigApp() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
