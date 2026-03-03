import React, { useState } from 'react';
import { useBudget } from './context/BudgetContext';
import { Header } from './components/features/Header';
import { SetupWizard } from './components/features/SetupWizard';
import { NotificationsPanel } from './components/features/NotificationsPanel';
import { DashboardScreen } from './screens/DashboardScreen';

export default function App() {
  const { showSetup, notifications } = useBudget();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {showSetup && <SetupWizard />}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      <Header
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        unreadCount={unreadCount}
      />

      <DashboardScreen />
    </div>
  );
}
