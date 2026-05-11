import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DayPlan from './components/DayPlan';
import ChecklistManager from './components/ChecklistManager';
import ResourceViewer from './components/ResourceViewer';
import RiskRegister from './components/RiskRegister';
import MetricsDashboard from './components/MetricsDashboard';
import Notes from './components/Notes';
import MeetingTracker from './components/MeetingTracker';
import RoleDashboard from './components/RoleDashboard';
import TeamManager from './components/TeamManager';
import Timeline from './components/Timeline';
import OnboardingTour, { useTour } from './components/OnboardingTour';
import DecisionLog from './components/DecisionLog';
import VendorComparison from './components/VendorComparison';
import { useStore } from './store/useStore';

export default function App() {
  const { activeSection, activeRole } = useStore();
  const tour = useTour();

  // Listen for sidebar "Replay tour" button
  useEffect(() => {
    const handler = () => tour.start();
    window.addEventListener('restart-tour', handler);
    return () => window.removeEventListener('restart-tour', handler);
  }, [tour.start]);

  const renderContent = () => {
    if (activeRole && activeRole !== 'all') return <RoleDashboard />;
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'dayplan':
        return <DayPlan />;
      case 'checklists':
        return <ChecklistManager />;
      case 'templates':
        return <ResourceViewer category="template" title="Templates" />;
      case 'risk':
        return <RiskRegister />;
      case 'communication':
        return <ResourceViewer category="communication" title="Communication Plans" />;
      case 'guides':
        return <ResourceViewer category="all" title="Resources & Guides" />;
      case 'governance':
        return <ResourceViewer category="governance" title="Governance" />;
      case 'training':
        return <ResourceViewer category="training" title="Training Resources" />;
      case 'metrics':
        return <MetricsDashboard />;
      case 'notes':
        return <Notes />;
      case 'meetings':
        return <MeetingTracker />;
      case 'decisions':
        return <DecisionLog />;
      case 'vendors':
        return <VendorComparison />;
      case 'team':
        return <TeamManager />;
      case 'timeline':
        return <Timeline />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </main>
      <OnboardingTour active={tour.active} onFinish={tour.finish} />
    </div>
  );
}
