import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Analytics from './dashboard/Analytics';
import MySkills from './dashboard/MySkills';
import MyLearnings from './dashboard/MyLearnings';
import Requests from './dashboard/Requests';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'skills':
        return <MySkills />;
      case 'learnings':
        return <MyLearnings />;
      case 'requests':
        return <Requests />;
      default:
        return <Analytics />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default Dashboard;

