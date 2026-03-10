import React, { useState, useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useBudget } from './context/BudgetContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/features/Header';
import { SetupWizard } from './components/features/SetupWizard';
import { NotificationsPanel } from './components/features/NotificationsPanel';
import { DashboardScreen } from './screens/DashboardScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { SecurityScreen } from './screens/SecurityScreen';
import { QuickAdd } from './components/features/QuickAdd';

export default function App() {
  const { showSetup, notifications, isDataLoaded, settings } = useBudget();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [hasUnlocked, setHasUnlocked] = useState(false);

  useEffect(() => {
    // If user is in setup mode, implicitly unlock this session
    if (isDataLoaded && showSetup) {
      setHasUnlocked(true);
    }
  }, [isDataLoaded, showSetup]);

  useEffect(() => {
    const initStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#18181b' });
      } catch (e) {
        // Platform unsupported
      }
    };
    initStatusBar();
  }, []);

  if (!isDataLoaded) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"></div>;
  }

  const isLocked = !showSetup && !!settings.securityPin && !hasUnlocked;

  if (isLocked) {
    return <SecurityScreen onUnlock={() => setHasUnlocked(true)} />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'analytics': return <AnalyticsScreen />;
      case 'savings': return <SavingsScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-[var(--bg-secondary)] pb-20 overflow-x-hidden">
      {showSetup && <SetupWizard />}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      <Header
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        unreadCount={unreadCount}
      />

      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <QuickAdd />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
