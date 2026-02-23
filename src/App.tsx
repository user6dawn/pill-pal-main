import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MedicationList } from './components/Medications/MedicationList';
import { ScheduleManager } from './components/Schedule/ScheduleManager';
import { DoseLogger } from './components/DoseLog/DoseLogger';
import { SideEffectsTracker } from './components/SideEffects/SideEffectsTracker';
import { HistoryView } from './components/History/HistoryView';
import { ProfilePage } from './components/Profile/ProfilePage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-white flex items-center justify-center ">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'medications':
        return <MedicationList />;
      case 'schedule':
        return <ScheduleManager />;
      case 'log':
        return <DoseLogger />;
      case 'side-effects':
        return <SideEffectsTracker />;
      case 'history':
        return <HistoryView />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
